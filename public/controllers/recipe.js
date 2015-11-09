angular.module('MyApp')
//for individual recipes
.controller('RecipeCtrl', function ($scope, $routeParams, MainService, $rootScope, RecipeBox, $alert) {
  $scope.recipe = {};


  MainService.getIndividualRecipe($routeParams.id).then(function (response) {
    $scope.recipe = response;
    // console.log(response);
  });

  $scope.addRecipe = function (recipe) {
    //TODO: take this out for a better user experience.
    if ($rootScope.currentUser === undefined) {
      $location.path('/login');
      return;
    }

    MainService.getIndividualRecipe(recipe.id).then(function (response) {
      saveRecipe(response);
      RecipeBox.recipeCount++;
    });
  };

  //refactor this out later:
  function saveRecipe(response) {
    MainService.save(response)
      .then(function (response) {

        $scope.$broadcast('getUserRecipes');
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
  }

});