var express = require('express');
var app = express();
var request = require('supertest');
var chai = require('chai');
var assert = chai.assert;
var should = chai.should();
var expect = require('chai').expect;
var routes = require("../routes")(app);
var session = require('express-session');
var path = require("path");
var user = require('../mongoModels/user');

var globalUser = {
  _id: 123,
  done: true,
  r_id: 123
};

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

    it('should update a recipe to be done', function (done) {
      var userId = globalUser._id;
      var recipeId = globalUser.r_id;
      var donerecipe = globalUser.done;

      routes.setRecipeDone(userId, recipeId, donerecipe);

      if (err) {
        return done(err);
      }
      expect(globalUser.done).to.equal(true);

      done();

    });
  });


});