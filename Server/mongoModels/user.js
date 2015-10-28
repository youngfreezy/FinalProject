'use strict';

var crypto = require('crypto');
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var recipeSchema = require('./recipe.js').schema;
//need the objectID, see: https://gist.github.com/fwielstra/1025038
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var userSchema = new Schema({
  email: {
    type: String,
    unique: true
  },
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  picture: ObjectId,
  name: String,
  facebook: {
    id: String,
    token: String,
    pictures: String
  },
  // recipesDone: [mongoose.Schema.ObjectId],
  // each time someone adds a recipe, push it here.
  // recipeBox: [mongoose.Schema.ObjectId]
  // can refactor this with $populate
  recipeBox: [Schema({
    recipe: ObjectId,
    done: Boolean
  }, {
    _id: false
  })],
});

userSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

var User = module.exports = mongoose.model('User', userSchema);