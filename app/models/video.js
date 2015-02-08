'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VideoSchema = new Schema({
  title: String,
  ytid: String,
  tags: [String],
  active: Boolean
});

VideoSchema.virtual('date')
  .get(function(){
    return this._id.getTimestamp();
  });
module.exports = mongoose.model('Video', VideoSchema);
