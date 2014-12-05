'use strict';
var toggle = function(o, level) {
	$(o).hide();
	var count;
	var n;
	var v;

	if ($(o).next().length == 1) {
		$(o).next().show();
		count = $(o).next().attr("count");
		n = $(o).next().attr("n");
		v = $(o).next().attr("v");
	} else {
		if (level == undefined) {
			var firstChield = $(":first-child", $(o).parent());
			firstChield.next().show();
			count = firstChield.next().attr("count");
			n = firstChield.next().attr("n");
			v = firstChield.next().attr("v");
			// console.log(count);
		} else {
			$(":first-child", $(o).parent()).show();
			count = $(":first-child", $(o).parent()).attr("count");
			n = $(":first-child", $(o).parent()).attr("n");
			v = $(":first-child", $(o).parent()).attr("v");
			// console.log(count);
		}
	}

	var scope = angular.element($(o)).scope();
	// console.log("before update")
	// console.log(scope);

	if (level == undefined) {
		level = parseInt($(o).parent().parent().parent().parent().parent().attr("id").slice(15)) - 1;
		console.log($(o).parent().parent().parent().parent().parent().attr("id"));
		for (var i = 0; i < scope.workflow.definition[level].length; i++) {
			if (scope.workflow.definition[level][i]["n"] == n && scope.workflow.definition[level][i]["v"] == v) {
				scope.$apply(function() {
					scope.workflow.definition[level][i]["c"] = count;
				});
			}
		}
	} else {
		scope.$apply(function() {
			scope.workflow.definitionCount[level] = count;
		})
	}
	// console.log("after update");
	// console.log(scope);
}

