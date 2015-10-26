angular.module('MyApp')
  .controller('ProfileCtrl', function ($scope, $http, $rootScope, Profile) {
    // $rootScope.currentUser = user;
    $scope.user = $rootScope.currentUser;
    $scope.picture = $scope.user.picture;
    $scope.name = $scope.user.name;
    // $scope.imageData = null;
    $scope.pictures = $scope.user.facebook ? $scope.user.facebook.pictures : $scope.imageData;
    // console.log($scope.user);
    // console.log($scope.user);
    $scope.filesChanged = function (elm) {
      $scope.files = elm.files;
      console.log($scope.files);
      $scope.apply();
    };

    $scope.upload = function (endpoint) {
      var fd = new FormData();
      angular.forEach($scope.files, function (file) {
        fd.append('file', file);
      });
       // console.log(elm.files);
      $http.post(endpoint, fd, {

        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
          // 'filename': elm.files[0].name
        }

      }).success(function (data) {
        console.log('data', data);
        if (endpoint === "/upload"){
          $scope.imageData = "data:image/png;base64," + data;
        } else {
          $scope.imageData = "/getpicture?id=" + data.picture;
          $scope.picture = data.picture;
          console.log('picture is now', $scope.picture);
        }
        // this is the actual string being returned:
        // console.log($scope.imageData);
      });
    };

    $scope.$watch('picture', function(newPic){
      console.log('newPic', newPic);
    }, true);

    $scope.getRightImage = function () {
      console.log('getting right image', $scope.picture);
      if($scope.user.facebook && !$scope.picture){
        return $scope.pictures;
      } else {
        return "/getpicture?id=" + $scope.picture;
      }
    };

    $scope.getImage = function (pictureId) {
      Profile.GetProfileImage(pictureId).then(function (response) {
        console.log(response);
      });
    };

    // $scope.saveImage = function () {
    //  Profile.SaveProfileImage().then(function(response){
    //     console.log(response);
    //   });
    // };
  })
  .directive('fileInput', ['$parse',
    function ($parse) {
      return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
          elm.bind('change', function () {
            $parse(attrs.fileInput)
              .assign(scope, elm[0].files);
              console.log(elm[0].files.name);
            scope.$apply();
          });
        }
      };
    }
  ]);