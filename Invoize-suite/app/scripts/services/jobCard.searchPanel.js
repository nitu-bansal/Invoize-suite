'use strict';

angularApp.service('searchPanelService', function($http, $q, $stateParams) {
	return {
		update: function(jobCard) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/update/jobCard',
				data: {
					id: 1,
					data: jobCard
				}
			}).
			success(function(data, status, headers, config) {
				if (data.type === 1) {
					deferred.resolve(data.msg);
				} else {
					deferred.reject(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},
		create: function(jobCard) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/create/jobCard',
				data: {
					id: 0,
					data: jobCard
				}
			}).
			success(function(data, status, headers, config) {
				if (data.type === 1) {
					deferred.resolve(data.msg);
				} else {
					deferred.reject(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},
		getGroupFields: function(data) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/jobCardGroupFields',
				data: data
			}).
			success(function(data, status, headers, config) {
				if (data.type === 1) {
					deferred.resolve(data.msg);
				} else {
					deferred.reject(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},

	};
});