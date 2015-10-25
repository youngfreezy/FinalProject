angular.module('MyApp')
  .controller('NavbarCtrl', function ($scope, $rootScope, Auth, Profile, RecipeBox) {
    $scope.data = {};
    $scope.logout = function () {
      Auth.logout();
    };

    // function updateStream(){
    //   socket.emit('lasthouractivity');
    //   // console.log('emitting an event');
    // }

    // setInterval(updateStream,10000);

    //socket.on('lasthouractivity', function (response) {
      //$scope.data.count = response.length;
      // console.log("got a response");
      // console.log(response);
    //});

    $scope.recipeBox = RecipeBox;
    $scope.streamActivityLength = $rootScope.streamLength;
    // console.log(RecipeBox);
    //watching the currentUser property on rootscope
    //when it does, get the name from the profile.

    $scope.$on('cleanup', function(){
      // $scope.recipeBox = [];
      // $scope.streamActivityLength = 0;
    });

    $rootScope.$watch("currentUser", function (newValue, oldValue) {
      if (newValue) {
        $scope.message = "Hi, " + Profile.getName() + "!";
      }
    });
  });