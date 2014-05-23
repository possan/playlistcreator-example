(function(exports) {

	var cache = new WordCache();

	var g_name = '';
	var g_tracks = '';

	var Playlist = function() {
	}

	var splitText = function(inputtext) {
		var words = inputtext
			.split(' ')
			.map(function(w) { return w.toLowerCase().trim().replace(/^[.,-]+/,'').replace(/[.,-]+$/g,''); })
			.filter(function(w) { return (w.length > 0); });
		words = words.slice(0, 100);
		return words;
	}

	var refreshText = function() {
		g_name = $('#alltext').val().trim();
		var words = splitText(g_name);
		console.log('text changed.', g_name, words);
		cache.lookupWords(words, function(worddata) {
			console.log('wordcache callback', worddata);
			// $('#debug').text(JSON.stringify(worddata, null, 2));

			var txt = '';
			g_tracks = [];
			worddata.forEach(function(data) {
				console.log('word', data.word);

				var names = data.tracks.map(function(track) {
					return track.name;
				});

				console.log('names', names);

				var f = new FuzzySet(names);
				var fr = f.get(data.word);
				console.log('fr', fr);

				var uri = '';
				var title = '';
				if (fr && fr.length > 0) {
					data.tracks.forEach(function(track) {
						if (track.name == fr[0][1]) {
							uri = track.uri;
							title = track.name;
						}
					});
				}
				if (uri == '') {
					if (data.tracks.length > 0) {
						uri = data.tracks[0].uri;
						title = data.tracks[0].name;
					}
				}

				console.log('uri', uri);
				if (uri != '') {
					g_tracks.push(uri);

					txt += uri+':\t' + title + '\n';
				}
			});

			$('#debug').text(txt);
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
							return { name: item.name, uri: item.uri };
						})
						.sort(function(t1, t2) {
							return 0;
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

	exports.startApp = function() {
		console.log('start app.');
		$('#alltext').keyup(function() { refreshText(); });
		$('#start').click(function() {
			doLogin(function() {});
		})
		refreshText();
		resolveOneWord();
}

})(window);
