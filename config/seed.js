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

var videosFetched = function(videos) {

};

Video.find({}).remove(function() {
//   getBillboardTop100(videosFetched);
// });


Playlist.find({}).remove(function() {
  Playlist.create({
    name : 'Test Playlist',
    info : 'First power hour playlist!',
    videos : ['jofNR_WkoCE','jofNR_WkoCE']
  });

  getBillboardTop100(function() {
    console.log('Creating playlist for Billboard...');
    //Playlist.find({'name': 'Billboard Top 100'}).remove(function() {
  console.log('removed old billboard');
      Video.find({ 'tags': 'billboard'}).lean().exec(function(err, videos) {
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
          name : 'Billboard Top 100',
          info : 'Powerhour of the top music videos from the Billboard Top 100',
          videos : vidarr
        });
      //playlist.populate('videos');
      playlist.save(function(err){
        if (err) console.log(err);

        console.log("created billboard playlist");
        console.dir(vidarr);
      });

  // console.dir(vidarr);
  //       results.forEach(function(video) {
  //         vidarr.push(video._id);
  //       });

      });
    //});
  });
  getOfficialTop40('dance', function() {
    console.log('Creating playlist for Official...');
    //Playlist.find({'name': 'Official Dance Charts'}).remove(function() {
      Video.find({ 'tags': 'official' }).lean().exec(function(err, videos) {
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
          name : 'Official Dance Charts',
          info : 'Top Dance Music Videos',
          videos : vidarr
        });
      //playlist.populate('videos');
      playlist.save(function(err){
        if (err) console.log(err);

        console.log("created official dance playlist");
        console.dir(vidarr);
      });

  // console.dir(vidarr);
  //       results.forEach(function(video) {
  //         vidarr.push(video._id);
  //       });

      });
    });
  });
}); 


function getBillboardTop100(callback) {
  var titles = [];
  var c = new Crawler({
    "maxConnections": 10,
    "callback": function(error, result, $) {
      //console.dir( result);
      $('article .row-title h2').each(function(index, h1) {
        //console.log($(h1).text());
        titles.push($(h1).text());
      });
      //console.log('Got titles: ' + titles);
      getYTVideos(titles, 'billboard', callback);
    }
  });

  c.queue('http://www.billboard.com/charts/hot-100');
  console.log('Fetching video info from Billboard...');
}

function getOfficialTop40(genre, callback) {
  var titles = [], artists = [];
  genre = genre || 'dance';
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
      getYTVideos(titles, 'official', callback);
    }
  });

  c.queue('http://www.officialcharts.com/dance-charts');
  console.log('Fetching video info from Billboard...');
}

function getYTVideos(titles, category, done) {
  var title, query, results;
  var videos = [];
  var name, id;
  var searchUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&order=relevance&type=video&key="+API_KEY+"&q=";
console.log('Fetching video ids from Youtube...');  
console.dir(titles);

  async.each(titles, function( title, callback) {

    // Perform operation on file here.
    console.log('Processing video data request ' + title);

    if (title != null) {
        query = encodeURI(title.split(' ').join('+') + "+official");
        request(searchUrl+query, function(error, response, body) {
          //console.log(response.statusCode);
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
        console.log('A video info request failed to process');
      } else {
        console.log('All video data has been processed successfully');
      }
      done();
  });

  // for (var i = 0; i < titles.length; i++) {
  //   title = titles[i];
  //   if (title != null) {
  //     query = encodeURI(title.split(' ').join('+') + "+official");
  //     request(searchUrl+query, function(error, response, body) {
  //       //console.log(response.statusCode);
  //       //console.log(response.body);
  //       results = JSON.parse(response.body);
  //       name = results["items"][0]["snippet"]["title"];
  //       id = results["items"][0]["id"]["videoId"];
  //       //console.log('id: ' + results["items"][0]["id"]["videoId"]); //top result
  //       console.log('name: ' + results["items"][0]["snippet"]["title"]); 
  //       videos.push(results["items"][0]["id"]["videoId"]);
        
  //       Video.create({
  //         title : name,
  //         ytid : id,
  //         tags : category
  //       });

  //       if (i == titles.length - 1){
  //         console.log('finished getting youtube videos for ' + category);
  //         callback();
  //       }
  //     });
  //   }
  // }
  console.log('Finished loading videos from Youtube:');
  console.dir(videos);
  //callback(videos);
}

function removeVideos(tags) {
  Video.find({ 'tags': category}).remove(function() {

  });
}