var request = require('supertest');
var chai = require('chai');
var assert = chai.assert;
var should = chai.should();
var expect = require('chai').expect;
var path = require("path");

var host = 'http://localhost:3000';
if (process.env.MODE === "heroku") {
  host = 'http://quickrecipesapp.herokuapp.com';
}

var postValidLoginCredentials = function () {
  return request(host).post('/api/login')
    .send({
      email: "fareez@fareez.com",
      'password': 'fareez'
    });


};


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


  describe('Login Route', function () {

    it('responds back with a 400 code if not logged in', function (done) {

      request(host)
        .post('/api/login')
        .expect(400, done);

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

  describe('GET /api/recipebox', function () {
    it('should return 404 if not logged in', function (done) {
      request(host)
        .get('/api/recipebox')
        .expect(404, done)
        .end(done);
    });
  });



  describe('POST /api/recipebox', function () {
    it("posts a new recipe to /api/recipebox", function (done) {
      var recipe = {
        recipe: {
          source: {
            sourceRecipeUrl: 'www.google.com',
          },
          images: [{
            hostedSmallUrl: 'www.google.com'
          }],
          numberOfServings: 5,
          ingredientLines: 'www.google.com',
          NutritionalInformation: 'www.google.com',
          name: 'www.google.com',
          totalTime: 500
        }
      };
      postValidLoginCredentials()
        .end(function (err, res) {
          // console.log(err);
          request(host)
            .post('/api/recipebox')
            .set('Cookie', res.headers['set-cookie'])
            .send(recipe)
            .expect(200, done)
            .end(function(err, res){
              console.log(err, res);
            })
        });

      // request(host)

      // .post('/api/recipebox')
      //   .send(recipe)
      //   .expect(200)
      //   .end(function (err, res) {
      //     if (err) {
      //       return done(err);
      //     }
      //     done();
      //   });
      // done();

    });

    //   it("posts a new recipe to /api/recipebox", function(done){

    //     var recipe = {
    //     recipe: {
    //         source: {
    //             sourceRecipeUrl: 'www.google.com',
    //         },
    //         images: [{
    //             hostedSmallUrl: 'www.google.com'
    //         }],
    //         numberOfServings: 5,
    //         ingredientLines: 'www.google.com',
    //         NutritionalInformation: 'www.google.com',
    //         name: 'www.google.com',
    //         totalTime: 500
    //     }
    // };

    // request("http://localhost:3000")
    // .post("/api/recipebox")
    // .send(recipe)
    // .expect(200, done);


    //   });


  });



});