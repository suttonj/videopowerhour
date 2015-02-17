/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Video = require('../app/models/video');
var Playlist = require('../app/models/playlist');

var API_KEY = 'AIzaSyAcL5-B_lj6nYNnx_bnauRa6p6ctEu2oGY';

var Crawler = require('crawler');
var request = require('request');
var async = require('async');


var createNewPlaylist = function(title, tag, info) {
  console.log('Creating playlist for Billboard...');
  //Playlist.find({'name': 'Billboard Top 100'}).remove(function() {
console.log('removed old billboard');
  Video.find({ 'tags': tag }).lean().exec(function(err, videos) {
  //request('/api/videos', function(error, response, body) {
    console.log(err);
    //console.dir(videos);
    var results = videos;
    var vidarr = [];
console.log('adding videos to billboard: ');
//console.dir(results);
    
    results.forEach(function(video) {
      vidarr.push(video.ytid);
    });

  // Playlist.create({
  //   name : 'Billboard Top 100',
  //   info : 'Powerhour of the top music videos from the Billboard Top 100',
  //   videos : vidarr
  // });

    var playlist = new Playlist({
      name : title,
      info : info,
      videos : vidarr
    });
  //playlist.populate('videos');
    playlist.save(function(err){
      if (err) console.log(err);

      console.log("created " + title + " playlist");
      console.dir(vidarr);
    });

  });
  //});
};
  
var populateDefaultPlaylists = function(done) {
  
  async.series({
    
    getBillboardTop100: function getBillboardTop100(next) {
      var titles = [];
      var c = new Crawler({
        "maxConnections": 10,
        "callback": function(error, result, $) {
          //console.dir( result);
          $('article .row-title h2').each(function(index, h1) {
            //console.log($(h1).text());
            titles.push($(h1).text().trim());
          });
          //console.log('Got titles: ' + titles);
          getYTVideos(titles, 'billboard', next);
        }
      });
    
      c.queue('http://www.billboard.com/charts/hot-100');
      console.log('Fetching video info from Billboard...');
    },
    
    getOfficialTop40: function getOfficialTop40(next) {
      var titles = [], artists = [];
      var genre = genre || 'dance';
      var c = new Crawler({
        "maxConnections": 10,
        "callback": function(error, result, $) {
          //console.dir( result);
          $('.infoHolder h3').each(function(index, h3) {
            //console.log($(h1).text());
            titles.push($(h3).text());
          });
          $('.infoHolder h4').each(function(index, h4) {
            //console.log($(h1).text());
            artists.push($(h4).text());
          });
    
          for (var i = 0; i < titles.length; i++) {
            titles[i] = titles[i] + " " + artists[i];
          }
          //console.log('Got titles: ' + titles);
          getYTVideos(titles, 'official', next);
        }
      });
    
      c.queue('http://www.officialcharts.com/dance-charts');
      console.log('Fetching video info from Official...');
    },
    
    getBBCTopVideos: function getBBCTopVideos(next) {
      var titles = [], artists = [];
      var c = new Crawler({
        "maxConnections": 10,
        "callback": function(error, result, $) {
          $('.entrybox .cht-entry-title').each(function(index, title) {
            //console.log($(h1).text());
            titles.push($(title).text().trim());
          });
          $('.entrybox .cht-entry-artist').each(function(index, artist) {
            //console.log($(h1).text());
            artists.push($(artist).text().trim());
          });
    
          for (var i = 0; i < titles.length; i++) {
            titles[i] = titles[i] + " " + artists[i];
          }
    
          // $('.info').each(function(index, info) {
          //   //console.log($(h1).text());
          //   titles.push($(info).find('.artist').text() + ' ' + $(info).find('.title').text());
          // });
          console.log('Got titles: ' + titles);
          getYTVideos(titles, 'bbc', next);
        }  
      });
    
      c.queue('http://www.bbc.co.uk/radio1/chart/singles');
      console.log('Fetching video info from BBC...');
    }
    
  },
  function(err, results) {
    done();
  });
};


Video.find({}).remove(function() {
  Playlist.find({}).remove(function () {
    populateDefaultPlaylists(function() {
      var defaults = [
        {
          tag: 'billboard',
          title: 'Billboard Top 100',
          info: 'Top music videos from the Billboard Top 100'
        },
        {
          tag: 'official',
          title: "Official Dance Charts",
          info: "Top Videos on Official's Dance chart"
        },
        { tag: 'bbc',
          title: "BBC Radio 1 Top Charts",
          info: "Top music videos of the week from BBC Radio 1"
        }
      ];
      
      for (var i = 0; i < defaults.length; i++) {
        createNewPlaylist(defaults[i].title, defaults[i].tag, defaults[i].info);
      }
    });
  });
});

function getYTVideos(titles, category, next) {
  var title, query, results;
  var videos = [];
  var name, id;
  var searchUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&order=relevance&type=video&key="+API_KEY+"&q=";
console.log('Fetching video ids from Youtube...');  
console.dir(titles);

  async.each(titles, function( title, callback) {

    // Perform operation on file here.
    console.log('Processing video data request ' + title + ' for category ' + category);

    if (title != null) {
        query = encodeURI(title.split(' ').join('+') + "+official");
        console.log("calling yt api for " + title);
        request(searchUrl+query, function(error, response, body) {
          console.log("got response for " + title + " : " + response.statusCode);
          if (error)
            callback('Failed to get video data for: ' + query);
          //console.log(response.body);
          if (response == undefined || response.body == undefined) {
            console.log("Error: Response from Youtube did not contain a body: ")
            console.dir(response);
            return;
          }
          results = JSON.parse(response.body);
          name = results["items"][0]["snippet"]["title"];
          id = results["items"][0]["id"]["videoId"];
          //console.log('id: ' + results["items"][0]["id"]["videoId"]); //top result
          console.log('name: ' + results["items"][0]["snippet"]["title"]); 
          videos.push(results["items"][0]["id"]["videoId"]);
          
          Video.create({
            title : name,
            ytid : id,
            tags : category
          });

          callback();
        });
      }
  }, function(err){
      // if any of the file processing produced an error, err would equal that error
      if( err ) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.log('A video info request in ' + category + 'failed to process');
        next(err);
      } else {
        console.log('All video data for ' + category + ' has been processed successfully');
        next(null);
      }
  });

}

function removeVideos(tags) {
  Video.find({ 'tags': category}).remove(function() {

  });
}