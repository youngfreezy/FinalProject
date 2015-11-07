var config = require('../config.js');
var request = require('request');

module.exports = {
	getRecipes: function (req, res) {
    var id = config.Yummly.id;
    var key = config.Yummly.key;
    var q = req.query.q;
    var max = 6;
    var url = "http://api.yummly.com/v1/api/recipes?_app_id=" + id + "&_app_key=" + key + "&q=" + q + "&maxResult=" + max;
    request(url, function (error, response, body) {
      if (!error) {
        res.json(JSON.parse(body));
      }
    });
  },
  getInitialRecipes: function (req, res) {
    var id = config.Yummly.id;
    var key = config.Yummly.key;
    var randGenre = req.query.q;
    var max = 6;
    var url = "http://api.yummly.com/v1/api/recipes?_app_id=" + id + "&_app_key=" + key + "&q=" + randGenre + "&maxResult=" + max + "&requirePictures=true";
    request(url, function (error, response, body) {
      if (!error) {
        res.json(JSON.parse(body));
      }
    });
  },

  getGenreRecipes: function (req, res) {
    var id = config.Yummly.id;
    var key = config.Yummly.key;
    var genre = req.query.q;
    var max = 6;
    var url = "http://api.yummly.com/v1/api/recipes?_app_id=" + id + "&_app_key=" + key + "&q=" + genre + "&maxResult=" + max;
    request(url, function (error, response, body) {
      if (!error) {
        res.json(JSON.parse(body));
      }
    });
  },

  getAllergyRecipes: function (req, res) {
    var id = config.Yummly.id;
    var key = config.Yummly.key;
    var allergy = req.query.q;
    var max = 6;
    var url = "http://api.yummly.com/v1/api/recipes?_app_id=" + id + "&_app_key=" + key + "&q=" + allergy + "&maxResult=" + max + "&requirePictures=true";
    request(url, function (error, response, body) {
      if (!error) {
        res.json(JSON.parse(body));
      }
    });
  },

  getSingleRecipe: function (req, res) {
    // console.log(req);
    var id = config.Yummly.id;
    var key = config.Yummly.key;
    var YummlyID = req.query.recipeid;

    var url = "http://api.yummly.com/v1/api/recipe/" + YummlyID + "?_app_id=" + id + "&_app_key=" + key;
    request(url, function (error, response, body) {
      if (!error) {
        res.json(JSON.parse(body));
      }
    });
  }
};