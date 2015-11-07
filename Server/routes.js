var User = require('./mongoModels/user');
var Recipe = require('./mongoModels/recipe');
var RecipeStream = require('./mongoModels/stream');
var Comments = require('./mongoModels/comments');
var socketio = require('./socketio.js');
var passport = require('passport');
var fs = require('fs');
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({
  storage: storage
});
var upload2 = multer({
  dest: '/tmp/'
});
var api = require('./Routes/api.js');
var auth = require('./Routes/auth.js');
var profile = require('./Routes/profile.js');
var recipeRoutes = require('./Routes/recipes.js');
var streamRoutes = require('./Routes/stream.js');
var yummly = require('./Routes/yummly.js');
var config = require('./config.js');
var recipesController = require('./Controllers/recipes.js');

module.exports = function (app, io) {

//initialize socket
socketio.initialize(io);
// set socket to what's in the now intialized/changed socketio instance
api.setsocketIO(socketio);
streamRoutes.setsocketIO(socketio);
  
  app.param('recipe', function (req, res, next, id) {
    var query = RecipeStream.findById(id);

    query.exec(function (err, recipe) {
      if (err) {
        return next(err);
      }
      if (!recipe) {
        return next(new Error('can\'t find recipe'));
      }
      //set req.recipe to be recipe it found.
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

  app.post('/api/login', auth.login);


  // Unsubscribe
  app.get('/api/unsubscribe', api.unsubscribe);

  app.post('/api/signup', auth.signup);
  app.get('/auth/facebook', auth.facebookLogin);
 

  app.get('/auth/facebook/callback', auth.facebookCallback);

  app.get('/profile/:id', ensureAuthenticated, profile.getProfile);

  app.get('/api/logout', auth.logout);


  
  //YUMMLY QUERIES;

  app.get('/api/yummly_recipes', yummly.getRecipes);

  app.get('/api/yummly_recipes/genre', yummly.getGenreRecipes);

  app.get('/api/yummly_recipes/allergy', yummly.getAllergyRecipes);

  app.get('/api/yummly_recipes/initRecipes', yummly.getInitialRecipes);

  app.get('/api/yummly_recipes/recipe', yummly.getSingleRecipe);



  app.post('/api/users/:userid/recipes/:recipeId/done', api.recipeDone);

  app.post('/api/users/:userid/recipes/:recipeId/undone', api.recipeUndone);



  app.post('/api/recipebox', api.postToRecipeBoxAndStream);



  //get all recipes from the recipebox:
  app.get('/api/:user/recipes', ensureAuthenticated, api.getUserRecipes);


  app.put('/api/:user/subscription', api.subscribe);

  app.delete('/api/users/:userid/recipes/:recipeId', recipeRoutes.deleteRecipe);

  //delete all:
  app.delete('/api/users/:userid/recipes', recipeRoutes.deleteAllRecipes);
  //this is middleware for the recipeStream items. handles :recipe

  
  app.get('/api/stream', streamRoutes.getStream);
  //get a single recipe from the stream

  //api/stream = posts, :recipe = post.
  //this = '/posts/:post'
  app.get('/api/stream/:recipe', streamRoutes.getRecipeInStream);

  // //this route is not necessary since you are really posting from api/add

  // app.post('/api/stream', function (req, res, next) {
  //   var recipeStreamItem = new RecipeStream(req.body);

  //   recipeStreamItem.save(function (err, recipes) {
  //     if (err) {
  //       return next(err);
  //     }

  //     res.json(recipes);
  //   });
  // });

  app.put('/api/stream/:recipe/upvote', streamRoutes.upVoteRecipeInStream);

  //TODO: route for upvoting comments

  // app.put('/api/stream/:recipe/comments/:comment/upvote', function (req, res, next) {
  //   req.comment.upvote(function (err, comment) {
  //     if (err) {
  //       return next(err);
  //     }
  //     socketio.broadCastStream();
  //     res.json(comment);
  //   });
  // });
  //route for posting comments on recipe stream recipes:


  app.post('/api/stream/:recipe/comments', streamRoutes.commentRecipeInStream);

  app.delete('/api/stream/:recipe/comments/:comment', streamRoutes.deleteComment);

  //handle POST requests to /upload
  // var Grid = require('gridfs-stream'),
  //   mongoose = require('mongoose'),
  //   GridFS = Grid(mongoose.connection.db, mongoose.mongo);


  app.post('/upload', upload.single('file'), profile.uploadPreview);
  // confirm user wants to save it first after they see it

  app.post('/upload/save', upload2.single('file'), profile.uploadSave);
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