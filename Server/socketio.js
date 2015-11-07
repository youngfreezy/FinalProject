var RecipeStream = require('./mongoModels/stream');
var moment = require('moment');
var sockets = [];
var userSockets = [];
module.exports = {

  initialize: function (io) {


    io.on('connect', function (socket) {
      var handshake = socket.handshake.query;
      var userId = handshake.userId;
      var email = handshake.email;

      // here you are adding socket connections to the sockets array
      sockets[socket.id] = socket;
      if (!userSockets[userId]) {
        userSockets[userId] = [];
      }
      userSockets[userId][socket.id] = socket;

      // console.log('GOT CONNECTION: ' + socket.id);


      socket.on('stream', function () {
        // console.log("******THIS", this);
        // console.log("********MODULE EXPORTS", module.exports);
        module.exports.broadCastStream();
      });

      socket.on('disconnect', function (socket) {
        // console.log('SOCKET DISCONNECTED: ' + socket.id);
        delete sockets[socket.id];
        userSockets.each(function (sockets) {
          for (var s in sockets) {
            if (s == socket.id) {
              delete sockets[s];
            }
          }
        });
      });
    });
  },

  broadCastStream: function () {
    var anHourAgo = moment().subtract(1, 'hour');
    RecipeStream.find({
      createdAt: {
        $gt: anHourAgo
      }
    }).populate('comments').exec(function (err, recipes) {
      if (err) {
        recipes = [];
      }
      //sending message back to client. can have same name but can be different.
      for (var s in sockets) {
        sockets[s].emit('stream', recipes);
      }
    });
  }

};