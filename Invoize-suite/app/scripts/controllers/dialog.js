
angularApp.controller('modalInstanceCtrl', function($scope, $modalInstance, items) {
	$scope.item = items;

	$scope.save = function() {
		$modalInstance.close($scope.item);
	};

	$scope.close = function() {
		$modalInstance.dismiss(undefined);
	};

//	$scope.redirectToEditTamplate = function() {
//		$modalInstance.close("/tariffManagement/viewTariff/" + $scope.item.accountId + "/" + $scope.item.templateId);
//	};
//	$scope.redirectToEditTariff = function() {
//		$modalInstance.close("/tariffManagement/editTariff/" + $scope.item.templateId);
//	};

});