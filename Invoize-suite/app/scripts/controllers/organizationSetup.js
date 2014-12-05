/**
 * Created by kamalsingh.saini on 28/10/13.
 */
'use strict';

angularApp.controller('organizationSetupCtrl', function($scope, $location, $stateParams, $route, $routeParams, flash) {
	$.getScript("/scripts/vendor/ace.js");
	$scope.redirectTo = function(path) {

		$location.path(path);
	};
})