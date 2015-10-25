'use strict';

var mongoose = require('mongoose');
var recipeSchema = new mongoose.Schema({
  recipeUrl: String,
  image: String,
  numServings: Number,
  Ingredients: [String],
  NutritionalInformation: [{
    attribute: String,
    description: String,
    unit: {
      name: String,
      plural: String
    },
    value: Number
  }],
  // _id: Number,
  name: String,
  createdAt: { type: Date, default: Date.now },
  totalTime: String
});

var Recipe = module.exports = mongoose.model('Recipe', recipeSchema);