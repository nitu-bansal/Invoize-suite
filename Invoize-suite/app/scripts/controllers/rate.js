'use strict';

angularApp.controller('rateCtrl', function($scope, $http, $location, $stateParams, $state, $routeParams, $route, rateService, flash) {
	var counter = 2;
	var accountCounter = 2;
	var moreAccounts = true;
	$scope.ratesAvailable = false;
	$scope.search = '';
	$scope.selectionList = [];
	$scope.searchBarValue = [];
	// $scope.route = $route;
	// $scope.routeParams = $routeParams;
	// $scope.location = $location;

	// $scope.$watch('routeParams', function(newVal, oldVal) {
	//       angular.forEach(newVal, function(v, k) {
	//         $location.search(k, v);
	//       });
	// }, true);
	// $scope.selectedOtherField={};
	// defaultFields are used to show default fields for new rate request
	//$scope.defaultFields = [{dn:"Origin",n:"origin"},{dn:"Destination",n:"destination"},{dn:"Service Level",n:"serviceLevel"},{dn:"Service Type",n:"serviceType"}];
	// otherFields are used to add extra fields in new rate request
	// $scope.otherFields = [{dn:"Zip Code",n:"zipCode"},{dn:"Origin Airport Code",n:"originAirportCode"},{dn:"Destination Airport Code",n:"destinationAirportCode"}];

	// selection contains new rate request fields with values
	$scope.selection = {};
	$scope.selectedChargeType = {};
	$scope.SelectedRateQualifier = {};
	$scope.chargeDefinitions = {};

	$scope.otherFieldsList = [];
	$scope.isCollapsed = false;
	$scope.selectedAccount;
	$scope.selectedChrgDefn;
	$scope.isRowCollapsed = true;
	$scope.rateQualifier = [{
		id: "Per Inch",
		val: "Per Inch"
	}, {
		id: "Per Kilograms",
		val: "Per Kilograms"
	}, {
		id: "Per Kilometer",
		val: "Per Kilometer"
	}, {
		id: "Per Kilotons",
		val: "Per Kilotons"
	}, {
		id: "Per Pound Per Article",
		val: "Per Pound Per Article"
	}, {
		id: "Per Pound",
		val: "Per Pound"
	}];
	$scope.weightBracketFields = [{
		sph: "0",
		eph: "*"
	}];

	$scope.newChargeDefn = function() {
		$scope.getChargeDefnEffctBase();
		$scope.getChargeDefnGroup();
	}

	$scope.itemChanged = function(e) {
		var hasAccount = false;
		console.log(e.target.value.split(','));
		for (var i = 0; i < e.target.value.split(',').length; i++) {
			if (e.target.value.split(',')[i] === "Account") {
				hasAccount = true;
			}

		}
		if (!hasAccount) {
			$scope.searchBarValue = [];
			$location.path("rate");
			$scope.toggleCollapse(false)

		}
	};
	$scope.selectAccount = function(value) {
		$scope.selectedAccount = value;
		localStorage.currentAccoutName = value;

	}
	$scope.selectChargeDefn = function(value) {
		$scope.selectedChrgDefn = value;
		localStorage.currentChargeName = value;
		$location.path("rate/search/" + $routeParams.accountId + "/" + value);
	}

	$scope.searchFor = function(k, param, accountId, templateId) {
		//$scope.toggleList();
		var searchBarValue = [];

		angular.forEach($scope.searchBarValue, function(i, j) { // loop over otherFields lists with i as object from list and j as index of that object
			if (i.id === k) // check if other fields object is same as selectedOtherField
				$scope.searchBarValue.splice(j, 1); // remove that object from otherFields using index
		});
		searchBarValue = $scope.searchBarValue;
		searchBarValue = searchBarValue.concat([{
			id: k,
			v: param,
			n: k
		}]);
		$scope.searchBarValue = searchBarValue;
		$scope.searchCharge(searchBarValue, accountId, templateId);
	};

	$scope.toggleCollapse = function(t) {

		$scope.isCollapsed = t;
	}
	$scope.updateSearchBar = function(k, param, id) {


	}
	$scope.formatAccResult = function(data) {

		if (data.g === "group")
			var markup = "<div><i class='icon-group'></i>  " + $scope.toHumanReadable(data.v) + "</div>";
		else
			var markup = "<div><i class='icon-user'></i>  " + $scope.toHumanReadable(data.v) + "</div>";
		return markup;
	}

	$scope.formatAccSelection = function(data) {

		if (data.g === "group")
			return "<i class='icon-group'></i>  " + $scope.toHumanReadable(data.v);
		else
			return "<i class='icon-user'></i>  " + $scope.toHumanReadable(data.v);
	}
	$scope.accountBar = {
		placeholder: "Please select..",
		minimumInputLength: 0,
		multiple: false,
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
					selected: $scope.selectedAccount, //selected values
					suggestionFor: "account", // suggestions for
					//   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
				};
			},
			results: function(data, page) {
				var data = data;
				data.total = 100;
				if (data.msg.length < 10)
					var more = false;
				else
					var more = (page * 10) < data.total;
				return {
					results: data.msg,
					more: more
				};
			}
		},
		initSelection: function(element, callback) {
			callback($(element).data('$ngModelController').$modelValue);
		},

		formatResult: $scope.formatAccResult, // omitted for brevity, see the source of this page
		formatSelection: $scope.formatAccSelection, // omitted for brevity, see the source of this page
		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
		escapeMarkup: function(m) {
			return m;
		} // we do not want to escape markup since we are displaying html in results
	};



	$scope.weightBracketCallback = function(field, index) {
		if ($scope.weightBracketFields[index][field]) {
			if (field === "e" && $scope.weightBracketFields.length === index + 1) {
				if ($scope.weightBracketFields[index].e != "*") {
					var difference = parseInt($scope.weightBracketFields[index].e) - parseInt($scope.weightBracketFields[index].s);
					var start = parseInt($scope.weightBracketFields[index].e);
					var end = start + difference;
					$scope.weightBracketFields.push({
						sph: start,
						eph: end + " or *"
					});
				}
			}
		} else {
			if (index === 0 || field === 's')
				$scope.weightBracketFields[index][field] = $scope.weightBracketFields[index][field + "ph"];
			else if (field === 'e' && $scope.weightBracketFields.length === index + 1) {
				if ($scope.weightBracketFields[index].e != "*") {
					$scope.weightBracketFields[index][field] = parseInt($scope.weightBracketFields[index].s) + parseInt($scope.weightBracketFields[index - 1].e) - parseInt($scope.weightBracketFields[index - 1].s);
					var difference = parseInt($scope.weightBracketFields[index].e) - parseInt($scope.weightBracketFields[index].s);
					var start = parseInt($scope.weightBracketFields[index].e);
					var end = start + difference;
					$scope.weightBracketFields.push({
						sph: start,
						eph: end + " or *"
					});
				}
			}
		}
	};



	$scope.removeFromWeightBracketFields = function(idx) {
		// This function is used to remove fields from weightBracketFields
		$scope.weightBracketFields.splice(idx, 1); // delete form field from weightBracketFields object using fields index
	};

	$scope.removeFromList = function(idx) {
		// This function is used to remove fields from new rate request from
		delete $scope.selection[$scope.defaultFields[idx]["n"]]; // delete form field from selection object using default fields index
		$scope.otherFieldsList.push($scope.defaultFields[idx]); // put default field into otherFields list
		$scope.defaultFields.splice(idx, 1); // delete form field from defaultFields object using default fields index
	};

	$scope.appendToList = function(v) {
		// This function is used to append fields into new rate request from
		// selectedOtherField is in template used for select box ng-model name  
		if ($scope.defaultFields) {
			if (v.length > 0) {
				var v;
				eval("v=" + v);
				$scope.defaultFields.push(v);
				// console.log('111');

				// $('#s2id_autogen8').addClass("highlight").delay(2000).queue(function(next) {
				// 	$('#s2id_autogen8').removeClass("highlight");
				// 	next();
				// });
				$scope.currentSelectedField = [];
				angular.forEach($scope.otherFieldsList, function(i, j) { // loop over otherFields lists with i as object from list and j as index of that object
					if (i.n === v.n) // check if other fields object is same as selectedOtherField
						$scope.otherFieldsList.splice(j, 1); // remove that object from otherFields using index
				});
			}
		}

	};


	$scope.formatResult = function(data) {
		var markup = "<div>" + $scope.toHumanReadable(data.id) + " : " + data.v + "</div>";
		return markup;
	}

	$scope.formatSelection = function(data) {
		return $scope.toHumanReadable(data.id) + " : " + data.v;
	}

	$scope.searchBar = {
		placeholder: "Search for a Rates",
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
					suggestionFor: "charge", // suggestions for
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

	$scope.selectCharge = function(value) {
		var promise = rateService.read(value);
		promise.then(function(result) {
				$scope.selectedCharge = result;
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


	if ($routeParams.chargeId)
		$scope.selectCharge($routeParams.chargeId);
	// else
	//   $scope.getAccountList()

	$scope.searchCharge = function(value, accountId, templateId) {

		if (templateId === undefined) {
			templateId = "";
		}
		if (accountId === undefined) {
			accountId = "";
		}
		localStorage.searchBarvals = JSON.stringify($scope.searchBarValue);
		//console.log(localStorage.searchBarvals);
		$scope.list = [];
		$scope.ratesAvailable = false;
		counter = 2;
		$location.path("rate/search/" + accountId + "/" + templateId);
		$scope.loadingRates = true;
		var promise = rateService.chargeList({
			"accountId": accountId,
			"chargeDefnId": templateId,
			selected: value,
			pageLimit: 10,
			page: 1
		});
		promise.then(function(result) {
				$scope.loadingRates = false;
				$scope.list = result;
				if (!result.length) {
					$scope.ratesAvailable = true;
					// flash.pop({title: 'Alert', body: "No Rates available for this search..!", type: 'error'});
				}
			},
			function(result) {
				$scope.loadingRates = false;
				flash.pop({
					title: 'Alert',
					body: "Please try after sometime..!",
					type: 'error'
				});
			}
		);

	}


	$scope.loadMore = function(accountId, templateId) {
		$scope.loadingRates = true;
		var promise = rateService.chargeList({
			"accountId": accountId,
			"chargeDefnId": templateId,
			selected: $scope.searchBarValue,
			pageLimit: 10,
			page: counter
		});
		promise.then(function(result) {
				counter += 1;
				$scope.loadingRates = false;
				$scope.list = $scope.list.concat(result);
			},
			function(result) {
				$scope.loadingRates = false;
			}
		);
	}

	$scope.create = function(charge, weightBracket, selectedChargeType, selectedRateQualifier, accountId, chargeDefnId, comment) {
		var promise = rateService.create({
			"selection": charge,
			"weightBracket": weightBracket,
			"chargeType": selectedChargeType,
			"rateQualifier": selectedRateQualifier,
			"accountId": accountId,
			"chargeDefnId": chargeDefnId,
			"comment": comment
		});
		promise.then(function(msg) {
				flash.pop({
					title: 'Success',
					body: msg.msg,
					type: 'success'
				});
				$scope.toggleCollapse(true);
				$scope.getChargeDefs($routeParams.accountId);
				$location.path("rate/search/" + $routeParams.accountId + "/" + $routeParams.templateId);
			},
			function(msg) {
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			}
		);
	}
	$scope.createChargeDefn = function(chargeDefn, accountId) {
		var promise = rateService.createChargeDefinition({
			"chargeDefn": chargeDefn,
			"accountId": accountId
		});
		promise.then(function(msg) {
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'success'
				});
				console.log(localStorage.currentAccoutName);
				$scope.toggleCollapse(true);
				$scope.getChargeDefs($routeParams.accountId);
				$location.path("rate/search/" + $routeParams.accountId + "/" + $routeParams.templateId);
			},

			function(msg) {
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			}
		);
	}

	$scope.searchAccount = function() {
		$scope.getAccountCodeList($scope.search);
	};

	$scope.getAccountCodeList = function(q) {
		$scope.accountListLoader = true;
		var promise = rateService.list({
			suggestionFor: 'account',
			q: q,
			pageLimit: 20,
			page: 1
		});
		promise.then(function(result) {
				$scope.accountList = result;
				$scope.accountListLoader = false;
			},
			function(result) {
				$scope.accountListLoader = false;
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	}

	$scope.loadMoreAccounts = function() {
		if (moreAccounts) {
			$scope.loadingMoreAccounts = true;
			var promise = rateService.list({
				suggestionFor: 'account',
				q: '',
				pageLimit: 20,
				page: accountCounter
			});
			promise.then(function(result) {
					if (result.length === 0)
						moreAccounts = false;
					accountCounter += 1;
					$scope.loadingMoreAccounts = false;
					$scope.accountList = $scope.accountList.concat(result);
				},
				function(result) {
					$scope.loadingMoreAccounts = false;
				}
			);
		}
	}

	$scope.getCount = function() {
		var promise = rateService.rateRequestCount();
		promise.then(function(result) {
				$scope.rateRequestCount = result;
			},
			function(result) {
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	}

	$scope.getTemplate = function(accountId, templateId) {
		$location.path("rate/new/" + $routeParams.accountId + "/" + templateId);
		$scope.getDefaultFieldsList(templateId);
		$scope.getOtherFieldsList();
	}
	$scope.getChargeDefs = function(accountId) {
		$scope.chargeDefinitions = {};
		$scope.chargeDefnListLoader = true;
		//$location.path("rate/"+accountId+"/template");          
		var promise = rateService.getChargeDefinitions(accountId);
		promise.then(function(result) {

				$scope.chargeDefinitions = result;
				$scope.chargeDefnListLoader = false;

			},
			function(result) {
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	}

	$scope.getDefaultFieldsList = function(templateId) {
		var promise = rateService.defaultFieldsList(templateId);
		promise.then(function(result) {
				console.log(result);
				$scope.defaultFields = result;
				$scope.appendFromSearchBar();
			},
			function(result) {
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	};
	$scope.getOtherFieldsList = function() {
		var promise = rateService.otherFieldsList({
			suggestionFor: 'metadata_laneparameter',
			q: '',
			pageLimit: 10,
			page: 1
		});
		promise.then(function(r) {
				$scope.otherFieldsList = r;
			},
			function(r) {
				flash.pop({
					title: 'Alert',
					body: r,
					type: 'error'
				});
			}
		);
	};


	$scope.getChargeDefnGroup = function() { //need to update suggestion for when API is ready
		var promise = rateService.chargeDefnGroups({
			suggestionFor: 'selectionCriteria',
			q: '',
			pageLimit: 10,
			page: 1
		});
		promise.then(function(r) {

				$scope.chargeDefnGroup = r;
			},
			function(r) {
				flash.pop({
					title: 'Alert',
					body: r,
					type: 'error'
				});
			}
		);
	};

	$scope.getChargeDefnEffctBase = function() { //need to update suggestion for when API is ready
		var promise = rateService.chargeDefneffectiveBase({
			suggestionFor: 'selectionCriteria',
			q: '',
			pageLimit: 10,
			page: 1
		});
		promise.then(function(r) {

				$scope.chargeDefnEffectiveBase = r;
			},
			function(r) {
				flash.pop({
					title: 'Alert',
					body: r,
					type: 'error'
				});
			}
		);
	};

	$scope.formatFieldsResult = function(data) {
		return "<div class='itemNew'><b>" + $scope.toHumanReadable(data.n) + "</b></div>";
	}

	$scope.formatFieldselection = function(data) {
		return "<div>" + $scope.toHumanReadable(data.n) + "</div>";
	}

	$scope.appendFromSearchBar = function() {
		if ($scope.defaultFields) {

			angular.forEach($scope.searchBarValue, function(i, j) {
				var fieldToAdd = i.n;
				var hasField = false;
				angular.forEach($scope.defaultFields, function(obj, k) {
					if (obj.n === fieldToAdd) {
						obj.v = i.v;
						hasField = true;
						$scope.selection[obj.n] = obj.v;
					}
				});

				if (fieldToAdd === "Charge Type") {
					$scope.selectedChargeType = i.v;
					hasField = true;
				}
				if (hasField === false && i.n != "chargeDefn" && i.n != "Account") {
					i.n = $scope.toHumanReadable(i.n);
					$scope.defaultFields.push(i);
					$scope.selection[i.n] = i.v;
					console.log(i.n);
					console.log($scope.selection);
					angular.forEach($scope.otherFieldsList, function(i, j) { // loop over otherFields lists with i as object from list and j as index of that object
						if (i.n === fieldToAdd) // check if other fields object is same as selectedOtherField
							$scope.otherFieldsList.splice(j, 1); // remove that object from otherFields using index
					});
				}
			});
		}
	};

	$scope.formatResultMetadata = function(data) {
		var markup = "<div>" + data.v + "</div>";
		return markup;
	}

	$scope.formatSelectionMetadata = function(data) {
		return data.v;
	}

	$scope.laneParameterBar = {
		placeholder: "Please select...",
		minimumInputLength: 0,
		closeOnSelect: false,
		multiple: false,
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
					selected: '', //selected values
					suggestionFor: 'metadata_laneparameter', // suggestions for
					//   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
				};
			},
			results: function(data, page) {
				var data = data
				data.total = 100;
				if (data.msg.length < 10)
					var more = false
				else
					var more = (page * 10) < data.total;
				return {
					results: data.msg,
					more: more
				};
			}
		},
		initSelection: function(element, callback) {
			callback($(element).data('$ngModelController').$modelValue);
		},
		formatResult: $scope.formatResultMetadata, // omitted for brevity, see the source of this page
		formatSelection: $scope.formatSelectionMetadata, // omitted for brevity, see the source of this page
		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
		escapeMarkup: function(m) {
			return m;
		} // we do not want to escape markup since we are displaying html in results
	};

	$scope.chargeTypeBar = {
		minimumInputLength: 0,
		closeOnSelect: false,
		multiple: false,
		placeholder: "Please Select",
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
					selected: '', //selected values
					suggestionFor: 'metadata_chargetype', // suggestions for
					//   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
				};
			},
			results: function(data, page) {
				var data = data
				data.total = 100;
				if (data.msg.length < 10)
					var more = false
				else
					var more = (page * 10) < data.total;
				return {
					results: data.msg,
					more: more
				};
			}
		},
		initSelection: function(element, callback) {
			callback($(element).data('$ngModelController').$modelValue);
		},
		formatResult: $scope.formatResultMetadata, // omitted for brevity, see the source of this page
		formatSelection: $scope.formatSelectionMetadata, // omitted for brevity, see the source of this page
		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
		escapeMarkup: function(m) {
			return m;
		} // we do not want to escape markup since we are displaying html in results
	};


	if ($route.current.name === 'rate.template') {
		$scope.getChargeDefnEffctBase();
		$scope.getChargeDefnGroup();
	}

	if ($route.current.name === 'rate.search') {

		$scope.selectedAccount = localStorage.currentAccoutName;
		$scope.searchBarValue = eval(localStorage.searchBarvals); //[{"id":"Account","v":localStorage.currentAccoutName,"n":"Account"}];

		if ($routeParams.templateId) {
			$scope.toggleCollapse(true);
			$scope.getChargeDefs($routeParams.accountId);
		} else if ($routeParams.accountId) {
			$scope.toggleCollapse(true);
			$scope.getChargeDefs($routeParams.accountId);
			$scope.searchCharge($scope.searchBarValue, $routeParams.accountId, $routeParams.templateId);
		} else {
			$scope.searchCharge($scope.searchBarValue, "", "");
		}

	}

	if ($route.current.name === 'rate.new') {
		$scope.searchAccount();
		$scope.selectedAccount = localStorage.currentAccoutName;
		$scope.searchBarValue = eval(localStorage.searchBarvals);
		$scope.toggleCollapse(true);
		$scope.getChargeDefs($routeParams.accountId);
		$location.path("rate/new/" + $routeParams.accountId + "/" + $routeParams.templateId);
		$scope.getDefaultFieldsList($routeParams.templateId);
		$scope.getOtherFieldsList();
	} else $scope.getAccountCodeList($scope.search);

//	$.getScript("/scripts/vendor/prettify.js");
//	$.getScript("/scripts/vendor/ace-elements.js");
	$.getScript("/scripts/vendor/ace.js");

	$scope.loading = false;

});