'use strict';

angularApp.directive('appAllow', function() {
  return {
    //template: '<div></div>',
    //restrict: 'E',
    
    link: function postLink($scope, element, attrs) {
    	/*console.log(attrs.appAccounts);
		//Error().stack

	    element.text('Hello Everyone' + attrs.appAccounts) ;

	    $scope.$watch(attrs.appAccounts, function(accounts) {
  			console.log(attrs.appAccounts);
		});*/

    }
  };
});
