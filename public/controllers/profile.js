angular.module('MyApp')
  .controller('ProfileCtrl', function ($scope, $http, $rootScope, Profile, $cookies) {
    // $rootScope.currentUser = user;
    // console.log($rootScope.previousPage);

    if ($rootScope.currentUser) {

      $scope.user = $rootScope.currentUser;
      console.log("User from root scope", $scope.user);
      // console.log($scope.user);
      $scope.picture = $scope.user.picture;
      $scope.name = $scope.user.name;
    }
    // $scope.imageData = null;
    // $scope.pictures = $scope.user.facebook ? $scope.user.facebook.pictures : $scope.imageData;
    // console.log($scope.user);
    // console.log($scope.user);
    $scope.getCurrentUser = function (id) {
      Profile.getCurrentUser(id).then(function (response) {
        $rootScope.currentUser = response.data;
        console.log(response.data);
        // console.log('lalala', $rootScope.currentUser);
      }, function (err) {
        console.log('error occured', err);
      });

    };

    $scope.filesChanged = function (elm) {
      $scope.files = elm.files;
      // console.log($scope.files);
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
        // console.log('data', data);
        if (endpoint === "/upload") {
          $scope.imageData = "data:image/png;base64," + data;
        }
        $rootScope.timestamp = (new Date()).getTime();
        
      });
    };

    $scope.$watch('picture', function (newPic) {
      // console.log('newPic', newPic);
    }, true);

    $scope.getRightImage = function () {
      // console.log('getting right image', $scope.picture);
      if ($scope.user && !$scope.user.facebook && !$scope.picture) {
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYXjtDxJYz7ZqPSNGyS3cUCWDxhs-UJhVIbAOVj1qjHHxR0Bl_yw";
      }
      if ($scope.user && $scope.user.facebook && !$scope.picture) {
        return $scope.user.facebook.pictures;
      } else {
        return "/getpicture?id=" + $scope.picture;
      }
    };


    // $scope.saveImage = function () {
    //  Profile.SaveProfileImage().then(function(response){
    //     console.log(response);
    //   });
    // };
     $scope.getCurrentUser();
  })
  .directive('fileInput', ['$parse',
    function ($parse) {
      return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
          elm.bind('change', function () {
            $parse(attrs.fileInput)
              .assign(scope, elm[0].files);
            // console.log(elm[0].files.name);
            scope.$apply();
          });
        }
      };
    }
  ]);