angularApp.controller('redirectionCtrl', function($scope, $location, $window, $rootScope, flash, Restangular, $routeParams) {
	var baseConfirm = Restangular.all('confirm');
	$scope.confirm = function() {
		var urldata = {
			data: $routeParams.id
		}
		baseConfirm.post(urldata).then(function(data) {
			if (data.type === 1) { // Email Confirmed : Do Nothing
				flash.pop({
					title: 'Success',
					body: data.msg,
					type: 'success'
				});
				$window.location.href = "http://" + $rootScope.host + "/#/main/registration/" + $routeParams.id;
			}
			// if (data.type === 2) { // Simply Re-opend emailed Link : Do nothing
			// 	flash.pop({
			// 		title: 'Information',
			// 		body: data.msg,
			// 		type: 'info'
			// 	});
			// 	$window.location.href = "http://" + $rootScope.host + "/#/main/registration/" + $routeParams.id;
			// }
			if (data.type === 2) { // Re-opend emailed Link after registration Confirmed : send to login					
				$window.location.href = "http://" + data.subDomain + "." + $rootScope.host + "/#/main/landing";
				flash.pop({
					title: 'Information',
					body: data.msg,
					type: 'info'
				});
			}
			// if (data.type === 4) { // Emailed Link Expired : Send to Signup
			// 	flash.pop({
			// 		title: 'Information',
			// 		body: data.msg,
			// 		type: 'info'
			// 	});
			// 	$window.location.href = "http://" + $rootScope.host + "/#/main/signup";
			// }

		}, function(data, status) {
			flash.pop({
				title: 'Alert',
				body: data.data,
				type: 'error'
			});
			if (status === 404)
				$window.location.href = "http://" + $rootScope.host + "/#/main/signup";
		});

	}
});