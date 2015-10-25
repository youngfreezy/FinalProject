'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var recipeStreamSchema = new mongoose.Schema({
  userId: ObjectId,
  userName: String,
  recipeUrl: String,
  image: String,
  name: String,
  createdAt: { type: Date, default: Date.now },
  upvotes: {type: Number, default: 0 },
  
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }]
});

//adding an upvote function to the schema
recipeStreamSchema.methods.upvote = function(cb) {
	this.upvotes += 1;
	this.save(cb);
};

var RecipeStream = module.exports = mongoose.model('RecipeStream', recipeStreamSchema);