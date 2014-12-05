'use strict';

angularApp.controller('paymentCtrl', function($scope, $http, $location, $routeParams, profileService, flash, Restangular, $dialog) {

	var payment = Restangular.all('payright/payment');
	$scope.readPayment = function(id) {
		$location.path("/payright/payment/" + $routeParams.statusId + "/" + id);
		Restangular.one('payright/payment', id).get().then(function(result) {
			$scope.payment = result;
		}, function(result) {
			flash.pop({
				title: 'Error in reading.',
				body: result,
				type: 'error'
			});
		});
	};
});