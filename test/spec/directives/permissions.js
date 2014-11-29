'use strict';

describe('Directive: permissions', function() {
  beforeEach(module('angularApp'));

  var element;

  it('should make hidden element visible', inject(function($rootScope, $compile) {
    element = angular.element('<permissions></permissions>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the permissions directive');
  }));
});
