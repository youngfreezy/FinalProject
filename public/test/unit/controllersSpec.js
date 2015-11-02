describe('MainController', function () {
  beforeEach(module('MyApp'));

  var $scope;
  var controller;
  var recipe;
  var deferred;
  var Recipes = {
    getIndividualRecipe: function() {
      return deferred.promise;
    },
    getQuickRecipes: function () {
      return deferred.promise;
    },
    save: function () {
      return deferred.promise;
    }
  };
  var RecipeBox = {
    recipeCount: 0
  };
  var user = {};

  beforeEach(inject(function ($controller, $httpBackend, $http, $q, $rootScope) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    this.$httpBackend = $httpBackend;
    this.$http = $http;
    deferred = $q.defer();

    recipe = {
      recipeName: "The Accidental Hipster",
      id: "The-Accidental-Hipster-1250057"
    };

    $httpBackend.whenGET('views/home.html').respond(200, '');
    $scope = $rootScope.$new();
    $scope.currentUser = user;
    controller = $controller('MainCtrl', {
      $scope: $scope,
      Recipes: Recipes,
      RecipeBox: RecipeBox
    });
    $scope.$apply();

  }));

  describe('$scope.addRecipe', function () {
    it('calls the Recipes service with the appropriate method', function () {
      spyOn(Recipes, 'getIndividualRecipe').and.callThrough();
      $scope.addRecipe(recipe);
      expect(Recipes.getIndividualRecipe).toHaveBeenCalled();
    });

    it('adds a recipe', function () {
      spyOn($scope, 'saveRecipe');
      $scope.addRecipe(recipe);

      deferred.resolve();
      $scope.$apply();

      expect($scope.saveRecipe).toHaveBeenCalled();
      expect(RecipeBox.recipeCount).toBe(1);
    });
  });
});