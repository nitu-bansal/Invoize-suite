'use strict';

angularApp.controller('rateRequestCtrl', function($scope, $rootScope, $http, $location, $route, $stateParams, $state, $routeParams, $compile, rateRequestService, accountService, sharedService, flash) {
	$scope.selectedRequest = {};
	$scope.selectedRequestHistory = {};
	$scope.newRequest = [];
	$scope.requestCount = {};
	$scope.quote = {};
	$scope.quote.basis = [];
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
	$scope.rateRequestHistory = [{}];
	$scope.quoteRequestHistory = [{}];
	$scope.selectedRequest.weightBracket = [{
		sph: "0",
		eph: "*"
	}];
	$scope.selectedRequestHistory.weightBracket = [{
		sph: "0",
		eph: "*"
	}];
	$scope.isInProcess = true;
	$scope.isCollapse = true;
	$scope.isCollapsed = true;
	$scope.isWidgetCollapsed = false;
	$scope.rateRequestHistoryAvailable = false;
	$scope.quoteRequestHistoryAvailable = false;
	$scope.isFilterCollapsed = true;
	$scope.isCurrentTmsStackHolderCollapsed = true;
	$scope.isCurrentRateStackHolderCollapsed = true;
	$scope.totalAmount = 0;
	$scope.htmlTemplateFilled = "";

	$scope.fileTypeSelects = [{
		"id": "Tariff",
		"name": "<i class='icon-file-alt'></i>&nbsp;Tariff"
	}, {
		"id": "SOP",
		"name": "<i class='icon-file-alt'></i>&nbsp;SOP"
	}, {
		"id": "Other",
		"name": "<i class='icon-file-alt'></i>&nbsp;Other"
	}];
	$scope.tariff = {};
	$scope.tariff.docId = [];
	$scope.tariffList = {};
	$scope.documentRequestHistory = [{}];
	$scope.globalFileUpload;
	$scope.tariffHistoryAvailable = false;
	$scope.quickViewAttachments = [];
	$scope.CurrentStackHolder = [];
	$scope.onBar = {
		placeholder: "Please select..",
		query: function(query) {
			var data = {
				results: []
			};
			$.each($scope.allBasisList, function() {
				if (query.term.length == 0 || this.n.toUpperCase().indexOf(query.term.toUpperCase()) >= 0) {
					data.results.push({
						id: this.id,
						text: this.n,
						c: this.c,
						g: this.g,
						v: this.v,
						n: this.n,
						tc: this.tc
					});
				}
			});
			query.callback(data);
		},
		initSelection: function(element, callback) {
			callback($(element).data('$ngModelController').$modelValue);
		},
		dropdownCssClass: "bigdrop",
		escapeMarkup: function(m) {
			return m;
		}
	};

//	$scope.getRequestCount = function() {
//		var promise = rateRequestService.rateRequestCount({
//			countFor: 'rateRequests'
//		});
//		promise.then(function(result) {
//				$scope.requestCount = result;
//				$scope.rateRequestCountLoader = false;
//				$rootScope.pendingRateRequestCount = $scope.requestCount.rate.pending;
//				$rootScope.inProcessRateRequestCount = $scope.requestCount.rate.inProcess;
//				$rootScope.pendingTmsRequestCount = $scope.requestCount.tariff.pending;
//				$rootScope.inProcessTmsRequestCount = $scope.requestCount.tariff.inProcess;
//				$rootScope.pendingQuoteRequestCount = $scope.requestCount.quote.pending;
//				$rootScope.inProcessQuoteRequestCount = $scope.requestCount.quote.inProcess;
//			},
//			function(result) {
//				flash.pop({
//					title: 'Alert',
//					body: result,
//					type: 'error'
//				});
//			}
//		);
//	};

	$scope.getRateRequestHistoryDetail = function(id, data) {
		var promise = rateRequestService.rateRequestHistoryRead({
			"rateRequestId": $routeParams.requestId,
			"timeStamp": data.timeStamp
		});
		promise.then(function(result) {
				$scope.selectedRequestHistory = result;
				$scope.getOtherFieldsList();
				$scope.rendorHtml(id);
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

	$scope.getQuoteRequestHistoryDetail = function(id, data) {
		var promise = rateRequestService.quoteRequestHistoryRead({
			"quoteRequestId": $routeParams.requestId,
			"timeStamp": data.timeStamp
		});
		promise.then(function(result) {
				$scope.selectedRequestHistory = result;
				$scope.getOtherFieldsList();
				$scope.rendorHtmlQuote(id);
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

	$scope.rendorHtml = function(id) {
		var strHTML = "";
		angular.forEach($scope.selectedRequestHistory.selection, function(i, j) {
			strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp " + $scope.toHumanReadable(i.n) + ": " + i.v + "</small></br>";
		});

		strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp chargeType: " + $scope.selectedRequestHistory.chargeType + "</small> </br>";
		strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp Rate Qualifier: " + $scope.selectedRequestHistory.rateQualifier + "</small> </br>";

		strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp Weight Brackets:&nbsp&nbsp</small>";
		angular.forEach($scope.selectedRequestHistory.weightBracket, function(i, j) {
			strHTML = strHTML + "<small>" + i.s + "&nbsp&nbsp-&nbsp&nbsp" + i.e + "&nbsp&nbsp-&nbsp&nbsp" + i.v + "</small>";
		});
		$("#" + id).html($compile("<div> " + strHTML)($scope));
	}
	$scope.rendorHtmlQuote = function(id) {
		var strHTML = "";
		angular.forEach($scope.selectedRequestHistory.selection, function(i, j) {
			strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp " + $scope.toHumanReadable(i.n) + ": " + i.v + "</small></br>";
		});

		angular.forEach($scope.selectedRequestHistory.chargeType, function(i, j) {
			strHTML = strHTML + "<small><strong>" + i + "</strong></small></br>";
			strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp Rate Qualifier: " + $scope.selectedRequestHistory.quoteQualifier[j] + "</small> </br>";
			strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp Weight Brackets:&nbsp&nbsp</small>";
			angular.forEach($scope.selectedRequestHistory.weightBracket[j], function(k, l) {
				strHTML = strHTML + "<small>" + k.s + "&nbsp&nbsp-&nbsp&nbsp" + k.e + "&nbsp&nbsp-&nbsp&nbsp" + k.v + "</small></br>";
			});

		});
		$("#" + id).html($compile("<div> " + strHTML)($scope));
	}

	$scope.getRateRequestList = function(value) {
		$scope.rateRequestListLoader = true;
		var promise = rateRequestService.rateRequestList({
			suggestionFor: "rateRequest",
			q: '',
			pageLimit: 10,
			page: 1,
			rateRequestType: value
		});
		$scope.CurrentStackHolder = [];
		promise.then(function(result) {
				$scope.rateRequestListLoader = false;
				$scope.oldRequest = result;
				var desc;
				angular.forEach($scope.oldRequest, function(i, j) {
					desc = "";
					angular.forEach(i.pendingFor, function(a, b) {
						desc += a.email + '\n';
					});
					$scope.CurrentStackHolder.push(desc.slice(0, -1));

				});
			},
			function(result) {
				$scope.rateRequestListLoader = false;
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	};

	$scope.getQuoteRequestList = function(value) {
		$scope.quoteRequestListLoader = true;
		var promise = rateRequestService.quoteRequestList({
			suggestionFor: "quoteRequest",
			q: '',
			pageLimit: 10,
			page: 1,
			quoteRequestType: value
		});
		$scope.CurrentStackHolder = [];
		promise.then(function(result) {
				$scope.quoteRequestListLoader = false;
				$scope.oldRequest = result;
				var desc;
				angular.forEach($scope.oldRequest, function(i, j) {
					desc = "";
					angular.forEach(i.pendingFor, function(a, b) {
						desc += a.email + '\n';
					});
					$scope.CurrentStackHolder.push(desc.slice(0, -1));

				});
			},
			function(result) {
				$scope.quoteRequestListLoader = false;
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	};


	$scope.getTmsRequestList = function(value) {
		$scope.tmsRequestListLoader = true;
		var promise = rateRequestService.tmsRequestList({
			suggestionFor: "tmsRequest",
			q: '',
			pageLimit: 10,
			page: 1,
			tmsRequestType: value
		});
		$scope.quickViewAttachments = [];
		$scope.CurrentStackHolder = [];
		promise.then(function(result) {
				$scope.tmsRequestListLoader = false;
				$scope.oldTmsRequest = result;
				var desc;
				angular.forEach($scope.oldTmsRequest, function(i, j) {
					desc = "";
					angular.forEach(i.docId, function(a, b) {
						desc += a.v + '\n';
					});
					$scope.quickViewAttachments.push(desc.slice(0, -1));
				});
				angular.forEach($scope.oldTmsRequest, function(i, j) {
					desc = "";
					angular.forEach(i.workflowUsers, function(a, b) {
						desc += a.email + '\n';
					});
					$scope.CurrentStackHolder.push(desc.slice(0, -1));

				});

			},
			function(result) {
				$scope.tmsRequestListLoader = false;
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	};

	$scope.getOtherFieldsList = function() {
		var promise = rateRequestService.otherFieldsList({
			suggestionFor: 'metadata_laneparameter',
			q: '',
			pageLimit: 10,
			page: 1
		});
		promise.then(function(r) {
				$scope.otherFieldsList = r;
				angular.forEach($scope.selectedRequest.selection, function(i, j) {
					angular.forEach($scope.otherFieldsList, function(k, l) {
						if (i.n === k.n)
							$scope.otherFieldsList.splice(l, 1);
					});
				});

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


	$scope.getOtherFieldsListForQuote = function(q) {
		var promise = accountService.list({
			suggestionFor: 'metadata_laneparameter',
			q: q,
			pageLimit: 20,
			page: 1
		});
		promise.then(function(result) {
				$scope.otherFieldsList = result;
				angular.forEach($scope.quote.selection, function(i, j) {
					angular.forEach($scope.otherFieldsList, function(k, l) {
						if (i.n === k.n)
							$scope.otherFieldsList.splice(l, 1);
					});
				});
			},
			function(result) {}
		);
	};

	$scope.getRateRequestHistory = function(value) {
		var promise = rateRequestService.getRateRequestHistory(value);
		$scope.rateRequestHistoryLoader = true;
		$scope.rateRequestHistoryAvailable = false;
		promise.then(function(result) {
				if (result.length > 0) {
					$scope.rateRequestHistoryAvailable = true;
				}
				$scope.rateRequestHistoryLoader = false;
				$scope.rateRequestHistory = result;
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

	$scope.getQuoteRequestHistory = function(value) {
		var promise = rateRequestService.getQuoteRequestHistory(value);
		$scope.quoteRequestHistoryLoader = true;
		$scope.quoteRequestHistoryAvailable = false;
		promise.then(function(result) {
				if (result.length > 0) {
					$scope.quoteRequestHistoryAvailable = true;
				}
				$scope.quoteRequestHistoryLoader = false;
				$scope.quoteRequestHistory = result;
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

	$scope.selectRateRequest = function(value) {
		$scope.requestUpdateLoader = true;
		$location.path("/request/rate/" + $routeParams.requestType + "/" + value);
		var promise = rateRequestService.rateRequestRead(value);
		promise.then(function(result) {
				$scope.selectedRequest = result;
				$scope.getOtherFieldsList();
				$scope.getRateRequestHistory(value);
				$scope.requestUpdateLoader = false;
				if ($routeParams.requestType == "pending")
					$scope.isInProcess = false;
				else
					$scope.isInProcess = true;
				$.getScript("/scripts/initSlimScroll.js");
			},
			function(result) {
				$scope.requestUpdateLoader = false;
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	};

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


	$scope.selectQuoteRequest = function(value) {
		$scope.defaultFields = {};
		$scope.requestUpdateLoader = true;
		$location.path("/request/quote/" + $routeParams.requestType + "/detail/" + value);
		$scope.getChargeList();
		$scope.getOtherFieldsListForQuote();
		$scope.getBasisList();
		var promise = rateRequestService.quoteRequestRead(value);
		promise.then(function(result) {
				$scope.quote = result;
				//Adding a key text in Basis Array which is required for select2 to initialize with some value
				$scope.quote.basis.forEach(function(i, j) {
					$scope.quote.basis[j].text = i.n;
				});
				console.log($scope.quote.basis)
				$scope.getQuoteRequestHistory(value);
				$scope.requestUpdateLoader = false;
				$.getScript("/scripts/initSlimScroll.js");
				if ($routeParams.requestType == "pending")
					$scope.isInProcess = false;
				else
					$scope.isInProcess = true;
			},
			function(result) {
				$scope.requestUpdateLoader = false;
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	};

	$scope.GetQuoteTemplate = function() {

		var quoteSelection = {};

		$scope.selectedRequest.selection.forEach(function(i) {
			// quoteSelection.push({i.n : i.v});
			quoteSelection[i.n] = i.v;
		});
		console.log(quoteSelection);
		var promise = quoteService.htmlQuoteTemplate({
			"selection": quoteSelection,
			"weightBracket": $scope.selectedRequest.weightBracket,
			"quoteQualifier": $scope.selectedRequest.quoteQualifier,
			"quoteDefnId": $scope.selectedRequest.quoteDefnId,
			"chargeType": $scope.selectedRequest.chargeType,
			"quoteNumber": $scope.selectedRequest.quoteNo
		});
		promise.then(function(msg) {
				if (msg === "")
					$('#ifrmFilledQuoteRequest').contents().find("html").html("<b>Template is  not available for this request.</b></br> </br> Tip : You can attach a template while creating a new quote definition.");
				else
					$('#ifrmFilledQuoteRequest').contents().find("html").html(msg);
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

	$scope.approveRateRequest = function(selectedRequest) {
		var promise = rateRequestService.updateRateRequest({
			"selectedRequest": selectedRequest,
			"action": "A",
			"rateRequestId": $routeParams.requestId
		});
		promise.then(function(msg) {
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'success'
				});
				//$scope.getRequestCount();
				$scope.getRateRequestList($routeParams.requestType);
				$location.path("/request/rate/" + $routeParams.requestType);
			},
			function(msg) {
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			}
		);
	};

	$scope.approveQuoteRequest = function(selectedRequest) {
		selectedRequest.template = $scope.htmlTemplateFilled;
		var promise = rateRequestService.updateQuoteRequest({
			"selectedRequest": selectedRequest,
			"action": "A",
			"quoteRequestId": $routeParams.requestId
		});
		promise.then(function(msg) {
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'success'
				});
				//$scope.getRequestCount();
				$scope.getQuoteRequestList($routeParams.requestType);
				$location.path("/request/quote/" + $routeParams.requestType);
			},
			function(msg) {
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			}
		);
	};

	$scope.rejectRateRequest = function(selectedRequest) {
		var promise = rateRequestService.updateRateRequest({
			"selectedRequest": selectedRequest,
			"action": "R",
			"rateRequestId": $routeParams.requestId
		});
		promise.then(function(msg) {
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'success'
				});
				//$scope.getRequestCount();
				$scope.getQuoteRequestList($routeParams.requestType);
				$location.path("/request/rate/" + $routeParams.requestType);
			},
			function(msg) {
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			}
		);
	};

	$scope.appendToList = function(v) {
		if ($scope.selectedRequest.selection) {
			if (v.length > 0) {
				var v;
				eval("v=" + v);
				$scope.selectedRequest.selection.push(v);
				$scope.currentSelectedField = [];
				angular.forEach($scope.otherFieldsList, function(i, j) {
					if (i.n === v.n)
						$scope.otherFieldsList.splice(j, 1);
				});
			}
		}
	};

	$scope.removeFromList = function(idx) {
		$scope.otherFieldsList.push($scope.selectedRequest.selection[idx]);
		$scope.selectedRequest.selection.splice(idx, 1);
	};

	$scope.weightBracketCallback = function(field, index) {
		if ($scope.selectedRequest.weightBracket[index][field]) {
			if (field === "e" && $scope.selectedRequest.weightBracket.length === index + 1) {
				if ($scope.selectedRequest.weightBracket[index].e != "*") {
					var difference = parseInt($scope.selectedRequest.weightBracket[index].e) - parseInt($scope.selectedRequest.weightBracket[index].s);
					var start = parseInt($scope.selectedRequest.weightBracket[index].e);
					var end = start + difference;
					$scope.selectedRequest.weightBracket.push({
						sph: start,
						eph: end + " or *"
					});
				}
			}
		} else {
			if (index === 0 || field === 's')
				$scope.selectedRequest.weightBracket[index][field] = $scope.selectedRequest.weightBracket[index][field + "ph"];
			else if (field === 'e' && $scope.selectedRequest.weightBracket.length === index + 1) {
				if ($scope.selectedRequest.weightBracket[index].e != "*") {
					$scope.selectedRequest.weightBracket[index][field] = parseInt($scope.selectedRequest.weightBracket[index].s) + parseInt($scope.selectedRequest.weightBracket[index - 1].e) - parseInt($scope.selectedRequest.weightBracket[index - 1].s);
					var difference = parseInt($scope.selectedRequest.weightBracket[index].e) - parseInt($scope.selectedRequest.weightBracket[index].s);
					var start = parseInt($scope.selectedRequest.weightBracket[index].e);
					var end = start + difference;
					$scope.selectedRequest.weightBracket.push({
						sph: start,
						eph: end + " or *"
					});
				}
			}
		}
	};

	$scope.weightBracketCallbackQuote = function(field, parentIndex, index) {
		if ($scope.selectedRequest.weightBracket[parentIndex][index][field]) {
			if (field === "e" && $scope.selectedRequest.weightBracket[parentIndex].length === index + 1) {
				if ($scope.selectedRequest.weightBracket[parentIndex][index].e != "*") {
					var difference = parseInt($scope.selectedRequest.weightBracket[parentIndex][index].e) - parseInt($scope.selectedRequest.weightBracket[parentIndex][index].s);
					var start = parseInt($scope.selectedRequest.weightBracket[parentIndex][index].e);
					var end = start + difference;
					$scope.selectedRequest.weightBracket[parentIndex].push({
						sph: start,
						eph: end + " or *"
					});
				}
			}
		} else {
			if (index === 0 || field === 's')
				$scope.selectedRequest.weightBracket[parentIndex][index][field] = $scope.selectedRequest.weightBracket[parentIndex][index][field + "ph"];
			else if (field === 'e' && $scope.selectedRequest.weightBracket[parentIndex].length === index + 1) {
				if ($scope.selectedRequest.weightBracket[parentIndex][index].e != "*") {
					$scope.selectedRequest.weightBracket[parentIndex][index][field] = parseInt($scope.selectedRequest.weightBracket[parentIndex][index].s) + parseInt($scope.selectedRequest.weightBracket[parentIndex][index - 1].e) - parseInt($scope.selectedRequest.weightBracket[parentIndex][index - 1].s);
					var difference = parseInt($scope.selectedRequest.weightBracket[parentIndex][index].e) - parseInt($scope.selectedRequest.weightBracket[parentIndex][index].s);
					var start = parseInt($scope.selectedRequest.weightBracket[parentIndex][index].e);
					var end = start + difference;
					$scope.selectedRequest.weightBracket[parentIndex].push({
						sph: start,
						eph: end + " or *"
					});
				}
			}
		}
	};


	$scope.removeFromWeightBracketFields = function(idx) {
		$scope.selectedRequest.weightBracket.splice(idx, 1);
	};

	$scope.removeFromWeightBracketFieldsQuote = function(parentIndex, idx) {
		// This function is used to remove fields from weightBracketFields
		$scope.selectedRequest.weightBracket[parentIndex].splice(idx, 1); // delete form field from weightBracketFields object using fields index
	};


	$scope.selectTmsRequest = function(value) {
		$scope.accountDetailLoader = true;
		$scope.documentRequestHistory = [];
		if ($routeParams.requestType === 'pending')
			$location.path("/request/tms/" + $routeParams.requestType + "/revise/" + value);
		else
			$location.path("/request/tms/" + $routeParams.requestType + "/detail/" + value);

		$scope.tariff = {};
		var promise = tmsService.read(value);
		promise.then(function(result) {
				$scope.getDocumentRequestHistory(value);
				$scope.tariffDetailLoader = false;
				$scope.tariff = result;
				$.getScript("/scripts/initSlimScroll.js");
				if ($routeParams.requestType == "pending")
					$scope.isInProcess = false;
				else
					$scope.isInProcess = true;

				$scope.initExistingDocs();

			},
			function(result) {
				$scope.tariffDetailLoader = false;
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	};
	$scope.getDocumentRequestHistoryDetail = function(id, data) {
		var promise = tmsService.documentHistoryDetails({
			"rateRequestId": $routeParams.requestId,
			"timeStamp": data.timeStamp
		});
		promise.then(function(result) {
				$scope.selectedRequestHistory = result;
				$scope.getOtherFieldsList();
				$scope.rendorHtml(id);
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

	$scope.getDocumentRequestHistory = function(value) {
		$scope.tariffHistoryLoader = true;
		$scope.tariffHistoryAvailable = false;
		var promise = tmsService.documentHistory(value);
		promise.then(function(result) {

				if (result.length > 0) {
					$scope.tariffHistoryAvailable = true;
				}

				$scope.documentRequestHistory = result;
				$scope.tariffHistoryLoader = false;
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

	$scope.approveTariff = function(tariff) {

		$scope.tariffCreateLoader = true;
		var ExistingAttachmentsId = sharedService.getFinalDocuments();
		var NewAttachmentsId = sharedService.getDocumentId();

		console.log(NewAttachmentsId);
		$scope.tariff.docId = [];
		angular.forEach(ExistingAttachmentsId, function(i, j) {
			$scope.tariff.docId.push(i);
		});
		angular.forEach(NewAttachmentsId, function(i, j) {
			$scope.tariff.docId.push(i);
		});
		$scope.tariff.accountId = $routeParams.accountId;
		$scope.tariff.id = $routeParams.requestId;
		$scope.tariff.action = "A";

		var promise = tmsService.update(tariff);
		promise.then(function(msg) {

				$scope.tariffCreateLoader = false;
				sharedService.clearDocumentId();
				sharedService.setExistingDocs($scope.tariff.docId);
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'success'
				});
				//$scope.getRequestCount();
				$scope.getTmsRequestList($routeParams.requestType);
				$location.path("/request/tms/" + $routeParams.requestType);
			},
			function(msg) {
				$scope.tariffCreateLoader = false;
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			}
		);
	};

	$scope.rejectTariff = function() {
		$scope.tariffCreateLoader = true;
		var ExistingAttachmentsId = sharedService.getFinalDocuments();
		var NewAttachmentsId = sharedService.getDocumentId();
		$scope.tariff.docId = [];
		angular.forEach(ExistingAttachmentsId, function(i, j) {
			$scope.tariff.docId.push(i);
		});
		angular.forEach(NewAttachmentsId, function(i, j) {
			$scope.tariff.docId.push(i);
		});
		$scope.tariff.accountId = $routeParams.accountId;
		$scope.tariff.id = $routeParams.requestId;
		$scope.tariff.action = "R";

		var promise = tmsService.update($scope.tariff);
		promise.then(function(msg) {
				$scope.tariffCreateLoader = false;
				sharedService.clearDocumentId();
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'info'
				});
				//$scope.getRequestCount();
				$scope.getTmsRequestList($routeParams.requestType);
				$location.path("/request/tms/" + $routeParams.requestType);
			},
			function(msg) {
				$scope.tariffCreateLoader = false;
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			}
		);
	};

	$scope.initExistingDocs = function() {
		sharedService.setExistingDocs($scope.tariff.docId);
	};
	$scope.setFileType = function(id, t) {
		sharedService.updateExistingFileType(id, t);
	};
	$scope.setNewFileType = function(id, t) {
		sharedService.updateNewFileType(id, t);
	};


	$scope.removeExistingAttachment = function(id) {

		var attachmentsId = sharedService.removeExistingDocumentId(id);
		$scope.tariff.docId = [];
		angular.forEach(attachmentsId, function(i, j) {
			$scope.tariff.docId.push(i);
		});
	}

	$scope.removeNewAttachment = function(id) {
		var attachmentsId = sharedService.removeNewDocumentId(id);
	}

	$scope.UndoFileRevision = function(id, index) {
		var attachmentsId = sharedService.resetFileRevision(id);
		angular.element('#reviseFiles' + index).scope().queue = [];
	}


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
		delete $scope.quote.selection[$scope.quote.selection[idx]["n"]]; // delete form field from selection object using default fields index
		$scope.otherFieldsList.push($scope.quote.selection[idx]); // put default field into otherFields list
		$scope.quote.selection.splice(idx, 1); // delete form field from defaultFields object using default fields index
	};

	// Quote :
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

	$scope.getTotalAmount = function(wt, wtBkts) {
		var charges = [0];
		var innerBracket = wtBkts.forEach(function(wtBkt) {
			var data = $scope.getInnerBracket(wt, wtBkt);
			try {
				if (!_.isUndefined(data.v))
					charges.push(parseFloat(data.v) * wt);
			} catch (err) {
				charges.push(0);
			}

		});
		var sum = _.reduce(charges, function(total, num) {
			return total + num;
		}, 0);
		return sum;
	}


	$scope.$watch('selectedRequest', function(newVal, oldVal) {
		var wt = 100;
		if (!_.isUndefined($scope.selectedRequest.selection)) {
			if (!_.isUndefined($scope.selectedRequest.selection.chargableWeight))
				wt = $scope.selectedRequest.selection.chargableWeight;
		}
		$scope.totalAmount = $scope.getTotalAmount(wt, newVal.weightBracket);
	}, true);


	if ($route.current.name === 'request.rateList.detail') {
		//$scope.getRequestCount();
		$scope.getRateRequestList($routeParams.requestType);
		$scope.selectRateRequest($routeParams.requestId);
	} else if ($route.current.name === 'request.tmsList.detail') {
		//$scope.getRequestCount();
		$scope.getTmsRequestList($routeParams.requestType);
		$scope.selectTmsRequest($routeParams.requestId);
	} else if ($route.current.name === 'request.quoteList.detail') {
		//$scope.getRequestCount();
		$scope.getQuoteRequestList($routeParams.requestType);
		$scope.selectQuoteRequest($routeParams.requestId);
	} else if ($route.current.name === 'request.rateList') {
		//$scope.getRequestCount();
		$scope.getRateRequestList($routeParams.requestType);
	} else if ($route.current.name === 'request.tmsList') {
		//$scope.getRequestCount();
		$scope.getTmsRequestList($routeParams.requestType);
	} else if ($route.current.name === 'request.quoteList') {
		//$scope.getRequestCount();
		$scope.getQuoteRequestList($routeParams.requestType);
	}

	//$scope.getRequestCount();
//	$.getScript("/scripts/vendor/prettify.js");
//	$.getScript("/scripts/vendor/ace-elements.js");
	$.getScript("/scripts/vendor/ace.js");



	setInterval(function() {
		try {
			$scope.htmlTemplateFilled = $('#ifrmFilledQuoteRequest').contents().find("html").html();
			$scope.$digest();

		} catch (exception) {

		}
	}, 3000);
	$scope.loading = false;

});