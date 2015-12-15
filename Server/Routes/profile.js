var User = require('../mongoModels/user');
var fs = require('fs');
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({
  storage: storage
});
var upload2 = multer({
  dest: '/tmp/'
});

module.exports = {

	getProfile: function (req, res, next) {
    //shouldn't find it by facebook - find it by other identifier
    User.findOne({
      // or req.user._id;
      _id: req.user._id
    }, function (err, user) {
      if (err) {
        throw err;
      }
      user.password = null;
      res.json(user);
    });
  },

  uploadPreview:  function (req, res, next) {
    // console.log('file', req.file);
    // console.log('content', req.file.buffer.toString('base64'));
    var file = req.file.buffer;
    // console.log(req.file);

    res.send(200, file.toString('base64'));

    // console.log(file);
  },
  //TODO: sign up for AWS and store images there instead of in DB. 
  uploadSave: function (req, res, next) {


    var file = req.file;
    console.log('file', file);

    fs.readFile(file.path, function (err, data) {
      if (err) throw err;
      console.log(data);

      var base64data = new Buffer(data).toString('base64');
      // image: data.buffer.toString('base64')


      // var writestream = GridFS.createWriteStream({
      //   filename: file.name,
      //   mode: 'w',
      //   content_type: file.mimetype,
      //   metadata: req.body,
      // });
      // fs.createReadStream(file.path).pipe(writestream);


      // writestream.on('close', function (file) {
      // console.log("============", file);

      var userId = req.user._id;
      var query = {
        '_id': userId
      };
      // console.log('query', query);
      // console.log(newData);
      User.findOneAndUpdate(query, {
        //reference to gridFS saved file.
        "image": base64data
      }, {
        'upsert': true,
        'new': true
      }, function (err, data) {
        if (err) {
          return res.send(500, {
            error: err
          });
        }
        // console.log(data);
        data.password = null;
        res.json(data);
      });
    });
  }
};