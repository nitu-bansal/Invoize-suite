angularApp.controller('companyCtrl', function($scope, $rootScope, $http, $location, $stateParams, $state, $route, $routeParams, $modal, $compile, commonService, flash, Restangular) {

	$scope.formModel = {};
	var baseCompanies = Restangular.all('company');
	var baseTemplates = Restangular.all('template');
	var counter = 2;
	var historyCounter = 2;
	$scope.showLoadmore = true;
	$scope.disableLoadmore = false;

	// field definition here - could also pull from server
	$scope.company = {};
	$scope.companyData = {};
	$scope.historyData = {
		// fields: [{
		// 	value: 'LLP',
		// 	label: "Company Name"
		// }, {
		// 	value: 'Searce',
		// 	label: "Parent Company"
		// }, {
		// 	value: 'Pune',
		// 	label: "Address1"
		// }]
	};
	// $scope.historyTemp = {
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
	$scope.historyTemp = [];

	$scope.compView = {
		id: "31313",
		fields: [{
			value: '',
			label: "Company Name"
		}, {
			value: '',
			label: "Parent Name"
		}, {
			value: '',
			label: "Address"
		}, {
			value: '',
			label: "Zip"
		}]
	};

	$scope.items = [{
		name: 'username',
		val: '',
		maxLength: '2',
		regex: "/^[a-zA-Z]+$/",
		isRequired: true
	}, {
		name: 'password',
		val: '',
		maxLength: 2,
		regex: "/^[a-zA-Z]+$/",
		isRequired: true
	}, {
		name: 'email',
		val: '',
		maxLength: 2,
		regex: "/^[a-zA-Z]+$/",
		isRequired: false
	}];
	$scope.companyList = [];

	/*$scope.TcompanyList = [{
		id: '1',
		title: "companyname value",
		fields: [{
			label: "Parent Company",
			value: "ABC"
		}, {
			label: "City",
			value: "pune"
		}, {
			label: "Company Country",
			value: "India"
		}]
	}, {
		id: '2',
		title: "xyz",
		fields: [{
			label: "Parent Company",
			value: "XYZ"
		}, {
			label: "City",
			value: "NY"
		}, {
			label: "Company Country",
			value: "US"
		}]
	}];*/

	//-get template default
	$scope.initialize = function() {

		Restangular.one('template/default', '').get({
			type: 'company'
		}).then(function(result) {
				//-$scope.userDetailLoader = false;
				$scope.companyData = result;

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

	};
	//get template after updating
	//also add templateId in object after getting object
	$scope.getTemplate = function(templateId) {

		Restangular.one('template', templateId).get({
			type: 'company'
		}).then(function(result) {
			//$scope.companyData = $scope.Tfields;
			$scope.companyData = result;

			$scope.companyData.templateId = templateId;

		}, function(result) {
			//$scope.companyData = $scope.Tfields;
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
		var itemToSend = $scope.companyData;
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
			//here read company not template when we are updating an existing saved company template
			$scope.getTemplate(selectedItem);
			console.log(selectedItem);
		}, function(selectedItem) {
			console.log('Modal dismissed ');
		});
	};

	$scope.openDialogUpdateTemplate = function(data, view) {
		// $scope.companyData.templateId = templateId;
		Restangular.one('template', data.templateId).get({
			type: 'company'
		}).then(function(result) {
			$scope.companyData = result;
            for (var i = 0; i < $scope.companyData.fields.length; i++) {
                if(!$scope.companyData.fields[i].isDependent)
                    $scope.companyData.fields[i].isDependent=false;

            }
			$scope.companyData.templateId = data.templateId;
			var modalInstance = $modal.open({
				templateUrl: 'fieldsConfig.html',
				controller: 'fieldsConfigCtrl',
				resolve: {
					items: function() {
						return angular.copy($scope.companyData);
					}
				}
			});
			modalInstance.result.then(function(selectedItem) {
				//here read company not template when we are updating an existing saved company template
				if (view)
					$scope.companyView($routeParams.companyId);
				else
					$scope.companyEditView($routeParams.companyId);

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

	$scope.create = function(company) {
		$scope.companyCreateLoader = true;
		commonService.loader(true);
		baseCompanies.post(company).then(function(msg) {
				counter = 2;
				$scope.getCompanyList();
				flash.pop({
					title: 'Success',
					body: msg.msg,
					type: 'success'
				});
				//-$scope.selectGroup(msg.id);
				// $location.path("wizard/company/view");
				commonService.loader();
				$scope.redirectTo("/company/view");
				$scope.companyCreateLoader = false;
			},
			function(msg) {
				$scope.companyCreateLoader = false;
				commonService.loader();
				//$location.path("wizard/company/view");
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			}
		);
	}


	//function to read details
	$scope.companyView = function(value) {
		$scope.companyDetailLoader = true;
		Restangular.one('company', value).get().then(function(result) {
				$scope.companyDetailLoader = false;
				$scope.company = result;
				$scope.redirectTo("/company/details/" + value);
			},
			function(result) {
				$scope.companyDetailLoader = false;
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
		$scope.companyUpdateLoader = true;
		commonService.loader(true);
		$scope.company.id = $routeParams.companyId;

		$scope.company.put().then(function(data) {
				console.log(data.msg);
				$scope.getCompanyList();
				flash.pop({
					title: 'Success',
					body: data.msg,
					type: 'success'
				});
				$scope.redirectTo("/company/view");
				commonService.loader();
				$scope.companyUpdateLoader = false;

			},
			function(data) {
				$scope.companyUpdateLoader = false;
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.msg,
					type: 'error'
				});
			}
		);
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
	//function to read data and redirect to update page
	$scope.companyEditView = function(value) {
		$scope.companyUpdateLoader = true;
		Restangular.one('company', value).get().then(function(result) {
				$scope.company = result;
				$scope.redirectTo("/company/edit/" + value);
				$scope.getHistoryTemplate(value);
				//$scope.companyData = result;
				$scope.companyUpdateLoader = false;

			},
			function(result) {
				$scope.companyUpdateLoader = false;
				flash.pop({
					title: 'Alert',
					body: "Please try after sometime..!",
					type: 'error'
				});
			}
		);
	};
	$scope.getCompanyList = function() {
		$scope.companyListLoader = true;
		commonService.loader(true);
		baseCompanies.getList({
			pageLimit: 100,
			pageNo: 1
		}).then(function(result) {
			$scope.companyListLoader = false;
			$scope.companyList = result;
			//$scope.companyList = $scope.TcompanyList;
			if (result.length < 1)
				$scope.redirectTo("/company/new");
			// $location.path("wizard/company/new");

			commonService.loader();
		}, function(result) {
			$scope.companyListLoader = false;
			commonService.loader();
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});
	};
	$scope.searchCompany = function(q) {
		$scope.companyListLoader = true;
		var promise = commonService.ajaxCall('GET', '/api/company?pageLimit=100&pageNo=1&q=' + q + '');
		promise.then(function(result) {
			$scope.companyListLoader = false;
			$scope.companyList = result;
			// if (result.length < 1)
			// 	$scope.redirectTo("/company/new");
			// $location.path("wizard/company/new");
		}, function(result) {
			$scope.companyListLoader = false;
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
				$scope.getCompanyList();
				//-$scope.getTotalUser();
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'success'
				});
				// $scope.userUpdateLoader = false;
				$scope.redirectTo("/company/view");
				// $location.path("wizard/company/view");
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
			"companyId": id
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
			//$scope.delete(selectedItem);
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
	$scope.backToView = function() {
		$scope.getCompanyList();
		$scope.redirectTo("/company/view");
		// $location.path("wizard/company/view");
	};

	$scope.loadMore = function() {
		baseCompanies.getList({
			pageLimit: 100,
			pageNo: counter
		}).then(function(result) {
			counter += 1;
			// $scope.loadingRates = false;		
			// $scope.companyList = result;
			$scope.companyList = $scope.companyList.concat(result);


		}, function(result) {
			//$scope.companyList = $scope.TcompanyList;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});
	};
	$scope.loadMoreHistory = function() {
		$scope.historyLoader = true;
		var promise = commonService.ajaxCall('GET', '/api/history?&q=' + $routeParams.companyId + '&pageLimit=5&pageNo=' + historyCounter);
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

	$scope.redirectTo = function(path) {
		//redirect based on wizard / organizationsetup
		$scope.companyData = {};
		$location.path($state.current.name.split('.')[0] + path);

	};

	$scope.companyTree = '';
	$scope.getTreeData = function() {
		$scope.templateLoader = true;
		var promise = commonService.ajaxCall('GET', '/api/treeview?type=company');
		promise.then(function(result) {
			$("#left").hide();
			$scope.companyTree = result;

			setTimeout(function() {
				$('#organisation').orgChart({
					container: $("#main")
				});
				if ($('.btn-pop').length > 0) {
					$('.btn-pop').popover({
						html: true
					});
				}
				$("#left").hide();
				$('.loader-backdrop').fadeOut(500);
			}, 500);

		}, function(result) {
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
			$scope.templateLoader = false;
		});
	}

	$scope.getTreeData();


	$scope.oneAtATime = true;

	$scope.groups = [{
		title: "Dynamic Group Header - 1",
		content: "Dynamic Group Body - 1"
	}, {
		title: "Dynamic Group Header - 2",
		content: "Dynamic Group Body - 2"
	}];

	$scope.items = ['Item 1', 'Item 2', 'Item 3'];

	$scope.addItem = function() {
		var newItemNo = $scope.items.length + 1;
		$scope.items.push('Item ' + newItemNo);
	};
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

				// var x = temp.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
				//                      if (offset == 0)
				//                              return(str.toUpperCase());
				//                      else
				//                              return(str.substr(0,1) + " " + str.substr(1).toUpperCase());
				//                      })

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
			//strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp " + $scope.toHumanReadable(i.n) + ": " + i.v + "</small></br>";
		});

		// strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp chargeType: " + $scope.selectedRequestHistory.chargeType + "</small> </br>";
		// strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp Rate Qualifier: " + $scope.selectedRequestHistory.rateQualifier + "</small> </br>";

		// strHTML = strHTML + "<i class='icon-caret-right green'></i><small>&nbsp&nbsp Weight Brackets:&nbsp&nbsp</small>";
		// angular.forEach($scope.selectedRequestHistory.weightBracket, function(i, j) {
		// 	strHTML = strHTML + "<small>" + i.s + "&nbsp&nbsp-&nbsp&nbsp" + i.e + "&nbsp&nbsp-&nbsp&nbsp" + i.v + "</small>";
		// });
		$("#" + id).html($compile(strHTML)($scope));
	}
	// $scope.getHistory = function(historyId) {
	// 	var promise = commonService.ajaxCall('GET', '/api/history/' + historyId + '');
	// 	promise.then(function(result) {
	// 		//$scope.companyListLoader = false;
	// 		$scope.historyData = result;
	// 	}, function(result) {
	// 		//$scope.companyListLoader = false;
	// 		flash.pop({
	// 			title: 'Alert',
	// 			body: "Please try after sometime..!",
	// 			type: 'error'
	// 		});
	// 	});

	// };
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
				//$scope.rendorHtml(id);
				$scope.historyTemp.history[id].historyData = result;
				$scope.historyTemp.history[id].firstFlag = true;
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