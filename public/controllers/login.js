angular.module('MyApp')
  .controller('LoginCtrl', function ($scope, $rootScope, Auth) {
    $scope.login = function () {
      // console.log('test1');
      Auth.login({
        email: $scope.email,
        password: $scope.password
      });
    };


    $scope.pageClass = 'fadeZoom';

  });