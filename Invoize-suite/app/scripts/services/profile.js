'use strict';

angularApp.service('profileService', function($http, $q) {
	return {
		create: function(permission) {
			var deferred = $q.defer();
			console.log('creating permission');
			$http({
				method: 'POST',
				url: '/api/payright/profile',
				data: permission
			}).
			success(function(data, status, headers, config) {
				if (data.result === 1) {
					deferred.resolve(data.msg);
				} else {
					deferred.reject(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			});
			return deferred.promise;
		},
	};
});