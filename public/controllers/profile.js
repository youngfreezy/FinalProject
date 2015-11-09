angular.module('MyApp')
  .controller('ProfileCtrl', function ($scope, $http, $rootScope, Profile, $cookies) {


    $scope.getCurrentUser = function (id) {
      Profile.getCurrentUser(id).then(function (response) {
        $rootScope.currentUser = response.data;

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
        //Angular’s default transformRequest function will try to serialize our FormData object, so we override it with 
        //the identity function to leave the data intact
        transformRequest: angular.identity,
        // Angular’s default Content-Type header for POST and PUT requests is application/json.
        // By setting ‘Content-Type’: undefined, the browser sets the Content-Type to multipart/form-data for us. 
        headers: {
          'Content-Type': undefined

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
    //parse translates a string to a function
    function ($parse) {
      return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
          //watching the input element for a change
          elm.bind('change', function () {
            //parse the file-input attribute to make it a function
            $parse(attrs.fileInput)
              .assign(scope, elm[0].files);
            console.log(elm[0].files);
            scope.$apply();
          });
        }
      };
    }
  ]);