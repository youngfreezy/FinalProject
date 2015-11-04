var dotenv = require('dotenv');

// silent supresses the warning is no .env file is found
dotenv.config({silent: true});

// only if the env is not production, we look for a .local env file
// otherwise we load the server env vars
// adjust this condition to suit your needs for staging servers or such
if (process.env.NODE_ENV != 'production')
  dotenv.load({path: process.env.PWD +'/.env.local'});
else
  dotenv.load();

module.exports = {

  'facebookAuth': {
    'clientID': process.env.FACEBOOK_ID,
    'clientSecret': process.env.FACEBOOK_SECRET,
    'callbackURL': "/auth/facebook/callback"
  },

  'Yummly': {
    key: process.env.YUMMLY_KEY ,
    id: process.env.YUMMLY_ID 
  },

  'gmail': {
    'pass': process.env.GMAIL 
  },

  "dbConnection": process.env.DB
};