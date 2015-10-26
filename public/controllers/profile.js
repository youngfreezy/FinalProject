angular.module('MyApp')
  .controller('ProfileCtrl', function ($scope, $http, $rootScope, Profile) {
    // $rootScope.currentUser = user;
    $scope.user = $rootScope.currentUser;
    $scope.name = $scope.user.name;
    // $scope.imageData = null;
    $scope.pictures = $scope.user.facebook ? $scope.user.facebook.pictures : $scope.imageData;

    // console.log($scope.user);
    $scope.filesChanged = function (elm) {
      $scope.files = elm.files;
      $scope.apply();
    };

    $scope.upload = function () {
      var fd = new FormData();
      angular.forEach($scope.files, function (file) {
        fd.append('file', file);
      });

      $http.post('upload', fd, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }

      }).success(function (data) {
        $scope.imageData = data;
        console.log($scope.imageData);
      });
    };
  })
  .directive('fileInput', ['$parse',
    function ($parse) {
      return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
          elm.bind('change', function () {
            $parse(attrs.fileInput)
              .assign(scope, elm[0].files);
            scope.$apply();
          });
        }
      };
    }
  ]);