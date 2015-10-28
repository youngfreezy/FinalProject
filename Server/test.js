 app.delete('/api/stream/:recipe/comments/:comment', function (req, res, next) {
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
        broadCastStream();
        res.json(recipe);
      });
    });
  });

   // console.log(req.body);
    User.findOne({ _id: userId}).populate('recipeBox', function(err, user){
      if(err){
        throw err;
      }

      console.log(user);
    });

   User.findOneAndUpdate(query, {
        //reference to gridFS saved file.  
        "picture": file._id
      }, {
        'upsert': true,
        'new': true
      }, function (err, data) {
        if (err) {
          return res.send(500, {
            error: err
          });
        }
        console.log(data);
        res.json(data);
      });

    app.get('/api/stream/:recipe', function (req, res) {
    //use populate to get all comments associate with this recipe!
    req.recipe.populate('comments', function (err, recipe) {
      if (err) {
        return next(err);
      }

      res.json(recipe);
    });
  });