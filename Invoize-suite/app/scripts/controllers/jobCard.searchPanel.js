'use strict';

angularApp.controller('searchPanelCtrl', function($scope, $http, $location, $stateParams, $route, $routeParams, $dialog, flash, searchPanelService, Restangular) {

	var baseJobCards = Restangular.all('jobCards');

	$scope.jobCardList = [];
	$scope.jobCard = {};
	$scope.jobCard.searchPanelCard = {};
	$scope.jobCard.searchPanel = [];
	$scope.jobCard.RulesPanelCard = {};
	$scope.RulesPanel = [];
	$scope.statusArr = ["Inactive", "Active", "Excluded"];
	$scope.statusColor = ["header-color-gray", "header-color-green", "header-color-blue"];
	$scope.ruleItems = ["Invoice Number", "Invoice Date", "Invoice amount", "HAWB number", "PO number", "PO Date", "Origin", "Destination"];
	$scope.jobCard.RulesPanelCard.data = {};
	$scope.jobCard.RulesPanelCard.data.Rules = [];
	$scope.jobCard.RulesPanelCard.data.Titles = [];
	$scope.searchCriteriaCreateLoader = false;
	$scope.jobCardCreateLoader = false;
	$scope.groupFieldsLoader = {};
	$scope.groupFields = {};

	$scope.updateJobcard = function(jobCard) {
		jobCard.put().then(function(result) {
			$scope.list('');
			flash.pop({
				title: 'jobcard updated',
				body: result.msg,
				type: 'success'
			});
			$location.path("/payright/jobCard/edit/" + $stateParams.jobCardId);
		}, function(result) {
			flash.pop({
				title: 'jobcard not updated',
				body: result.msg,
				type: 'error'
			});
		});
	};

	$scope.getGroupFields = function(group) {
		$scope.groupFieldsLoader[group] = true;
		$scope.groupFields[group] = [];
		var dict = _.where($scope.jobCard.searchPanelCard.searchBy, {
			groupCaption: group
		});
		var promise = searchPanelService.getGroupFields(dict[0]);
		promise.then(function(result) {
				$scope.groupFields[group] = result;
				$scope.groupFieldsLoader[group] = false;
			},

			function(result) {
				$scope.groupFields[group] = [];
				$scope.groupFieldsLoader[group] = false;
			}
		);

	};

	$scope.addGroupField = function(item, parentIndex, index) {
		$scope.jobCard.searchPanelCard.searchBy[parentIndex].fields.splice(0, 0, item);
	}
	$scope.removeGroupField = function(parentIndex, index) {
		$scope.jobCard.searchPanelCard.searchBy[parentIndex].fields.splice(index, 1);
	}

	$scope.createJobcard = function(jobCard) {
		baseJobCards.post(jobCard).then(function(result) {
			$scope.jobcardCreateLoader = false;
			// $scope.read(result.msg.id);
			$scope.list('');
			flash.pop({
				title: 'jobcard created',
				body: result.msg,
				type: 'success'
			});

			$location.path("/payright/jobCard/edit/" + result.msg.id);
		}, function(result) {
			flash.pop({
				title: 'jobcard not created',
				body: result.msg,
				type: 'error'
			});
		});
	};
	$scope.searchJobCard = function() {
		$scope.list('');
	};

	$scope.read = function(id) {
		$scope.searchPanelCardLoader = true;
		$scope.ruleItems = ["Invoice Number", "Invoice Date", "Invoice amount", "HAWB number", "PO number", "PO Date", "Origin", "Destination"];
		Restangular.one('jobCards', id).get().then(function(result) {
			$scope.jobCard = result;
			angular.forEach($scope.jobCard.RulesPanelCard.data.Titles, function(i, j) {
				angular.forEach($scope.ruleItems, function(k, l) {
					if (k == i.title)
						$scope.ruleItems.splice(l, 1);

				});
			});
			angular.forEach($scope.jobCard.searchPanelCard.searchBy, function(i, j) {
				if (_.isUndefined($scope.jobCard.searchPanel[i.groupCaption]))
					$scope.jobCard.searchPanel[i.groupCaption] = {};

			});
			if (id == 0)
				$location.path("payright/jobCard/new");
			else
				$location.path("payright/jobCard/edit/" + id);
			$.getScript("/scripts/initSlimScroll.js");
			$scope.searchPanelCardLoader = false;
		}, function(result) {
			flash.pop({
				title: 'Error in reading.',
				body: result.msg,
				type: 'error'
			});
			$scope.searchPanelCardLoader = false;
		});
	};

	$scope.changeStatus = function(parentIndex, index) {
		if ($scope.jobCard.RulesPanelCard.data.Rules[parentIndex].ruleData[index].deleted != 1) {
			if ($scope.jobCard.RulesPanelCard.data.Rules[parentIndex].ruleData[index].value < $scope.statusArr.length - 1)
				$scope.jobCard.RulesPanelCard.data.Rules[parentIndex].ruleData[index].value = $scope.jobCard.RulesPanelCard.data.Rules[parentIndex].ruleData[index].value + 1;
			else
				$scope.jobCard.RulesPanelCard.data.Rules[parentIndex].ruleData[index].value = 0;
		}
	}

	$scope.addRuleColumn = function(item, index) {
		$scope.ruleItems.splice(index, 1);
		$scope.jobCard.RulesPanelCard.data.Titles.push({
			"title": item
		});
		angular.forEach($scope.jobCard.RulesPanelCard.data.Rules, function(i, j) {
			i.ruleData.push({
				"value": 0,
				"status": {
					"image": "hide",
					"state": "inactive"
				},
				"config": "",
				"toolTipText": "",
				"deleted": $scope.jobCard.RulesPanelCard.data.Rules[j].deleted
			})

		});

	}
	$scope.addNewRule = function() {
		$scope.jobCard.RulesPanelCard.data.Rules.push({
			"ruleData": []
		})
		angular.forEach($scope.jobCard.RulesPanelCard.data.Rules[0].ruleData, function(i, j) {
			$scope.jobCard.RulesPanelCard.data.Rules[$scope.jobCard.RulesPanelCard.data.Rules.length - 1].ruleData.push({
				"value": 0,
				"status": {
					"image": "hide",
					"state": "inactive"
				},
				"config": "",
				"toolTipText": "",
				"deleted": $scope.jobCard.RulesPanelCard.data.Titles[j].deleted
			})

		});
	}
	$scope.addRuleItem = function(item, parentIndex, index) {
		$scope.ruleItems.splice(index, 1);
		$scope.ruleItems.push($scope.jobCard.RulesPanelCard.data.Titles[parentIndex].title);
		$scope.jobCard.RulesPanelCard.data.Titles[parentIndex].title = item;
	}

	$scope.removeRuleColumn = function(index) {
		angular.forEach($scope.jobCard.RulesPanelCard.data.Rules, function(i, j) {
			i.ruleData[index].deleted = 1;
		});
		$scope.jobCard.RulesPanelCard.data.Titles[index].deleted = 1;
	}
	$scope.removeRule = function(index) {
		angular.forEach($scope.jobCard.RulesPanelCard.data.Rules[index].ruleData, function(i, j) {
			i.deleted = 1;
		});
		$scope.jobCard.RulesPanelCard.data.Rules[index].deleted = 1;
	}
	$scope.undoRemoveRuleColumn = function(index) {
		angular.forEach($scope.jobCard.RulesPanelCard.data.Rules, function(i, j) {
			if ($scope.jobCard.RulesPanelCard.data.Rules[j].deleted != 1)
				i.ruleData[index].deleted = 0;

		});
		$scope.jobCard.RulesPanelCard.data.Titles[index].deleted = 0;
	}
	$scope.undoRemoveRule = function(index) {
		angular.forEach($scope.jobCard.RulesPanelCard.data.Rules[index].ruleData, function(i, j) {
			if ($scope.jobCard.RulesPanelCard.data.Titles[j].deleted != 1)
				i.deleted = 0;
		});
		$scope.jobCard.RulesPanelCard.data.Rules[index].deleted = 0;
	}

	$scope.openDialog = function(parentIndex, index) {
		var itemToSend = $scope.jobCard.RulesPanelCard.data.Rules[parentIndex].ruleData[index];
		// Code Dialog Start   
		$dialog.dialog(angular.extend({
			controller: 'rulePanelCtrl',
			templateUrl: 'm.jobCardRulesConfig.html', // change as per the dialog html needed
			backdrop: true,
			keyboard: false,
			backdropFade: true,
			dialogFade: true,
			backdropClick: false,
			show: true
		}, {
			resolve: {
				item: function() {
					return angular.copy(itemToSend);
				}
			}
		}))
			.open()
			.then(function(result) {
				if (result) {
					console.log(result); // user has clicked save ..   
					$scope.jobCard.RulesPanelCard.data.Rules[parentIndex].ruleData[index] = result;
					//call function here for saving
				} else {

					console.log("close");
				}
			});
		// Code Dialog End
	};

	$scope.list = function(searchText) {
		$scope.jobCardList = baseJobCards.getList({
			page: 1,
			per_page: 20,
			q: searchText
		});
	};

	$scope.formatResult = function(data) {
		var markup = "<div>" + $scope.toHumanReadable(data.v) + "</div>";
		return markup;

	}

	$scope.formatSelection = function(data) {
		var markup = "<div>" + data.v + "</div>";
		return markup;
	}

	$scope.vendorBar = {
		placeholder: "Please select...",
		minimumInputLength: 0,
		multiple: true,
		allowClear: true,
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
					suggestionFor: "profiles", // suggestions for
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
		formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
		formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
		escapeMarkup: function(m) {
			return m;
		} // we do not want to escape markup since we are displaying html in results
	};

	$scope.confirmDeleteJobCard = function() {
		// Code Dialog Start   
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
					console.log(result); // user has clicked save ..   
					$scope.delete();
				} else {

					console.log("close");
				}
			});
		// Code Dialog End
	};

	$scope.delete = function() {
		$scope.jobCard.remove().then(function(data) {
				flash.pop({
					title: 'Success',
					body: data.msg,
					type: 'info'
				});
				$location.path("/payright/jobCard");
				$scope.listJc('');
			},
			function(msg) {
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			});
	}


	$.getScript("/scripts/vendor/prettify.js");
	$.getScript("/scripts/vendor/ace-elements.js");
	$.getScript("/scripts/vendor/ace.js");
	$.getScript("/scripts/initSlimScroll.js");


	if ($route.current.name == "payright.jobCard.edit") {
		$scope.read($routeParams.jobCardId);
		$scope.list('');
	} else if ($route.current.name == "payright.jobCard.new") {
		$scope.list('');
		$scope.read(0);
	} else {
		$scope.list('');
	}

	$scope.list('');


});