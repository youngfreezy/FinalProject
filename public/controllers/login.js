angular.module('MyApp')
  .controller('LoginCtrl', function ($scope, $rootScope, Auth) {
    $scope.login = function () {
      // console.log('test1');
      Auth.login({
        email: $scope.email,
        password: $scope.password
      });
    };

    // console.log($location.path());
    // $scope.$on("$routeChangeStart",
    //   function (event, current, previous, rejection) {
    //     // console.log(current, previous);
    //   });


    $scope.facebookLogin = function () {
      Auth.facebookLogin();
    };

    $scope.pageClass = 'fadeZoom';

  });