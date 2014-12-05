/**
 * Created by noopur waghmare on 10/01/14.
 */
'use strict';
angularApp.controller('billRightTmsCtrl', function($scope, $state, $routeParams, $route, $location, $modal, $modalInstance, commonService, flash, sharedService, $rootScope, $upload, $filter, items) {
	$scope.accountNumber = items;
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
	$scope.TariffTemp = {};
	$scope.TariffObj = {};
	$scope.tariffNewFile = [];
	$scope.TariffInfo = {};
	$scope.dataLoader = false;
	$scope.loader = false;
	$scope.sharedWithGroupEdit = null;
	$scope.sharedWithUsersEdit = null;
	$scope.sharedWithGroupView = null;
	$scope.sharedWithUsersView = null;

	//	$scope.accountNum = [];

	//$scope.$parent.showConfigurationDD = false;
	//$scope.$parent.showBackBtn = true;
	$scope.revisionFileID = "";
	$scope.showRevision = false;
	$scope.effectiveDate = null;
	$scope.expiryDate = null;
	$scope.receivedDate = null;
	$scope.stationKeyID = null;
	$scope.regionKeyID = null;

	$scope.getAccountData = function() {
		$scope.tariff = sharedService.getAccountIDTariff();
	}



	$scope.getTemplateTariffCode = function(accountId) {
		$scope.loader = true;
		var promise = commonService.ajaxCall('GET', '/api/tms?&accountId=' + accountId);
		promise.then(function(result) {
			$scope.loader = false;
			$scope.TariffTemp = result;
			for (var j = 0; j <= $scope.TariffTemp.fields.length - 1; j++)
				$scope.TariffTemp.fields[j].firstFlag = false;

		}, function(result) {
			$scope.loader = false;
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
		});

	}

	$scope.getTariffInfo = function(index, id) {
		if ($scope.TariffTemp.fields[index].firstFlag == false) {
			//$scope.dataLoader = true;
			$scope.loader = true;
			var cnt = 0;
			var promise = commonService.ajaxCall('GET', '/api/tms/' + id);
			promise.then(function(result) {
				//$scope.dataLoader = false;
				$scope.docExist = true;
				$scope.loader = false;

				if (result.sharedWithEdit == undefined) {
					result.sharedWithEdit = {};
					result.sharedWithEdit.Groups = [];
					result.sharedWithEdit.Users = [];
				}
				if (result.sharedWithView == undefined) {
					result.sharedWithView = {};
					result.sharedWithView.Groups = [];
					result.sharedWithView.Users = [];
				}
				$scope.TariffInfo = result;
				$scope.TariffTemp.fields[index].tariffData = result;
				$scope.TariffTemp.fields[index].firstFlag = true;

				for (cnt = 0; cnt < $scope.TariffTemp.fields[index].tariffData.fields.length; cnt++) {
					if ($scope.TariffTemp.fields[index].tariffData.fields[cnt].key == "station") {
						$scope.stationKeyID = cnt;
					} else if ($scope.TariffTemp.fields[index].tariffData.fields[cnt].key == "region") {
						$scope.regionKeyID = cnt;
					}
				}

			}, function(result) {
				//$scope.dataLoader = false;
				$scope.loader = false;
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
			if ($scope.tariffTemplate.sharedWithEdit == undefined) {
				$scope.tariffTemplate.sharedWithEdit = {};
				$scope.tariffTemplate.sharedWithEdit.Groups = [];
				$scope.tariffTemplate.sharedWithEdit.Users = [];
			}
			if ($scope.tariffTemplate.sharedWithView == undefined) {
				$scope.tariffTemplate.sharedWithView = {};
				$scope.tariffTemplate.sharedWithView.Groups = [];
				$scope.tariffTemplate.sharedWithView.Users = [];
			}

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
	$scope.close = function() {
		$modalInstance.dismiss(undefined);
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
			if (result.sharedWithEdit == undefined) {
				result.sharedWithEdit = {};
				result.sharedWithEdit.Groups = [];
				result.sharedWithEdit.Users = [];
			}
			if (result.sharedWithView == undefined) {
				result.sharedWithView = {};
				result.sharedWithView.Groups = [];
				result.sharedWithView.Users = [];
			}
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

				//                if(obj.sharedWithEdit == undefined)
				//                {
				//                    obj.sharedWithEdit = {};
				//                    obj.sharedWithEdit.Groups = [];
				//                    obj.sharedWithEdit.Users = [];
				//                }
				//                if(obj.sharedWithView == undefined)
				//                {
				//                    obj.sharedWithView = {};
				//                    obj.sharedWithView.Groups= [];
				//                    obj.sharedWithView.Users= [];
				//                }

				$scope.tariffNewFile.push(obj);
				$scope.tariffMain.push(obj);

			}

			var cnt = 0;
			for (cnt = 0; cnt < $scope.tariffNewFile[0].fields.length; cnt++) {
				if ($scope.tariffNewFile[0].fields[cnt].key == "station") {
					$scope.stationKeyID = cnt;
				} else if ($scope.tariffNewFile[0].fields[cnt].key == "region") {
					$scope.regionKeyID = cnt;
				}
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
	$scope.SaveAccountDocsEdit = function() {
		var accountNum = [];

		var obj = [];

		obj = combineData(); //update  $scope.TariffTemp
		// }


		if (obj.length > 0) {
			if (obj[0].sharedWithEdit == undefined) {
				obj[0].sharedWithEdit = {};
				obj[0].sharedWithEdit.Groups = [];
				obj[0].sharedWithEdit.Users = [];
			}
			if (obj[0].sharedWithView == undefined) {
				obj[0].sharedWithView = {};
				obj[0].sharedWithView.Groups = [];
				obj[0].sharedWithView.Users = [];
			}

			var flgContinue = true;
			var errMsg = '';
			for (var i = 0; i < obj[0].fields.length; i++) {
				if (obj[0].fields[i].label == "Effective Date")
					$scope.effectiveDate = $filter('date')(obj[0].fields[i].value, "yyyy-MM-dd"); //.split('T')[0];
				if (obj[0].fields[i].label == "Received Date")
					$scope.receivedDate = $filter('date')(obj[0].fields[i].value, "yyyy-MM-dd"); //.split('T')[0];
				if (obj[0].fields[i].label == "Expiry Date")
					$scope.expiryDate = $filter('date')(obj[0].fields[i].value, "yyyy-MM-dd"); //.split('T')[0];
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

				angular.forEach($scope.accountNumber, function(i) {
					accountNum.push(i.id);
				});
				var objSave = {
					"accounts": accountNum,
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
					//$scope.$parent.$parent.showGrid = true;
					//$scope.$parent.showConfigurationDD = true;
					//$scope.$parent.showBackBtn = false;
					//$scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account');
					$scope.close();
				}, function(data) {
					//$scope.$parent.$parent.loader = false;
					flash.pop({
						title: 'Fail',
						body: data.data.msg,
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
		} else flash.pop({
			title: 'Alert',
			body: "No Data to save!",
			type: 'info'
		});
	}
	$scope.SaveAccountDocsUpload = function() {
		var accountNum = [];


		if ($scope.tariffMain.length > 0) {
			var obj = [];
			obj = $scope.tariffMain; //new
			if (obj[0].sharedWithEdit == undefined) {
				obj[0].sharedWithEdit = {};
				obj[0].sharedWithEdit.Groups = [];
				obj[0].sharedWithEdit.Users = [];
			}
			if (obj[0].sharedWithView == undefined) {
				obj[0].sharedWithView = {};
				obj[0].sharedWithView.Groups = [];
				obj[0].sharedWithView.Users = [];
			}

			angular.forEach($scope.accountNumber, function(i) {
				accountNum.push(i.id);
			});
			var objSave = {
				"accounts": accountNum,
				"data": obj
			};
			var flgContinue = true;
			var errMsg = '';
			// for (var i = 0; i < objSave.fields.length; i++) {
			//     if (objSave.fields[i].label == "Effective Date")
			//         $scope.effectiveDate = $filter('date')( objSave.fields[i].value,"yyyy-MM-dd");//.split('T')[0];
			//     if (objSave.fields[i].label == "Received Date")
			//         $scope.receivedDate =  $filter('date')(objSave.fields[i].value,"yyyy-MM-dd");//.split('T')[0];
			//     if (objSave.fields[i].label == "Expiry Date")
			//         $scope.expiryDate =  $filter('date')(objSave.fields[i].value,"yyyy-MM-dd");//.split('T')[0];
			// }
			for (var i = 0; i < obj[0].fields.length; i++) {
				if (obj[0].fields[i].label == "Effective Date")
					$scope.effectiveDate = $filter('date')(obj[0].fields[i].value, "yyyy-MM-dd"); //.split('T')[0];
				if (obj[0].fields[i].label == "Received Date")
					$scope.receivedDate = $filter('date')(obj[0].fields[i].value, "yyyy-MM-dd"); //.split('T')[0];
				if (obj[0].fields[i].label == "Expiry Date")
					$scope.expiryDate = $filter('date')(obj[0].fields[i].value, "yyyy-MM-dd"); //.split('T')[0];
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

				//$scope.$parent.$parent.loader = true;
				var promise = commonService.ajaxCall('PUT', '/api/tms', objSave);
				promise.then(function(data) {
					//$scope.$parent.$parent.loader = false;
					flash.pop({
						title: 'Success',
						body: data,
						type: 'success'
					});
					//$scope.$parent.$parent.showGrid = true;
					//$scope.$parent.showConfigurationDD = true;
					//$scope.$parent.showBackBtn = false;
					//$scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account');
					$scope.close();
				}, function(data) {
					//$scope.$parent.$parent.loader = false;
					flash.pop({
						title: 'Fail',
						body: data.data.msg,
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
		} else flash.pop({
			title: 'Alert',
			body: "No Data to save!",
			type: 'info'
		});
	}
	//	$scope.initAccount = function() {
	//		angular.forEach($scope.accountNumber, function(i) {
	//			$scope.accountNum.push(i.id);
	//		});
	//
	//	}

	$scope.redirectTo = function(path) {
		$location.path($state.current.name.split('.')[0] + path);

	};
	$rootScope.$on('docExists', function(e, doc) {
		//console.log(doc);
		if ($scope.accountNumber.length > 0) {
			$scope.proceedClicked = false;
			if (doc.length > 0) {
				$scope.docExist = true;
			} else
				$scope.docExist = false;
		}
	});

	//	$.getScript("/scripts/vendor/prettify.js");
	//	//	$.getScript("/scripts/vendor/ace-elements.js");
	//	$.getScript("/scripts/vendor/ace.js");

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
				file: file
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

	if ($scope.accountNumber != null)
		$scope.getTemplateTariffCode($scope.accountNumber[0].id);

	$scope.changeData = function(controlkey, controlValue, index, parentIndex) {
		console.log(parentIndex);
		if (controlkey == "station") {
			if (controlValue != undefined) {
				if ($scope.docExist == false) {
					$scope.tariffNewFile[0].fields[$scope.regionKeyID].value = controlValue[0].v;
				} else {
					$scope.TariffTemp.fields[parentIndex].tariffData.fields[$scope.regionKeyID].value = controlValue[0].v;
				}
			}
		}
	}

	$scope.addUsersinView = function(userType, index) {
		var flgFound = false;

		if (userType == 'group') {
			angular.forEach($scope.TariffTemp.fields[index].tariffData.sharedWithEdit.Groups, function(finditem, i) {
				flgFound = false;

				angular.forEach($scope.TariffTemp.fields[index].tariffData.sharedWithView.Groups, function(item, j) {
					if (flgFound == false) {
						if (item.n === finditem.n) {
							flgFound = true;
							//                        break ;
						}
					}
				});

				if (flgFound == false) {
					$scope.TariffTemp.fields[index].tariffData.sharedWithView.Groups.push(finditem);
				}
			});


		}
	}

	$scope.loading = false;
});