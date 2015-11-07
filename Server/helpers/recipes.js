var User = require('../mongoModels/user');

module.exports = {

  //handles the querying:
  setRecipeDone: function (userId, recipeId, done, res) {
    User.where({
      _id: userId
    }).findOne(function (err, user) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);

      }

      if (!user) {
        return res.status(404);

      }

      var recipeBox = user.recipeBox;
      for (var r in recipeBox) {
        if (recipeBox[r]._id == recipeId.toString())
          recipeBox[r].done = done;
      }

      user.recipeBox = recipeBox;
      user.save(function (err, resp) {
        if (err) {
          return res.status(500).send(err);

        }
        // console.log('done saving user recipes', resp);
        return res.status(200).send(resp);
      });
    });
  },

  pushToRecipeBox: function (email, recipeId, res) {
    User.findOne({
      email: email
    }, function (err, user) {
      if (err) {
        return res.status(500).send(err);
      }

      if (!user) {
        return res.status(404);
      }

      var recipeBox = user.recipeBox;
      for (var r in user.recipeBox) {
        if (!user.recipeBox[r]._id) {
          continue;
        }

        if (recipeBox[r]._id == recipeId.toString()) {
          // console.log('recipe is already in recipeBox', recipeId);
          return res.status(200).send('recipe is already in recipeBox');
        }
      }

      user.recipeBox.push({
        _id: recipeId,
        done: false
      });

      user.save(function (err, resp) {
        if (err) {
          return res.status(500).send(err);

        }
        // console.log('added recipe to recipebox', resp);
        return res.status(200).send(resp);
      });
    });
  }

};