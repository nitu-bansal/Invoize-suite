'use strict';

angularApp.controller('wizardCtrl', function($scope, $location, flash) {

	$scope.wizard = {};
	$scope.steps = ['Company', 'System', 'location', 'Operation', 'Accounts', 'Users'];
	$scope.organizationTypeList = ['Local', 'National', 'International'];
	$scope.transportModeList = ['Air', 'Ocean', 'Rail', 'Ground'];
	$scope.metadataList = [];
	$scope.wizard.transportMode = {};
	$scope.wizard.metaData = {};
	$scope.selection = $scope.steps[0];
	$scope.roleList = [];

	//    $scope.items = [
	//        {
	//            id: 1,
	//            name: {
	//                first: "Marcin",
	//                last: "Warpechowski"
	//            },
	//            address: "Marienplatz 11, Munich",
	//            isActive: "Yes",
	//            Product:"Air"
	////            Product: {
	////                Description: "Big Mac",
	////                Options: [
	////                    {Description: "Big Mac"},
	////                    {Description: "Big Mac & Co"}
	////                ]
	////            }
	//        },
	//        {
	//            id: 2,
	//            name: {
	//                first: "Marcin1",
	//                last: "Warpechowski1"
	//            },
	//            address: "Marienplatz 11, Munich1",
	//            isActive: "No",
	//            Product:"Air"// {
	////                Description: "Air",
	////                Options: [
	////                    {Description: "Big Mac"},
	////                    {Description: "Big Mac & Co"}
	////                ]
	////            }
	//        }
	//        //more items go here
	//    ];
	//    $scope.columns = [
	//        {value: 'item.id', title: 'ID'},
	//        {value: 'item.name.last', title: 'Last Name'},
	//        {value: 'item.name.first', title: 'First Name'},
	//        {value: 'item.address', title: 'Address', width: 120},
	//        {value: 'item.Product', type: 'autocomplete', title: 'Favorite food', width: 120, src:$scope.transportModeList},
	//        {value: 'item.isActive', type: 'checkbox', title: 'Is active', checkedTemplate: 'Yes', uncheckedTemplate: 'No'}
	//    ];
	//
	//    $scope.celChange = function(a){
	//        console.log(a)
	//        //return false;
	//    }

	$scope.setupOrg = function(value) {
		$scope.loading = true;
		var promise = organizationService.setup(value);
		promise.then(function(data) {
				flash.pop({
					title: 'Success',
					body: data.msg,
					type: 'success'
				});
				$location.path("/home");
			},
			function(data) {
				flash.pop({
					title: 'Alert',
					body: data.msg,
					type: 'error'
				});
			}
		);
		$scope.loading = false;
	}

	// $scope.getMetadataList = function() {
	// 	var promise = organizationService.metedataList();
	// 	promise.then(function(data) {
	// 			$scope.metadataList = data;
	// 		},
	// 		function(data) {
	// 			flash.pop({
	// 				title: 'Alert',
	// 				body: "System has experienced an error. Please contact helpdesk.",
	// 				type: 'error'
	// 			});
	// 		}
	// 	);
	// 	$scope.loading = false;
	// };

	$scope.getRoleList = function() {
		var promise = organizationService.roleList();
		promise.then(function(data) {
				$scope.roleList = data;
			},
			function(data) {
				flash.pop({
					title: 'Alert',
					body: "System has experienced an error. Please contact helpdesk.",
					type: 'error'
				});
			}
		);
		$scope.loading = false;
	};

	$scope.getCurrentStepIndex = function() {
		// Get the index of the current step given selection
		return _.indexOf($scope.steps, $scope.selection);
	};

	//$scope.getMetadataList();
	$scope.loading = false;

});