angular.module('MyApp')
  .controller('AddCtrl', function($scope, $alert, $resource, Recipes) {
    console.log($scope.recipes);
    console.log($scope.quickRecipes);
    $scope.addRecipe = function(recipe) {
      console.log('recipe adding',recipe);
      Recipes.save(recipe)
        .then(function() {

          $alert({
            content: 'recipe has been added.',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        })
        .catch(function(response) {
      
          $alert({
            content: response.data.message,
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        });
    };
  });