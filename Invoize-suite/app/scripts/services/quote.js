'use strict';

angularApp.service('quoteService', function($http, $q) {
	var quotes = [];
	var selectedQuote = {};

	return {
		quoteRequestCount: function() {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/count/quoteRequest/'
			}).
			success(function(data, status, headers, config) {
				if (data.type === 1) {
					deferred.resolve(data.msg);
				} else {
					deferred.resolve(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},
		list: function(value) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/suggestion/',
				data: value
			}).
			success(function(data, status, headers, config) {
				if (data.type === 1) {
					deferred.resolve({
						"data": data.msg,
						"exact": data.exact
					});
				} else {
					deferred.resolve({
						"data": data.msg,
						"exact": data.exact
					});
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},

		quoteList: function(value) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/quote/',
				data: value
			}).
			success(function(data, status, headers, config) {
				if (value === "1") {
					deferred.resolve(data.msg);
				} else {
					deferred.resolve(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},

		oldQuoteList: function(value) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/quote/',
				data: value
			}).
			success(function(data, status, headers, config) {
				if (value === "1") {
					deferred.resolve(data.msg);
				} else {
					deferred.resolve(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},

		read: function(quoteId) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/read/quote/',
				data: {
					"quoteId": quoteId
				}
			}).
			success(function(data, status, headers, config) {
				if (data.result === 1) {
					deferred.resolve(data.msg);
				} else {
					deferred.resolve(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},

		selectionList: function(quoteId) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/quote/',
				data: {
					"quoteId": quoteId
				}
			}).
			success(function(data, status, headers, config) {
				if (data.result === 1) {
					deferred.resolve([{
						dn: "Merge Code",
						n: "MergeCode"
					}, {
						dn: "Amendmen No",
						n: "AmendmentNo"
					}, {
						dn: "Shipment Mode",
						n: "ShipmentMode"
					}, {
						dn: "Origin Airport Code",
						n: "OriginAirportCode"
					}, {
						dn: "Origin Country Code",
						n: "OriginCountryCode"
					}, {
						dn: "Origin Geo",
						n: "OriginGeo"
					}, {
						dn: "Destination Airport Code",
						n: "DestinationAirportCode"
					}, {
						dn: "Destination Geo",
						n: "DestinationGeo"
					}, {
						dn: "Weight Type",
						n: "WeightType"
					}, {
						dn: "Dim Factor",
						n: "DimFactor"
					}, {
						dn: "Service Code",
						n: "ServiceCode"
					}, {
						dn: "Service Level",
						n: "ServiceLevel"
					}, {
						dn: "Supplier Code",
						n: "SupplierCode"
					}, {
						dn: "Intel Code",
						n: "IntelCode"
					}]);
				} else {
					deferred.resolve(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},
		getQuoteDefinitions: function(accId) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/quoteDefns',
				data: {
					"id": accId
				}
			}).
			success(function(data, status, headers, config) {
				if (data.result === 1) {
					deferred.resolve(data.msg);
				} else {
					deferred.resolve(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},



		getQuote: function() {
			return selectedQuote
		},

		update: function() {
			return 2
		},

		delete: function() {
			return 3
		},



		create: function(quote) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/create/quote',
				data: quote
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

		htmlQuoteTemplate: function(quote) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/read/filledTemplate',
				data: quote
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



		createQuoteDefinition: function(d) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/create/quoteDefinition',
				data: d
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


		defaultFieldsList: function(value) {
			var deferred = $q.defer();

			$http({
				method: 'POST',
				url: '/api/read/quoteTemplate',
				data: {
					"id": value,
					"sequenceAction": "new"
				}
			}).
			success(function(data, status, headers, config) {
				if (data.result === 1) {
					deferred.resolve(data.msg);
				}
				//  deferred.resolve([{id:"1",n:"Origin",v:""},{id:"2",n:"Destination",v:""},{id:"3",n:"Service Level",v:""},{id:"4",n:"Service Type",v:""}]);
				else {
					deferred.reject(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},

		otherFieldsList: function(value) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/suggestion/',
				data: value
			}).
			success(function(data, status, headers, config) {
				if (data.result === 1) {
					deferred.resolve([{
						id: "1",
						n: "Zip Code",
						v: ""
					}, {
						id: "2",
						n: "Origin Airport Code",
						v: ""
					}, {
						id: "3",
						n: "Destination Airport Code",
						v: ""
					}]);
				} else {
					deferred.reject(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},

		quoteDefnGroups: function(value) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/suggestion/',
				data: value
			}).
			success(function(data, status, headers, config) {
				if (data.result === 1) {
					deferred.resolve([{
						id: "1",
						n: "Air",
						v: ""
					}, {
						id: "2",
						n: "Ocean",
						v: ""
					}, {
						id: "3",
						n: "Ground",
						v: ""
					}]);
				} else {
					deferred.reject(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},

		quoteDefneffectiveBase: function(value) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/suggestion/',
				data: value
			}).
			success(function(data, status, headers, config) {
				if (data.result === 1) {
					deferred.resolve([{
						id: "1",
						n: "Shipment Date",
						v: ""
					}, {
						id: "2",
						n: "Actual Date",
						v: ""
					}, {
						id: "3",
						n: "Invoice Date",
						v: ""
					}]);
				} else {
					deferred.reject(data.msg);
				}
			}).
			error(function(data, status, headers, config) {
				deferred.reject("System has experienced an error. Please contact helpdesk.");
			})
			return deferred.promise;
		},

		laneParameter: function(value) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/suggestion/',
				data: value
			}).
			success(function(data, status, headers, config) {
				if (data.result === 1) {
					deferred.resolve(data.msg);;
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