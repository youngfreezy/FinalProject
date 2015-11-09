angular.module('MyApp')
  .factory('Stream', function ($rootScope, $http) {


    return {
      SaveRecipeInStreamWithUpvotes: function (recipe) {
        return $http.put('/api/stream/' + recipe._id + '/upvote').success(function (data) {
          recipe.upvotes += 1;
        });

      },
      removeCommentFromStreamRecipe: function (recipeId, commentId) {
        return $http.delete('/api/stream/' + recipeId + '/comments/' + commentId);
        //resolve promise in controller where you can handle error. you can also

      },
      SaveRecipeInStreamWithComments: function (id, comment) {
        return $http.post('/api/stream/' + id + '/comments', comment);
      },
      // TODO:
      // upVoteStreamRecipeComments: function (recipe, comment) {
      //   return $http.put('/api/stream/' + recipe._id + '/comments/' + comment._id + '/upvote')
      //     .success(function (data) {
      //       comment.upvotes += 1;
      //     });
      // },

    };

  });