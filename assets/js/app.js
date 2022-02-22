(function(exports) {

	var cache = new WordCache();

	var g_name = '';
	var g_tracks = '';

	function setStatus(text) {
		if (text != '') {
			$('#status').html(
				'<div class="progress progress-striped active">' +
				'<div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">' +
			    text +
			 	'</div>' +
				'</div>'
			);
		} else {
			$('#status').html('');
		}
	}

	var Playlist = function() {
	}

	var splitText = function(inputtext) {
		var words = inputtext
			.split(/[ \n\r\t]/)
			.map(function(w) { return w.toLowerCase().trim().replace(/^[.,-]+/,'').replace(/[.,-]+$/g,''); })
			.filter(function(w) { return (w.length > 0); });
		words = words.slice(0, 100);
		return words;
	}

	var refreshText = function() {
		setStatus('Updating text...');

		g_name = $('#alltext').val().trim();
		var words = splitText(g_name);
		console.log('text changed.', g_name, words);
		cache.lookupWords(words, function(worddata) {

			setStatus('');

			console.log('wordcache callback', worddata);
			// $('#debug').text(JSON.stringify(worddata, null, 2));

			var txt = '';
			g_tracks = [];
			worddata.forEach(function(data) {
				console.log('word', data.word);

				data.tracks.sort(function(a,b) {
					return Math.random() - 0.5;
				})

				var names = data.tracks.map(function(track) {
					return track.name;
				});

				console.log('names', names);

				var f = new FuzzySet(names);
				var fr = f.get(data.word);
				console.log('fr', fr);

				var found = null;
				var title = '';

				if (!found) {
					data.tracks.forEach(function(track) {
						if (track.name.toLowerCase().trim() === data.word.toLowerCase().trim()) {
							found = track;
						}
					});
				}

				if (!found) {
					if (fr && fr.length > 0) {
						data.tracks.forEach(function(track) {
							if (track.name === fr[0][1]) {
								found = track;
							}
						});
					}
				}

				if (!found) {
					if (data.tracks.length > 0) {
						found = data.tracks[0];
					}
				}

				console.log('found', found);
				if (found) {
					g_tracks.push(found.uri);
					txt += '<div class="media">' +
						'<a class="pull-left" href="#"><img class="media-object" src="' + found.cover_url + '" /></a>' +
						'<div class="media-body">' +
						'<h4 class="media-heading"><a href="' + found.uri + '">' + found.name + '</a></h4>' +
						'Album: <a href="' + found.album_uri + '">' + found.album +
						'</a><br/>Artist: <a href="' + found.artist_uri + '">' + found.artist+'</a>' +
						'</div>' +
						'</div>\n';
				} else {
					txt += '<div class="media">No match found for the word "' + data.word+ '"</div>\n'
				}
			});

			$('#debug').html(txt);
		});
	}

	var doSearch = function(word, callback) {
		console.log('search for ' + word);
		var url = 'https://api.spotify.com/v1/search?type=track&limit=50&q=' + encodeURIComponent('track:"'+word+'"');
		$.ajax(url, {
			dataType: 'json',
			success: function(r) {
				console.log('got track', r);
				callback({
					word: word,
					tracks: r.tracks.items
						.map(function(item) {
							var ret = {
								name: item.name,
								artist: 'Unknown',
								artist_uri: '',
								album: item.album.name,
								album_uri: item.album.uri,
								cover_url: '',
								uri: item.uri
							}
							if (item.artists.length > 0) {
								ret.artist = item.artists[0].name;
								ret.artist_uri = item.artists[0].uri;
							}
							if (item.album.images.length > 0) {
								ret.cover_url = item.album.images[item.album.images.length - 1].url;
							}
							return ret;
						})
				});
			},
			error: function(r) {
				callback({
					word: word,
					tracks: []
				});
			}
		});
	}

	var resolveOneWord = function() {
		var word = cache.pop();
		if (word) {
			console.log('time to resolve word', word);
			setStatus('Looking up the word "' + word + '"');
			doSearch(word, function(result) {
				console.log('got word result', result);
				cache.store(word, result);
				setTimeout(resolveOneWord, 1);
			});
		} else {
			console.log('no words to look up...');
			setTimeout(resolveOneWord, 1000);
		}
	}

	var g_access_token = '';
	var g_username = '';

	var client_id = '';
	var redirect_uri = '';


	if (location.host == 'localhost:8000') {
		client_id = 'd37a9e88667b4fb3bc994299de2a52bd';
		redirect_uri = 'http://localhost:8000/callback.html';
	} else {
		client_id = '6f9391eff32647baa44b1a700ad4a7fc';
		redirect_uri = 'http://lab.possan.se/playlistcreator-example/callback.html';
	}

	var doLogin = function(callback) {
		var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
			'&response_type=token' +
			'&scope=playlist-read-private%20playlist-modify%20playlist-modify-private' +
			'&redirect_uri=' + encodeURIComponent(redirect_uri);
		localStorage.setItem('createplaylist-tracks', JSON.stringify(g_tracks));
		localStorage.setItem('createplaylist-name', g_name);
		var w = window.open(url, 'asdf', 'WIDTH=400,HEIGHT=500');
	}

	var refreshtimer = 0;
	var queueRefreshText = function() {
		if (refreshtimer) {
			clearTimeout(refreshtimer);
		}
		refreshtimer = setTimeout(function() {
			refreshText();
		}, 1000);
	}

	exports.startApp = function() {
		setStatus('');
		console.log('start app.');
		$('#alltext').keyup(function() {
			queueRefreshText();
		});
		$('#alltext').change(function() {
			queueRefreshText();
		});
		$('#start').click(function() {
			doLogin(function() {});
		})
		$('#alltext').text('hello world');
		refreshText();
		resolveOneWord();
}

})(window);
