'use strict';

var PH = PH || {};
PH.Playlists = (function playlistControl($, player) {
    var videos = [];
    var playlists = [];
    var selectedPlaylist = null;
    var DEFAULT_PLAYLIST = "Billboard Top 100";

    // Public API here
    return {
      getCurrentPlaylistVideos: getCurrentPlaylistVideos,
      getSelected: getSelected,
      setSelected: setSelected,
      fetchAll: fetchAllPlaylists,
      setPlaylists: setPlaylists,
      getAvailablePlaylists: getAvailablePlaylists
    };


    function getRandomSubSet (set) {
      //console.log('length of videos: ' + set.length);
      //console.dir(set);
      var shuffled = set.slice(0), 
        i = set.length, 
        size = 61,
        min = i - size,
        temp, 
        index;

      while (i--) {
          index = Math.floor((i + 1) * Math.random());
          temp = shuffled[index];
          shuffled[index] = shuffled[i];
          shuffled[i] = temp;
      }
      return shuffled.slice(min);
    }

    function getCurrentPlaylistVideos() {
      var collection = playlists;// || fetchAllPlaylists();
      if (collection.length == 0) 
        return null;
      
      var selectedPlaylist = getSelected();

      var filtered = collection.filter(function (item) {
          return item.name == selectedPlaylist;
      });

      console.log(filtered[0]);
      console.log('getting playlist: ' + filtered[0].name);
      console.log('returning videos: ');
      var videos = getRandomSubSet(filtered[0].videos);
      console.dir(videos);
      return videos;
    }

    function setSelected(playlistTitle) {
      selectedPlaylist = playlistTitle;
    }

    function getSelected() {
      return selectedPlaylist ? selectedPlaylist : DEFAULT_PLAYLIST;
    }

    function fetchAllPlaylists() {
        var deferred = $.Deferred();
    console.log('calling get all playlists');
        $.getJSON("/api/playlists")
            .done(function(data) {
                playlists = data;
            console.log('got all playlists from api');
                deferred.resolve(data.map(function(item) {
                  return { 
                    title: item.name,
                    id: item.id,
                    videos: item.videos
                  }
                }));
            })
            .error(function(msg, code) {
                deferred.reject(msg);
                //$log.error(msg, code);
             });
             
        return deferred.promise();
    }
    
    function setPlaylists(playlists) {
        this.playlists = playlists;
        this.videos = playlists[1].videos;
        
        $('#list').html("");
        $("#startlist").html("");
        
        for (var i = 0; i < playlists.length; i++) {
            $("#list").append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#" onclick="PH.Player.setPlaylist(\'' + playlists[i].title + '\')">' + playlists[i].title + '</a></li>');
            $("#startlist").append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">' + playlists[i].title + '</a></li>');
        }
        
        $(".dropdown-menu li a").click(function(){
          var selected = $(this).text();
          $('#playlistselect').html(selected+' <span class="caret"></span>');
        });
        
        $("#startbutton").click(function() {
            var title = $('#playlistselect').text().trim();
            PH.Player.setPlaylist(title);
        })
    }
    
    function getAvailablePlaylists() {
        return this.playlists;
    }
    
})(jQuery, PH.Player);