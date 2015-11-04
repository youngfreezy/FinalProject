angular.module('MyApp')
  .controller('MainCtrl', function ($scope, Recipes, $alert, $http, $location, RecipeBox, $rootScope, $route, Profile, $cookies) {
    window.Recipes = Recipes;
    // console.log($scope.recipe);

    $scope.genres = ['Mexican', 'Italian', 'Chinese', 'Korean',
      'American', 'Comfort Food', 'New American', 'Dessert', 'Fruit',
      'Indian', 'West African', 'Japanese', 'Quick', 'Pizza', 'Romantic', 'Spicy', 'Bland',
      'Pan-Asian', 'Indonesian', 'Vietnamese', 'Hipster', 'Habanero'
    ];

    $scope.allergies = ["Peanut-Free", "Wheat-Free", "Seafood-Free", "Dairy-Free", "Gluten-Free", "Egg-Free", "Treenut-Free"];
    $scope.dietaryRestrictions = ["Vegan", "Vegetarian", "Pescatarian", "Low Carbs", "Low Sugar"];
    // $scope.userRecipes = [];
    // console.log($scope.userRecipes);     
    var randGenre = $scope.genres[Math.floor(Math.random() * $scope.genres.length)];
    getRandomGenre = function () {
      var randGenre = $scope.genres[Math.floor(Math.random() * $scope.genres.length)];
      $scope.randGenre = randGenre;

    };



    // console.log($scope.currentUser);

    $scope.getGenreRecipes = function (genre) {
      Recipes.getRecipesByGenre(genre).then(function (response) {
        $scope.recipes = response;
        // console.log(response);
      });
    };


    $scope.getAllergyRecipes = function (allergy) {
      console.log($scope.allergy);

      Recipes.getRecipesByRestrictions(allergy).then(function (response) {
        $scope.recipes = response;
        console.log(response);
      });
    };

    $scope.setUsertoSubscribe = function () {
      if (!$scope.currentUser) {
        $alert({
          content: "Sign Up or Log In to Subscribe :)",
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 2
        });
      } else {


        Recipes.saveUserSubscription($rootScope.currentUser._id).then(function (response) {
          $rootScope.currentUser = response.data;

          $alert({
            content: "Thanks for Signing Up!",
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 2
          });
        });
      }
    };



    $scope.getUserRecipeBox = function (id) {
      if ($rootScope.currentUser) {

        Profile.getCurrentUser(id).then(function (response) {
          $rootScope.currentUser = response.data;
          // console.log("GETTTING THE CURRENT USERRRR", response.data);
          // console.log('lalala', $rootScope.currentUser);
        }, function (err) {
          console.log('error occured', err);
        });


      }
    };

    function addDonesToNGModel() {

      if ($rootScope.currentUser && $scope.userRecipes) {

        var box = $rootScope.currentUser.recipeBox;
        var recipes = $scope.userRecipes;

        // console.log(box, recipes);
        for (i = 0; i < box.length; i++) {
          for (var j = 0; j < recipes.length; j++) {

            if (box[i]._id == recipes[j]._id) {
              recipes[j].done = box[i].done;
            }
          }
        }
      }

    }


    // $scope.done = $scope.isDone();
    $scope.toggleDoneRecipe = function (value, recipe) {

      if (!value) {
        Recipes.saveDoneRecipe(recipe).then(function (response) {

          $rootScope.currentUser = response.data;
          $cookies.user = JSON.stringify(response.data);


        }, function (err) {
          console.log('error occured', err);
        });
        return;
      }
      if (value) {


        Recipes.saveUnDoneRecipe(recipe).then(function (response) {
          // console.log('saved undone user recipes');
          // $scope.currentUser = response.data;
          $rootScope.currentUser = response.data;
          // #HACKreactor:
          $cookies.user = JSON.stringify(response.data);

        }, function (err) {
          console.log('error occured', err);
        });
      }
    };


    $scope.deleteRecipe = function (recipe) {
      Recipes.deleteRecipe(recipe).then(function () {
        // console.log("This is the response from the delete", response);
        //why this? we are just going to call the function
        //that got the recipes initially, which talks to the backend
        //and gets the current state of the world. since we deleted, it
        //will automatically update it. this sets the $scope.recipes to be what we want.

        var recipes = $scope.getUserRecipes();

        $scope.userRecipes = recipes;


        RecipeBox.recipeCount--;
        // console.log();
        // console.log("deleted recipe");
      }, function (err) {
        console.log("error occured when deleting", err);
      });
    };

    $scope.deleteAllUserRecipes = function () {
      Recipes.deleteAllRecipes().then(function (response) {
        // RecipeBox.recipeCount = 0;
        // $scope.userRecipes = null;
        console.log(response);
        $scope.userRecipes = response.data.recipeBox;
        $rootScope.currentUser.recipeBox = [];
        RecipeBox.recipeCount = 0;

        //  $scope.userRecipes = response;
        // //probably better to store everything in RecipeBox service. 
        // // there could be a reset function.  
        // RecipeBox.recipeCount = $scope.userRecipes.length;
        // // $scope.$apply();

      }, function (err) {
        console.log("error occured when deleting", err);
      });
    };
    // $scope.save = function(checked) {
    //   localStorage.setItem('CONFIG', $scope.CONFIG);
    // };
    window.$location = $location;

    $scope.saveRecipe = function (response) {
      Recipes.save(response)
        .then(function (response) {

          $scope.getUserRecipes();

          //   //ideal case would be recipeBox would live in the service
          //   RecipeBox.recipeCount = $scope.userRecipes.length;
          // }
          // console.log(response);
          $alert({
            content: response.data.recipeBox ? 'recipe has been added.' : 'This recipe is already in your recipe box',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 1
          });
        })
        .catch(function (response) {

          $alert({


            content: response.data.message,
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        });
    };

    $scope.addRecipe = function (recipe) {
      if ($scope.currentUser === undefined) {
        $location.path('/login');
        return;
      }

      Recipes.getIndividualRecipe(recipe.id).then(function (response) {
        // console.log(response);

        $scope.saveRecipe(response);
        RecipeBox.recipeCount++;
        // console.log($rootScope.recipePropsIWant);
        // console.log($scope.individualRecipe);
      });
    };

    $scope.searchRecipes = function () {

      Recipes.getRecipes($scope.query.name).then(function (response) {
        $scope.recipes = response;
        // console.log($scope.recipes);
      });

    };



    $scope.getGenreRecipes = function (genre) {
      Recipes.getRecipesByGenre(genre).then(function (response) {
        $scope.recipes = response;
        // console.log(response);
      });
    };

    $scope.handleEnterKey = function ($event) {

      if ($event.keyCode === 13) {
        $scope.searchRecipes();
      }
    };

    $scope.getIndividualRecipe = function (recipeId) {
      Recipes.getIndividualRecipes(recipeId).then(function (response) {
        $scope.individualRecipe = response;

        // console.log($rootScope.recipePropsIWant);
        // console.log($scope.individualRecipe);
      });
    };
    $scope.getUserRecipes = function () {
      if ($rootScope.currentUser) {

        Recipes.getUserRecipes().then(function (response) {
          // console.log(response);
          $scope.userRecipes = response;
          addDonesToNGModel();
          //probably better to store everything in RecipeBox service. 
          // there could be a reset function.  
          if (!$scope.userRecipes) {
            RecipeBox.recipeCount = 0;
          }
          RecipeBox.recipeCount = $scope.userRecipes.length;
          // console.log($scope.userRecipes);
          // $scope.$apply();
          // console.log('recipes to display', $scope.userRecipes);
        });
      }
    };
    // var id = $rootScope.currentUser._id;


    $scope.$on("getUserRecipes", function () {
      $scope.getUserRecipes();
    });


    var init = function (randGenre) {
      Recipes.getQuickRecipes(randGenre).then(function (response) {

        $scope.quickRecipes = response;
        // console.log('quick recipes',$scope.quickRecipes);
      });

    };



    // for testing: $http.get('/api/add').then(function(response){console.log(response)});
    init(randGenre);
    $scope.getUserRecipes();

  })
  .directive('streamPreview', function () {

    return {
      controller: 'StreamCtrl',
      template: [
        '{{lasthourRecipes.userName}}',
        '<ul style="list-style-type: none">',
        '<li class="animate-repeat" ng-repeat="recipe in recipeStreamLimited | orderBy:\'createdAt\':true">',
        '{{recipe.userName}}  Added: {{recipe.name}}',
        '</li>',
        '</ul>'
      ].join('')
    };
  })
  .directive('recipeBoxPreview', function () {
    return {
      template: [
        '<h5><center>Your Recipe Box: </center></h5>',
        '<ol>',
        '<li class="animate-repeat" ng-repeat="recipe in userRecipes | orderBy:\'createdAt\':true">',
        '<a href="{{recipe.recipeUrl}}" target="_blank">{{recipe.name}}</a>',
        '</li>',
        '</ol>'
      ].join('')
    };
  });