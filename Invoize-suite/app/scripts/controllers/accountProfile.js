/**
 * Created by noopur waghmare on 10/01/14.
 */
'use strict';
angularApp.controller('accountProfileCtrl', function($scope, $state, $routeParams, $route, $location, $modal, commonService, flash, sharedService, $rootScope, $upload) {

	var counter = 2;
	var moreAccounts = true;
	$scope.totalAccount = 0;
	$scope.accountList = [];
	$scope.account = {};
	$scope.search = '';
	$scope.tariff = {};
	$scope.docID = [];
	$scope.docExist = false;
	$scope.proceedClicked = false;
	$scope.tariffMain = [];
	$scope.tariffTemplate = [];
	$scope.tariff.docId = [];
	$scope.tariffList = {};
	$scope.documentRequestHistory = [{}];
	$scope.globalFileUpload;
	$scope.tariffHistoryAvailable = false;
	$scope.isCollapsed = true;
	$scope.quickViewAttachments = [];
	$scope.CurrentStackHolder = [];
	$scope.isFilterCollapsed = true;
	$scope.searchFilter = {};
	$scope.isCurrentStackHolderCollapsed = true;
	$scope.IsFileAttached = false;
	$scope.tariffCreateLoader = false;
	$scope.TariffTemp = {};
	$scope.TariffObj = {};
	$scope.tariffNewFile = [];
	$scope.TariffInfo = {};
	$scope.dataLoader = false;
	$scope.accountNum = [];
	$scope.$parent.showConfigurationDD = false;
	$scope.$parent.showBackBtn = true;
	$scope.revisionFileID = "";
	$scope.showRevision = false;
	$scope.historyLoader = false;
	$scope.historyTemp = [];
	$scope.historyData = {};
	$scope.getAccountData = function() {
		$scope.tariff = sharedService.getAccountIDTariff();
	}



	$scope.getTemplateTariffCode = function(accountId) {
		//$scope.$parent.$parent.loader = true;
		var promise = commonService.ajaxCall('GET', '/api/tms?&accountId=' + accountId);
		promise.then(function(result) {
			//$scope.$parent.$parent.loader = false;
			$scope.TariffTemp = result;
			for (var j = 0; j <= $scope.TariffTemp.fields.length - 1; j++)
				$scope.TariffTemp.fields[j].firstFlag = false;

		}, function(result) {
			//$scope.$parent.$parent.loader = false;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});

	}
	// $scope.setFlag = function(index, id, accountId) {
	// 	if ($scope.TariffTemp.fields[index].firstFlag == false) {
	// 		$scope.TariffTemp.fields[index].firstFlag = true;
	// 		$scope.getTariffInfo(index, id, accountId);
	// 	}
	// }
	$scope.getTariffInfo = function(index, id) {
		if ($scope.TariffTemp.fields[index].firstFlag == false) {
			//$scope.dataLoader = true;
			//$scope.TariffTemp.fields[index].dataPresent = true;
			//$scope.$parent.$parent.loader = true;
			var promise = commonService.ajaxCall('GET', '/api/tms/' + id);
			promise.then(function(result) {
				//$scope.dataLoader = false;
				//$scope.$parent.$parent.loader = false;
				$scope.TariffInfo = result;
				$scope.TariffTemp.fields[index].tariffData = result;
				$scope.TariffTemp.fields[index].firstFlag = true;
				$scope.getHistoryTemplate(index, id);
				//$scope.TariffTemp.fields[index].dataPresent = false;
			}, function(result) {
				//$scope.dataLoader = false;
				//$scope.TariffTemp.fields[index].dataPresent = false;
				//$scope.$parent.$parent.loader = false;
				flash.pop({
					title: 'Alert',
					body: "Please try after sometime..!",
					type: 'error'
				});
			});
		}
	}
	$scope.getTemplateTms = function() {
		var promise = commonService.ajaxCall('GET', '/api/template/default?type=tms');
		promise.then(function(result) {
			//$scope.companyListLoader = false;
			$scope.tariffTemplate = result;
			// $scope.tariffMain.presentDocId = {};
			// $scope.TariffObj = angular.copy($scope.tariffMain[0]);

		}, function(result) {
			//$scope.companyListLoader = false;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});
	}

	$scope.closeObj = function(index) {
		$scope.tariffMain.splice(index, 1);
	}
	$scope.closeObjEdit = function(index) {
		$scope.tariffNewFile.splice(index, 1);
	}
	$scope.proceed = function() {
		//$scope.$parent.$parent.loader = true;
		var obj = {};
		$scope.docID = sharedService.getDocumentId();
		var promise = commonService.ajaxCall('GET', '/api/template/default?type=tms');
		promise.then(function(result) {
			//$scope.companyListLoader = false;
			var temp = result;
			// for (var j = 0; j <= temp[0].fields.length - 1; j++) {
			// 	if (temp[0].fields[j].type == "dropdown")
			// 		temp[0].fields[j].isMandatory = false;
			// }
			for (var i = 0; i <= $scope.docID.length - 1; i++) {
				obj = {};
				obj = angular.copy(temp[0]);
				obj.presentDocId = {};
				obj.presentDocId = $scope.docID[i];
				$scope.tariffNewFile.push(obj);
				$scope.tariffMain.push(obj);

			}

			$scope.proceedClicked = true;
			//$scope.$parent.$parent.loader = false;
			$scope.docID = [];
			sharedService.clearDocumentId();
			$rootScope.$broadcast('clearDoc', {});
			if ($scope.docID.length > 0) {
				$scope.docExist = true;
			} else
				$scope.docExist = false;
		}, function(result) {
			//$scope.companyListLoader = false;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});


	}
	$scope.init = function() {

	}

	$scope.editTemplate = function() {

		var itemToSend = $scope.tariffTemplate[0];
		itemToSend.templateId = 'default';
		itemToSend.groupTab = true;
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
			//$scope.getTemplateTms();
		}, function(selectedItem) {
			console.log('Modal dismissed ');
		});
	};
	$scope.$on("saveDataAccountTms", function(event, args) {
		$scope.SaveAccountDocs();
	});
	$scope.$on("editTemplateAccountTms", function(event, args) {
		var promise = commonService.ajaxCall('GET', '/api/template/default?type=tms');
		promise.then(function(result) {
			//$scope.companyListLoader = false;
			$scope.tariffTemplate = result;
			$scope.editTemplate();
		}, function(result) {
			//$scope.companyListLoader = false;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});

	});
	//	$scope.$watch('form.tmsForm.$valid', function(newValue, oldValue) {
	//        var state=$scope.form.tmsForm.$valid;
	//        if(!_.isUndefined($scope.form.tmsForm2)){
	//            state=($scope.form.tmsForm.$valid && $scope.form.tmsForm2.$valid);        }
	//		$scope.$parent.$parent.validForm = !state;
	//        console.log('TMS: form check new');
	//	});
	//    console.log($scope.form.tmsForm2);
	//
	//        $scope.$watch('form.tmsForm2.$valid', function(newValue, oldValue) {
	//            var state=($scope.form.tmsForm.$valid && $scope.form.tmsForm2.$valid);
	//            $scope.$parent.$parent.validForm = !state;
	//            console.log('TMS: form check new');
	//        });
	$scope.$watch('form.tmsForm.$valid', function(newValue, oldValue) {
		$scope.$parent.$parent.validForm = !newValue;
		console.log('TMS: form check new');
	});
	$scope.$watch('form.tmsForm2.$valid', function(newValue, oldValue) {
		$scope.$parent.$parent.validForm = !newValue;
		console.log('TMS: form check 2');
	});



	function combineData() {
		var arrOfObj = [];
		for (var i = 0; i <= $scope.TariffTemp.fields.length - 1; i++) {
			if ("tariffData" in $scope.TariffTemp.fields[i]) {
				if ("revisionDocId" in $scope.TariffTemp.fields[i].tariffData) {
					$scope.TariffTemp.fields[i].tariffData.presentDocId = $scope.TariffTemp.fields[i].tariffData.revisionDocId;
				}
				arrOfObj.push($scope.TariffTemp.fields[i].tariffData);
			}
		}
		for (var j = 0; j <= $scope.tariffNewFile.length - 1; j++) {
			arrOfObj.push($scope.tariffNewFile[j]);
		}
		return arrOfObj;
	}
	$scope.SaveAccountDocs = function() {


		var obj = [];
		if ($state.current.url == "/Upload")
			obj = $scope.tariffMain; //new
		else {

			obj = combineData(); //update  $scope.TariffTemp
		}

		if (obj.length > 0) {
			// accountNum = [];
			// angular.forEach(this.accountNumber, function(i) {
			// 	accountNum.push(i.id);
			// });
			//var accountNum = $scope.accountNumber;
			var objSave = {
				"accounts": $scope.accountNum,
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
				$scope.$parent.$parent.showGrid = true;
				$scope.$parent.showConfigurationDD = true;
				$scope.$parent.showBackBtn = false;
				$scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account');
			}, function(data) {
				//$scope.$parent.$parent.loader = false;
				flash.pop({
					title: 'Fail',
					body: data.data,
					type: 'alert'
				});
			});
		} else flash.pop({
			title: 'Alert',
			body: "No Data to save!",
			type: 'info'
		});
	}
	$scope.initAccount = function() {
		angular.forEach(this.accountNumber, function(i) {
			$scope.accountNum.push(i.id);
		});

	}
	$scope.accountChange = function() {
		$scope.accountNum = [];
		if (this.accountNumber.length <= 0) {
			$scope.docID = [];
			sharedService.clearDocumentId();
			$rootScope.$broadcast('clearDoc', {});
			$scope.tariffNewFile = [];
			$scope.tariffMain = [];
			$scope.$parent.$parent.validForm = true;
		} else {
			$scope.docID = sharedService.getDocumentId();
			angular.forEach(this.accountNumber, function(i) {
				$scope.accountNum.push(i.id);
			});
		}
	}

	$scope.redirectTo = function(path) {
		$location.path($state.current.name.split('.')[0] + path);

	};
	$rootScope.$on('docExists', function(e, doc) {
		//console.log(doc);
		if ($scope.accountNum.length > 0) {
			$scope.proceedClicked = false;
			if (doc.length > 0) {
				$scope.docExist = true;
			} else
				$scope.docExist = false;
		}
	});

	$.getScript("/scripts/vendor/prettify.js");
	//	$.getScript("/scripts/vendor/ace-elements.js");
	$.getScript("/scripts/vendor/ace.js");

	$scope.onFileSelect = function($files, index) {
		//$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; i < $files.length; i++) {
			var file = $files[i];
			$scope.upload = $upload.upload({
				url: '/api/tms/upload/file', //upload.php script, node.js route, or servlet url
				// data: {
				// 	myObj: $scope.myModelObj
				// },
				dataType: 'json',
				file: file,
			}).success(function(data, status, headers, config) {
				// file is uploaded successfully
				$scope.revisionFileID = data.msg.$oid;
				console.log(data.msg.$oid);
				$scope.TariffTemp.fields[index].tariffData.revisionDocId = {
					"id": data.msg.$oid,
					"t": "",
					"v": file.name
				};
				$scope.TariffTemp.fields[index].showRevision = true;
				//$scope.showRevision = true;
				console.log(data);
			});
			//.error(...)
			//.then(success, error, progress); 
		}
	};

	$scope.undoFileUpload = function(index) {
		$scope.TariffTemp.fields[index].showRevision = false;
		//obj.revisionDocId = {};
	}
	$scope.getHistoryTemplate = function(index, id) {
		$scope.historyLoader = true;
		var promise = commonService.ajaxCall('GET', '/api/history?&q=' + id + '&pageLimit=-1&pageNo=1');
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


	$scope.loading = false;
});