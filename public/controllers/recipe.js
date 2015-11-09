angular.module('MyApp')
   //for individual recipes
  .controller('RecipeCtrl', function ($scope, $routeParams, MainService) {
    $scope.recipe = {};
   
   
      MainService.getIndividualRecipe($routeParams.id).then(function (response) {
        $scope.recipe = response;
        // console.log(response);
      });

    
   
  });