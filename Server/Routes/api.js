var passport = require('passport');
var User = require('../mongoModels/user');
var helpers = require('../helpers/recipes.js');
var Recipe = require('../mongoModels/recipe');
var RecipeStream = require('../mongoModels/stream');
var socketio;
module.exports = {
  subscribe: function (req, res) {
    var userId = req.user._id;
    var query = {
      _id: userId
    };
    console.log("HERRREE", userId);
    User.findOneAndUpdate(query, {

      emailSubscription: true
    }).exec(function (err, user) {
      if (err) {
        throw err;
      }
      res.json(user);
    });
  },
    unsubscribe: function (req, res) {
    User.findByIdAndUpdate(req.query.id, {
      emailSubscription: false
    }, function (err, user) {
      res.redirect("/");
    });
  },

  recipeDone: function (req, res) {
    var recipeId = req.params.recipeId;
    var userId = req.user._id;
    // console.log("this is the userId", userId);
    // console.log(recipeId);

    helpers.setRecipeDone(userId, recipeId, true, res);
  },

 recipeUndone: function (req, res) {
    var recipeId = req.params.recipeId;
    var userId = req.user._id;
    // console.log("this is the userId", userId);
    // console.log(recipeId);

    helpers.setRecipeDone(userId, recipeId, false, res);
  },

    //don't have reference to right socketio object, to solve that, we create
    // this function, which takes io as a paremeter, which is the right io object being used in routes.
    // saved in the socketio variable in this file. 
  setsocketIO: function(io) {
    socketio = io;
  },

  postToRecipeBoxAndStream: function (req, res) {
    var recipe = new Recipe({
      recipeUrl: req.body.recipe.source.sourceRecipeUrl,
      image: req.body.recipe.images[0].hostedSmallUrl,
      numServings: req.body.recipe.numberOfServings,
      Ingredients: req.body.recipe.ingredientLines,
      NutritionalInformation: req.body.recipe.nutritionEstimates,
      name: req.body.recipe.name,
      totalTime: req.body.recipe.totalTime
    });

    var recipeStreamItem = new RecipeStream({
      userId: req.user._id,
      userName: req.user.name,
      recipeUrl: req.body.recipe.source.sourceRecipeUrl,
      image: req.body.recipe.images[0].hostedSmallUrl,
      name: req.body.recipe.name,
      totalTime: req.body.recipe.totalTime
    });

    Recipe.findOne({
      name: req.body.recipe.name
    }, function (err, result) {
      if (!result) {
        recipe.save(function (err, r) {
          // console.log(r);
          if (err) {
            res.send(500, err);
            // console.log(JSON.stringify(err), "failed to save recipe");
          } else {
            // find the associated user
            // console.log("Hello");
            recipeStreamItem.save();
            helpers.pushToRecipeBox(req.user.email, r._id, res);
            socketio.broadCastStream();
          }
        });
        return;
      }

      recipeStreamItem.save();
      helpers.pushToRecipeBox(req.user.email, result._id, res);
      socketio.broadCastStream();
    });
  },

  getUserRecipes: function (req, res) {
    //passport injects req.user.
    // console.log(req.user._id);
    User.findById(
      req.user._id,
      function (err, user) {
        // console.log("the user is", user);
        // console.log(user);
        if (err) {
          res.send(500, err.message);
        } else {
          //found the user, get all their recipes

          if (user.recipeBox.length > 0) {
            Recipe
              .where('_id').in(user.recipeBox)
              .exec(function (err, result) {
                if (err) {
                  res.send(500, err.message);
                  return;
                }

                res.json(result);
              });
            return;
          }

          // res.json(result);
        }
      });
  }
  

};