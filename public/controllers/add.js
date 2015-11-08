angular.module('MyApp')
  .controller('AddCtrl', function ($scope, $rootScope, $alert, $resource, $cookies, Recipes, RecipeBox) {
    $scope.deleteRecipe = function (recipe) {
      Recipes.deleteRecipe(recipe).then(function () {

        var recipes = getUserRecipes();

        $scope.userRecipes = recipes;


        RecipeBox.recipeCount--;

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

       

      }, function (err) {
        console.log("error occured when deleting", err);
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

    // for persisting the "done" state with the checkbox.  The recipes displayed on that page are generated
    // from recipes which follow the mongoModels/recipe.js schema. these recipes do not have a "done" property.
    // the recipebox in the User model stores recipes by id, and a done property.  This function adds "dones" to the
    // recipes (from recipeModel) in this users recipeBox.
    
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
          
 
          $rootScope.currentUser = response.data;
    
          $cookies.user = JSON.stringify(response.data);

        }, function (err) {
          console.log('error occured', err);
        });
      }
    };

    function getUserRecipes () {
      Recipes.getUserRecipes().then(function (recipes) {
        $scope.userRecipes = recipes;
        addDonesToNGModel();
      });
    }

    function init () {
      getUserRecipes();
    }

    init();
  });