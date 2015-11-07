var User = require('../mongoModels/user');
var Recipe = require('../mongoModels/recipe');
var RecipeStream = require('../mongoModels/stream');

module.exports = {
	deleteRecipe: function (req, res) {
    var recipeId = req.params.recipeId;
    var userId = req.user._id;
    var query = {
      _id: userId
    };
    // User.where({_id: userId}).findOne{}
    User.findOneAndUpdate(query, {
      $pull: {
        recipeBox: {
          _id: recipeId
        }
      }
    }).exec(function (err, user) {
      if (err) {
        throw err;
      }

      // console.log("RECIPE BOX!!!!!!", user);
      res.json(user);

    });
  },

  deleteAllRecipes: function (req, res) {
    //the user has a recipe box array.  set it to undefined or null.
    var userId = req.user._id;
    var query = {
      _id: userId
    };

    User.update(query, {
      $set: {
        recipeBox: []
      }
    }, function (err, affected) {
      if (err) {
        throw err;
      }
      // console.log('affected: ', affected);
      // console.log(res);
      res.json(affected);
    });

  }
};