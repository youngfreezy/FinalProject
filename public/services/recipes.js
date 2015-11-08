angular.module('MyApp')
  .factory('Recipes', function ($http, Profile, $rootScope) {
    var key = 'efd918c28d5b710d9583ec24fb2bb362';
    var id = '3ee8ed9f';
    // TODO: cache all the api calls.
    return {
      save: function (recipe) {
        //the recipe is being sent to the database.
        //sending recipe object as req.body
        return $http.post('/api/recipebox', {
          recipe: recipe,
          email: Profile.getEmail()
        });
      },


      SaveRecipeInStreamWithUpvotes: function (recipe) {
        return $http.put('/api/stream/' + recipe._id + '/upvote').success(function (data) {
          recipe.upvotes += 1;
        });

      },
      removeCommentFromStreamRecipe: function (recipeId, commentId) {
        return $http.delete('/api/stream/' + recipeId + '/comments/' + commentId);
        //resolve promise in controller where you can handle error. you can also
        //resolve errors with divs in the controller. 
      },

      saveUserSubscription: function (userId) {
        console.log("Howdy");
        return $http.put('/api/' + userId + '/subscription');
      },


      SaveRecipeInStreamWithComments: function (id, comment) {
        return $http.post('/api/stream/' + id + '/comments', comment);
      },
      // TODO:
      // upVoteStreamRecipeComments: function (recipe, comment) {
      //   return $http.put('/api/stream/' + recipe._id + '/comments/' + comment._id + '/upvote')
      //     .success(function (data) {
      //       comment.upvotes += 1;
      //     });
      // },


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
      },
      getUserRecipes: function () {
        var currentUser = $rootScope.currentUser;
        if (currentUser) {


          return $http.get('/api/' + currentUser._id + '/recipes').then(function (response) {
            //response has a data aray
            // console.log(response.data);
            return response.data;
          });
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