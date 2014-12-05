'use strict';

angularApp.controller('fileUploadCtrl', ['$scope', '$rootScope', 'uploadManager',
	function($scope, $rootScope, uploadManager, $location) {
		$scope.files = [];
		$scope.percentage = 0;

		$scope.upload = function() {
			uploadManager.upload();
			$scope.files = [];
			$location.path("/metadata/" + $routeParams.metadataType);
		};

		$rootScope.$on('fileAdded', function(e, call) {
			$scope.files.push(call);
			uploadManager.upload();
			$scope.$apply();
		});

		$rootScope.$on('uploadProgress', function(e, call) {
			$scope.percentage = call;
			$scope.$apply();
		});

		$scope.loading = false;
	}
]);