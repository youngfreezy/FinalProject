  app.post('/api/stream/:recipe/comments', function (req, res, next) {
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
        broadCastStream();
        res.json(_recipe);
      });
      broadCastStream();
    });
  });

  UserAlerts.findOneAndUpdate({
    userId: userId
  }, {
    $pull: {
      alerts: {
        _id: alertId
      }
    }
  }, function (err, data) {
    console.log(err, data);
  });

  // User.update({
  //   _id: userId
  // }, {
  //   $pull: {
  //     'User.recipeBox': {
  //       recipeBox: recipeId
  //     }
  //   }
  // }).exec(function (err, deletedRecipe) {
  //   if (err) {
  //     throw err;
  //   }
  //   console.log("PPPPPPPPP", deletedRecipe);
  //   res.json(deletedRecipe);
  // });
  // Comments.remove({_id: req.comment._id}).exec(function(err, removedComment) {
  //   RecipeStream.findByIdAndUpdate(req.recipe._id, {$pull: {comments: req.comment._id}}).exec(function(err, recipe) {
  //     if (err) {
  //       return next(err);
  //     }
  //     res.json(recipe)
  //   })
  // })


  // console.log(userId);
  // console.log(recipeId);

  // deleteRecipe(userId, recipeId, res);