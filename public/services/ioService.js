angular.module('MyApp')
  .factory('ioService', function ($rootScope) {

    this.start = function (io, user) {

      // console.log('ioService loaded');

      var self = this;

      var userId = (user && user._id) ? user._id : 'guest';
      var email = (user && user.email) ? user.email : 'null';
      var socket = io.connect(window.location.origin, {
        query: 'userId=' + userId + '&email=' + email
      });

      socket.on('connect', function () {
        // console.info('Connected to server via socket io');
      });

      $rootScope.stream = {};
      $rootScope.stream.recipes = [];
      $rootScope.stream.unseen = 0;

      // stream
      var firstRun = true;
      socket.on('stream', function (data) {
        // console.log('got stream event');
        for (var r = 0; r < data.length; r++) {
          var recipe = data[r];
          recipe = 'user:' + recipe.userId + 'recipe:' + recipe._id;
          if ($rootScope.stream.recipes.indexOf(recipe) < 0) {
            $rootScope.stream.recipes.push(recipe);
            if (!firstRun) {
              $rootScope.stream.unseen++;
            }
          }
        }
        firstRun = false;

        $rootScope.$apply();
        // console.log(data);
        $rootScope.$broadcast('stream', data);
      });

      self.getStream = function () {
        socket.emit('stream');
      };

      self.getStream();
    };

    return this;
  });