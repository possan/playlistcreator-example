var g_access_token = "";
  var g_username = "";
  var g_tracks = [];
  
  function getUsername(callback) {
    console.log("getUsername");
    var url = "https://api.spotify.com/v1/me";
    $.ajax(url, {
      dataType: "json",
      headers: {
        Authorization: "Bearer " + g_access_token
      },
      success: function (r) {
        console.log("got username response", r);
        callback(r.id);
      },
      error: function (r) {
        callback(null);
      }
    });
  }
  
  function createPlaylist(username, name, callback) {
    console.log("createPlaylist", username, name);
    var url = "https://api.spotify.com/v1/users/" + username + "/playlists";
    $.ajax(url, {
      method: "POST",
      data: JSON.stringify({
        name: name,
        public: false
      }),
      dataType: "json",
      headers: {
        Authorization: "Bearer " + g_access_token,
        "Content-Type": "application/json"
      },
      success: function (r) {
        console.log("create playlist response", r);
        callback(r.id);
      },
      error: function (r) {
        callback(null);
      }
    });
  }
  
  function addTracksToPlaylist(username, playlist, tracks, callback) {
    console.log("addTracksToPlaylist", username, playlist, tracks);
    var url =
      "https://api.spotify.com/v1/users/" +
      username +
      "/playlists/" +
      playlist +
      "/tracks"; // ?uris='+encodeURIComponent(tracks.join(','));
    $.ajax(url, {
      method: "POST",
      data: JSON.stringify(tracks),
      dataType: "text",
      headers: {
        Authorization: "Bearer " + g_access_token,
        "Content-Type": "application/json"
      },
      success: function (r) {
        console.log("add track response", r);
        callback(r.id);
      },
      error: function (r) {
        callback(null);
      }
    });
  }
  
  function doit() {
    // parse hash
    var hash = location.hash.replace(/#/g, "");
    var all = hash.split("&");
    var args = {};
    console.log("all", all);
    all.forEach(function (keyvalue) {
      var idx = keyvalue.indexOf("=");
      var key = keyvalue.substring(0, idx);
      var val = keyvalue.substring(idx + 1);
      args[key] = val;
    });
  
    g_name = localStorage.getItem("createplaylist-name");
    g_tracks = JSON.parse(localStorage.getItem("createplaylist-tracks"));
  
    console.log("got args", args);
  
    if (typeof args["access_token"] != "undefined") {
      // got access token
      console.log("got access token", args["access_token"]);
      g_access_token = args["access_token"];
    }
  
    getUsername(function (username) {
      console.log("got username", username);
      createPlaylist(username, g_name, function (playlist) {
        console.log("created playlist", playlist);
        addTracksToPlaylist(username, playlist, g_tracks, function () {
          console.log("tracks added.");
          $("#playlistlink").attr(
            "href",
            "spotify:user:" + username + ":playlist:" + playlist
          );
          $("#creating").hide();
          $("#done").show();
        });
      });
    });
  }