angularApp.controller('systemCtrl', function($scope, $rootScope, $http, $location, $state, $route, $routeParams, $modal, commonService, $compile, flash, Restangular) {

	var baseSystems = Restangular.all('system');
	var counter = 2;
	var historyCounter = 2;
	$scope.showLoadmore = true;
	$scope.disableLoadmore = false;
	// field definition here - could also pull from server
	$scope.system = {};
	$scope.systemData = {};
	$scope.historyData = {
		// fields: [{
		// 	value: 'Class',
		// 	label: "System Name"
		// }, {
		// 	value: 'Searce',
		// 	label: "System Company"
		// }]
	};
	$scope.historyTemp = [];
	// {
	// 	history: [{
	// 		id: 101,
	// 		emailID: "a.a@searce.com",
	// 		timestamp: "02 DEC 13"
	// 	}, {
	// 		id: 102,
	// 		emailID: "s.s@searce.com",
	// 		timestamp: "15 DEC 13"
	// 	}]
	// };

	$scope.systemList = [];

	$scope.redirectTo = function(path) {
		//redirect based on wizard / organizationsetup
		$location.path($state.current.name.split('.')[0] + path);

	};
	$scope.initialize = function() {
		Restangular.one('template/default', '').get({
			type: 'system'
		}).then(function(result) {
			// $scope.systemData = $scope.Tfields;
			$scope.systemData = result;
		}, function(result) {
			//$scope.systemData = $scope.Tfields;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});
	};
	//get template after updating
	//also add templateId in object after getting object
	$scope.getTemplate = function(templateId) {
		Restangular.one('template', templateId).get({
			type: 'system'
		}).then(function(result) {
			//$scope.systemData = $scope.Tfields;			
			$scope.systemData = result;
			$scope.systemData.templateId = templateId;


		}, function(result) {
			//$scope.systemData = $scope.Tfields;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});
	};

	$scope.openDialog = function(data) {
		var templateId = "default";
		if ('templateId' in data) {
			templateId = data.templateId;
		}
		var itemToSend = $scope.systemData;
		itemToSend.templateId = templateId;
		var modalInstance = $modal.open({
			templateUrl: 'fieldsConfig.html',
			controller: 'fieldsConfigCtrl',
			resolve: {
				items: function() {
					return angular.copy(itemToSend);
				}
			}
		});
		modalInstance.result.then(function(selectedItem) {
			$scope.getTemplate(selectedItem);
			console.log(selectedItem);
		}, function(selectedItem) {
			console.log('Modal dismissed ');
		});
	};

	$scope.openDialogUpdateTemplate = function(data) {
		// $scope.companyData.templateId = templateId;
		Restangular.one('template', data.templateId).get({
			type: 'system'
		}).then(function(result) {
			$scope.systemData = result;
            for (var i = 0; i < $scope.systemData.fields.length; i++) {
                if(!$scope.systemData.fields[i].isDependent)
                    $scope.systemData.fields[i].isDependent=false;

            }
			$scope.systemData.templateId = data.templateId;
			var modalInstance = $modal.open({
				templateUrl: 'fieldsConfig.html',
				controller: 'fieldsConfigCtrl',
				resolve: {
					items: function() {
						return angular.copy($scope.systemData);
					}
				}
			});
			modalInstance.result.then(function(selectedItem) {
				//here read company not template when we are updating an existing saved company template
				$scope.systemEditView($routeParams.systemId);

				console.log(selectedItem);
			}, function(selectedItem) {
				console.log('Modal dismissed ');
			});

		}, function(result) {
			//$scope.companyData = $scope.Tfields;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});

		});


	};

	$scope.create = function(system) {
		$scope.systemCreateLoader = true;
		commonService.loader(true);
		baseSystems.post(system).then(function(msg) {
				counter = 2;
				$scope.getSystemList();
				flash.pop({
					title: 'Success',
					body: msg.msg,
					type: 'success'
				});
				//$location.path("wizard/system/view");
				commonService.loader();
				$scope.redirectTo("/system/view");
				$scope.systemCreateLoader = false;
			},
			function(msg) {
				commonService.loader();
				$scope.systemCreateLoader = false;
				flash.pop({
					title: 'Alert',
					body: msg.data.msg,
					type: 'error'
				});
			}
		);
	}

	$scope.systemView = function(value) {
		Restangular.one('system', value).get().then(function(result) {
				//-$scope.userDetailLoader = false;
				$scope.system = result;
				//$location.path("wizard/system/details/" + value);
				$scope.redirectTo("system/details/" + value);
			},
			function(result) {
				//-$scope.userDetailLoader = false;
				flash.pop({
					title: 'Alert',
					body: "Please try after sometime..!",
					type: 'error'
				});
			}
		);

	}

	//function for update data
	$scope.update = function() {
		$scope.systemUpdateLoader = true;
		commonService.loader(true);
		$scope.system.id = $routeParams.systemId;
		$scope.system.put().then(function(data) {
				console.log(data.msg);
				$scope.getSystemList();
				flash.pop({
					title: 'Success',
					body: data.msg,
					type: 'success'
				});
				$scope.systemUpdateLoader = false;
				commonService.loader();
				$scope.redirectTo("/system/view");
			},
			function(data) {
				$scope.systemUpdateLoader = false;
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.msg,
					type: 'error'
				});
			}
		);
	};

	$scope.systemEditView = function(value) {
		Restangular.one('system', value).get().then(function(result) {
				$scope.system = result;
				$scope.getHistoryTemplate(value);
//				$scope.redirectTo("/system/edit/" + value);
			},
			function(result) {
				flash.pop({
					title: 'Alert',
					body: "Please try after sometime..!",
					type: 'error'
				});

			}
		);
	};

	$scope.getSystemList = function() {
		$scope.systemListLoader = true;
		commonService.loader(true);
		baseSystems.getList({
			pageLimit: 100,
			pageNo: 1
		}).then(function(result) {
			$scope.systemListLoader = false;
			$scope.systemList = result;
			commonService.loader();
			if (result.length < 1)
				$scope.redirectTo("/system/new");
		}, function(result) {
			$scope.systemListLoader = false;
			commonService.loader();
			//$location.path("wizard/system/view");
			$scope.redirectTo("/system/view");
			//-$scope.systemList = $scope.TsystemList;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});
	};


	$scope.loadMore = function() {
		baseSystems.getList({
			pageLimit: 100,
			pageNo: 1
		}).then(function(result) {
			counter += 1;
			$scope.systemList = $scope.systemList.concat(result);
		}, function(result) {
			//$scope.companyList = $scope.TcompanyList;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});
	};
	$scope.searchSystem = function(q) {
		$scope.systemListLoader = true;
		var promise = commonService.ajaxCall('GET', '/api/system?pageLimit=100&pageNo=1&q=' + q + '');
		promise.then(function(result) {
			$scope.systemListLoader = false;
			$scope.systemList = result;
//			if (result.length < 1)
//				$scope.redirectTo("/system/new");
		}, function(result) {
			$scope.systemListLoader = false;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});
	};
	$scope.delete = function(id) {
		//-$scope.userUpdateLoader = true;
		id.remove().then(function(msg) {
				$scope.getSystemList();
				//-$scope.getTotalUser();
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'success'
				});
				// $scope.userUpdateLoader = false;
				//$location.path("wizard/system/view");
				$scope.redirectTo("/system/view");
			},
			function(msg) {
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
				//-$scope.userUpdateLoader = false;
			}
		);
	}

	$scope.confirmDeleteProfile = function(id) {
		var itemToSend = {
			"systemId": id
		};
		var modalInstance = $modal.open({
			templateUrl: 'confirm.html',
			controller: 'modalInstanceCtrl',
			resolve: {
				items: function() {
					return angular.copy(itemToSend);
				}
			}
		});
		modalInstance.result.then(function(selectedItem) {
			//$scope.delete(system);
			console.log(selectedItem);
			flash.pop({
				title: 'Alert',
				body: 'functionality under construction',
				type: 'error'
			});

		}, function() {
			console.log('Modal dismissed');
		});
	};

	$scope.Profiling = function(obj) {
		$scope.redirectTo("/system/profile/" + obj.title + "/" + obj.id);
		/*var itemToSend = {
			//"systemId": id
		};
		var modalInstance = $modal.open({
			templateUrl: 'system.edit.profile.html',
			controller: 'profilesConfigCtrl',
			resolve: {
				items: function() {
					return angular.copy(itemToSend);
				}
			}
		});
		modalInstance.result.then(function(selectedItem) {
			//$scope.delete(system);
			console.log(selectedItem);
			flash.pop({
				title: 'Alert',
				body: 'functionality under construction',
				type: 'error'
			});

		}, function() {
			console.log('Modal dismissed');
		});*/
	};
	/*$modalInstance.close(undefined);*/
	$scope.backToView = function() {
		$scope.redirectTo("/system/view");
	};

	$scope.checkSystemListLength = function() {
		if ($scope.systemList.length < 1) { // your question said "more than one element"
			return true;
		} else {
			return false;
		}
	};

	$scope.getHistoryTemplate = function(id) {
		$scope.historyLoader = true;
		var promise = commonService.ajaxCall('GET', '/api/history?&q=' + id + '&pageLimit=5&pageNo=1');
		promise.then(function(result) {
			$scope.historyLoader = false;
			$scope.historyTemp = result;
			for (var j = 0; j <= $scope.historyTemp.history.length - 1; j++)
				$scope.historyTemp.history[j].firstFlag = false;
			if ($scope.historyTemp.history.length == $scope.historyTemp.count) {
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
	$scope.selectFormat = function(arr) {
		if (_.isArray(arr)) {
			if (arr.length < 1)
				return "N/A";
			var str = [];
			_.each(arr, function(val) {

				var temp = val['n'].toString().replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
				if (!_.isUndefined(str))
					temp = temp.replace(/\w\S*/g, function(txt) {
						return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
					});

				str.push(temp);
			});
			return str.join(", ");
		} else {
			if (_.isEmpty(arr))
				return "N/A";
			else
				return arr;
		}


	};

	$scope.rendorHtml = function(id) {
		var strHTML = "";
		angular.forEach($scope.historyData.fields, function(i, j) {
			strHTML = strHTML + "<div class='line'><div class='caption ng-binding'>" + i.label + " </div> <div class='data ng-scope ng-binding'>" + $scope.selectFormat(i.value) + "</div></div> ";
		});

		$("#" + id).html($compile(strHTML)($scope));
	}

	$scope.loadMoreHistory = function() {
		$scope.historyLoader = true;
		var promise = commonService.ajaxCall('GET', '/api/history?&q=' + $routeParams.systemId + '&pageLimit=5&pageNo=' + historyCounter);
		promise.then(function(result) {
			$scope.historyLoader = false;
			historyCounter += 1;
			$scope.historyTemp.history = $scope.historyTemp.history.concat(result.history);
			if ($scope.historyTemp.history.length == $scope.historyTemp.count) {
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

	};
	$scope.setFlag = function(id, data) {
		if ($scope.historyTemp.history[id].firstFlag == false) {
			$scope.historyTemp.history[id].firstFlag = true;
			$scope.getHistory(id, data);
		}
	}

	$scope.getHistory = function(id, data) {
		if ($scope.historyTemp.history[id].firstFlag == false) {
			var promise = commonService.ajaxCall('GET', '/api/history/' + data.id + '');
			promise.then(function(result) {
				//$scope.companyListLoader = false;
				$scope.historyData = result;
				$scope.historyTemp.history[id].historyData = result;
				$scope.historyTemp.history[id].firstFlag = true;
				//$scope.rendorHtml(id);
			}, function(result) {
				//$scope.companyListLoader = false;
				flash.pop({
					title: 'Alert',
					body: "Please try after sometime..!",
					type: 'error'
				});
			});
		}

	};

});