angularApp.controller('inputDialogCtrl', function($rootScope, $scope, flash, $location, $timeout, $stateParams, $modalInstance, $routeParams, $route, $modal, Restangular, items) {

	$scope.item = items;



	$scope.save = function() {

		if ($scope.item.type == 'dropdown') {
			if ($scope.item.isMandatory == true) {
				if ($scope.item.value == undefined) {
					flash.pop({
						title: 'Alert',
						body: $scope.item.title + ' should not be blank.',
						type: 'error'
					});
				} else {
					if ($scope.item.value[0].v == undefined)
						flash.pop({
							title: 'Alert',
							body: $scope.item.title + ' should not be blank.',
							type: 'error'
						});
					else {
						$scope.item.data = $scope.item.value[0].v;
						$modalInstance.close($scope.item);
					}
				}
			} else {
				$scope.item.data = $scope.item.value[0].v;
				$modalInstance.close($scope.item);
			}
		} else {
			if ($scope.item.isMandatory == true) {
				if ($scope.item.value == undefined)
					if ($scope.item.title == "Calculate Tariff") {
						flash.pop({
							title: 'Alert',
							body: 'Invalid Input...!!',
							type: 'error'
						});
					} else {
						flash.pop({
							title: 'Alert',
							body: $scope.item.title + ' should not be blank.',
							type: 'error'
						});
					} else {
					$scope.item.data = $scope.item.value;
					$modalInstance.close($scope.item);
				}
			} else {
				$scope.item.data = $scope.item.value;
				$modalInstance.close($scope.item);
			}
		}

	};

	$scope.close = function() {
		$modalInstance.dismiss(undefined);
	};



});