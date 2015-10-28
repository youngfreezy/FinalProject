
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