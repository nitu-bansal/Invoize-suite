'use strict';

angularApp.controller('profileCtrl', function($scope, $http, $location, $routeParams, profileService, flash, Restangular, $dialog) {

	var baseProfiles = Restangular.all('profiles');

	$scope.create = function(profile) {
		baseProfiles.post(profile).then(function(result) {
			flash.pop({
				title: 'Profile created',
				body: result.msg,
				type: 'success'
			});
		}, function(result) {
			flash.pop({
				title: 'Profile not created',
				body: result.msg,
				type: 'error'
			});
		});
	};

	$scope.list = function() {
		$scope.profileList = baseProfiles.getList({
			page: 1,
			per_page: 20
		});
	};

	$scope.read = function(id) {
		Restangular.one('profiles', id).get().then(function(result) {
			$scope.profile = result;
		}, function(result) {
			flash.pop({
				title: 'Error in reading.',
				body: result,
				type: 'error'
			});
		});
	};

	$scope.update = function() {
		$scope.profile.put().then(function(data) {
				flash.pop({
					title: 'Success',
					body: data.msg,
					type: 'info'
				});
				$location.path("/payright/vendor/" + $routeParams.profileId);
			},
			function(msg) {
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			});
	}

	$scope.delete = function() {
		$scope.profile.remove().then(function(data) {
				flash.pop({
					title: 'Success',
					body: data.msg,
					type: 'info'
				});
				$location.path("/profile");
			},
			function(msg) {
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			});
	}

	$scope.confirmDeleteProfile = function() {
		$dialog.dialog(angular.extend({
			controller: 'dialogCtrl',
			templateUrl: 'confirm.html', // change as per the dialog html needed
			backdrop: true,
			keyboard: false,
			backdropFade: true,
			dialogFade: true,
			backdropClick: false,
			show: true
		}, {
			resolve: {
				item: function() {
					return angular.copy(true);
				}
			}
		}))
			.open()
			.then(function(result) {
				if (result) {
					console.log(result);
					$scope.delete();
				} else {
					console.log("close");
				}
			});
	};

	$scope.list();
});