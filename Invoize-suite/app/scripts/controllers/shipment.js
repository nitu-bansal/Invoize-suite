'use strict';

angularApp.controller('shipmentCtrl', function($scope, $http, $location, $routeParams, profileService, flash, Restangular, $dialog) {

	var shipment = Restangular.all('payright/shipment');
	$scope.readShipment = function(id) {
		$location.path("/payright/shipment/" + $routeParams.statusId + "/" + id);
		Restangular.one('payright/shipment', id).get().then(function(result) {
			$scope.shipment = result;
		}, function(result) {
			flash.pop({
				title: 'Error in reading.',
				body: result,
				type: 'error'
			});
		});
	};
});