var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var favicon = require('static-favicon');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var crypto = require('crypto');
var cron = require('cron');
var socket = require('socket.io');
var sugar = require('sugar');
var nodemailer = require('nodemailer');
var _ = require('lodash');
var app = express();
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var User = require('./Server/mongoModels/user');
var Comments = require('./Server/mongoModels/comments');
var config = require('./Server/config');

//for authentication:

var db = mongoose.connect(config.dbConnection, {}, function (err) {
  if (!err) {
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(favicon());
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(session({
      saveUninitialized: true,
      resave: true,
      secret: 'cat',
      cookie: {
        maxAge: 24 * (60 * 60 * 1000),
        // httpOnly flag makes sure the cookie is only accessed
        // through the HTTP protocol and not JS/browser
        httpOnly: true,
        // secure cookie should be turned to true to provide additional
        // layer of security so that the cookie is set only when working
        // in HTTPS mode.
        secure: false
      },
      key: 'sessionId',
      store: new MongoStore({
        mongooseConnection: db.connection,
        collection: 'sessions'
      })
    }));
    app.use(allowCrossDomain);
    app.use(passport.initialize());
    app.use(passport.session());
    require('./Server/passport.js')();
    //heroku sets this to production
    if (app.get('env') === 'production') {
      app.use(function (req, res, next) {
        var protocol = req.get('x-forwarded-proto');
        protocol == 'https' ? res.redirect('http://' + req.hostname + req.url) : next();
      });
    }

    app.use(function (req, res, next) {
         //req.session.returnTo is available everywhere in router now.
         //filter if it not auth/login/signup, then save it.  only update return to when it's not one of those.  
        if(req.get('lastUrl') !== undefined){

        var lastUrl = req.get('lastUrl');

        if(lastUrl.indexOf("login") === -1 && lastUrl.indexOf("signup") === -1 && lastUrl !== "http://localhost:3000/#!/"){

         req.session.returnTo = lastUrl;
        }
         console.log(req.session);
        }
                  next();
      });


    app.use(express.static(path.join(__dirname, 'public')));



    var server = app.listen(app.get('port'), function () {
      console.log('Express server listening on port ' + app.get('port'));
    });
    var io = require('socket.io')(server);
    var routes = require('./Server/routes.js')(app, io);
  }
});




var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};