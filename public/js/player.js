'use strict';    


var PH = PH || {};
PH.Player = (function playerControl($, playlists) {
    var ytUrlPrefix = "http://www.youtube.com/watch?v=",
    screen1 = null,
    screen2 = null, 
    currentScreen = screen1,
    videos = [];

    // Public API here
    return {
      play: play,
      setup: setup,
      reset: reset
    };

    function setup () {
      // var playlist = playlistService.getPlaylist();
//        var poll = setInterval(function() {
            videos = playlists.getCurrent();
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
                   "src": ytUrlPrefix + placeholder
                 },
                function() {
                  console.log("screen1 loaded -- constructer cb:");
                  
                }
              );
              screen2 = videojs(
                "screen2", 
                { 
                  "techOrder": ["youtube"], 
                   "src": ytUrlPrefix + videos[1]
                 },
                function() {
                  console.log("screen2 loaded -- constructer cb:");
                  
                }
              );
              videojs.Youtube.prototype.onError = function(error) {
                console.log('**handled error-- skipping to next video');
                console.log(error);
                next();
              };

              screen1.ready(function() {
                console.log('screen1 ready -- screen1.ready');
                screen1.currentTime(50);
                play(false);
              });
              screen2.ready(function() {
                console.log('screen2 ready -- screen2.ready');
                screen2.currentTime(50);
              });

              //clearInterval(poll);
            }
//        }, 200);
    
    }

    function play(started) {
        var videos = videos || playlists.getCurrent();
console.log("playlist loaded in play:");

        window.playlistPosition = window.playlistPosition || 0;
        var played = window.playlistPosition;
        var screen = screen1;
        var rear = screen2;

        if (window.videoLoop) {
          clearInterval(window.videoLoop);
        }

        if (started) {
            screen.removeClass('hide');
            rear.addClass('hide');
            screen.src(ytUrlPrefix + videos[0]);
            screen.load();
            screen.currentTime(50);
            rear.src(ytUrlPrefix + videos[1]);
        }

        window.videoLoop = setInterval(function() {
            console.log('number of videos played: ' + played);
            window.playlistPosition += 1;
            played += 1;

            if (played % 2 == 0) {
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
            
            if (played < videos.length && videos[played] && played <= 60) {
                console.log('Playlist video ' + videos[played]);
                screen.play();
                rear.src(ytUrlPrefix + videos[(played + 1 < videos.length ? played + 1 : 0)]);
                rear.load();
                rear.currentTime(50);
                rear.one('play', function() {
                    rear.pause();
                    console.log('pausing preloaded video');
                });
            }
            else if (played <= 60 && played >= videos.length) {
                screen.play();
                rear.src(ytUrlPrefix + videos[(played%60) + 1]);
                rear.load();
                rear.currentTime(50);
                rear.one('play', function() {
                    rear.pause();
                    console.log('pausing preloaded video');
                });
                console.log('playlist too short, looping to the start');
            }
            else {
                clearInterval(window.videoLoop);
                console.log('playlist over.');
                screen.pause();
            }
            
        },10000);
        
        rear.load();
        rear.one('playing', function() {
            rear.pause();
            console.log('pausing preloaded video');
        });
        screen.play();
    }

    function next() {
        var screen = getBackgroundPlayer();
        var played = ++window.playlistPosition;
        screen.src(ytUrlPrefix + videos[played]); //TODO handle smaller-than-60 playlists
        screen.load();
        screen.currentTime(50);
        screen.one('play', function() {
            screen.pause();
        });
        console.log('handling video error, next video in queue');
    }
    
    function reset() {
      window.playlistPosition = 0;
      screen1.pause();
     // $rootScope.screen1.dispose();
      screen2.pause();
      //$rootScope.screen2.dispose();
      clearInterval(window.videoLoop);
    }

    function getBackgroundPlayer() {
        return screen1.hasClass('hide') ? screen1 : screen2;
    }
})($, PH.Playlists);