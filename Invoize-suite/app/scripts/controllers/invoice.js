'use strict';
angularApp.controller('invoiceCtrl', function($scope, $http, $location, $routeParams, profileService, flash, Restangular, $dialog) {
	var invoices = Restangular.all('payright/invoice');
	$scope.invoice = [];
	$scope.readInvoice = function(id) {
		$location.path("/payright/invoice/" + $routeParams.statusId + "/" + id);
		Restangular.one('payright/invoice', id).get().then(function(result) {
			$scope.invoice = result;
		}, function(result) {
			flash.pop({
				title: 'Error in reading.',
				body: result,
				type: 'error'
			});
		});
	};
});