angularApp.controller('quoteCtrl', function($scope, $http, $location, $stateParams, $compile, $state, $routeParams, $route, $modal, quoteService, accountService, flash) {
	var counter = 2;
	var accountCounter = 2;
	var moreAccounts = true;
	$scope.quotesAvailable = false;
	$scope.search = '';
	$scope.quote = {};
	$scope.selectionList = [];
	$scope.searchBarValue = [];
	$scope.quote.selection = {};
	$scope.quote.selectedChargeTypeList = [];
	$scope.selectedQuoteType = {};
	$scope.quote.currentRateQualifier = [];
	$scope.quoteDefinitions = {};
	$scope.quoteDefn = {};
	$scope.isCollapsed = false;
	$scope.selectedAccount;
	$scope.selectedChrgDefn;
	$scope.quote.totalAmount = 0;
	$scope.allChargeTypeList = [];
	$scope.defaultFields = {};
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
	$scope.quote.weightBracketFields = [];
	var counter = 2;
	$scope.workflow = {};
	$scope.workflow.definition = [];
	$scope.workflowDefinitions = [{}];
	$scope.workflow.definitionCount = ['*'];

	$scope.quoteEmail = {};
	$scope.oldQuoteList = [];

	$scope.template = "<b><style='color:red'> test template</b></br>Hello World<input/>";
	$scope.showCreateAccountBtn = false;
	$scope.isRowCollapsed = true;
	$scope.otherFieldsList = [];

	$scope.htmlTemplate = "";
	$scope.quote.htmlTemplateFilled = "";
	$scope.currentSelectedCharge = [];

	$scope.allBasisList = [];
	$scope.quote.basis = [];

	// Create Quote :
	$scope.appendToSelectedChargeTypeList = function(v) {
		// console.log(v.toString());
		if ($scope.allChargeTypeList) {
			if (v.length > 0) {
				var vObj;
				eval("vObj=" + v[0]);

				// add current selected charge into selected charge list
				$scope.quote.selectedChargeTypeList.push(vObj);
				// $scope.currentSelectedCharge = [];

				// remove selected charge from list of all charges
				angular.forEach($scope.allChargeTypeList, function(i, j) {
					if (i.n === vObj.n)
						$scope.allChargeTypeList.splice(j, 1);
				});

				// create new weight bracket
				$scope.quote.weightBracketFields.push([{
					sph: "0",
					eph: "*"
				}]);
			}

		}
		return [];
	};

	// Create Quote :
	$scope.removeFromSelectedChargeTypeList = function(idx) {
		// push removed charge from selected to all charge list
		$scope.allChargeTypeList.push($scope.quote.selectedChargeTypeList[idx]);

		// remove selected charge from list of selected charges
		angular.forEach($scope.quote.selectedChargeTypeList, function(i, j) {
			if (j === idx)
				$scope.quote.selectedChargeTypeList.splice(j, 1);
		});

		// remove weight bracket for that perticular charge
		angular.forEach($scope.quote.weightBracketFields, function(i, j) {
			if (j === idx)
				$scope.quote.weightBracketFields.splice(j, 1);
		});
	}


	// Create Quote :
	$scope.getBasisList = function(v) {
		var promise = accountService.list({
			suggestionFor: 'metadata_laneparameter',
			q: "",
			pageLimit: 20,
			page: 1,
			parent: v
		});
		promise.then(function(result) {
				$scope.allBasisList = result;
			},
			function(result) {}
		);
	}

	// Create Quote
	$scope.checkAvailableThenAppend = function(v, idx) {
		// console.log(v);
		var existed = false;
		//check item existed in selection criteria
		angular.forEach($scope.quote.selectionCriteria, function(i, j) {
			if (i.n === v.n)
				existed = true;
		});

		angular.forEach($scope.quote.selectionCriteria, function(i, j) {
			if (!_.has(i, "m")) {
				var found = true;
				// var base = _.map($scope.quote.basis, function(x) {
				// 	return JSON.parse(x);
				// });
				angular.forEach($scope.quote.basis, function(v, w) {
					if (i.n === v.n)
						found = false;
				});
				if (found) {
					$scope.quote.selectionCriteria.splice(j, 1);
					$scope.otherFieldsList.push(i);
				}
			}
		});

		//if item not existed in selection criteria
		if (!existed)
			$scope.quote.selectionCriteria.push(v);

		$scope.currentSelectedField = [];

		//remove selected item from other fields
		angular.forEach($scope.otherFieldsList, function(i, j) {
			if (i.n === v.n)
				$scope.otherFieldsList.splice(j, 1);
		});

		//create new text box
		$("#basis" + idx).html("");
		var htmltext = "<input class='input-small higlightedTextbox' type='text' placeholder='value' required='required' ng-model='quote.selection[\"" + v.n + "\"]' ></input>";
		$("#basis" + idx).html($compile(htmltext)($scope));
	};

	// Create Quote :
	$scope.getDefaultFieldsList = function(templateId) {
		$scope.quote.weightBracketFields = [];
		$scope.getChargeList();
		var promise = quoteService.defaultFieldsList(templateId);
		promise.then(function(result) {
				$scope.getOtherFieldsList('');
				$scope.defaultFields = result;
				$scope.quote.workflow = result.workflow;
				$scope.quote.email = result.quoteEmail;
				$scope.quote.selectionCriteria = result.selectionCriteria;
				$scope.quote.sequence = result.sequence;
				$scope.quote.quoteDate = result.quoteDate;
				$scope.quote.quoteDefnId = $routeParams.quoteTemplateId;
				$scope.quote.accountId = $routeParams.accountId;
				$scope.quote.selectionCriteria = _.map($scope.quote.selectionCriteria, function(x) {
					return _.extend(x, {
						"m": true
					});
				});
				$scope.quote.selectedChargeTypeList = result.chargeType;
				$("#quoteEmail").html($compile("<div>" + $scope.defaultFields.quoteEmail.message + "</div>")($scope));
				$scope.appendFromSearchBar();

				// remove selected charges from all charge list
				angular.forEach($scope.allChargeTypeList, function(i, j) {
					$scope.quote.selectedChargeTypeList.forEach(function(v) {
						if (i.n === v.n)
							$scope.allChargeTypeList.splice(j, 1);
					});
				});
				// create weight brackets for each selected charge
				$scope.quote.selectedChargeTypeList.forEach(function(i) {
					$scope.quote.weightBracketFields.push([{
						sph: "0",
						eph: "*"
					}]);
					$scope.quote.currentRateQualifier.push({});
				});
			},
			function(result) {
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			});
	};

	$scope.createQuickAccount = function(account) {
		var promise = accountService.create(account);
		promise.then(function(result) {
				$scope.searchAccount();
				$scope.selectAccount(result.accountName);
				$scope.toggleCollapse(true);
				$scope.getQuoteDefs(result.accountId);
				$scope.getTemplate(result.accountId, result.quoteDefnID)

				$location.path("quote/new/" + result.accountId + "/" + result.quoteDefnID);
				flash.pop({
					title: 'New Account Added',
					body: "Proceed with quote generation",
					type: 'success'
				});
			},
			function(result) {
				console.log('failed');
				flash.pop({
					title: 'Account not created',
					body: result.msg,
					type: 'error'
				});
			}
		);
	}

	// // Code Dialog Start            
	// $scope.showDialog = function(item) {
	// 	if (item.length > 0) {
	// 		var itemToSend = {
	// 			quickAccount: 1,
	// 			accountName: item,
	// 			station: "",
	// 			accountType: "",
	// 			user: "",
	// 			email: "",
	// 			phone: "",
	// 			role: "customer"
	// 		}; //change as per dialog template 

	// 		//console.log(itemToSend);
	// 		$dialog.dialog(angular.extend({
	// 			controller: 'dialogCtrl',
	// 			templateUrl: 'm.account.new.html', // change as per the dialog html needed
	// 			backdrop: true,
	// 			keyboard: false,
	// 			backdropFade: true,
	// 			dialogFade: true,
	// 			backdropClick: false,
	// 			show: true
	// 		}, {
	// 			resolve: {
	// 				item: function() {
	// 					return angular.copy(itemToSend);
	// 				}
	// 			}
	// 		}))
	// 			.open()
	// 			.then(function(result) {
	// 				if (result) {
	// 					$scope.createQuickAccount(result);
	// 				} else {
	// 					console.log('close');

	// 				}
	// 				itemToSend = undefined;
	// 			});
	// 	}
	// };
	// // Code Dialog End

	$scope.showDialog = function(item) {
if (item.length > 0) {
	var itemToSend = {
				quickAccount: 1,
				accountName: item,
				station: "",
				accountType: "",
				user: "",
				email: "",
				phone: "",
				role: "customer"
			}; //change as per dialog template 

		var modalInstance = $modal.open({
			templateUrl: 'm.account.new.html',
			controller: 'modalInstanceCtrl',
			resolve: {
				items: function() {
					return angular.copy(itemToSend);
				}
			}
		});
		modalInstance.result.then(function(selectedItem) {
			console.log(selectedItem);
			$scope.createQuickAccount(selectedItem);
		}, function() {
			console.log('Modal dismissed');
		});
		itemToSend = undefined;
	}
	};

	$scope.newQuoteDefn = function() {
		$scope.getQuoteDefnEffctBase();
		$scope.getQuoteDefnGroup();
		$.getScript("/scripts/editor.js");
	}

	$scope.itemChanged = function(e) {
		var hasAccount = false;
		for (var i = 0; i < e.target.value.split(',').length; i++) {
			if (e.target.value.split(',')[i] === "Account") {
				hasAccount = true;
			}
		}
		if (!hasAccount) {
			$scope.searchBarValue = [];
			$location.path("quote");
			$scope.toggleCollapse(false)
		}
	};

	$scope.selectAccount = function(value) {
		$scope.selectedAccount = value;
		localStorage.currentAccoutName = value;
	}

	$scope.selectQuoteDefn = function(value) {
		$scope.selectedChrgDefn = value;
		localStorage.currentQuoteName = value;
		$location.path("quote/search/" + $routeParams.accountId + "/" + value);
	}

	$scope.searchFor = function(k, param, accountId, templateId) {
		var searchBarValue = [];
		angular.forEach($scope.searchBarValue, function(i, j) {
			if (i.id === k)
				$scope.searchBarValue.splice(j, 1);
		});
		searchBarValue = $scope.searchBarValue;
		searchBarValue = searchBarValue.concat([{
			id: k,
			v: param,
			n: k
		}]);
		$scope.searchBarValue = searchBarValue;
		$scope.searchQuote(searchBarValue, accountId, templateId);
	};

	$scope.toggleCollapse = function(t) {
		$scope.isCollapsed = t;
	}

	$scope.updateSearchBar = function(k, param, id) {}

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


	$scope.weightBracketCallback = function(field, parentIndex, index) {
		if ($scope.quote.weightBracketFields[parentIndex][index][field]) {
			if (field === "e" && $scope.quote.weightBracketFields[parentIndex].length === index + 1) {
				if ($scope.quote.weightBracketFields[parentIndex][index].e != "*") {
					var difference = parseInt($scope.quote.weightBracketFields[parentIndex][index].e) - parseInt($scope.quote.weightBracketFields[parentIndex][index].s);
					var start = parseInt($scope.quote.weightBracketFields[parentIndex][index].e);
					var end = start + difference;
					$scope.quote.weightBracketFields[parentIndex].push({
						sph: start,
						eph: end + " or *"
					});
				}
			}
		} else {
			if (index === 0 || field === 's')
				$scope.quote.weightBracketFields[parentIndex][index][field] = $scope.quote.weightBracketFields[parentIndex][index][field + "ph"];
			else if (field === 'e' && $scope.quote.weightBracketFields[parentIndex].length === index + 1) {
				if ($scope.quote.weightBracketFields[parentIndex][index].e != "*") {
					$scope.quote.weightBracketFields[parentIndex][index][field] = parseInt($scope.quote.weightBracketFields[parentIndex][index].s) + parseInt($scope.quote.weightBracketFields[parentIndex][index - 1].e) - parseInt($scope.quote.weightBracketFields[parentIndex][index - 1].s);
					var difference = parseInt($scope.quote.weightBracketFields[parentIndex][index].e) - parseInt($scope.quote.weightBracketFields[parentIndex][index].s);
					var start = parseInt($scope.quote.weightBracketFields[parentIndex][index].e);
					var end = start + difference;
					$scope.quote.weightBracketFields[parentIndex].push({
						sph: start,
						eph: end + " or *"
					});
				}
			}
		}
	};


	$scope.removeFromWeightBracketFields = function(parentIndex, idx) {
		// This function is used to remove fields from weightBracketFields
		$scope.quote.weightBracketFields[parentIndex].splice(idx, 1);
	};

	$scope.appendToList = function(v) {
		if ($scope.defaultFields) {
			if (v.length > 0) {
				var v;
				eval("v=" + v);
				v["m"] = true;
				$scope.quote.selectionCriteria.push(v);
				$scope.currentSelectedField = [];
				angular.forEach($scope.otherFieldsList, function(i, j) {
					if (i.n === v.n)
						$scope.otherFieldsList.splice(j, 1);
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
					suggestionFor: "quote", // suggestions for
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

	$scope.selectQuote = function(value) {
		var promise = quoteService.read(value);
		promise.then(function(result) {
				$scope.quoteDate = result.quoteDate;
				$scope.quoteNo = result.quoteNo;
				$scope.quoteDefnId = result.quoteDefnId;
				$scope.quote.selection = result.selection;
				$scope.weightBracket = result.weightBracket;
				$scope.quote.currentRateQualifier = result.quoteQualifier;
				$scope.defaultFields.chargeType = result.chargeType;
				$scope.quote.workflow = result.workFlowData;
				$scope.defaultFields.quoteEmail = result.quoteEmail;
				$scope.comment = result.comment;
				$scope.htmlTemplateFilled = result.template;
				$scope.quote.basis = result.basis;
				console.log(result.comment);
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

	if ($routeParams.quoteId)
		$scope.selectQuote($routeParams.quoteId);

	$scope.searchQuote = function(value, accountId, templateId) {
		if (templateId === undefined) {
			templateId = "";
		}
		localStorage.searchBarvals = JSON.stringify($scope.searchBarValue);
		$scope.list = [];
		$scope.quotesAvailable = false;
		counter = 2;
		$location.path("quote/search/" + accountId + "/" + templateId);
		$scope.loadingQuotes = true;
		var promise = quoteService.quoteList({
			"accountId": accountId,
			"quoteDefnId": templateId,
			selected: value,
			pageLimit: 10,
			page: 1
		});
		promise.then(function(result) {
				$scope.loadingQuotes = false;
				$scope.list = result;
				if (!result.length) {
					$scope.quotesAvailable = true;
				}
			},
			function(result) {
				$scope.loadingQuotes = false;
				flash.pop({
					title: 'Alert',
					body: "Please try after sometime..!",
					type: 'error'
				});
			}
		);

	}

	$scope.loadMore = function(accountId, templateId) {
		$scope.loadingQuotes = true;
		var promise = quoteService.quoteList({
			"accountId": accountId,
			"quoteDefnId": templateId,
			selected: $scope.searchBarValue,
			pageLimit: 10,
			page: counter
		});
		promise.then(function(result) {
				counter += 1;
				$scope.loadingQuotes = false;
				$scope.list = $scope.list.concat(result);
			},
			function(result) {
				$scope.loadingQuotes = false;
			}
		);
	}
	$scope.create = function(quote) {
		var promise = quoteService.create(quote);
		promise.then(function(msg) {
				flash.pop({
					title: 'Success',
					body: msg.msg,
					type: 'success'
				});
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

	$scope.GetQuoteTemplate = function(quote, weightBracket, currentRateQualifier, accountId, quoteDefnId) {
		var promise = quoteService.htmlQuoteTemplate({
			"selection": quote,
			"weightBracket": weightBracket,
			"rateQualifier": currentRateQualifier,
			"accountId": accountId,
			"quoteDefnId": quoteDefnId,
			"chargeType": $scope.defaultFields.chargeType,
			"quoteNumber": $scope.defaultFields.sequence
		});
		promise.then(function(msg) {
				if (msg === "")
					$('#ifrmFilled').contents().find("html").html("Template is not available for this request.");
				else
					$('#ifrmFilled').contents().find("html").html(msg);
			},
			function(msg) {
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
				$scope.htmlTemplate = "Template not available.";
			}
		);
	}

	$scope.createQuoteDefn = function(quoteDefn, accountId, workflow, quoteEmail) {
		$scope.initializeData();
		var promise = quoteService.createQuoteDefinition({
			"quoteDefn": quoteDefn,
			"accountId": accountId,
			"workflow": workflow,
			"quoteEmail": quoteEmail,
			"template": $scope.htmlTemplate
		});
		promise.then(function(msg) {
				flash.pop({
					title: 'Success',
					body: msg.msg,
					type: 'success'
				});
				$scope.initializeData()
				$scope.toggleCollapse(true);
				$scope.getQuoteDefs($routeParams.accountId);
				$location.path("quote/search/" + $routeParams.accountId + "/" + msg.id);
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
		$scope.showCreateAccountBtn = false;
		var promise = quoteService.list({
			suggestionFor: 'account',
			q: q,
			pageLimit: 20,
			page: 1
		});
		promise.then(function(result) {
				$scope.accountList = result.data;
				$scope.accountListLoader = false;

				if (result.exact === 1) {
					$scope.showCreateAccountBtn = false;
				} else {
					if ($scope.search.trim().length > 0)
						$scope.showCreateAccountBtn = true;
					else
						$scope.showCreateAccountBtn = false;
				}
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
			var promise = quoteService.list({
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
		var promise = quoteService.rateRequestCount();
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
		$location.path("quote/new/" + $routeParams.accountId + "/" + templateId);
		$scope.initializeData();
		$scope.getDefaultFieldsList(templateId);
	}

	$scope.getQuoteDefs = function(accountId) {
		$scope.quoteDefinitions = {};
		$scope.quoteDefnListLoader = true;
		//$location.path("rate/"+accountId+"/template");
		var promise = quoteService.getQuoteDefinitions(accountId);
		promise.then(function(result) {
				$scope.quoteDefinitions = result;
				$scope.quoteDefnListLoader = false;
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

	$scope.getOtherFieldsList = function(q) {
		var promise = accountService.list({
			suggestionFor: 'metadata_laneparameter',
			q: q,
			pageLimit: 20,
			page: 1
		});
		promise.then(function(result) {
				$scope.otherFieldsList = result;
				angular.forEach($scope.quote.selectionCriteria, function(i, j) {
					angular.forEach($scope.otherFieldsList, function(k, l) {
						if (i.n === k.n)
							$scope.otherFieldsList.splice(l, 1);
					});
				});
			},
			function(result) {}
		);
	};

	$scope.getChargeList = function(q) {
		var promise = accountService.list({
			suggestionFor: 'metadata_chargetype',
			q: q,
			pageLimit: 20,
			page: 1
		});
		promise.then(function(result) {
				$scope.allChargeTypeList = result;
			},
			function(result) {}
		);
	}

	$scope.removeFromList = function(idx) {
		// This function is used to remove fields from new rate request from
		delete $scope.quote.selection[$scope.quote.selectionCriteria[idx]["n"]]; // delete form field from selection object using default fields index
		$scope.otherFieldsList.push($scope.quote.selectionCriteria[idx]); // put default field into otherFields list
		$scope.quote.selectionCriteria.splice(idx, 1); // delete form field from defaultFields object using default fields index
	};

	$scope.getQuoteDefnGroup = function() { //need to update suggestion for when API is ready
		var promise = quoteService.quoteDefnGroups({
			suggestionFor: 'selectionCriteria',
			q: '',
			pageLimit: 10,
			page: 1
		});
		promise.then(function(r) {
				$scope.quoteDefnGroup = r;
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

	$scope.getQuoteDefnEffctBase = function() { //need to update suggestion for when API is ready
		var promise = quoteService.quoteDefneffectiveBase({
			suggestionFor: 'selectionCriteria',
			q: '',
			pageLimit: 10,
			page: 1
		});
		promise.then(function(r) {
				$scope.quoteDefnEffectiveBase = r;
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
						$scope.quote.selection[obj.n] = obj.v;
					}
				});

				if (fieldToAdd === "quote Type") {
					$scope.selectedQuoteType = i.v;
					hasField = true;
				}
				if (hasField === false && i.n != "quoteDefn" && i.n != "Account") {
					i.n = $scope.toHumanReadable(i.n);
					$scope.defaultFields.push(i);
					$scope.quote.selection[i.n] = i.v;
				}
			});
		}
	};

	$scope.workflowDefinitionsCallback = function(index) {
		if ($scope.workflowDefinitions.length == index + 1) {
			$scope.workflowDefinitions.push({});
			$scope.workflow.definitionCount.push('*');
		}
		if ($("div[style$='display: none;']", "#workflowLevel" + index).length == $("div", "#workflowLevel" + index).length) {
			$("div:last-child", "#workflowLevel" + index).show();
			if ($scope.workflow.definition[index].length == 1)
				$scope.workflow.definitionCount[index] = "*";
			else
				$scope.workflow.definitionCount[index] = $scope.workflow.definition[index].length - 1;
		}
	};

	$scope.removeFromWorkflowDefinitions = function(idx) {
		$scope.workflow.definitionCount.splice(idx, 1);
		$scope.workflow.definition.splice(idx, 1);
		$scope.workflowDefinitions.splice(idx, 1);
	};

	$scope.formatResult = function(data) {
		if (data.g === "group" || data.n === "group" || data.n === "role")
			var markup = "<div><i class='icon-group'></i>  " + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v) + "</div>";
		else
			var markup = "<div><i class='icon-user'></i>  " + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v) + "</div>";
		return markup;
	}

	$scope.formatSelection = function(data) {
		if (data.g === "group" || data.n === "group" || data.n === "role") {
			var arr = _.range(data.tc)
			var str2 = ""
			if (data.c != "*")
				data.c = parseInt(data.c);
			arr.forEach(function(element, index) {
				var counter = element + 1
				if (data.c === counter)
					str2 += "<div style='cursor: pointer;' onclick='toggle(this)' n='" + data.n + "' v='" + data.v + "' count='" + counter + "' class='help-inline label btn-primary'>Any " + counter + "</div>";
				else if (data.tc > counter)
					str2 += "<div style='cursor: pointer;display:none;' onclick='toggle(this)' n='" + data.n + "' v='" + data.v + "' count='" + counter + "' class='help-inline label btn-primary'>Any " + counter + "</div>";
				else if (data.c === "*")
					str2 += "<div style='cursor: pointer;' onclick='toggle(this)' n='" + data.n + "' v='" + data.v + "' count='*' class='help-inline label btn-primary'>All</div>";
				else
					str2 += "<div style='cursor: pointer;display:none;' onclick='toggle(this)' n='" + data.n + "' v='" + data.v + "' count='*' class='help-inline label btn-primary'>All</div>";
			});
			var str = "<span><i class='icon-group'></i>  " + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v) + str2 + "</span> ";
			return str
		} else
			return "<span><i class='icon-user'></i>  " + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v) + "</span>";
	}

	$scope.userGroupBar = {
		placeholder: "Add User or Role or Group",
		minimumInputLength: 0,
		multiple: true,
		ajax: {
			method: 'POST',
			url: "/api/list/suggestion/",
			dataType: 'json',
			quietMillis: 100,
			data: function(term, page) {
				return {
					q: term,
					pageLimit: 10,
					page: page,
					selected: $scope.searchBarValue,
					suggestionFor: "workflowDefinition",
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
		formatResult: $scope.formatResult,
		formatSelection: $scope.formatSelection,
		dropdownCssClass: "bigdrop",
		escapeMarkup: function(m) {
			return m;
		}
	};

	$scope.userBar = {
		placeholder: "Please select...",
		minimumInputLength: 0,
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
					suggestionFor: "user", // suggestions for
				};
			},
			results: function(data, page) {
				var data = data;
				data.total = 100;
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
		formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
		formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
		escapeMarkup: function(m) {
			return m;
		} // we do not want to escape markup since we are displaying html in results
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
		placeholder: "Please select...",
		minimumInputLength: 0,
		closeOnSelect: false,
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

	$scope.initializeData = function() {
		$scope.quoteDefn = {};
		$scope.workflow = {};
		$scope.workflow.definition = [];
		$scope.workflowDefinitions = [{}];
		$scope.workflow.definitionCount = ['*'];
		$scope.quote.weightBracketFields = [];
		$scope.defaultFields = {};
		$scope.comment = "";
		$scope.quote.selection = {};
	}

	if ($route.current.name === 'quote.template') {
		$scope.getQuoteDefnEffctBase();
		$scope.getQuoteDefnGroup();
	} else if ($route.current.name === 'quote.search') {
		$scope.selectedAccount = localStorage.currentAccoutName;
		$scope.searchBarValue = eval(localStorage.searchBarvals); //[{"id":"Account","v":localStorage.currentAccoutName,"n":"Account"}];

		if ($routeParams.quoteTemplateId) {
			$scope.toggleCollapse(true);
			$scope.getQuoteDefs($routeParams.accountId);
		} else {
			$scope.toggleCollapse(true);
			$scope.getQuoteDefs($routeParams.accountId);
			console.log('ere');
			$scope.searchQuote($scope.searchBarValue, $routeParams.accountId, $routeParams.quoteTemplateId);
		}

	} else if ($route.current.name === 'quote.new') {
		$location.path("quote/new/" + $routeParams.accountId + "/" + $routeParams.quoteTemplateId);
		$scope.initializeData();
		$scope.searchAccount();
		$scope.selectedAccount = localStorage.currentAccoutName;
		$scope.searchBarValue = eval(localStorage.searchBarvals);
		$scope.toggleCollapse(true);
		$scope.getQuoteDefs($routeParams.accountId);
		$scope.getDefaultFieldsList($routeParams.quoteTemplateId);
	} else $scope.getAccountCodeList($scope.search);

	$scope.selectOldQuote = function(value) {
		var promise = quoteService.oldQuoteList(value);
		promise.then(function(result) {
				$scope.oldQuoteList = result;
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

	$scope.$watch('quote.selection', function(newVal, oldVal) {
		var val = [];
		var newValue = "";
		for (var key in newVal) {
			if (newVal[key] != undefined)
				newValue = newVal[key];
			// val[key] = newValue;
			val.push({
				"id": key,
				"v": newValue,
				"n": key
			});
		}
		if (val.length > 0) {
			var data = {
				selected: val, //search term
				quoteDefnId: $routeParams.quoteTemplateId,
				accountId: $routeParams.accountId,
				pageLimit: 10, // page size
				page: 1 // page number
			}
			$scope.selectOldQuote(data);
		}
	}, true);

	$scope.getInnerBracket = function(wt, wtBkt) {
		var value = _.find(wtBkt, function(bkt) {
			if (bkt.e === "*") { // check end value, if end value is equal to "*" then take that bracket 
				return bkt;
			} else { // check if wt is inbetween start weight and end weight then take corresponding value
				var start = parseInt(bkt.s);
				var end = parseInt(bkt.e);
				if (wt > start && wt <= end) {
					return bkt;
				}
			}
		});
		return value;
	};

	$scope.getWeight = function(idx) {
		var n = $scope.quote.basis[idx]
		if (n) {
			return $scope.quote.selection[n["n"]];
		}
	}

	$scope.getTotalAmount = function(wt, wtBkts) {
		var charges = [];
		var innerBracket = wtBkts.forEach(function(wtBkt, idx) {
			var newWt = $scope.getWeight(idx);
			if (_.isUndefined(newWt))
				wt = 0;
			else
				wt = newWt;
			var data = $scope.getInnerBracket(wt, wtBkt);
			try {
				if (!_.isUndefined(data.v))
					charges.push(parseFloat(data.v) * wt);
			} catch (err) {
				charges.push(0);
			}

		});
		$scope.quote.charges = charges;
		var sum = _.reduce(charges, function(total, num) {
			return total + num;
		}, 0);
		return sum;
	}

	$scope.$watch('quote.weightBracketFields', function(newVal, oldVal) {
		var wt = 100;
		if (!_.isUndefined($scope.quote.selection.chargableWeight))
			wt = $scope.quote.selection.chargableWeight;
		$scope.quote.totalAmount = $scope.getTotalAmount(wt, newVal);
	}, true);

	$scope.$watch('quote.selection', function(newVal, oldVal) {
		var wt = 100;
		if (!_.isUndefined($scope.quote.selection.chargableWeight))
			wt = $scope.quote.selection.chargableWeight;
		$scope.quote.totalAmount = $scope.getTotalAmount(wt, $scope.quote.weightBracketFields);
	}, true);

	$scope.searchAccount();
//	$.getScript("/scripts/vendor/ace-elements.js");
	$.getScript("/scripts/vendor/ace.js");
//	$.getScript("/scripts/vendor/prettify.js");
	$.getScript("/scripts/vendor/bootstrap-colorpicker.js");

	if ($state.current.name === "quote.template") {
		$.getScript("/scripts/editor.js");
	}

	setInterval(function() {
		try {
			var divData = angular.element($('#editor1'));
			$scope.quoteEmail.message = divData[0].innerHTML;
			$scope.htmlTemplate = $('#ifrm').contents().find("html").html();
			$scope.$digest();
		} catch (exception) {

		}
		try {
			$scope.quote.htmlTemplateFilled = $('#ifrmFilled').contents().find("html").html();
			$scope.$digest();

		} catch (exception) {

		}
	}, 3000);

	$scope.loading = false;
});