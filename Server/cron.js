   var User = require('./mongoModels/user');
   var Recipe = require('./mongoModels/recipe');
   var nodemailer = require('nodemailer');
   var transporter = nodemailer.createTransport();
   var transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: 'nodemailertester3@gmail.com',
       pass: process.env.GMAIL
     }
   });


module.exports = function () {
   var CronJob = require('cron').CronJob;

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
   	console.log("*********JOB IS RUNNING");

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
}