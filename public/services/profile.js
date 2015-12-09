angular.module('MyApp')
  .factory('Profile', function ($rootScope, $http) {
    //I have everything stored in $rootScope.currentUser

    function getUserJSON() {
      // console.log($rootScope.currentUser);
        if(!rootScope.currentUser){
          return;
        }
        return $rootScope.currentUser;
      
    }

    return {
      getCurrentUser: function (id) {
        return $http.get('/profile/' + id);
      },
      getName: function () {
        var name = getUserJSON().name;

        if ($rootScope.currentUser && $rootScope.currentUser.facebook) {
          return name.split(" ")[0];
        }
        return name.charAt(0).toUpperCase() + name.slice(1);
      },
      SaveProfileImage: function (id) {
        return $http.post('/upload/save');
      },

      getEmail: function () {
        return getUserJSON().email;
      }
    };
  });