/**
 * Created by noopur.waghmare on 06/02/2014.
 */
angularApp.controller('tmsDocManageCtrl', function($scope, $state, $routeParams, $route, $location, commonService, flash, sharedService, $rootScope, $upload, $filter, $modal) {
	$scope.reportIndex = 0;
	//$scope.reports = [];
	$scope.fields = {};

	//Variables added for pagination
	$scope.currentPage = 1;
	$scope.pageLimit = 20;
	$scope.totalItems = 0;

	$scope.rule = {};
	$scope.rule.conditions = {};
	$scope.isRowCollapsed = [];
	$scope.selected = [];
	$scope.selectedIdsOnly = [];
	$scope.list = [];
	$scope.filter = {};
	$scope.Loader = false;

	//global search account id array
	//    if($scope.$parent.global == undefined)
	//        $scope.$parent.global = items;
	$scope.global = $scope.$parent.global;
	if (!$scope.global.account) {
		$scope.global.account = [];
		$scope.accounts = [];
	} else if ($scope.global.account.length <= 0) {
		$scope.global.account = [];
		$scope.accounts = [];
	} else {
		$scope.accounts = [];
		$scope.accounts.push($scope.global.account[0].id);
	}

	//table check box based account objects
	$scope.accountNumber = $scope.global.account;

	$scope.TariffInfo = {};
	$scope.showRevision = false;
	$scope.historyLoader = false;
	$scope.showGoBtn = false;
	//$scope.Parentindex = 0;
	var filterObj = {};
	$scope.effectiveDate = null;
	$scope.expiryDate = null;
	$scope.receivedDate = null;
	$scope.selectedTab = "tariff";
	$scope.stationKeyID = null;
	$scope.regionKeyID = null;


	$scope.pullFile = function() {

		$.post('/api/tms/export', JSON.stringify(filterObj), function(retData) {
			$("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
		});

	}
	$scope.BulkFileDownload = function() {
		$scope.GetSelectedAccountsandIds();
		if ($scope.accountNumber.length > 0) {
			$.post('/api/tms/bulkDownload', JSON.stringify($scope.accountNumber), function(retData) {
				$("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
			});
		} else {
			flash.pop({
				title: 'Information ',
				body: "No account selected!.",
				type: 'warning'
			});
		}
	}

	function getFilteredData(pageNo, isGetCount) {

		$scope.Loader = true;
		if (isGetCount) {
			var promise1 = commonService.ajaxCall('PUT', 'api/tms/filter?count=1', filterObj);
			promise1.then(function(data) {
				$scope.totalItems = data.count;
			}, function(data) {
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
		}
		$scope.currentPage = pageNo;
		var promise = commonService.ajaxCall('PUT', 'api/tms/filter?pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo, filterObj);
		promise.then(function(data) {
			$scope.Loader = false;
			$scope.isRowCollapsed = [];
			for (var i = 1; i < data.length; i++) {
				$scope.isRowCollapsed.push(true);
			}
			$scope.list = data;
			//			console.log($scope.isRowCollapsed);
		}, function(data) {
			flash.pop({
				title: 'Alert',
				body: data.data,
				type: 'error'
			});
			$scope.Loader = false;
		});

	}
	$scope.quickSearch = function(pageNo, isGetCount, tab) {
		$scope.Loader = true;
		$scope.selectedTab = tab;
		//		console.log($scope.selectedTab);

		filterObj = angular.copy({
			"accounts": $scope.accounts,
			'rules': {}
		});
		if (isGetCount) {
			var promise1 = commonService.ajaxCall('PUT', 'api/tms/filter?count=1', filterObj);
			promise1.then(function(data) {
				$scope.totalItems = data.count;
				$scope.showGoBtn = true;

			}, function(data) {
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
		}
		$scope.currentPage = pageNo;
		var promise = commonService.ajaxCall('PUT', 'api/tms/filter?pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo, filterObj);
		promise.then(function(data) {
			$scope.Loader = false;
			$scope.list = data;
			$scope.isRowCollapsed = [];
			for (var i = 1; i < data.length; i++) {
				$scope.isRowCollapsed.push(true);
			}
			//			console.log($scope.isRowCollapsed);
			// $scope.list = [
			// 	["Select", "ID", "Account Id", "Account Number", "Tariff Code", "Station", "Document Tag", "Effective Date", "Expiry Date"],
			// 	["false", "52e12199c210b20b1316d50d", "52aec7ae1c80a8130567ac63", "44444", "Type2", "nnnn", "s", "2014-01-05T18:30:00.000Z", "2014-01-06T18:30:00.000Z"],
			// 	["false", "52e121f2c210b20b1316d510", "52aec7ae1c80a8130567ac63", "44444", "w", "w", null, "2013-12-29T18:30:00.000Z", "2013-12-29T18:30:00.000Z"],
			// 	["false", "52e1253dc210b21132c9825d", "52aec7ae1c80a8130567ac63", "44444", "s", "22222", "ttttt", "2013-12-30T18:30:00.000Z", "2014-01-05T18:30:00.000Z"],
			// 	["false", "52e125c7c210b21132c98264", "52aec7ae1c80a8130567ac63", "44444", "s", "44444444", null, "2013-12-30T18:30:00.000Z", "2013-12-30T18:30:00.000Z"]
			// ];
		}, function(data) {
			flash.pop({
				title: 'Alert',
				body: data.data,
				type: 'error'
			});
			$scope.Loader = false;
		});

		//        $scope.selectedTab="tariff";
	}

	$scope.redirectTobillright = function(path) {
		$location.path($state.current.name.split('.')[0] + path);

	};

	$scope.checkAll = function($event) {



		var checkbox = $event.target;
		var action = (checkbox.checked ? 'add' : 'remove');
		if (action === 'add') {
			angular.forEach($scope.list, function(element, i) {
				if (i > 0) {
					$scope.list[i][0] = true;
					$('[name="chk_' + i + '"]').prop('checked', true);
				}
			});

		} else if (action === 'remove') {
			angular.forEach($scope.list, function(element, i) {
				if (i > 0) {
					$scope.list[i][0] = false;
					$('[name="chk_' + i + '"]').prop('checked', false);
				}
			});
		}
	}

	$scope.updateSelection = function($event, accountId, accountNum, arrIndex) {
		var checkbox = $event.target;
		var action = (checkbox.checked ? 'add' : 'remove');
		if (action === 'add') {
			$scope.list[arrIndex][0] = true;
			// $scope.selectedIdsOnly.push(accountId);
			// $scope.accountNumber.push({
			// 	"id": accountId,
			// 	"v": accountId,
			// 	"n": accountNum
			// });
			// $scope.selected.push({
			// 	"id": accountId,
			// 	"v": accountId,
			// 	"n": accountNum
			// });
		} else if (action === 'remove') {
			$scope.list[arrIndex][0] = false;
			// $scope.accountNumber.splice($scope.accountNumber.indexOf({
			// 	"id": accountId,
			// 	"v": accountId,
			// 	"n": accountNum
			// }), 1);
			// $scope.selected.splice($scope.selected.indexOf({
			// 	"id": accountId,
			// 	"v": accountId,
			// 	"n": accountNum
			// }), 1);
			// $scope.selectedIdsOnly.splice($scope.selectedIdsOnly.indexOf(accountId), 1);

		}
		// else if (action === 'add') {
		// 	checkbox.checked = false;
		// 	// checkbox.prop("checked", false);
		// 	// $event.target.checked
		// 	flash.pop({
		// 		title: 'Alert',
		// 		body: "Already selected..!",
		// 		type: 'info'
		// 	});
		// }
		// console.log("Update selection $scope.accountNumber-" + $scope.accountNumber);
		// console.log("Update selection $scope.selectedIdsOnly-" + $scope.selectedIdsOnly);
		// console.log($scope.list[arrIndex]);

	};

	$scope.GetSelectedAccountsandIds = function() {
		$scope.accountNumber = [];
		$scope.selected = [];
		$scope.selectedIdsOnly = [];
		angular.forEach($scope.list, function(element, i) {
			//angular.forEach(element, function(e) {
			if (i > 0) {
				// if (element[0] === false && $scope.selectedIdsOnly.indexOf(element[2]) !== -1) {
				// 	$scope.accountNumber.splice($scope.accountNumber.indexOf({
				// 		"id": element[2],
				// 		"v": element[2],
				// 		"n": element[3]
				// 	}), 1);
				// 	$scope.selected.splice($scope.selected.indexOf({
				// 		"id": element[2],
				// 		"v": element[2],
				// 		"n": element[3]
				// 	}), 1);
				// 	$scope.selectedIdsOnly.splice($scope.selectedIdsOnly.indexOf(element[2]), 1);

				// } else
				if (element[0] === true && $scope.selectedIdsOnly.indexOf(element[2]) === -1) {
					$scope.selectedIdsOnly.push(element[2]);
					$scope.accountNumber.push({
						"id": element[2],
						"v": element[2],
						"n": element[3]
					});
					$scope.selected.push({
						"id": element[2],
						"v": element[2],
						"n": element[3]
					});

				}
			}
			//}
		});
	}

	$scope.getTariffInfo = function(index, id) {
		if ($scope.isRowCollapsed[index] == undefined)
			$scope.isRowCollapsed[index] = true;
		$scope.isRowCollapsed[index] = !$scope.isRowCollapsed[index];
		var cnt = 0;

		if (_.isUndefined($scope.list[index].doc)) {
			$scope.list[index].dataPresent = true;
			//$scope.dataLoader = true;
			var promise = commonService.ajaxCall('GET', '/api/tms/' + id);
			promise.then(function(result) {
				//$scope.dataLoader = false;

				if (result.sharedWithEdit == undefined) {
					result.sharedWithEdit.Groups = [];
					result.sharedWithEdit.Users = [];
				}
				if (result.sharedWithView == undefined) {
					result.sharedWithView.Groups = [];
					result.sharedWithView.Users = [];
				}
				$scope.TariffInfo = result;
				$scope.list[index].doc = result;
				$scope.list[index].isHistoryOpen = false;
				$scope.list[index].dataPresent = false;
				for (cnt = 0; cnt < $scope.TariffInfo.fields.length; cnt++) {
					if ($scope.TariffInfo.fields[cnt].key == "station") {
						$scope.stationKeyID = cnt;
					} else if ($scope.TariffInfo.fields[cnt].key == "region") {
						$scope.regionKeyID = cnt;
					}
				}

				$scope.getHistoryTemplate(index, id);
				// $scope.TariffTemp.fields[index].firstFlag = true;
			}, function(result) {
				//$scope.dataLoader = false;
				$scope.list[index].dataPresent = false;
				flash.pop({
					title: 'Alert',
					body: "Please try after sometime..!",
					type: 'error'
				});
			});
		}
	}
	$scope.onFileSelect = function($files, index) {
		//$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; i < $files.length; i++) {
			var file = $files[i];
			$scope.upload = $upload.upload({
				url: '/api/tms/upload/file',
				dataType: 'json',
				file: file
			}).success(function(data, status, headers, config) {
				// file is uploaded successfully
				//$scope.revisionFileID = data.msg.$oid;
				$scope.list[index].doc.revisionDocId = {
					"id": data.msg.$oid,
					"t": "",
					"v": file.name
				};
				$scope.list[index].doc.showRevision = true;
				//$scope.showRevision = true;

			});

		}
	};
	$scope.undoFileUpload = function(index) {
		$scope.list[index].doc.showRevision = false;
		//obj.revisionDocId = {};
	}

	$scope.getRuleFields = function() {
		var promise = commonService.ajaxCall('GET', 'api/dataSources?type=tms');
		promise.then(function(data) {
			angular.forEach(data, function(i) {
				$scope.fields[i.key] = {
					type: i.type,
					label: i.label
				};
			});
		}, function(data) {
			flash.pop({
				title: 'Alert',
				body: data.data,
				type: 'error'
			});
		});

	}
	$scope.setPage = function() {
		setTimeout(function() {
			getFilteredData(angular.element("ul.pagination li.active.ng-scope").scope().page.number, false);
		}, 300);
	};
	$scope.setAccounts = function(acc) {
		//		console.log(acc);
		// $scope.accounts = angular.copy(acc);
		$scope.accountGlobal = angular.copy(acc);
		// $scope.accountNumber = angular.copy(acc);
		if (acc.length > 0)
			$scope.accounts = $filter('toArrayId')(acc).split(',');
		else {
			$scope.accounts = [];
			$scope.list = [];
			$scope.showGoBtn = false;
		}



	};
	$scope.reset = function() {
		$scope.rule.conditions = {};
	}

	$scope.getData = function() {

		var rulesData = {};
		rulesData.ruleDef = {};
		rulesData.generateJson = function(root, data) {
			var ruleParents = root.find(' > div[group="condition"]');
			data.condition = root.find(' > div.inz-chk > input')[0].checked ? 'and' : 'or';
			data.level = root.parent().attr('index');
			data.fields = [];
			var rule = {};
			for (var k = 0; k < ruleParents.length; k++) {
				var fields = ruleParents.eq(k).find('[cname]');
				if (!fields[0].hasAttribute('disabled') && fields[0].value != '-1') {
					rule = {};
					for (var j = 0; j < fields.length; j++) {
						rule[fields.eq(j).attr('cname')] = fields.eq(j).val();
					}
					data.fields.push(rule);
				}
			}
			var nextRoot = root.find(' > div[index]');
			for (var i = 0; i < nextRoot.length; i++) {
				if (!nextRoot.eq(i).find(' > div.sub-condition > button')[0].hasAttribute('disabled')) {
					data.fields.push({});
					rulesData.generateJson(nextRoot.eq(i).find(' > div.sub-condition'), data.fields[data.fields.length - 1]);
				}
			}
		}

		rulesData.generateJson($('div[ng-form="rulesForm"] > div > div.row > div.sub-condition'), rulesData.ruleDef);
		filterObj = {
			rules: rulesData.ruleDef,
			accounts: $scope.accounts
			//			accounts: ["52aec82c1c80a813874f8529",
			//				"52aec7ae1c80a8130567ac63"
			//			]
		};

		if (filterObj.rules.fields.length <= 0) {
			flash.pop({
				title: 'No filter conditions',
				body: 'No conditions to apply filter',
				type: 'info'
			});
		} else
			getFilteredData(1, true);
	}
	//};
	$scope.SaveOldToNew = function(id, curObj, sendAccountId) {
		//		console.log("SaveOldToNew:" + id);
		var obj = {};
		obj.docType = "tms";
		obj.fields = angular.copy(curObj.fields);
		obj.id = id;
		obj.presentDocId = {
			id: curObj.fileId,
			t: "",
			v: curObj.fileName
		};


		$scope.SaveAccountDocs(obj, sendAccountId);
	}

	$scope.confirmToSetCurrent = function(id, curObj, sendAccountId) {
		var modalInstance = $modal.open({
			templateUrl: 'confirm.html',
			controller: 'modalInstanceCtrl',
			resolve: {
				items: function() {
					return angular.copy({
						msg: 'Are you sure? You want to set this as current data?'
					});
				}
			}
		});
		modalInstance.result.then(function(selectedItem) {
			$scope.SaveOldToNew(id, curObj, sendAccountId);
		}, function(selectedItem) {
			//$scope.loader = false;
			console.log('Modal dismissed ');
		});

	}
	$scope.SaveAccountDocs = function(sendObj, sendAccountId) {
		//validate Effective, Expiry and Received Date before saving
		var flgContinue = true;
		var errMsg = '';

		if (sendObj.sharedWithEdit == undefined) {
			sendObj.sharedWithEdit.Groups = [];
			sendObj.sharedWithEdit.Users = [];
		}
		if (sendObj.sharedWithView == undefined) {
			sendObj.sharedWithView.Groups = [];
			sendObj.sharedWithView.Users = [];
		}

		for (var i = 0; i < sendObj.fields.length; i++) {
			if (sendObj.fields[i].label == "Effective Date")
				$scope.effectiveDate = $filter('date')(sendObj.fields[i].value, "yyyy-MM-dd"); //.split('T')[0];
			if (sendObj.fields[i].label == "Received Date")
				$scope.receivedDate = $filter('date')(sendObj.fields[i].value, "yyyy-MM-dd"); //.split('T')[0];
			if (sendObj.fields[i].label == "Expiry Date")
				$scope.expiryDate = $filter('date')(sendObj.fields[i].value, "yyyy-MM-dd"); //.split('T')[0];
		}
		errMsg = "";
		if ($scope.effectiveDate > $scope.expiryDate) {
			flgContinue = false;
			errMsg = errMsg + "Effective Date should be less than Expiry Date.";
		}
		if ($scope.receivedDate > $scope.effectiveDate) {
			flgContinue = false;
			errMsg = errMsg + "Received Date should be less than Effective Date.";
		}
		if ($scope.receivedDate > $scope.expiryDate) {
			flgContinue = false;
			errMsg = errMsg + "Received Date should be less than Expiry Date.";
		}

		if (flgContinue) {
			// added to switch files during revision and setting exiting revision to blank while saving
			if ("revisionDocId" in sendObj) {
				var temp = sendObj.presentDocId;
				sendObj.presentDocId = angular.copy(sendObj.revisionDocId);
				sendObj.showRevision = false;
				sendObj.revisionDocId = {};
			}

			var obj = [];
			obj.push(sendObj);
			var accountId = [];
			accountId.push(sendAccountId);

			var objSave = {
				"accounts": accountId,
				"data": obj
			};
			//$scope.$parent.$parent.loader = true;
			var promise = commonService.ajaxCall('PUT', '/api/tms', objSave);
			promise.then(function(data) {
				//$scope.$parent.$parent.loader = false;
				flash.pop({
					title: 'Success',
					body: data,
					type: 'success'
				});
				$scope.quickSearch($scope.currentPage, true, $scope.selectedTab);

				//$scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account');
			}, function(data) {
				//$scope.$parent.$parent.loader = false;
				flash.pop({
					title: 'Fail',
					body: data.msg,
					type: 'alert'
				});
			});
		} else {
			flash.pop({
				title: 'Error',
				body: errMsg,
				type: 'error'
			});
		}
	}

	$scope.openDialog = function() {
		$scope.GetSelectedAccountsandIds();
		//console.log(selectedAccounts);
		//var selectedAccounts = angular.copy($scope.selected);
		//replaced $scope.selected with  $scope.accountGlobal below by sushrut
		//		console.log($scope.selected);

		if ($scope.accountGlobal == undefined) {
			flash.pop({
				title: 'Alert',
				body: 'Please select Account first',
				type: 'error'
			});

			return;
		}
		if ($scope.accountGlobal.length == 0) {
			flash.pop({
				title: 'Alert',
				body: 'Please select Account first',
				type: 'error'
			});

			return;
		}

		$scope.Loader = true;
		if ($scope.accountGlobal.length > 0) {
			if ($scope.accountGlobal.length == 1) {
				//send account number and get all data and display check if already any data available for that account then display this 
				//otherwise display Upload  (new) form
				var promise = commonService.ajaxCall('GET', '/api/tms?&accountId=' + $scope.accountGlobal[0].id);
				promise.then(function(result) {
					$scope.Loader = false;
					if (result.fields.length > 0) {
						//$scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/edit');
						var modalInstance = $modal.open({
							templateUrl: 'billRightTmsEdit.html',
							controller: 'billRightTmsCtrl',
							resolve: {
								items: function() {
									return angular.copy($scope.accountGlobal);
								}
							}
						});
						modalInstance.result.then(function(Items) {}, function(Items) {});

					} else {
						var modalInstance = $modal.open({
							templateUrl: 'billRightTmsUpload.html',
							controller: 'billRightTmsCtrl',
							resolve: {
								items: function() {
									return angular.copy($scope.accountGlobal);
								}
							}
						});
						modalInstance.result.then(function(Items) {}, function(Items) {});
						//$scope.Loader = false;
					}
					//$scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/Upload');


				}, function(result) {
					$scope.Loader = false;
					flash.pop({
						title: 'Alert',
						body: "Please try after sometime..!",
						type: 'error'
					});
				});
			} else {
				$scope.Loader = false;
				var modalInstance = $modal.open({
					templateUrl: 'billRightTmsUpload.html',
					controller: 'billRightTmsCtrl',
					resolve: {
						items: function() {
							return angular.copy($scope.accountGlobal);
						}
					}
				});
				modalInstance.result.then(function(Items) {}, function(Items) {});
			}
		} else {
			$scope.Loader = false;
			flash.pop({
				title: 'Information',
				body: "No account selected!.",
				type: 'warning'
			});
			//$scope.$parent.showGrid = true;
			//$scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account');
		}

	};

	$scope.applyFilter = function() {
		filterObj = {
			rules: {
				condition: 'and',
				level: 0,
				fields: []
			},
			accounts: $scope.accounts
		}

		for (var k in $scope.filter) {
			if ($scope.filter.hasOwnProperty(k)) {
				if (angular.isArray($scope.filter[k]))
					for (var i = 0; i < $scope.filter[k].length; i++)
						filterObj.rules.fields.push({
							name: k,
							operator: 'equalTo',
							value: $scope.filter[k][i].n
						});
				else
					filterObj.rules.fields.push({
						name: k,
						operator: 'equalTo',
						value: $scope.filter[k]
					});
			}
		}
		getFilteredData(1, true);
	}

	$scope.resetFilter = function() {
		for (var k in $scope.filter)
			if ($scope.filter.hasOwnProperty(k) && $scope.filter[k]) {
				$scope.filter[k] = null;
				$('input[name="' + k + '"]').select2('val', null);
			}
	};



	$scope.getHistoryTemplate = function(index, id) {
		$scope.historyLoader = true;
		//$scope.Parentindex = index;
		var promise = commonService.ajaxCall('GET', '/api/history?&q=' + id + '&pageLimit=-1&pageNo=1');
		promise.then(function(result) {
			$scope.historyLoader = false;
			$scope.list[index].historyTemp = result;
			//$scope.historyTemp = result;
			// for (var j = 0; j <= $scope.list[index].historyTemp.history.length - 1; j++)
			// 	$scope.list[index].historyTemp.history[j].firstFlag = false;
			if ($scope.list[index].historyTemp.history.length == $scope.list[index].historyTemp.count) {
				//$scope.showLoadmore = false;
				$scope.disableLoadmore = true;
			} else {
				$scope.disableLoadmore = false;
			}
		}, function(result) {
			$scope.historyLoader = false;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});
	}

	$scope.getHistory = function(parentIndex, index, data) {
		//if ($scope.list[parentIndex].historyTemp.history[index].firstFlag == false) {
		var promise = commonService.ajaxCall('GET', '/api/history/' + data.id + '');
		promise.then(function(result) {
			//$scope.companyListLoader = false;

			$scope.list[parentIndex].historyTemp.history[index].historyData = result;
			$scope.list[parentIndex].historyData = result;
			//$scope.list[$scope.Parentindex].historyTemp.history[index].firstFlag = true;
			for (var j = 0; j <= $scope.list[parentIndex].historyTemp.history.length - 1; j++)
				$scope.list[parentIndex].historyTemp.history[j].isHistoryOpen = false;
			$scope.list[parentIndex].historyTemp.history[index].isHistoryOpen = true;
			$scope.list[parentIndex].isHistoryOpen = true;
		}, function(result) {
			//$scope.companyListLoader = false;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});
		//}
	};

	$scope.ReturnToCurrent = function(index) {
		$scope.list[index].isHistoryOpen = false;
		for (var j = 0; j <= $scope.list[index].historyTemp.history.length - 1; j++)
			$scope.list[index].historyTemp.history[j].isHistoryOpen = false;
	}

	function dateConvert(dateobj1, format) {
		var dateobj = new Date(dateobj1);
		var year = dateobj.getFullYear();
		var month = ("0" + (dateobj.getMonth() + 1)).slice(-2);
		var date = ("0" + dateobj.getDate()).slice(-2);
		var hours = ("0" + dateobj.getHours()).slice(-2);
		var minutes = ("0" + dateobj.getMinutes()).slice(-2);
		var seconds = ("0" + dateobj.getSeconds()).slice(-2);
		var day = dateobj.getDay();
		var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
		var dates = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
		var converted_date = "";

		switch (format) {
			case "YYYY-MMM-DD DDD":
				converted_date = year + " - " + months[parseInt(month, 10) - 1] + " - " + date + "" + dates[parseInt(day, 10)];
				break;
			case "YYYY - MM - DD ":
				converted_date = year + " - " + month + " - " + date;
				break;
			case "dd-MMM-yyyy":
				converted_date = date + " - " + months[parseInt(month, 10) - 1] + " - " + year;
				break;
			case "dd-MM-yyyy":
				converted_date = date + "-" + month + "-" + year;
				break;
		}

		return new Date(converted_date);
	}

	$scope.editTemplate = function(index) {

		var promise = commonService.ajaxCall('GET', '/api/template/default?type=tms');
		promise.then(function(result) {
			var modalInstance = $modal.open({
				templateUrl: 'fieldsConfig.html',
				controller: 'fieldsConfigCtrl',
				resolve: {
					items: function() {
						return angular.copy(result[0]);
					}
				}
			});
			modalInstance.result.then(function(data) {

				console.log('Modal dismissed successfully');
			}, function(selectedItem) {
				console.log('Modal dismissed ');
			});
		}, function(result) {

			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});



	}

	$scope.openUsersDialog = function(index) {

		//        var promise = commonService.ajaxCall('GET', '/api/template/default?type=tms');
		//        promise.then(function(result) {
		var modalInstance = $modal.open({
			templateUrl: 'docManagementUserGroup.html',
			controller: 'docManagementUserGroupctrl',
			resolve: {
				items: function() {
					//                        return angular.copy(result[0]);
				}
			}
		});
		modalInstance.result.then(function(data) {

			console.log('Modal dismissed successfully');
		}, function(selectedItem) {
			console.log('Modal dismissed ');
		});
		//        }, function(result) {
		//
		//            flash.pop({
		//                title: 'Alert',
		//                body: "Please try after sometime..!",
		//                type: 'error'
		//            });
		//        });



	}

	$scope.changeData = function(controlkey, controlValue, index, parentIndex) {
		//        console.log(parentIndex);
		if (controlkey == "station") {
			if (controlValue != undefined) {
				$scope.list[parentIndex].doc.fields[$scope.regionKeyID].value = controlValue[0].v;
			}
		}
	}

	$scope.downloadDocument = function(idx) {
		//        if($scope.isGroupSelected){
		//            $.get('/api/tms/download/file?id=' + $scope.list[idx].DocId, function(retData) {
		$("body").append("<iframe src='/api/tms/download/file?id=" + $scope.list[idx][10] + "' style='display: none;' ></iframe>");
		//            });
		//        }else {
		//            $.get('api/tariffLane?templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + $scope.currentPage + "&isExcel=true&systemId=" + $rootScope.loggedInUser.userSystem[0].id + "&account=" + $scope.global.account[0].n, function (retData) {
		//                $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
		//            });
		//        }
		commonService.hideDropPanel();

	};

});