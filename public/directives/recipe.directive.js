angular.module('MyApp')
  .directive('recipe', function () {
    function RecipeCtrl($scope, $rootScope, MainService, RecipeBox, $alert, $location) {
      
      $scope.addRecipe = function (recipe) {
        if ($rootScope.currentUser === undefined) {
          $location.path('/login');
          return;
        }

        MainService.getIndividualRecipe(recipe.id).then(function (response) {
          saveRecipe(response);
          RecipeBox.recipeCount++;
        });
      };


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
    }

    return {
      restrict: 'E',
      templateUrl: '/directives/recipe.directive.html',
      controller: RecipeCtrl,
      scope: {
        recipe: '=value'
      }
    };
  });