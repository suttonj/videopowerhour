var express = require('express'),
  _ = require('lodash'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Playlist = mongoose.model('Playlist');


// module.exports = function (app) {
//   app.use('/', router);
// };

router.get('/', index);
router.get('/:id', show);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', destroy);

/// Get all playlists
function index(req, res, next) {
    Playlist.find(function (err, playlists) {
        if(err) { return handleError(res, err); }
            return res.json(200, playlists);
    });
}

// Get a single playlist
function show(req, res) {
  Playlist.findById(req.params.id, function (err, playlist) {
    if(err) { return handleError(res, err); }
    if(!playlist) { return res.send(404); }
    return res.json(playlist);
  });
};

// Creates a new playlist in the DB.
function create(req, res) {
  Playlist.create(req.body, function(err, playlist) {
    if(err) { return handleError(res, err); }
    return res.json(201, playlist);
  });
};

// Updates an existing playlist in the DB.
function update (req, res) {
  if(req.body._id) { delete req.body._id; }
  Playlist.findById(req.params.id, function (err, playlist) {
    if (err) { return handleError(res, err); }
    if(!playlist) { return res.send(404); }
    var updated = _.merge(playlist, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, playlist);
    });
  });
};

// Deletes a playlist from the DB.
function destroy (req, res) {
  Playlist.findById(req.params.id, function (err, playlist) {
    if(err) { return handleError(res, err); }
    if(!playlist) { return res.send(404); }
    playlist.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

module.exports = router;