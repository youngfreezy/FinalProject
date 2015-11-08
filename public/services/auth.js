angular.module('MyApp')
  .factory('Auth', function ($http, $location, $rootScope, $alert, $window, $cookies, RecipeBox) {

    return {
      login: function (user) {
        // console.log('loggin in');
        return $http.post('/api/login', user)
          .success(function (data) {
            
            $cookies.user = JSON.stringify(data);
            $rootScope.currentUser = data;
          
          $rootScope.$broadcast("getUserRecipes");
          

              $alert({
              title: 'Cheers!',
              content: 'You have successfully logged in.',
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
                  if($rootScope.previousPage){
                    $location.path($rootScope.previousPage);
                  } else {
                    $location.path("/#!")
                  }
                
          })


          .error(function () {
            delete $window.localStorage.token;
            $alert({
              title: 'Error!',
              content: 'Invalid username or password.',
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          });
      },
      signup: function (user) {
        return $http.post('/api/signup', user)
          .success(function () {
            $location.path('/login');
            $alert({
              title: 'Congratulations!',
              content: 'Your account has been created.',
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          })
          .error(function (response) {
            $alert({
              title: 'Error!',
              content: response.data,
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          });
      },
      logout: function () {
        window.$rootScope = $rootScope;
        delete $cookies.user;
        $rootScope.currentUser = null;
        RecipeBox.recipeCount = 0;
  
        $alert({
          content: 'You have been logged out.',
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 3
        });
      }
    };
  });