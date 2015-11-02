  ///////FACEBOOK:
  passport.use(new FacebookStrategy({
      clientID: '1689439597952787',
      clientSecret: '46f70d0b0cc3495def302e47e4f90513',
      callbackURL: "http://localhost:3000/auth/facebook/callback",
      enableProof: false,
      profileFields: ['id', 'name', 'displayName', 'emails', 'photos']
    },



    //facebook will send back the token and the profile
    function (token, refreshToken, profile, done) {
      process.nextTick(function () {
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

            // set all of the facebook information in our user model
            newUser.facebook.id = profile.id; // set the users facebook id                   
            newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
            newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
            // save our user to the database
            newUser.save(function (err) {
              if (err)
                throw err;

              // if successful, return the new user
              console.log("successfully saved user into database");
              done(null, newUser);
            });

          }
        });
      });
    }));