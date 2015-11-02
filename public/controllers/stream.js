angular.module('MyApp')
//we have the Stream/Socket.io service is in vendor/socket.min.js "socketFactory"
.controller('StreamCtrl', function ($scope, $alert, $rootScope, Recipes, ioService) {
  $rootScope.data = {};
  $rootScope.data.count = 0;
  $scope.lasthourRecipes = [];
  $scope.txtcomment = "";
  $scope.$watch('lasthourRecipes', function (newRecipes) {
    // console.log('lasthourRecipes changed', newRecipes);
  }, true);
  // $scope.lasthour.upvotes = 0;
  $scope.incrementUpvotes = function (recipe) {
    // recipe.upvotes += 1;
    Recipes.SaveRecipeInStreamWithUpvotes(recipe);
  };


  $scope.saveComment = function (recipe, comment) {
    // so here we are getting the ng-model passed in.
    if(!$rootScope.currentUser){
      $alert({
          content: 'Login to Comment :)',
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 2
        });
    }
    else if (comment !== '') {
      Recipes.SaveRecipeInStreamWithComments(recipe._id, {
        body: comment,
        author: $rootScope.currentUser._id
      }).success(function (comment) {
        $alert({
          content: 'Comment Saved :)',
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 2
        });
        
        
      }).error(function (comment) {
        $alert({
          content: 'Login to Comment :)',
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 2
        });
     
      });
     
      $scope.txtcomment = "";
    }
  };


  $scope.deleteComment = function (recipeid, commentid) {
    //you should only be able to delete your own comment. if $rootScope.currentUser._id === comments[i].author
    // if($rootScope.currentUser._id === commentAuthorID){
      //just use ng-if
    // }
    Recipes.removeCommentFromStreamRecipe(recipeid, commentid).success(function (data) {
      $alert({
          content: 'Comment Deleted!',
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 2
        });
    });
    
  };

  ioService.getStream();
  $rootScope.stream.unseen = 0;

  // we can do this because of $broadcast. we are catching the $broadcasted event.  
  $scope.$on('stream', function (event, data) {
    $scope.lasthourRecipes = data;
    $scope.recipeStreamLimited = data.slice(-8);
  

    $scope.$apply();
  });
});