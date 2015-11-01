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

      // getAllStreamItems: function() {
      //   return $http.get('/api/stream').success(function(data) {
      //     angular.copy(data, o.stream);
      //   });
      // },
      // = o.create = function(post)

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
        return $http.jsonp("http://api.yummly.com/v1/api/recipes?callback=JSON_CALLBACK", {
          params: {
            "_app_id": id,
            "_app_key": key,
            "q": query,
            "maxResult": 6
          }
        }).then(function (response) {
          return response.data.matches;
        });
      },

      getRecipesByGenre: function (genre) {
        return $http.jsonp("http://api.yummly.com/v1/api/recipes?callback=JSON_CALLBACK", {
          params: {
            "_app_id": id,
            "_app_key": key,
            "q": genre,
            "maxResult": 6
          }
        }).then(function (response) {
          // console.log(response.data);
          return response.data.matches;
        });
      },

      getRecipesByRestrictions: function (allergy) {
        console.log(allergy);
        return $http.jsonp("http://api.yummly.com/v1/api/recipes?callback=JSON_CALLBACK" , {
          params: {
            "_app_id": id,
            "_app_key": key,
            "maxResult": 6,
          "q": allergy,

            "requirePictures": true
          }
        }).then(function (response) {
          console.log(response.data);
          return response.data.matches;
        });
      },

      //  getRecipesByRestrictions: function (randomGenre, allergy) {
      //   console.log(allergy);
      //   console.log(randomGenre);
      //   return $http.jsonp("http://api.yummly.com/v1/api/recipes?callback=JSON_CALLBACK" , {
      //     params: {
      //       "_app_id": id,
      //       "_app_key": key,
      //       "q": randomGenre,
      //       "maxResult": 6,
      //        "excludedIngredient[]": ["shrimp"],
      //       "requirePictures": true
      //     }
      //   }).then(function (response) {
      //     console.log(response.data);
      //     return response.data.matches;
      //   });
      // },
     
      getQuickRecipes: function (randGenre) {
        return $http.jsonp("http://api.yummly.com/v1/api/recipes?callback=JSON_CALLBACK", {
          params: {
            "_app_id": id,
            "_app_key": key,
            "q": randGenre,
            "maxResult": 6,
            "maxTotalTimeInSeconds": 1200,
            "requirePictures": true,
            "excludedIngredient[]": ["cookies","cookie", "brownie", "cupcakes", "cheesecake", "frosting", "milkshake"]
          }
        }).then(function (response) {
          // console.log(response.data);
          return response.data.matches;
        });
      },
      // this is what the url needs to look like:
      // http://api.yummly.com/v1/api/recipe/Creamy-Seafood-Alfredo-652832?_app_id=3ee8ed9f&_app_key=efd918c28d5b710d9583ec24fb2bb362
      getIndividualRecipe: function (recipeId) {
        return $http.jsonp("http://api.yummly.com/v1/api/recipe/" + recipeId + "?callback=JSON_CALLBACK", {
          params: {
            "_app_id": id,
            "_app_key": key,
          }
        }).then(function (response) {
          // console.log(response.data);
          return response.data;
        });
      }
    };
  });