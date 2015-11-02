describe('MainController', function () {
  beforeEach(module('MyApp'));

  var $controller;


  beforeEach(inject(function (_$controller_, $httpBackend, $http) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    this.$httpBackend = $httpBackend;
    this.$http = $http;
  }));

  describe('$scope.addRecipe', function () {
    it('adds a recipe', function ($scope, $httpBackend) {
      var recipe = {
        recipeName: "The Accidental Hipster",
        id: "The-Accidental-Hipster-1250057"
      };


      var $scope = {
        $on: function (cb) {
          return;
        }
      };
      var controller = $controller('MainCtrl', {
        $scope: $scope
      });

      $scope.addRecipe(recipe);

      var recipeId = 'The-Accidental-Hipster-1250057';
      // Step 2
      this.$httpBackend.expectJSONP($httpBackend.expectJSONP(/http:\/\/api.yummly.com\/v1\/api\/recipes.*/), function (recipe) {
        // Step 3
        expect(recipe).toBeDefined();
        expect(recipe.id).to.equal('The-Accidental-Hipster-1250057');
      }).respond({
        recipeName: "The Accidental Hipster",
        id: "The-Accidental-Hipster-1250057"
      });
      // Step 1. Fire a JSONP request
      this.$http.jsonp('http://api.yummly.com/v1/api/recipe/' + recipeId + '?callback=JSON_CALLBACK');
      this.$httpBackend.flush();

    });
  });
});









// describe('controllers', function () {
//   beforeEach(module('MyApp', function ($provide) {
//     $provide.constant('io', io);
//   }));

//   var socket = {
//     on: function () {},
//     emit: function () {}
//   };
//   var io = {
//     connect: function () {
//       return socket;
//     }
//   };

//   describe('AddCtrl', function () {
//     it('should add a new recipe', inject(function ($controller, $rootScope, $httpBackend) {
//       $httpBackend.expectJSONP('http:\/\/api\.yummly\.com\/.*').return(200, '');
//       var scope = $rootScope.$new();
//       var Main = $controller('MainCtrl', {
//         $scope: scope
//       });
//       scope.$digest();
//       expect(MainCtrl).toBeDefined();
//     }));
//   });


// });