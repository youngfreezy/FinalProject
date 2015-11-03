var User = require('./mongoModels/user');
var Recipe = require('./mongoModels/recipe');
var RecipeStream = require('./mongoModels/stream');
var Comments = require('./mongoModels/comments');
var passport = require('passport');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var fs = require('fs');
var moment = require('moment');
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({
  storage: storage
});
var upload2 = multer({
  dest: '/tmp/'
});
var config = require('./config.js');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nodemailertester3@gmail.com',
    pass: config.gmail.pass
  }
});
var request = require('request');

module.exports = function (app, io) {
  var CronJob = require('cron').CronJob;

  //routes for socket.io
  var sockets = [];
  var userSockets = [];

  io.on('connect', function (socket) {
    var handshake = socket.handshake.query;
    var userId = handshake.userId;
    var email = handshake.email;

    // here you are adding socket connections to the sockets array
    sockets[socket.id] = socket;
    if (!userSockets[userId]) {
      userSockets[userId] = [];
    }
    userSockets[userId][socket.id] = socket;

    // console.log('GOT CONNECTION: ' + socket.id);


    socket.on('stream', function () {
      broadCastStream();
    });

    socket.on('disconnect', function (socket) {
      // console.log('SOCKET DISCONNECTED: ' + socket.id);
      delete sockets[socket.id];
      userSockets.each(function (sockets) {
        for (var s in sockets) {
          if (s == socket.id) {
            delete sockets[s];
          }
        }
      });
    });
  });

  function broadCastStream() {
    var anHourAgo = moment().subtract(1, 'hour');
    RecipeStream.find({
      createdAt: {
        $gt: anHourAgo
      }
    }).populate('comments').exec(function (err, recipes) {
      if (err) {
        recipes = [];
      }
      //sending message back to client. can have same name but can be different.
      for (var s in sockets) {
        sockets[s].emit('stream', recipes);
      }
    });
  }

  function cronJob() {
    var usersWithRecipeBoxes = [];

    User.find({
      // this finds all the users
      emailSubscription: true,
      recipeBox: {
        $exists: true,
        $not: {
          $size: 0
        }
      }
    }, function (err, result) {
      console.log(result);
      if (err) {
        return console.log("Something went wrong when querying the users: ", err);
        //throw err;
      }
      result = result.map(function (currentUser) {
        //currentUser is an element of the result array.
        return {
          _id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          recipeBox: currentUser.recipeBox,

          //  filter: [{ _id: ObjectId, done: false }]
          //  map:    [ ObjectId, ObjectId, ObjectId, ObjectId... ]
          incompleteRecipes: currentUser.recipeBox.filter(function (currentRecipe) {
            return currentRecipe.done === false;
          }).map(function (currentRecipe) {
            return currentRecipe._id;
          })
        };
      });
      //result is now an array of objects (which we return on line 22, filtered with incomplete recipes by Id)
      //concating to avoid nesting
      usersWithRecipeBoxes = usersWithRecipeBoxes.concat(result);

      // [{ incompleteRecips: [ObjectIds] }]
      var complete = 0;

      function sendEmails() {

        function emailText(currentUser) {
          var text = "";
          text += "Hello " + currentUser.name + "!\n\n";
          text += "You have the following recipes waiting in your Recipe Box:\n";
          text += currentUser.incompleteRecipes.map(function (c) {
            return c.recipeUrl;
          }).join("\n"); // \n
          text += "\n\nHappy Cooking!";
          text += "\n\nUnsubscribe: ";
          text += "http://quickrecipesapp.herokuapp.com/api/unsubscribe?id=" + currentUser._id;

          console.log(text);
          return text;
        }

        function emailData(currentUser) {
          return {
            from: 'nodemailertester3@gmail.com',
            to: currentUser.email,
            subject: 'hello',
            text: emailText(currentUser)
          };
        }

        // For every user
        result.forEach(function (currentUser) {
          // console.log(emailData(c));
          // Send the email with the urls
          transporter.sendMail(emailData(currentUser), function (err) {
            if (err) {
              console.error(err);
            }
          });
        });
      }


      function checkComplete() {
        //calling checkComplete each time a DB query is done/executed. don't know when it will end, this
        // is a way to handle asynchronicity.
        if (++complete === result.length) {
          sendEmails();
        }
      }

      function findIncompleteRecipes(currentUser) {

        Recipe.find().where('_id').in(currentUser.incompleteRecipes).select({
          recipeUrl: 1,
          name: 1
        }).exec(function (err, incompleteRecipes) {

          if (err) {
            checkComplete();
            return console.log("Something went wrong when querying the recipes: ", err);
          }
          //this replaces the IDs with actual recipes. similar to populate.
          currentUser.incompleteRecipes = incompleteRecipes;
          checkComplete();
          return;
        });
      }
      //if no users with incomplete recipes, call the done function.
      //if (result.length === 0) {
      //    sendEmails();
      //}
      //go through results of current Users with recipe boxes, and there there will be actual recipes in their recipe boXes.
      for (var i = 0; i < result.length; ++i) {
        findIncompleteRecipes(result[i]);
      }
    });
  }

  var job = new CronJob({
    // cronTime: '10 * * * * *' ---> once every minute at the 10 second mark.
    // cronTime: '*/10 * * * * *',
    //this will be run every three days at 11:30
    cronTime: '00 30 11 * * */3',
    onTick: function () {

      cronJob();
      /*
       * Runs every weekday (Monday through Friday)
       * at 11:30:00 AM. It does not run on Saturday
       * or Sunday.
       //make a test route to sendAllEmails and once its working, move it into ontick.
       */
      //    //nodemailer. this works.  use cron, wake it up, query the database, send the email.
      //    // put it in its own file/directory.
      //    // its job is to connect to the database periodically and do this.
      // TODO: connect to the database. grab all the users.  find their incomplete recipes, send them an email based upon that.
      //need to change 'to ' to what is polled from the database.
    },
    start: false,
    timeZone: 'America/Los_Angeles'
  });

  job.start();
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
  app.get('/auth/facebook', function (req, res, next) {
    // var backUrl = req.params.backUrl;
    // res.session.backUrl = backUrl;
    passport.authenticate('facebook', {
      display: 'popup',
      scope: ['email']
    })(req, res, next);

  });
  // if no error, this gets hit:
  //middleware for previous url: 

  app.get('/auth/facebook/callback', function (req, res, next) {


    passport.authenticate('facebook', {
      successRedirect: req.session.returnTo
    }, function (err, user, info) {
      // console.log(' in the callback ');
      var redirectUrl = "/#!/login";
      if (err) {
        // console.log(err);
        return next(err);
      }

      if (!user) {
        return res.redirect('/#!/signup');
      }
      if (req.user) {
        // console.log("==================== This is the user from routes.js", req.user);
        res.cookie('user', JSON.stringify(user));
      }

      if (req.session.redirectUrl) {
        redirectUrl = req.session.redirectUrl;
        req.session.redirectUrl = null;
      }
      //actually storing the fact that they are logged in:
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        console.log('=========== here!', user);
      });
      console.log('=========== here ALSO!!', req.session.redirectUrl);
      console.log('=========== here ALSO!!', req.session.redirectUrl);
      res.redirect(req.session.returnTo);


    })(req, res, next);
  });

  app.get('/profile/:id', ensureAuthenticated, function (req, res, next) {
    //shouldn't find it by facebook - find it by other identifier
    User.findOne({
      // or req.user._id;
      _id: req.user._id
    }, function (err, user) {
      if (err) {
        throw err;
      }
      user.password = null;
      res.json(user);
    });
  });

  app.get('/api/logout', function (req, res, next) {
    req.logout();
    res.send(200);
  });


  //handles the querying:
  function setRecipeDone(userId, recipeId, done, res) {
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
        return  res.status(500).send(err);
          
        }
        // console.log('done saving user recipes', resp);
        return res.status(200).send(resp);
      });
    });
  }

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

  function pushToRecipeBox(email, recipeId, res) {
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
  var Grid = require('gridfs-stream'),
    mongoose = require('mongoose'),
    GridFS = Grid(mongoose.connection.db, mongoose.mongo);


  app.post('/upload', upload.single('file'), function (req, res, next) {
    // console.log('file', req.file);
    // console.log('content', req.file.buffer.toString('base64'));
    var file = req.file.buffer;
    // console.log(req.file);

    res.send(200, file.toString('base64'));

    // console.log(file);
  });
  // confirm user wants to save it first after they see it

  app.post('/upload/save', upload2.single('file'), function (req, res, next) {


    var file = req.file;
    console.log('file', file);

    fs.readFile(file.path, function (err, data) {
      if (err) throw err;
      console.log(data);

      var base64data = new Buffer(data).toString('base64');
      // image: data.buffer.toString('base64')


      // var writestream = GridFS.createWriteStream({
      //   filename: file.name,
      //   mode: 'w',
      //   content_type: file.mimetype,
      //   metadata: req.body,
      // });
      // fs.createReadStream(file.path).pipe(writestream);


      // writestream.on('close', function (file) {
      // console.log("============", file);

      var userId = req.user._id;
      var query = {
        '_id': userId
      };
      // console.log('query', query);
      // console.log(newData);
      User.findOneAndUpdate(query, {
        //reference to gridFS saved file.  
        "image": base64data
      }, {
        'upsert': true,
        'new': true
      }, function (err, data) {
        if (err) {
          return res.send(500, {
            error: err
          });
        }
        // console.log(data);
        data.password = null;
        res.json(data);
      });
    });
  });
  //this succesfully gets the picture. now i need to 
  //construct image tag ng-click= to a function makes a call to this route
  // app.get('/getpicture/:id', function (req, res) {
  //   var id = req.params.id;
  //   User.where({
  //     _id: id
  //   }).findOne(function (err, result) {
  //     if (err) {
  //       res.send(404);
  //       return;
  //     }
  //     //we have the user
  //     var pictureId = result.picture;
  //     var readStream = GridFS.createReadStream({
  //       _id: pictureId
  //     });

  //     //error handling, e.g. file does not exist
  //     readStream.on('error', function (err) {
  //       throw new Error(err);
  //     });

  //     readStream.pipe(res);
  //   });

  // });
  // app.get('/getpicture', function (req, res, next) {
  //   var id = mongoose.Types.ObjectId(req.query.id);
  //   var readStream = GridFS.createReadStream({
  //     _id: id
  //   });

  //   //error handling, e.g. file does not exist
  //   readStream.on('error', function (err) {
  //     throw new Error(err);
  //   });

  //   readStream.pipe(res);
  // });


  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }


    res.redirect(req.session.returnTo);

  }

};