describe('controllers', function () {
  beforeEach(module('MyApp', function ($provide) {
    $provide.constant('io', io);
  }));

  var socket = {
    on: function () {},
    emit: function () {}
  };
  var io = {
    connect: function () {
      return socket;
    }
  };

  describe('AddCtrl', function () {
    it('should add a new recipe', inject(function ($controller, $rootScope, $httpBackend) {
      $httpBackend.expectJSONP('http:\/\/api\.yummly\.com\/.*') //.return(200, '');
      var scope = $rootScope.$new();
      var Main = $controller('MainCtrl', {
        $scope: scope
      });
      scope.$digest();
      expect(MainCtrl).toBeDefined();
    }));
  });


});