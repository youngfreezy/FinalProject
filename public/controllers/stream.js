angular.module('MyApp')
//we have the Stream/Socket.io service is in vendor/socket.min.js "socketFactory"
.controller('StreamCtrl', function ($scope, $rootScope, Recipes, ioService) {
  $rootScope.data = {};
  $rootScope.data.count = 0;
  $scope.lasthourRecipes = [];
  $scope.lasthourRecipesFull = [];
  $scope.txtcomment = "";
  $scope.$watch('lasthourRecipes', function(newRecipes){
    // console.log('lasthourRecipes changed', newRecipes);
  }, true);
  // $scope.lasthour.upvotes = 0;
  $scope.incrementUpvotes = function (recipe) {
    // recipe.upvotes += 1;
    Recipes.SaveRecipeInStreamWithUpvotes(recipe);
  };

  SaveRecipeInStreamWithComments = function (id, comment) {
    return $http.post('/api/stream/' + id + '/comments', comment);
  };

  $scope.saveComment = function (recipe, comment) {
    // so here we are getting the ng-model passed in. 
    if (comment !== '') {
      Recipes.SaveRecipeInStreamWithComments(recipe._id, {
        body: comment,
        author: $rootScope.currentUser._id
      }).success(function (comment) {
        console.log('saved comments', comment);
        // push this comment to the recipes comments array
        // recipe.comments.push(comment);
      });
      // recipe.comments.push($scope.txtcomment);
      $scope.txtcomment = "";
    }
  };

  // $scope.incrementCommentUpvotes = function(comment) {

  // Recipes.upVoteStreamRecipeComments(recipe, comment);
  // } 

  $scope.deleteComment = function (recipeid, commentid) {
    Recipes.removeCommentFromStreamRecipe(recipeid, commentid).success(function(data) {
      console.log('deleted');
    });
    //recipe.comments.splice($index, 1);
  };
  //TODO: comments/emojis.


  //socket.emit('lasthouractivity');
  //socket.on('lasthouractivity', function (response) {
    //this gets the recipeStream model
    //$scope.lasthourRecipes = response;
    //console.log(response);
    // get the right scope
    //$scope.$apply();

  //});
  ioService.getStream();
  $rootScope.stream.unseen = 0;

  // we can do this because of $broadcast. we are catching the $broadcasted event.  
  $scope.$on('stream', function(event, data) {
    if(!$scope.lasthourRecipesFull.length){
      $scope.lasthourRecipesFull = data;
    } else if($scope.lasthourRecipesFull.length < data.length){
      $scope.lasthourRecipesFull.push(data[data.length-1]);
    }
    //to get socket.io to talk to the animation nicely. 
    if(!$scope.lasthourRecipes.length){
      $scope.lasthourRecipes = data.slice(-5);
    } else {
      $scope.lasthourRecipes.push(data[data.length-1]);

      if($scope.lasthourRecipes.length > 5){
        $scope.lasthourRecipes.shift();
      }
    }

    /* angular.forEach(data, function(item){
      console.log('item', item);
    }); */

    $scope.$apply();
  });
});