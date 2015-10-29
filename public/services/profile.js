angular.module('MyApp')
  .factory('Profile', function ($rootScope, $http) {
    //I have everything stored in $rootScope.currentUser
    //refactor to pull users from the database, will need that for the stream!
    function getUserJSON() {
      // console.log($rootScope.currentUser);
      if ($rootScope.currentUser && $rootScope.currentUser.facebook) {
        return $rootScope.currentUser;
      } else {
        return $rootScope.currentUser;
      }
    }

    return {
       getCurrentUser: function(id) {
        return $http.get('/profile/' + id);
      },
      getName: function () {
        var name = getUserJSON().name;

        if($rootScope.currentUser && $rootScope.currentUser.facebook) {
          return name.split(" ")[0];
        }
        return name.charAt(0).toUpperCase() + name.slice(1);
      },
      SaveProfileImage: function () {
        return $http.post('/upload/save');
      },

      GetProfileImage: function () {
        return $http.get('/getpicture');
      },
      getEmail: function () {
        return getUserJSON().email;
      }
    };
  });