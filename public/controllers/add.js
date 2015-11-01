angular.module('MyApp')
  .controller('AddCtrl', function ($scope, $alert, $resource, Recipes) {
    console.log($scope.recipes);
    console.log($scope.quickRecipes);
    $scope.addRecipe = function (recipe) {
      console.log('recipe adding', recipe);
      Recipes.save(recipe)
        .then(function () {

          $alert({
            content: 'recipe has been added.',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
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

    // $scope.toggleDoneRecipe = function (value, recipe) {

    //   if (value) {
    //     Recipes.saveDoneRecipe(recipe).then(function (response) {
    //       // $rootScope.currentUser = response.data;
    //       $rootScope.currentUser = response.data;
    //       // console.log(response.data);
    //       // console.log($scope.currentUser);
    //       // $scope.currentUser = response.data;
    //       // $scope.getUserRecipes();
    //       // $scope.recipes = response.data;
    //     }, function (err) {
    //       console.log('error occured', err);
    //     });
    //     return;
    //   }

    //   Recipes.saveUnDoneRecipe(recipe).then(function (response) {
    //     // console.log('saved undone user recipes');
    //     $rootScope.currentUser = response.data;
    //   }, function (err) {
    //     console.log('error occured', err);
    //   });
    // };

    // $scope.deleteRecipe = function (recipe) {
    //   Recipes.deleteRecipe(recipe).then(function () {
    //     // console.log("This is the response from the delete", response);
    //     //why this? we are just going to call the function
    //     //that got the recipes initially, which talks to the backend
    //     //and gets the current state of the world. since we deleted, it
    //     //will automatically update it. this sets the $scope.recipes to be what we want.
    //     //the above $scope.userRecipes
    //     var recipes = $scope.getUserRecipes();

    //     $scope.userRecipes = recipes;
    //     // RecipeBox.recipeCount = recipes.recipeBox.length;
    //     // console.log(response.data);
    //     // $scope.userRecipes = response.data;
    //     // RecipeBox.recipeCount = response.data.recipeBox.length;

    //     RecipeBox.recipeCount--;
    //     // console.log();
    //     // console.log("deleted recipe");
    //   }, function (err) {
    //     console.log("error occured when deleting", err);
    //   });
    // };

   
    // $scope.deleteAllUserRecipes = function () {
    //   Recipes.deleteAllRecipes().then(function (response) {
    //     // RecipeBox.recipeCount = 0;
    //     // $scope.userRecipes = null;
    //     console.log(response);
    //     $scope.userRecipes = response.data.recipeBox;
    //     $rootScope.currentUser.recipeBox = [];
    //     RecipeBox.recipeCount = 0;

    //     //console.log('$scope.userRecipes', $scope.userRecipes);
    //     //console.log('RecipeBox.recipeCount', RecipeBox.recipeCount);
    //     // console.log(response.data.);
    //     // console.log($scope.currentUser);

    //     //  $scope.userRecipes = response;
    //     // //probably better to store everything in RecipeBox service. 
    //     // // there could be a reset function.  
    //     // RecipeBox.recipeCount = $scope.userRecipes.length;
    //     // // $scope.$apply();
    //     // // console.
    //   }, function (err) {
    //     console.log("error occured when deleting", err);
    //   });
    // };
    // // $scope.save = function(checked) {
    // //   localStorage.setItem('CONFIG', $scope.CONFIG);
    // // };
    // window.$location = $location;
    // $scope.addRecipe = function (recipe) {
    //   if ($scope.currentUser === undefined) {
    //     $location.path('/login');
    //     return;
    //   }
    //   Recipes.getIndividualRecipe(recipe.id).then(function (response) {
    //     // console.log(response);
    //     Recipes.save(response)
    //       .then(function (response) {

    //         $scope.getUserRecipes();
    //         // if (response.data.recipeBox) {

    //         //   $scope.userRecipes = response.data.recipeBox;

    //         //   console.log("This is the user recipebox", $scope.userRecipes);
    //         //   //ideal case would be recipeBox would live in the service
    //         //   RecipeBox.recipeCount = $scope.userRecipes.length;
    //         // }
    //         // console.log(response);
    //         $alert({
    //           content: response.data.recipeBox ? 'recipe has been added.' : 'This recipe is already in your recipe box',
    //           animation: 'fadeZoomFadeDown',
    //           type: 'material',
    //           duration: 1
    //         });
    //       })
    //       .catch(function (response) {

    //         $alert({

    //           // #3: generally, all three items aren't updating in real time

    //           content: response.data.message,
    //           animation: 'fadeZoomFadeDown',
    //           type: 'material',
    //           duration: 3
    //         });
    //       });
    //     // console.log($rootScope.recipePropsIWant);
    //     // console.log($scope.individualRecipe);
    //   });
    // };
  });