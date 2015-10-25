angular.module('MyApp')
  .controller('RecipeCtrl', function ($scope, $routeParams, Recipes) {
   
    $scope.recipe = {};
   
   
      Recipes.getIndividualRecipe($routeParams.id).then(function (response) {
        $scope.recipe = response;
        // console.log(response);
      });

    
   
  });