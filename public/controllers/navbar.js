angular.module('MyApp')
  .controller('NavbarCtrl', function ($scope, $rootScope, Auth, Profile, RecipeBox) {
    $scope.data = {};
    $scope.logout = function () {
      Auth.logout();
    };


    $scope.recipeBox = RecipeBox;
    $scope.streamActivityLength = $rootScope.streamLength;


    $rootScope.$watch("currentUser", function (newValue, oldValue) {
      if (newValue) {
        $scope.message = "Hi, " + Profile.getName() + "!";
      }
    });
  });