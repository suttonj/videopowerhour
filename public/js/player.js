'use strict';    


var PH = PH || {};
PH.Player = (function playerControl($, _, playlists) {
    var ytUrlPrefix = "http://www.youtube.com/watch?v=",
    MAXVIDEOS = 60,
    screen1 = null,
    screen2 = null, 
    currentScreen = screen1,
    playbackActive = false,
    currentPlaylist = null,
    plPosition = 0,
    videos = [];

    var screen = screen1,
        rear = screen2;
        
    var playbackLoop = function() {
        console.log('number of videos plPosition: ' + plPosition);
        plPosition += 1;

        if (plPosition % 2 == 0) {
            screen = screen1;
            rear = screen2;
        }
        else {
            screen = screen2;
            rear = screen1;
        }
        screen.removeClass('hide');
        rear.addClass('hide');
        rear.pause();
        
        if (plPosition < videos.length && videos[plPosition] && plPosition <= MAXVIDEOS) {
            console.log('Playlist video ' + videos[plPosition]);
            screen.play();
            rear.src(ytUrlPrefix + videos[(plPosition + 1 < videos.length ? plPosition + 1 : 0)]);
            rear.load();
            rear.currentTime(50);
            rear.one('play', function() {
                rear.pause();
                console.log('pausing preloaded video');
            });
            playbackActive = true;
        }
        else if (plPosition <= MAXVIDEOS && plPosition >= videos.length) {
            screen.play();
            rear.src(ytUrlPrefix + videos[(plPosition%60) + 1]);
            rear.load();
            rear.currentTime(50);
            rear.one('play', function() {
                rear.pause();
                console.log('pausing preloaded video');
            });
            console.log('playlist too short, looping to the start');
            playbackActive = true;
        }
        else {
            clearInterval(window.videoLoop);
            console.log('playlist over.');
            screen.pause();
            playbackActive = false;
            $("#start").html("<div class='jumbotron'><span id='donemsg'>The Powerhour has completed! Great job!<br/>Don't get up too fast, now...</span></div>");
            $("#start").fadeIn(200);
            $("vidcontrol").hide();
            return;
        }
        
        $("#drink").fadeIn(200, function() {
            $("#drink").fadeOut(800);
        });
        
    };
    // Public API here
    return {
      play: play,
      setup: setup,
      reset: reset,
      setPlaylist: setSelectedPlaylist
    };

    function setup () {
      // var playlist = playlistService.getPlaylist();
//        var poll = setInterval(function() {
            this.currentPlaylist = playlists.getSelected();
            videos = playlists.getCurrentPlaylistVideos();
            if (videos === null) {
                setTimeout(setup, 300);
                return;
            }
            else if (videos != undefined && videos != null) {
              var placeholder = videos[0];
              console.log('creating video screen...');

              screen1 = videojs(
                "screen1", 
                { 
                  "techOrder": ["youtube"], 
                   "src": ytUrlPrefix + placeholder,
                   "controls": false
                 },
                function() {
                  console.log("screen1 loaded -- constructer cb:");
                  
                }
              );
              screen2 = videojs(
                "screen2", 
                { 
                  "techOrder": ["youtube"], 
                   "src": ytUrlPrefix + videos[1],
                   "controls": false
                 },
                function() {
                  console.log("screen2 loaded -- constructer cb:");
                  
                }
              );
              videojs.Youtube.prototype.onError = function(error) {
                console.log('**handled error-- skipping to next video');
                console.log(error);
                next(this.player_);
              };

              screen1.ready(function() {
                console.log('screen1 ready -- screen1.ready');
                screen1.currentTime(50);
                screen1.pause();
              });
              screen2.ready(function() {
                console.log('screen2 ready -- screen2.ready');
                screen2.currentTime(50);
                screen2.pause();
              });
              
              screen = screen1;
              rear = screen2;
              $("#vidcontrol").click(togglePlayback);
            }
    }

    function play(userChangedPlaylist, resume) {
        var videos = videos || playlists.getCurrentPlaylistVideos();
console.log("playlist loaded in play:");
        // var screen = currentScreen,
        //     rear = rear;
            
        plPosition = plPosition || 0;
        userChangedPlaylist = userChangedPlaylist || false;
        resume = resume || false;
        
        if (window.videoLoop) {
          clearInterval(window.videoLoop);
        }
        
        if (!resume) {
            $("#start").hide();
            $("#vidcontrol").css("display","block");
            
            screen.removeClass('hide');
            rear.addClass('hide');
        }
        
        if (userChangedPlaylist) {
            screen.src(ytUrlPrefix + videos[0]);
            screen.load();
            screen.currentTime(50);
            rear.src(ytUrlPrefix + videos[1]);
            rear.load();
            rear.one('playing', function() {
                rear.pause();
                console.log('pausing preloaded video');
            });
        }

        window.videoLoop = setInterval(playbackLoop, 6000);

        screen.play();
        playbackActive = true;
        // $("#playicon").hide();
        // $("#pauseicon").show();
    }

    function setSelectedPlaylist (title) {
        console.log('selected playlist: ' + title);
        var currentPlaylist = playlists.getSelected();
        if (!_.contains(playlists.getAvailablePlaylists(), title)) {
            return false;
        }
        
        if (title != currentPlaylist)
        {   
            playlists.setSelected(title);
            if (plPosition > 0) {
                reset();
                play(true);
                $("#drink").hide();
                $("#drink").html('DRINK!!!');
                return true;
            }
            play(true, false);
        }
        else {
            play(false, false);
        }
        
        updateCurrentPlaylist(title);
        return true;
    }
	
	
    function updateCurrentPlaylist(title) {
        $("#currentplaylist").html(title);   
        this.currentPlaylist = title;
    }
    
    function togglePlayback() { 
        var s1paused = screen1.paused();
        var s2paused = screen2.paused();
        var pauseButton = $('#vidcontrol');
        screen1.el().classList.toggle("stopfade");
        screen2.el().classList.toggle("stopfade");
        
        if (screen.paused()) {
        //if (s1paused && s2paused) {
            play(false, true); 
            //playbackActive = true;
            $(pauseButton).find('.button-text').text("Pause");
            $(pauseButton).find('.glyphicon').removeClass("glyphicon-play").addClass("glyphicon-pause");
            //$scope.$apply();
            // $("#playicon").hide();
            // $("#pauseicon").show();
        }
        else {
            // if (s1paused) {
            //     screen2.pause();
            //     //screen2.el().classList.toggle("stopfade");
            // } else {
            //     screen1.pause();
            //     //screen1.el().classList.toggle("stopfade");
            // }
            screen.pause();
            clearInterval(window.videoLoop);
            playbackActive = false;
            $(pauseButton).find('.button-text').text("Paused");
            $(pauseButton).find('.glyphicon').removeClass("glyphicon-pause").addClass("glyphicon-play");
            //$scope.$apply();
            $("#pauseicon").hide();
            $("#playicon").show();
        }
    }
	      	
    function next(activeScreen) {
        plPosition = plPosition + 1;
        activeScreen.src(ytUrlPrefix + videos[plPosition]); //TODO handle smaller-than-60 playlists
        activeScreen.load();
        activeScreen.currentTime(50);
        activeScreen.one('play', function() {
            activeScreen.pause();
        });
        console.log('handling video error, next video in queue');
        
        clearInterval(window.videoLoop);
        window.videoLoop = setInterval(playbackLoop, 6000);
    }
    
    function reset() {
      plPosition = 0;
      screen1.pause();
     // $rootScope.screen1.dispose();
      screen2.pause();
      //$rootScope.screen2.dispose();
      clearInterval(window.videoLoop);
    }

    function getBackgroundPlayer() {
        var s1 = screen1.el(),
            s2 = screen2.el();
            
        return $(s1).hasClass('hide') ? screen1 : screen2;
    }
    
    function slideRight(leftvid, rightvid) {
        //
    }
    
    function slideLeft(leftvid, rightvid) {
        //
    }
})($, _, PH.Playlists);