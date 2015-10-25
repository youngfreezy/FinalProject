angular.module('MyApp')
.controller('ProfileCtrl', function($scope, $rootScope, Profile) {
// $rootScope.currentUser = user;
$scope.user = $rootScope.currentUser;
$scope.name = $scope.user.name;
$scope.pictures = $scope.user.facebook.pictures;
// console.log($scope.user);
});