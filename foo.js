var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nodemailertester3@gmail.com',
    pass: 'youngfreezy'
  }
});


transporter.sendMail({
    to: "bizauionica@gmail.com"
  , from: "foo@bar.com"
  , text: "Hi"
}, function (err) {
    console.log(err);
});
