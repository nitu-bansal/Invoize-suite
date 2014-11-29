'use strict';

describe('Controller: RecordsCtrl', function() {

  // load the controller's module
  beforeEach(module('angularApp'));

  var RecordsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    RecordsCtrl = $controller('RecordsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
