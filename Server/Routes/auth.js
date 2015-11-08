var passport = require('passport');
var User = require('../mongoModels/user');
module.exports = {

	facebookLogin: function (req, res, next) {
    // var backUrl = req.params.backUrl;
    // res.session.backUrl = backUrl;
    passport.authenticate('facebook', {
      display: 'popup',
      scope: ['email']
    })(req, res, next);

  },

  facebookCallback: function (req, res, next) {


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
        console.log("==================== This is the user from routes.js", user);
        res.cookie('user', JSON.stringify(user));
        console.log(req.user);
      }

      // if (req.session.redirectUrl) {
      //   redirectUrl = req.session.redirectUrl;
      //   req.session.redirectUrl = null;
      // }
      //actually storing the fact that they are logged in:
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        console.log('=========== here!', user);
      });
      // console.log('=========== here ALSO!!', req.session.redirectUrl);
      // console.log('=========== here ALSO!!', req.session.redirectUrl);
      res.redirect(req.session.returnTo);


    })(req, res, next);
  },
  login: function (req, res, next) {
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
  },

  logout: function (req, res, next) {
    req.logout();
    res.send(200);
  },
  signup: function (req, res) {
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
  }

  
};