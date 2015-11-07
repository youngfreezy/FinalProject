var User = require('../mongoModels/user');
var Recipe = require('../mongoModels/recipe');
var RecipeStream = require('../mongoModels/stream');
var Comments = require('../mongoModels/comments');
var socketio;
module.exports = {

  getStream: function (req, res, next) {
    RecipeStream.find(function (err, recipes) {
      if (err) {
        return next(err);
      }

      res.json(recipes);
    });
  },

  getRecipeInStream: function (req, res) {
    //use populate to get all comments associate with this recipe!
    //using app.param(recipe) middleware:
    req.recipe.populate('comments', function (err, recipe) {
      if (err) {
        return next(err);
      }

      res.json(recipe);
    });
  },
  setsocketIO: function(io) {
    socketio = io;
  },
  upVoteRecipeInStream: function (req, res, next) {
    // req.recipe.update()

    req.recipe.upvote(function (err, recipe) {
      if (err) {
        return next(err);
      }

      socketio.broadCastStream();
      res.json(recipe);
    });
  },

  commentRecipeInStream: function (req, res, next) {
    var comment = new Comments(req.body);
    comment.recipe = req.recipe._id;

    comment.save(function (err, comment) {
      if (err) {
        return next(err);
      }

      RecipeStream.findByIdAndUpdate(req.recipe._id, {
        $push: {
          comments: comment._id
        }
      }).populate('comments').exec(function (err, _recipe) {
        if (err) {
          return next(err);
        }
        socketio.broadCastStream();
        res.json(_recipe);
      });
      socketio.broadCastStream();
    });
  },

  deleteComment: function (req, res, next) {
    Comments.remove({
      _id: req.comment._id
    }).exec(function (err, removedComment) {
      RecipeStream.findByIdAndUpdate(req.recipe._id, {
        $pull: {
          comments: req.comment._id
        }
      }).exec(function (err, recipe) {
        if (err) {
          return next(err);
        }
        socketio.broadCastStream();
        res.json(recipe);
      });
    });
  }
};