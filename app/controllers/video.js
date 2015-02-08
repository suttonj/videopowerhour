var express = require('express'),
  _ = require('lodash'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Video = mongoose.model('Video');


// module.exports = function (app) {
//   app.use('/', router);
// };

router.get('/', index);
router.get('/:id', show);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', destroy);

/// Get all Videos
function index(req, res, next) {
    Video.find(function (err, videos) {
        if(err) { return handleError(res, err); }
            return res.json(200, videos);
    });
}

// Get a single Video
function show(req, res) {
  Video.findById(req.params.id, function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    return res.json(video);
  });
};

// Creates a new Video in the DB.
function create(req, res) {
  Video.create(req.body, function(err, video) {
    if(err) { return handleError(res, err); }
    return res.json(201, video);
  });
};

// Updates an existing Video in the DB.
function update (req, res) {
  if(req.body._id) { delete req.body._id; }
  Video.findById(req.params.id, function (err, video) {
    if (err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    var updated = _.merge(video, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, video);
    });
  });
};

// Deletes a Video from the DB.
function destroy (req, res) {
  Video.findById(req.params.id, function (err, video) {
    if(err) { return handleError(res, err); }
    if(!video) { return res.send(404); }
    video.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

module.exports = router;