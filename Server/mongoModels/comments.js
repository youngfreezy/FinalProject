var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
  body: String,
  //use populate to get this.  
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  upvotes: {
    type: Number,
    default: 0
  },
recipe:{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'RecipeStream'}
});

module.exports = mongoose.model('Comments', commentSchema);