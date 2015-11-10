angular.module('MyApp')
  .factory('MainService', function ($http, Profile, $rootScope, $q, RecipeBox) {
    // TODO: cache all the api calls.
    // this is the service corresponding to the main.js controller.
    return {
      save: function (recipe) {
        return $http.post('/api/recipebox', {
          recipe: recipe,
          email: Profile.getEmail()
        })
      },


      getUserRecipes: function () {
        var currentUser = $rootScope.currentUser;
        if (currentUser) {
          return $http.get('/api/' + currentUser._id + '/recipes').then(function (response) {
            var recipes = response.data;
            RecipeBox.recipeCount = recipes.length;
            //response has a data aray
            return recipes;
          });
        } else {
          //handle data here instead of checking in controller. 
          RecipeBox.recipeCount = 0;
          var deferred = $q.defer();
          var promise = deferred.promise.then(function () {
            return [];
          });
          deferred.resolve();
          return promise;
        }
      },
      getRecipes: function (query) {
        return $http.get('/api/yummly_recipes?q=' + query).then(function (response) {
          return response.data.matches;
        });
      },

      getRecipesByGenre: function (genre) {
        return $http.get('/api/yummly_recipes/genre?q=' + genre).then(function (response) {
          return response.data.matches;
        });

      },

      getRecipesByRestrictions: function (allergy) {
        return $http.get('/api/yummly_recipes/allergy?q=' + allergy).then(function (response) {
          return response.data.matches;
        });

      },



      getQuickRecipes: function (randGenre) {
        return $http.get('/api/yummly_recipes/initRecipes?q=' + randGenre).then(function (response) {
          return response.data.matches;
        });

      },
      // this is what the url needs to look like:
      // http://api.yummly.com/v1/api/recipe/French-Onion-Soup-The-Pioneer-Woman-Cooks-_-Ree-Drummond-41364?_app_id=3ee8ed9f&_app_key=efd918c28d5b710d9583ec24fb2bb362
      getIndividualRecipe: function (recipeId) {
        return $http.get('/api/yummly_recipes/recipe?recipeid=' + recipeId).then(function (response) {
          return response.data;
        });

      }
    };
  });