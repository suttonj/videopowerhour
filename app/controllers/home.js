var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Playlist = mongoose.model('Playlist');

// module.exports = function (app) {
//   app.use('/', router);
// };

router.get('/', function (req, res, next) {
  // var defaultPlaylist = Playlist.where({ name: 'Billboard Top 100' });
  // defaultPlaylist.findOne(function (err, playlist) {
  //   if (err) return next(err);
    res.render('index', {
      title: 'Powerhour Video',
      // playlist: JSON.parse(playlist)
    });
  // });
  
});

module.exports = router;