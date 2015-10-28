
  function deleteRecipe(userId, recipeId, res) {
    // console.log("============= this is the userId:", userId);
    User.where({
      _id: userId
    }).findOne(function (err, user) {
      if (err) {
        res.status(500).send(err);
        return;
      }

      if (!user) {
        res.status(404);
        return;
      }

      var recipeBox = user.recipeBox;
      if (recipeId === "deleteAll") {
        recipeBox = [];
        // console.log("inside the lookup and this is it:",recipeBox)

      } else {


        //       console.log(user);
        // console.log(recipeBox.length);

        for (var r = 0; r < recipeBox.length; r++) {

          // console.log(r, recipeBox[r]);
          // console.log(recipeBox[r]._id.toString(), recipeId.toString());
          if (recipeBox[r]._id.toString() == recipeId.toString()) {
            // console.log("we're deleting", recipeId);
            if (recipeBox.length == 1) {
              recipeBox = [];

            }

            recipeBox.splice(r, 1);
          }
        }
      }
      // console.log(recipeBox.length);
      user.recipeBox = recipeBox;
      user.save(function (err, resp) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        // console.log('done saving user recipes', resp);
        return res.json(resp);
      });
    });
  }


   // User.findOneAndUpdate(query, {
        //   $addToSet: {
        //     recipeBox: {
        //       _id: recipeId
        //     }
        //   }
        // }).exec(function (err, user) {
        //   if (err) {
        //     throw err;
        //   }

        //   console.log("RECIPE BOX!!!!!!", user);
        //   res.json(user);
        //   recipeStreamItem.save();
        //   broadCastStream();

        // });

        // Recipe.findOne({
        //   name: req.body.recipe.name
        // }, function (err, result) {
        //   if (!result) {
        //     recipe.save(function (err, r) {
        //       // console.log(r);
        //       if (err) {
        //         res.send(500, err);
        //         // console.log(JSON.stringify(err), "failed to save recipe");
        //       } else {
        //         // find the associated user
        //         // console.log("Hello");
        //         recipeStreamItem.save();
        //         pushToRecipeBox(req.body.email, r._id, res);
        //         broadCastStream();
        //       }
        //     });
        //     return;
        //   }

        //   recipeStreamItem.save();
        //   pushToRecipeBox(req.body.email, result._id, res);
        //   broadCastStream();
        // });