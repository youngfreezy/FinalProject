angular.module('MyApp')
  .directive('recipe', function () {
    function RecipeCtrl($scope, $rootScope, Recipes, RecipeBox, $alert) {
      $scope.addRecipe = function (recipe) {
        if ($rootScope.currentUser === undefined) {
          $location.path('/login');
          return;
        }

        Recipes.getIndividualRecipe(recipe.id).then(function (response) {
          saveRecipe(response);
          RecipeBox.recipeCount++;
        });
      };


      function saveRecipe(response) {
        Recipes.save(response)
          .then(function (response) {

            $scope.$broadcast('getUserRecipes');
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