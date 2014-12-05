'use strict';

angularApp.controller('payrightCtrl', function($scope, $rootScope, $http, $location, $route, $stateParams, $state, $routeParams, $compile, payrightService, Restangular, flash) {
	$scope.StatusList = [];

	// to keep the respective dropdown collapsed
	$scope.isInvoiceCollapsed = false;
	$scope.isPaymentCollapsed = false;
	$scope.isShipmentCollapsed = false;


	//############################## Vendor Profiles ################################
	var baseProfiles = Restangular.all('profiles');
	$scope.isVendorCollapsed = false;
	//get list of vendor profiles	
	$scope.list = function() {
		$scope.vendorCategoryLoader = true;
		baseProfiles.getList({
			page: 1,
			per_page: 20
		}).then(function(result) {
			$scope.profileList = result;
			$scope.vendorCategoryLoader = false;
		}, function(result) {
			flash.pop({
				title: 'Error in reading.',
				body: result,
				type: 'error'
			});
		});
	};

	//get vendor profile details based on selected id
	$scope.read = function(id) {
		$location.path("/payright/vendor/" + id);
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

	$scope.newVendor = function() {
		$location.path("/payright/vendor/new");
	};
	//############################## Vendor Profiles ################################


	//############################## Job Cards ################################
	var baseJobCards = Restangular.all('jobCards');
	$scope.isJobCardCollapsed = false;
	//get list of job cards 
	$scope.listJc = function(searchText) {
		$scope.jobcardCategoryLoader = true;
		baseJobCards.getList({
			page: 1,
			per_page: 20,
			q: searchText
		}).then(function(result) {
			$scope.jobCardList = result;
			$scope.jobcardCategoryLoader = false;
		}, function(result) {
			flash.pop({
				title: 'Error in reading.',
				body: result,
				type: 'error'
			});
		});
	};


	//get job card details based on selected id
	$scope.readJc = function(id) {
		if (id == 0)
			$location.path("payright/jobCard/new");
		else
			$location.path("payright/jobCard/edit/" + id);
	};
	//############################## Job Cards ################################


	//############################## Side Bar Lists ################################
	// Gets all the side bar navigation list based upon the value[PaymentStatus,InvoiceStatus,ShipmentStatus]
	$scope.getCategories = function(v) {
		if (v == 'invoicestatus')
			$scope.InvoiceCategoryLoader = true;
		if (v == 'shipmentstatus')
			$scope.shipmentCategoryLoader = true;
		if (v == 'paymentstatus')
			$scope.paymentCategoryLoader = true;
		var promise = payrightService.list({
			suggestionFor: v,
			pageLimit: 20,
			page: 1
		});
		promise.then(function(result) {
				$scope.categoryLoader = false;
				console.log(v);
				if (v == 'invoicestatus') {
					$scope.invoiceStatusList = result;
					$scope.InvoiceCategoryLoader = false;
				}
				if (v == 'shipmentstatus') {
					$scope.shipmentStatusList = result;
					$scope.shipmentCategoryLoader = false;
				}
				if (v == 'paymentstatus') {
					$scope.paymentStatusList = result;
					$scope.paymentCategoryLoader = false;
				}
			},
			function(result) {
				flash.pop({
					title: 'Alert',
					body: "Please try after sometime..!",
					type: 'error'
				});
			}
		);
	}

	//Select the subcategory from the dropdown of the report type
	var invoice = Restangular.all('payright/invoice');
	var shipment = Restangular.all('payright/shipment');
	var payment = Restangular.all('payright/payment');

	$scope.paymentList = function(categoryId) {
		$location.path("/payright/payment/" + categoryId);
		$scope.categorizedLists = [];
		$scope.categorizedLists = payment.getList({
			page: 1,
			per_page: 20,
			id: categoryId
		}).then(function(result) {
			$scope.categorizedLists = result;
		}, function(result) {
			flash.pop({
				title: 'Profile not created',
				body: result.msg,
				type: 'error'
			});
		});
	};

	$scope.invoiceList = function(categoryId) {
		$location.path("/payright/invoice/" + categoryId);
		$scope.categorizedLists = [];
		$scope.categorizedLists = invoice.getList({
			page: 1,
			per_page: 20,
			id: categoryId
		}).then(function(result) {
			$scope.categorizedLists = result;
		}, function(result) {
			flash.pop({
				title: 'Profile not created',
				body: result.msg,
				type: 'error'
			});
		});
	};
	$scope.shipmentList = function(categoryId) {
		$location.path("/payright/shipment/" + categoryId);
		$scope.categorizedLists = [];
		$scope.categorizedLists = shipment.getList({
			page: 1,
			per_page: 20,
			id: categoryId
		}).then(function(result) {
			$scope.categorizedLists = result;
		}, function(result) {
			flash.pop({
				title: 'Profile not created',
				body: result.msg,
				type: 'error'
			});
		});
	};

	//############################## Side Bar Lists ################################
	$scope.formatResult = function(data) {
		var markup = "<div>" + $scope.toHumanReadable(data.id) + " : " + data.v + "</div>";
		return markup;
	}

	$scope.formatSelection = function(data) {
		return $scope.toHumanReadable(data.id) + " : " + data.v;
	}

	$scope.searchBar = {
		placeholder: "Search <under construction> ...",
		minimumInputLength: 1,
		multiple: true,
		ajax: {
			method: 'POST',
			url: "/api/list/suggestion",
			dataType: 'json',
			quietMillis: 100,
			data: function(term, page) { // page is the one-based page number tracked by Select2
				return {
					q: term, //search term
					pageLimit: 10, // page size
					page: page, // page number
					selected: $scope.searchBarValue, //selected values
					suggestionFor: "charge" // suggestions for
					//   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
				};
			},
			results: function(data, page) {
				var data = data
				// {"data":[{"id":"origin","val":"SFO"},{"id":"Destination","val":"SFO"},{"id":"Service Type","val":"SFO"},{"id":"origin","val":"LAX"},{"id":"Destination","val":"LAX"},{"id":"Service Type","val":"LAX"}]}
				data.total = 100;
				if (data.msg.length < 10)
					var more = false
				else
					var more = (page * 10) < data.total; // whether or not there are more results available

				// notice we return the value of more so Select2 knows if more results can be loaded
				return {
					results: data.msg,
					more: more
				};
			}
		},
		initSelection: function(element, callback) {
			callback($(element).data('$ngModelController').$modelValue);
		},
		formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
		formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
		escapeMarkup: function(m) {
			return m;
		} // we do not want to escape markup since we are displaying html in results
	};
//	$.getScript("/scripts/vendor/ace-elements.js");
	$.getScript("/scripts/vendor/ace.js");

	$scope.loading = false;
	console.log($route.current.name);
	if ($route.current.name == "payright.jobCard") {
		$scope.listJc('');
	}

});