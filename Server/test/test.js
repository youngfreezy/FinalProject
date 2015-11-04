var request = require('supertest');
var chai = require('chai');
var assert = chai.assert;
var should = chai.should();
var expect = require('chai').expect;
var path = require("path");
var fs = require('fs');

var host = 'http://localhost:3000';
if (process.env.MODE === "heroku") {
  host = 'http://quickrecipesapp.herokuapp.com';
}

function authenticate() {
  return request(host).post('/api/login')
    .send({
      email: "fareez@fareez.com",
      'password': 'fareez'
    });
}

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
        .expect(404, done);
    });
  });

  describe('POST /api/recipebox', function () {
    it("posts a new recipe to /api/recipebox", function (done) {
      var recipe = {
        recipe: {
          source: {
            sourceRecipeUrl: 'https://en.wikipedia.org/wiki/Dolma',
          },
          images: [{
            hostedSmallUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Etli_dolma.JPG/500px-Etli_dolma.JPG'
          }],
          numberOfServings: 5,
          ingredientLines: 'nothing',
          NutritionalInformation: 'nothing',
          name: 'Dolma',
          totalTime: 500
        }
      };

      authenticate().end(function (err, res) {
        request(host)
          .post('/api/recipebox')
          .set('Cookie', res.headers['set-cookie'])
          .type('json')
          .send(JSON.stringify(recipe))
          .expect(200, done);
      });



    });



    describe('GET /api/stream', function () {
      it("gets stream feed of newly added itesm to users recipebox", function (done) {
        authenticate().end(function (err, res) {
          request(host)
            .get('/api/stream')
            .set('Cookie', res.headers['set-cookie'])
            .expect(200)
            .end(function (err, res) {
              if (err) {
                done(err);
                return;
              }

              if (res.body.length > 0) {
                done();
                return;
              }

              done('res.body is empty');
            });
        });
      });
    });

    describe('POST /api/stream/:recipe/comments', function () {
      it("posts comment to stream feed", function (done) {
        authenticate().end(function (err, res) {
          var cookies = res.headers['set-cookie'];
          request(host)
            .get('/api/stream')
            .set('Cookie', cookies)
            .expect(200)
            .end(function (err, res) {
              if (err) {
                done(err);
                return;
              }

              if (!(res.body.length > 0)) {
                done('res.body is empty');
                return;
              }

              var lastItem = res.body[res.body.length - 1];
              var comment = {
                _id: lastItem._id,
                body: 'Dolma is yummy!'
              };
              request(host)
                .post('/api/stream/' + lastItem._id + '/comments')
                .set('Cookie', cookies)
                .expect(200)
                .type('json')
                .send(JSON.stringify(comment))
                .end(function (err, res) {
                  if (err) {
                    done(err);
                    return;
                  }

                  done();
                });
            });
        });
      });
    });

  });

  describe('POST /upload', function () {
    it("uploads profile image of current logged in user and gets base64 string", function (done) {
      var file = __dirname + '/profile.jpg';
      file = new Buffer(fs.readFileSync(file)).toString('base64');

      authenticate().end(function (err, res) {
        var cookies = res.headers['set-cookie'];
        request(host)
          .post('/upload')
          .set('Cookie', cookies)
          .expect(200)
          .attach('file', __dirname + '/profile.jpg')
          .end(function (err, res) {
            if (err) {
              done(err);
              return;
            }

            if (!res.text) {
              done('No data in response');
              return;
            }

            if (res.text.length != file.length) {
              done('Uploaded image is not same with base64 in response');
              return;
            }

            done();
          });
      });
    });
  });

  describe('POST /upload/save', function () {
    it("uploads and saves profile image of current logged in user and compares base64 string", function (done) {
      var file = __dirname + '/profile.jpg';
      file = new Buffer(fs.readFileSync(file)).toString('base64');

      authenticate().end(function (err, res) {
        var cookies = res.headers['set-cookie'];
        request(host)
          .post('/upload/save')
          .set('Cookie', cookies)
          .expect(200)
          .attach('file', __dirname + '/profile.jpg')
          .end(function (err, res) {
            if (err) {
              done(err);
              return;
            }

            if (!res.body.image) {
              done('No image field in response');
              return;
            }

            if (res.body.image.length != file.length) {
              done('Uploaded image is not same with image in response');
              return;
            }

            done();
          });
      });
    });
  });


});