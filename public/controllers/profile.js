angular.module('MyApp')
  .controller('ProfileCtrl', function ($scope, $http, $rootScope, Profile, $cookies) {
    // $rootScope.currentUser = user;
    // console.log($rootScope.previousPage);
    // I am templating $scope.image. so that needs to be set to something from the response.  


    // $scope.getRightImage = function () {
    //   Profile.SaveProfileImage().then(function(data){
    //     console.log(data);
    //   });
    // };
  

    $scope.getCurrentUser = function (id) {
      Profile.getCurrentUser(id).then(function (response) {
        $rootScope.currentUser = response.data;
        // console.log("GETTTING THE CURRENT USERRRR", response.data);
        // console.log('lalala', $rootScope.currentUser);
      }, function (err) {
        console.log('error occured', err);
      });

    };


    if ($rootScope.currentUser) {

      var id = $rootScope.currentUser._id;
      $scope.getCurrentUser(id);

      if ($rootScope.currentUser.facebook && !$rootScope.currentUser.image) {
        $rootScope.currentUser.image = $rootScope.currentUser.facebook.photos;
        $scope.getCurrentUser(id);
      }

    }



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

        if (endpoint === "/upload/save") {
          $rootScope.currentUser.image = data.image;
          // $scope.apply();
          console.log(data);
        }

      });
    };


  })
  .directive('fileInput', ['$parse',
    //parse translates a string to an actual expression.
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