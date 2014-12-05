'use strict';
angularApp.controller('tmsCtrl', function($scope, $http, $location, $stateParams, $route, $routeParams, $modal, accountService, sharedService, flash) {
	var counter = 2;
	var moreAccounts = true;
	$scope.totalAccount = 0;
	$scope.accountList = [];
	$scope.account = {};
	$scope.search = '';
	$scope.tariff = {};
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

	$scope.formatResult = function(data) {
		var markup = "<div>" + $scope.toHumanReadable(data.v) + "</div>";
		return markup;
	}

	$scope.formatSelection = function(data) {
		return data.v;
	}

	$scope.selectAccount = function(value) {
		console.log(value);
		$scope.accountDetailLoader = true;
		var promise = accountService.read(value);
		promise.then(function(result) {
				$scope.accountDetailLoader = false;
				$scope.account = result;
			},
			function(result) {
				$scope.accountDetailLoader = false;
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	}
	$scope.accountBar = {
		placeholder: "Please select...",
		minimumInputLength: 1,
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
					selected: $scope.tariff.account, //selected values
					suggestionFor: 'account', // suggestions for
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

	$scope.initExistingDocs = function(docs) {
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
	$scope.new = function() {
		$scope.tariff = {};
		sharedService.clearDocumentId();
		$scope.IsFileAttached = sharedService.IsNewDocAttached();
	}

	$scope.removeNewAttachment = function(id) {
		var attachmentsId = sharedService.removeNewDocumentId(id);
		$scope.IsFileAttached = sharedService.IsNewDocAttached();
	}

	$scope.UndoFileRevision = function(id, index) {
		var attachmentsId = sharedService.resetFileRevision(id);
		angular.element('#reviseFiles' + index).scope().queue = [];
	}

	$scope.create = function(tariff) {

		$scope.tariffCreateLoader = true;
		var NewAttachmentsId = sharedService.getDocumentId();
		$scope.tariff.accountId = $routeParams.accountId;
		$scope.tariff.docId = [];
		angular.forEach(NewAttachmentsId, function(i, j) {
			$scope.tariff.docId.push(i);
		});

		var promise = tmsService.create(tariff);
		promise.then(function(msg) {
				$scope.tariffCreateLoader = false;
				sharedService.clearDocumentId();
				$scope.listTariffs($routeParams.accountId);
				$scope.selectTariff(msg);
				flash.pop({
					title: 'Success',
					body: "Tariff was created successfully",
					type: 'info'
				});
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


	$scope.approveTariff = function(tariff) {

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
		console.log($scope.tariff.docId);
		$scope.tariff.accountId = $routeParams.accountId;
		$scope.tariff.id = $routeParams.tariffId;
		$scope.tariff.action = "A";

		var promise = tmsService.update(tariff);
		promise.then(function(msg) {

				$scope.tariffCreateLoader = false;
				sharedService.clearDocumentId();
				$scope.listTariffs($routeParams.accountId);
				$scope.selectTariff($routeParams.tariffId)
				sharedService.setExistingDocs($scope.tariff.docId);
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'success'
				});
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
		$scope.tariff.id = $routeParams.tariffId;
		$scope.tariff.action = "R";

		var promise = tmsService.update($scope.tariff);
		promise.then(function(msg) {
				$scope.tariffCreateLoader = false;
				sharedService.clearDocumentId();
				$scope.selectTariff($routeParams.tariffId)
				$scope.listTariffs($routeParams.accountId);
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'info'
				});
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
	// $scope.update = function(tariff){

	//         $scope.tariffCreateLoader = true;
	//         var ExistingAttachmentsId= sharedService.getFinalDocuments();
	//         var NewAttachmentsId=sharedService.getDocumentId();
	//         $scope.tariff.docId=[];
	//         angular.forEach(ExistingAttachmentsId, function(i,j){
	//                 $scope.tariff.docId.push(i);
	//         });
	//         angular.forEach(NewAttachmentsId, function(i,j){
	//                 $scope.tariff.docId.push(i);
	//         });

	//         $scope.tariff.accountId=$routeParams.accountId;
	//         $scope.tariff.id=$routeParams.tariffId;
	//         $scope.tariff.id=$routeParams.tariffId;

	//         console.log($scope.tariff);

	//         var promise = tmsService.update(tariff);
	//         promise.then(function(msg){
	//                         $scope.tariffCreateLoader = false;
	//                         sharedService.clearDocumentId();
	//                         $scope.selectTariff($routeParams.tariffId)
	//                         $scope.listTariffs($routeParams.accountId);
	//                         flash.pop({title: 'Success', body: msg, type: 'info'});},
	//                 function(msg){
	//                         $scope.tariffCreateLoader = false;
	//                         flash.pop({title: 'Alert', body: msg, type: 'error'});
	//                 }
	//         );
	// };



//	////$scope.getTotalAccount = function() {
//		var promise = accountService.totalAccount({
//			countFor: 'account'
//		});
//		promise.then(function(result) {
//				$scope.totalAccount = result.count;
//			},
//			function(result) {
//				flash.pop({
//					title: 'Alert',
//					body: "Please try after sometime..!",
//					type: 'error'
//				});
//			}
//		);
//	}

	$scope.searchAccount = function() {
		$scope.getAccountList($scope.search);
	};


	$scope.getAccountList = function(q) {
		$scope.accountListLoader = true;
		var promise = accountService.list({
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
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
				$scope.accountListLoader = false;
			}
		);
	}

	$scope.loadMore = function() {
		console.log("Here....");
		if (moreAccounts) {
			$scope.loadingMore = true;
			var promise = accountService.list({
				suggestionFor: 'account',
				q: '',
				pageLimit: 20,
				page: counter
			});
			promise.then(function(result) {
					if (result.length === 0)
						moreAccounts = false;
					counter += 1;
					$scope.loadingMore = false;
					$scope.accountList = $scope.accountList.concat(result);
				},
				function(result) {
					$scope.loadingMore = false;
				}
			);
		}
	}

	$scope.listTariffs = function(value) {
		$scope.tariffListLoader = true;
		$scope.tariff = {};
		var promise = tmsService.list(value);
		promise.then(function(result) {
				$scope.tariffListLoader = false;
				$scope.tariffList = result;
				var desc;

				angular.forEach($scope.tariffList, function(i, j) {
					desc = "";
					angular.forEach(i.docId, function(a, b) {
						desc += a.v + ',';
					});
					$scope.quickViewAttachments.push(desc.slice(0, -1));

				});
				angular.forEach($scope.tariffList, function(i, j) {
					desc = "";
					angular.forEach(i.workflowUsers, function(a, b) {
						desc += a.email + ',';
					});
					$scope.CurrentStackHolder.push(desc.slice(0, -1));

				});



			},
			function(result) {
				$scope.tariffListLoader = false;
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	}
	$scope.selectTariff = function(value) {
		$scope.accountDetailLoader = true;
		$scope.documentRequestHistory = [];
		$location.path("/tms/list/" + $routeParams.accountId + "/detail/" + value);
		$scope.tariff = {};
		var promise = tmsService.read(value);
		promise.then(function(result) {

				$scope.getDocumentRequestHistory(value);
				$.getScript("/scripts/initSlimScroll.js");
				$scope.tariffDetailLoader = false;
				$scope.tariff = result;
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
	}

	$scope.updateAccount = function(account) {
		$scope.accountUpdateLoader = true;
		var promise = accountService.update(account);
		promise.then(function(msg) {
				$scope.accountUpdateLoader = false;
				$scope.getAccountList($scope.search);
				////$scope.getTotalAccount();
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'info'
				});
				$location.path("/account/" + $routeParams.accountId);
			},

			function(msg) {
				$scope.accountUpdateLoader = false;
				flash.pop({
					title: 'Alert',
					body: msg,
					type: 'error'
				});
			}
		);
	}

	$scope.editAccount = function(value) {
		// $scope.account = $scope.account;
	}


	$scope.confirmDeleteAccount = function() {
		// Code Dialog Start
		// $dialog.dialog(angular.extend({
		// 	controller: 'dialogCtrl',
		// 	templateUrl: 'confirm.html', // change as per the dialog html needed
		// 	backdrop: true,
		// 	keyboard: false,
		// 	backdropFade: true,
		// 	dialogFade: true,
		// 	backdropClick: false,
		// 	show: true
		// }, {
		// 	resolve: {
		// 		item: function() {
		// 			return angular.copy(true);
		// 		}
		// 	}
		// }))
		// 	.open()
		// 	.then(function(result) {
		// 		if (result) {
		// 			console.log(result); // user has clicked save ..
		// 			$scope.delete();
		// 		} else {

		// 			console.log("close");
		// 		}
		// 	});

		var modalInstance = $modal.open({
			templateUrl: 'confirm.html',
			controller: 'modalInstanceCtrl',
			resolve: {
				items: function() {
					return angular.copy(true);
				}
			}
		});
		modalInstance.result.then(function(selectedItem) {
			console.log(selectedItem);
			$scope.delete();
		}, function() {
			console.log('Modal dismissed');
		});
		// Code Dialog End
	};

	$scope.delete = function() {
		$scope.accountUpdateLoader = true;
		var promise = accountService.delete($routeParams.accountId);
		promise.then(function(result) {
				$scope.getAccountList($scope.search);
				////$scope.getTotalAccount();
				flash.pop({
					title: 'Success',
					body: msg,
					type: 'success'
				});
				$scope.accountUpdateLoader = false;
				$location.path("/account/");
			},
			function(result) {
				$scope.accountUpdateLoader = false;
				flash.pop({
					title: 'Alert',
					body: result,
					type: 'error'
				});
			}
		);
	}

	setInterval(function() {
		try {
			//var scope = angular.element($('#fileUploadCtrl1')).scope();
			// $scope.globalFileUpload=angular.element('.fileUps').scope().queue;
			$scope.IsFileAttached = sharedService.IsNewDocAttached();
			// console.log($scope.IsFileAttached);
			$scope.$digest();
		} catch (exception) {

		}
	}, 3000);

	if ($route.current.name == "tms.list.edit") {
		$scope.getAccountList($scope.search);
		$scope.listTariffs($routeParams.accountId);
		$scope.selectTariff($routeParams.tariffId);
		$location.path("tms/list/" + $routeParams.accountId + "/edit/" + $routeParams.tariffId);
		//$scope.editAccount($routeParams.accountId);
	} else if ($route.current.name == "tms.list.detail") {
		$scope.getAccountList($scope.search);
		$scope.listTariffs($routeParams.accountId);
		$scope.selectTariff($routeParams.tariffId);

	} else if ($route.current.name == "tms.list.new") {
		$scope.getAccountList($scope.search);
		$scope.listTariffs($routeParams.accountId);
	} else if ($route.current.name == "tms.list") {
		$scope.getAccountList($scope.search);
		$scope.listTariffs($routeParams.accountId);

	} else if ($route.current.name == "tms.list.account") {
		$scope.getAccountList($scope.search);
		$scope.listTariffs($routeParams.accountId);
		$scope.selectAccount($routeParams.accountId);

	} else {
		$scope.getAccountList($scope.search);
		////$scope.getTotalAccount();
	}
//	// $.getScript("/scripts/vendor/bootstrap-datepicker.js");
//	// $.getScript("/scripts/vendor/daterangepicker.js");
	$.getScript("/scripts/vendor/prettify.js");
//	$.getScript("/scripts/vendor/ace-elements.js");
	$.getScript("/scripts/vendor/ace.js");



	$scope.loading = false;
});