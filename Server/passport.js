'use strict'
var User = require('./mongoModels/user.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var config = require('./config.js');

module.exports = function () {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
  //Local Strategy:
  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, function (email, password, done) {
    User.findOne({
      email: email
    }, function (err, user) {
      if (err) return done(err);
      if (!user) return done(null, false);
      user.comparePassword(password, function (err, isMatch) {
        if (err) return done(err);
        if (isMatch) return done(null, user);
        return done(null, false);
      });
    });
  }));
  ///////FACEBOOK:
  passport.use(new FacebookStrategy({
      clientID: config.facebookAuth.clientID,
      clientSecret: config.facebookAuth.clientSecret,
      callbackURL: config.facebookAuth.callbackURL,
      enableProof: false,
      profileFields: ['id', 'name', 'displayName', 'emails', 'photos']
    },



    //facebook will send back the token and the profile
    function (token, refreshToken, profile, done) {
      process.nextTick(function () {
        console.log(profile);
        //find the user in the database based on their facebook ID
        User.findOne({
          'facebook.id': profile.id
        }, function (err, user) {
          if (err) {
            throw err;
          }

          if (user) {
            console.log("there is a user already");
            done(null, user);
          } else {
            //create the user  if not found
            var newUser = new User();
            console.log(profile.photos[0].value);
            // set all of the facebook information in our user model
            newUser.facebook.id = profile.id; // set the users facebook id                   
            newUser.facebook.token = token; // we will save the token that facebook provides to the user      
            newUser.facebook.pictures = profile.photos[0].value;
            newUser.name = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
            newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
            // save our user to the database
            newUser.save(function (err) {
              if (err)
                throw err;
              // if successful, return the new user
              console.log("successfully saved user into database")
              done(null, newUser);
            });

          }
        })
      })
    }));
};