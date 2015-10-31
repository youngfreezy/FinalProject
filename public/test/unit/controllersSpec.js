describe('controllers', function(){
  beforeEach(module('MyApp'));

  describe('AddCtrl', function() {
    it('should add a new recipe', inject(function($controller) {
      var Main = $controller('MainCtrl', { $scope: {} });
      expect(MainCtrl).toBeDefined();
    }));
  });


});