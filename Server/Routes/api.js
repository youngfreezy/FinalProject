var express = require('express');
var app = express.Router();


  app.post('/api/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err || !user) {
        res.status(400).send(info);
      } else {
        // if user logs in locally their cookie is being over written, which is great.
   
        if (req.user) {
          // console.log("This is the user from routes.js", req.user);
          // res.cookie('user', JSON.stringify(req.user));
        }
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {

            // console.log("This is the user from local strategy:", req.user);
            user.password = null;
            res.json(user);
          }
        });
      }
    })(req, res, next);
  });


  // Unsubscribe
  app.get('/api/unsubscribe', function (req, res) {
    User.findByIdAndUpdate(req.query.id, {
      emailSubscription: false
    }, function (err, user) {
      res.redirect("/");
    });
  });

  app.post('/api/signup', function (req, res) {
    var user = new User({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name
    });
    user.save(function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(200);
      }
    });
  });
  




//YUMMLY QUERIES;

  app.get('/api/yummly_recipes', function (req, res) {
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
  });

  app.get('/api/yummly_recipes/genre', function (req, res) {
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
  });

  app.get('/api/yummly_recipes/allergy', function (req, res) {
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
  });

  app.get('/api/yummly_recipes/initRecipes', function (req, res) {
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
  });

  app.get('/api/yummly_recipes/recipe', function (req, res) {
    console.log(req);
    var id = config.Yummly.id;
    var key = config.Yummly.key;
    var YummlyID = req.query.recipeid;

    var url = "http://api.yummly.com/v1/api/recipe/" + YummlyID + "?_app_id=" + id + "&_app_key=" + key;
    request(url, function (error, response, body) {
      if (!error) {
        res.json(JSON.parse(body));
      }
    });
  });



  app.post('/api/users/:userid/recipes/:recipeId/done', function (req, res) {
    var recipeId = req.params.recipeId;
    var userId = req.user._id;
    // console.log("this is the userId", userId);
    // console.log(recipeId);

    setRecipeDone(userId, recipeId, true, res);
  });

  app.post('/api/users/:userid/recipes/:recipeId/undone', function (req, res) {
    var recipeId = req.params.recipeId;
    var userId = req.user._id;
    // console.log("this is the userId", userId);
    // console.log(recipeId);

    setRecipeDone(userId, recipeId, false, res);
  });






app.post('/api/recipebox', function (req, res) {


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
            pushToRecipeBox(req.body.email, r._id, res);
            broadCastStream();
          }
        });
        return;
      }

      recipeStreamItem.save();
      pushToRecipeBox(req.body.email, result._id, res);
      broadCastStream();
    });
  });



  //get all recipes from the recipebox:
  app.get('/api/:user/recipes', ensureAuthenticated, function (req, res) {
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
  });
  //remove from recipebox
  //TODO: cache the queries

  //   app.param('userid', function (req, res, next, id) {
  //   var query = RecipeStream.findById(id);

  //   query.exec(function (err, recipe) {
  //     if (err) {
  //       return next(err);
  //     }
  //     if (!recipe) {
  //       return next(new Error('can\'t find recipe'));
  //     }

  //     req.recipe = recipe;
  //     return next();
  //   });
  // });

  app.put('/api/:user/subscription', function (req, res) {
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
  });

  app.delete('/api/users/:userid/recipes/:recipeId', function (req, res) {
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
  });

  //delete all:
  app.delete('/api/users/:userid/recipes', function (req, res) {
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

  });
  //this is middleware for the recipeStream items. handles :recipe

  app.param('recipe', function (req, res, next, id) {
    var query = RecipeStream.findById(id);

    query.exec(function (err, recipe) {
      if (err) {
        return next(err);
      }
      if (!recipe) {
        return next(new Error('can\'t find recipe'));
      }

      req.recipe = recipe;
      return next();
    });
  });



  //this is middleware for the comments. handles :comment

  app.param('comment', function (req, res, next, id) {
    var query = Comments.findById(id);

    query.exec(function (err, comment) {
      if (err) {
        return next(err);
      }
      if (!comment) {
        return next(new Error('can\'t find comment'));
      }

      req.comment = comment;
      return next();
    });
  });

  app.get('/api/stream', function (req, res, next) {
    RecipeStream.find(function (err, recipes) {
      if (err) {
        return next(err);
      }

      res.json(recipes);
    });
  });
  //get a single recipe from the stream

  //api/stream = posts, :recipe = post.
  //this = '/posts/:post'
  app.get('/api/stream/:recipe', function (req, res) {
    //use populate to get all comments associate with this recipe!
    req.recipe.populate('comments', function (err, recipe) {
      if (err) {
        return next(err);
      }

      res.json(recipe);
    });
  });

  //this route is not necessary since you are really posting from api/add

  app.post('/api/stream', function (req, res, next) {
    var recipeStreamItem = new RecipeStream(req.body);

    recipeStreamItem.save(function (err, recipes) {
      if (err) {
        return next(err);
      }

      res.json(recipes);
    });
  });

  app.put('/api/stream/:recipe/upvote', function (req, res, next) {
    // req.recipe.update()

    req.recipe.upvote(function (err, recipe) {
      if (err) {
        return next(err);
      }

      broadCastStream();
      res.json(recipe);
    });
  });

  //route for upvoting comments

  app.put('/api/stream/:recipe/comments/:comment/upvote', function (req, res, next) {
    req.comment.upvote(function (err, comment) {
      if (err) {
        return next(err);
      }
      broadCastStream();
      res.json(comment);
    });
  });
  //route for posting comments on recipe stream recipes:


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

  //handle POST requests to /upload







module.exports = router;