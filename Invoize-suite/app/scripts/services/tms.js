'use strict';

angularApp.service('tmsService', function($http, $q, $stateParams) {
	return {
		list: function(id) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/tms/list/document',
				data: {
					"id": id
				}
			}).
			success(function(data, status, headers, config) {
				if (data.type === 1)
				//{deferred.resolve([{"id":"51b1de4ec210b268df8daf59","n":"Request 1","doc":"2","details":[{"n":"Effective","v":"2013-06-01"},{"n":"Expiry","v":"2013-10-01"}]}]);}
				{
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

		create: function(tariff) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/tms/create/document',
				data: tariff
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
			});
			return deferred.promise;
		},

		removeFile: function(id) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/tms/remove/file',
				data: id
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
			});
			return deferred.promise;
		},


		read: function(id) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/tms/read/document',
				data: {
					"id": id
				}
			}).
			success(function(data, status, headers, config) {
				if (data.type === 1) {
					deferred.resolve(data.msg);
				}
				//{deferred.resolve({"id":"51b1de4ec210b268df8daf59","account":{"c":"","g":"None","n":"account","v":"Titanium","id":"51b1de4ec210b268df8daf59","tc":null},"effectiveDate":"2013-06-11 00:00:00:00","expiryDate":"2013-06-11 00:00:00:00","receivedDate":"2013-06-17 00:00:00:00","receivedFrom":"Morris Green","comment":"Hey this aap is cool !!","docId":[{"id":"51c1636bc210b217c2b94cec","v":"file1.pdf","t": "Tariff"},{"id":"51c1636cc210b217c2b94cee","v":"file2.pdf", "t": "Tariff"}]});}
				else {
					deferred.reject(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},

		update: function(tariff) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/tms/update/document',
				data: tariff
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
			});
			return deferred.promise;
		},


		documentHistory: function(id) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/tms/list/history/document',
				data: {
					"id": id
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

		documentHistoryDetails: function(id) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/tms/history/document',
				data: {
					"id": id
				}
			}).
			success(function(data, status, headers, config) {
				if (data.type === 1) {
					deferred.resolve({
						"id": "51b1de4ec210b268df8daf59",
						"account": {
							"c": "",
							"g": "None",
							"n": "account",
							"v": "Titanium",
							"id": "51b1de4ec210b268df8daf59",
							"tc": null
						},
						"effectiveDate": "2013-06-11 00:00:00:00",
						"expiryDate": "2013-06-11 00:00:00:00",
						"receivedDate": "2013-06-17 00:00:00:00",
						"receivedFrom": "Morris Green",
						"comment": "Hey this aap is cool !!",
						"docId": [{
							"id": "51c1636bc210b217c2b94cec",
							"v": "file1.pdf",
							"t": "Tariff"
						}, {
							"id": "51c1636cc210b217c2b94cee",
							"v": "file2.pdf",
							"t": "Tariff"
						}]
					});
				} else {
					deferred.reject(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},


		delete: function(id) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/delete/account',
				data: {
					"id": id
				}
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



		totalAccount: function(data) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/count',
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
			});
			return deferred.promise;
		}
	};
});