'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PlaylistSchema = new Schema({
  name: String,
  info: String,
  //videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  videos: [String],
  creator: String,
  active: Boolean
});

PlaylistSchema.virtual('date')
  .get(function(){
    return this._id.getTimestamp();
  });
  
module.exports = mongoose.model('Playlist', PlaylistSchema);