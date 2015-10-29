'use strict';
var async = require('async');
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
      recipeBox: {
        $exists: true,
        $not: {
          $size: 0
        }
      }
    }, function (err, result) {
      if (err) {
        return console.log("Something went wrong when querying the users: ", err);
        //throw err;
      }
      result = result.map(function (c) {
        return {
          name: c.name,
          email: c.email,
          // {
          // if you dont want recipe box take this out:
          recipeBox: c.recipeBox,

          //  filter: [{ _id: ObjectId, done: false }]
          //  map:    [ ObjectId, ObjectId, ObjectId, ObjectId... ]
          incompleteRecipes: c.recipeBox.filter(function (cc) {
            return cc.done === false;
          }).map(function (cc) {
            return cc._id;
          })
        };
      });

      usersWithRecipeBoxes = usersWithRecipeBoxes.concat(result);

      // [{ incompleteRecips: [ObjectIds] }]
      var complete = 0;

      function sendEmails() {

        function emailText(cResult) {
          var text = "";
          text += "Hello " + cResult.name;
          text += "Please review your cart. Your current items are: ";
          text += cResult.incompleteRecipes.map(function (c) {
            return c.recipeUrl;
          }).join("\n"); // \n
          text += "Cheers!";
          return text;
        }

        function emailData(cResult) {
          return {
            from: 'nodemailertester3@gmail.com',
            to: cResult.email,
            subject: 'hello',
            text: emailText(cResult)
          };
        }

        // For every user
        result.forEach(function (c) {
          // console.log(emailData(c));
          // Send the email with the urls
          transporter.sendMail(emailData(c));
        });
      }

      function done() {
        // console.log(usersWithRecipeBoxes);
        // fs.writeFileSync("dbresponse1.json", JSON.stringify(usersWithRecipeBoxes, null, 4));
        // return;

        //send email inside the callback:
        sendEmails();
      }

      function checkComplete() {
        if (++complete === result.length) {
          done();
        }
      }

      function findIncompleteRecipes(cResult) {

        Recipe.find().where('_id').in(cResult.incompleteRecipes).select({
          recipeUrl: 1,
          name: 1
        }).exec(function (err, incompleteRecipes) {

          if (err) {
            checkComplete();
            return console.log("Something went wrong when querying the recipes: ", err);
          }
          cResult.incompleteRecipes = incompleteRecipes;
          checkComplete();
          return;
        });
      }
      if (result.length === 0) {
        return done();
      }
      for (var i = 0; i < result.length; ++i) {
        findIncompleteRecipes(result[i]);
      }
    });
  }

  // get all info from the db.
  // var usersWithRecipeBoxes = User.find({
  //   recipeBox.length >= 1
  // });
  //find all the users where recipeBox.length >= 1
  //get the recipebox itself
  //every three days, grab the first three recipes.

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
  // job.start();
  // var transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'nodemailertester3@gmail.com',
  //     pass: 'youngfreezy'
  //   }
  // });

  app.post('/api/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err || !user) {
        res.status(400).send(info);
      } else {
        // if user logs in locally their cookie is being over written, which is great.
        //associate local/facebook logins?
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

  // app.post('/api/login', passport.authenticate('local'), function (req, res) {
  //   res.cookie('user', JSON.stringify(req.user));
  //   res.send(req.user);
  // });


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
      scope: ['email']
    })(req, res, next);

  });
  // if no error, this gets hit:
  //middleware for previous url: 

  app.get('/auth/facebook/callback', function (req, res, next) {


    passport.authenticate('facebook', function (err, user, redirectURL) {
      // console.log(' in the callback ');
      if (err) {
        console.log(err);
        return res.redirect('/#!/login');
      }

      if (!user) {
        return res.redirect('/#!/signup');
      }
      if (req.user) {
        // console.log("==================== This is the user from routes.js", req.user);
        res.cookie('user', JSON.stringify(user));
      }
      //actually storing the fact that they are logged in:
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/#!/login');
        }

        // console.log('=========== here!', user);
        res.redirect(req.session.returnTo || '/#!');
        req.session.returnTo = null;
        
      });
    })(req, res, next);
  });

  app.get('/profile/:id', function (req, res, next) {
    //shouldn't find it by facebook - find it by other identifier
    User.findOne({
      // or req.user._id;
      _id: req.user._id
    }, function (err, user) {
      if (err) {
        throw err;
      }
      res.json(user);
    });
  });

  app.get('/api/logout', function (req, res, next) {
    req.logout();
    res.send(200);
  });

  //for done recipes:
  //$addToSet was not working.
  function arrayUnique(array) {
    var result = [];
    array.forEach(function (v, k) {
      if (result.indexOf(v) == -1) result.push(v);
    });
    return result;
  }
  //handles the querying:
  function setRecipeDone(userId, recipeId, done, res) {
    User.where({
      _id: userId
    }).findOne(function (err, user) {
      if (err) {
        console.log(err);
        res.status(500).send(err);
        return;
      }

      if (!user) {
        res.status(404);
        return;
      }

      var recipeBox = user.recipeBox;
      for (var r in recipeBox) {
        if (recipeBox[r]._id == recipeId.toString())
          recipeBox[r].done = done;
      }

      user.recipeBox = recipeBox;
      user.save(function (err, resp) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        // console.log('done saving user recipes', resp);
        return res.status(200).send(resp);
      });
    });
  }


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
        res.status(500).send(err);
        return;
      }

      if (!user) {
        res.status(404);
        return;
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
          res.status(500).send(err);
          return;
        }
        // console.log('added recipe to recipebox', resp);
        return res.status(200).send(resp);
      });
    });
  }


  app.post('/api/recipebox', ensureAuthenticated, function (req, res) {


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
  app.get('/api/:user/recipes', function (req, res) {
    //passport injects req.user.  
    console.log(req.user._id);
    User.findById(
      req.user._id,
      function (err, user) {
        // console.log("the user is", user);
        console.log(user);
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

      console.log("RECIPE BOX!!!!!!", user);
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
    console.log(req.file);

    res.send(200, file.toString('base64'));

    // console.log(file);
  });
  // confirm user wants to save it first after they see it

  app.post('/upload/save', upload2.single('file'), function (req, res, next) {


    var file = req.file;
    console.log('file', file);

    var writestream = GridFS.createWriteStream({
      filename: file.name,
      mode: 'w',
      content_type: file.mimetype,
      metadata: req.body,
    });
    fs.createReadStream(file.path).pipe(writestream);

    writestream.on('close', function (file) {
      console.log("============", file);

      var userId = req.user._id;
      var query = {
        '_id': userId
      };
      console.log('query', query);
      // console.log(newData);
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
    });
  });
  //this succesfully gets the picture. now i need to 
  //construct image tag ng-click= to a function makes a call to this route
  app.get('/getpicture/:id', function (req, res) {
    var id = req.params.id;
    User.where({
      _id: id
    }).findOne(function (err, result) {
      if (err) {
        res.send(404);
        return;
      }
      //we have the user
      var pictureId = result.picture;
      var readStream = GridFS.createReadStream({
        _id: pictureId
      });

      //error handling, e.g. file does not exist
      readStream.on('error', function (err) {
        throw new Error(err);
      });

      readStream.pipe(res);
    });

  });
  app.get('/getpicture', function (req, res, next) {
    var id = mongoose.Types.ObjectId(req.query.id);
    var readStream = GridFS.createReadStream({
      _id: id
    });

    //error handling, e.g. file does not exist
    readStream.on('error', function (err) {
      throw new Error(err);
    });

    readStream.pipe(res);
  });


  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

      req.session.returnTo = req.path;
      console.log("PATHHHHH DURRRRR", req.ression.returnTo);
      res.redirect('/#!/login');
      
  }

};