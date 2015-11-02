module.exports = {

  'facebookAuth': {
    'clientID': process.env.FACEBOOK_ID || '1689439597952787',
    'clientSecret': process.env.FACEBOOK_SECRET ||'46f70d0b0cc3495def302e47e4f90513',
    'callbackURL': "/auth/facebook/callback"
  },

  

   'gmail': {
    'pass': 'aeulqtlvzljhkpsd'
  },
  
  "dbConnection" : process.env.DB  || "localhost/seven"
};