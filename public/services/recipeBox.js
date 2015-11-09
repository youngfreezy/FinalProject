angular.module('MyApp')
  .factory('RecipeBox', function ($rootScope, $http) {

    return {
      recipeCount: 0,
      saveUserSubscription: function (userId) {
        console.log("Howdy");
        return $http.put('/api/' + userId + '/subscription');
      },

      saveDoneRecipe: function (recipe) {
        var currentUser = $rootScope.currentUser;
        return $http.post('/api/users/' + currentUser._id + '/recipes/' + recipe._id + '/done');
      },
      saveUnDoneRecipe: function (recipe) {
        var currentUser = $rootScope.currentUser;
        return $http.post('/api/users/' + currentUser._id + '/recipes/' + recipe._id + '/undone');
      },

      deleteRecipe: function (recipe) {
        var currentUser = $rootScope.currentUser;
        return $http.delete('/api/users/' + currentUser._id + '/recipes/' + recipe._id);
      },

      deleteAllRecipes: function () {
        // console.log($rootScope.currentUser);
        var currentUser = $rootScope.currentUser;
        return $http.delete('/api/users/' + currentUser._id + '/recipes/');
      }
    };
  });