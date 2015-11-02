var express = require('express');
var app = express();
var request = require('supertest');
var chai = require('chai');
var assert = chai.assert;
var should = chai.should();
var expect = require('chai').expect;
var routes = require("../routes");
var session = require('express-session');
var path = require("path");
var User = require('../mongoModels/user');
// //for accessing private variables inside routes.  
// var rewire = require('rewire');
// var routes = rewire('../routes');
      

var globalUser = {
  _id: 123,
  done: true,
  recipeBox: [{
    _id: 'lala',
    done: false
  }, {
    _id: 'hi',
    done: false
  }]
};
// this is here temporarily. TODO: refactor my routes.js file to separate controllers from routes. Could not access this function from routes.js without that refactor.

function setRecipeDone(user, recipeId, done) {

  var recipeBox = user.recipeBox;
  for (var r in recipeBox) {
    if (recipeBox[r]._id == recipeId.toString())
      recipeBox[r].done = done;
  }

  user.recipeBox = recipeBox;
  
    return user;

}

describe('Routes', function () {
  // console.log("Test");
  app.use(session({
    secret: 'shhh, it\'s a secret',
    resave: false,
    saveUninitialized: true
  }));


  describe('Login Route', function () {

    it('responds back with a 400 code if not logged in', function (done) {
      app.post('/api/login', function (req, res) {

      });
      request(app)
        .post('/api/login')
        .expect(400)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res.status).to.be(400);
          // done();
        });
      done();

    });

  });

  describe("Set Recipe Done", function () {
    var res = {};

    res.sendStatus = function (status) {
      console.log('sendingstatus');
    };

    it('should update a recipe to be done', function (done) {
      var userId = globalUser._id;
      var recipeId = globalUser.r_id;
      var donerecipe = globalUser.done;

      // var recipeDoneFunction = routes.__get__("setRecipeDone");
      setRecipeDone(userId, recipeId, donerecipe);


      expect(globalUser.done).to.equal(true);

      done();

    });
  });

  describe("API RecipeBox", function() {
    var res = {};
    res.sendStatus = function(status) {
      console.log('sendingstatus');
    } 

  })

});