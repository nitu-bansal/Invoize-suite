'use strict';

angularApp.controller('operationCtrl', function($scope, $http, $location,$timeout, $stateParams, $state, $route, $routeParams, $modal, Restangular, commonService, flash) {

	$scope.operation = {};
	$scope.templates = [];
    $scope.selectedPage=1;
    $scope.totalItems = 0;
    $scope.currentPage = 1;
	$scope.pageLimit = 500;
	$scope.rowNos = [];
	$scope.hw=null;
	var invalidMsgList = [];

    $scope.setPage = function () {
        //$scope.selectedPage = this.currentPage;
        setTimeout(function(){
            angular.element(".pagination").scope().getOperations(angular.element("li.active.ng-scope").scope().page.number);
        },300);
    };

	function initialGrid() {
		$scope.operations = [{
			updateField: null,
			id: null
		}];

		$scope.columns = [{
			value: 'operation.updateField',
			type: 'checkbox',
			title: 'update',
			width: 50
		}];
	}

//    $scope.$watch('operations',function(){
//        if ($scope.operations != null && $scope.operations.length > 20)
//            $scope.hh = $(window).height()- 300;
//        else
//            $scope.hh = null;
//    });

	function renderHT(){
		if ($scope.operations != null && $scope.operations.length > 20)
			$scope.hh = $(window).height()- 300;
		else
			$scope.hh = null;
	}

	$scope.celChange = function(values) {
		var cellCount = values.length;
		for (var i = 0; i < cellCount; i++) {
			if (values[i][3] !== values[i][2]) {
				if (values[i][3] === '')
					values[i][3] = null;
				if (values[i][1] !== 'updateField' && (!$scope.operations[values[i][0]] || !$scope.operations[values[i][0]].updateField))
					values.push([values[i][0], 'updateField', 'null', true]);
			}
		}
		invalidMsgList=[];
		$timeout(renderHT,1000);
	}


	$scope.onRowCreate = function(rowNo){
		$scope.rowNos.push($scope.rowNos[$scope.rowNos.length-1] +1);
	}

	var cellRenderer = function(instance, td, row, col, prop, value, cellProperties) {

		if (cellProperties.type == 'autocomplete')
			Handsontable.AutocompleteCell.renderer.apply(this, arguments)
		else if (cellProperties.type == 'date')
			Handsontable.DateCell.renderer.apply(this, arguments)
		else
			Handsontable.TextCell.renderer.apply(this, arguments);

		if (cellProperties.toolTip)
			td.title = '';

		if (invalidMsgList.length - 1 >= row) {
			td.title = '';
			var colIndx = invalidMsgList[row].mandatory.indexOf(prop);
			if (colIndx != -1) {
				td.title = 'Mandatory!\n';
				td.style.backgroundColor = 'pink';
			}
			colIndx = invalidMsgList[row].length.indexOf(prop);
			if (colIndx != -1) {
				td.title += 'Length Exceed!\n';
				td.style.backgroundColor = 'pink';
			}
			colIndx = invalidMsgList[row].regex.indexOf(prop);
			if (colIndx != -1) {
				if(invalidMsgList[row].serverMsg != null)
					td.title += invalidMsgList[row].serverMsg[prop];
				else
					td.title += cellProperties.errorMessage;
				td.style.backgroundColor = 'pink';
			}
		}
		td.innerHtml = value;
		return td;
	}

	$scope.getTemplates = function(q) {
		$scope.templateLoader = true;
		commonService.loader(true);
		var promise = commonService.ajaxCall('GET', '/api/template?type=operation&pageLimit=20&pageNo=1&q=' + q + '');
		promise.then(function(result) {

			$scope.templates = result;
			if (result.length < 1)
			//$location.path("/wizard/operation/new");
				$scope.redirectTo("/operation/new");
			$scope.templateLoader = false;
			commonService.loader();
		}, function(result) {
			flash.pop({
				title: 'Alert',
				body: "Please try after sometime..!",
				type: 'error'
			});
			$scope.templateLoader = false;
			commonService.loader();
		});
	}

	$scope.getTemplate = function() {
		$scope.templateLoader = true;
		commonService.loader(true);
		initialGrid();
		var templateId = $routeParams.templateId ? $routeParams.templateId : 'Default';
		var promise = commonService.ajaxCall('GET', '/api/template/' + templateId + '?type=operation');
		promise.then(function(data) {
				$scope.templateData = data;
				var sc = data.fields.sort(function(a, b) {
					return parseInt(a.displayOrder,10) - parseInt(b.displayOrder,10)
				});
				$scope.templateData.fields = sc;
				angular.forEach(sc, function(col, i) {
					if (col.isActive) {
						switch (col.type) {
							case 'dropdown':
							case 'multiselect':
								$scope.columns.push({
									value: 'operation.' + col.key,
									type: 'autocomplete',
									title: col.label,
									strict: true,
									src: col.suggestionsSource,
									renderer: cellRenderer,
									width: col.length * 9,
									length: col.length,
                                    readOnly:col.isReadonly,
									isMandatory: col.isMandatory,
									key: col.key,
									regex: col.regex,
									toolTip: col.toolTip,
									errorMessage: col.errorMessage,
									displayOrder: col.displayOrder
								})
								break;
							default:
								if (col.type == 'multiline')
									col.type = 'text';
								$scope.columns.push({
									value: 'operation.' + col.key,
									type: col.type,
									allowInvalid: false,
									renderer: cellRenderer,
									title: col.label,
									width: col.length * 9,
									length: col.length,
                                    readOnly:col.isReadonly,
									isMandatory: col.isMandatory,
									key: col.key,
									regex: col.regex,
									toolTip: col.toolTip,
									errorMessage: col.errorMessage,
									displayOrder: col.displayOrder
								});
						}
					}
				});
				$timeout(function(){
					//var sb = $('#sidebar').width();
					var ww = $(window).width()-10;
//					if(sb!=null)
//						ww-=sb;
					var hw = $('table.htCore').eq(0).width() + 10;
					if(ww>hw)
						$scope.hw = hw;
					else{
						$scope.hw = ww;
					}
				},1000);
				$scope.getOperations($scope.currentPage,true);
				$scope.templateLoader = false;
			},
			function(data) {
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
				$scope.templateLoader = false;
			});
	}

	$scope.editViewTemplete = function(template) {
		//$location.path("/wizard/operation/operationDetails/" + template.id);
		$scope.redirectTo("/operation/operationDetails/" + template.id);
	}

	$scope.getOperations = function(pageNo,getCount) {
		$scope.templateLoader = true;
		commonService.loader(true);
		$scope.currentPage = pageNo;
		invalidMsgList = [];
        if(getCount){
			var promise1 = commonService.ajaxCall('GET', 'api/getCount?collection=Operation&templateId='+$routeParams.templateId);
			promise1.then(function(data) {
				$scope.totalItems = data;
			},function(data){
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
		}
		var promise = commonService.ajaxCall('GET', '/api/operation?templateId=' + $routeParams.templateId + '&pageLimit= 500 &pageNo='+pageNo);
		promise.then(function(data) {
				if (data.length) {
					$scope.operations = data;
					//for (var i = 0; i < $scope.operations.length; i++)
					$scope.operations[0].updateField = false;
				}
				$scope.templateLoader = false;
				$scope.rowNos = [];
				for (var i = pageNo*500-499; i <= pageNo*500; i++)
					$scope.rowNos.push(i);
				$scope.templateLoader = false;
				renderHT();
				commonService.loader();
			},
			function(data) {
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
				commonService.loader();
			});
	}

	$scope.createOperation = function(operation) {
		$scope.templateLoader = true;
        commonService.loader(true);
		var promise = commonService.ajaxCall('POST', '/api/template?type=operation', operation);
		promise.then(function(data) {
				flash.pop({
					title: 'Success',
					body: data.msg,
					type: 'success'
				});
				if (data.templateId)
				//$location.path("/wizard/operation/operationDetails/" + data.templateId);
					$scope.redirectTo("/operation/operationDetails/" + data.templateId);
				$scope.templateLoader = false;
                commonService.loader();
			},
			function(data) {
				$scope.templateLoader = false;
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
                commonService.loader();
			});
	}

	$scope.saveOperations = function() {
		invalidMsgList = [];
		var dataTosave = commonService.validateGridData($scope.operations, $scope.columns, $routeParams.templateId);
		invalidMsgList = dataTosave.arrInvalidMsg;
		if (dataTosave.inValidData.length > 0) {
			$scope.operations = dataTosave.inValidData;
			fillRowNos();
		}
		$scope.templateLoader = true;

		if (dataTosave.validData.data.length > 0) {
			commonService.loader(true);
			var promise = commonService.ajaxCall('PUT', '/api/grid?type=operation&templateId=' + $routeParams.templateId, dataTosave.validData);
			promise.then(function(data) {
					if (dataTosave.inValidData.length > 0) {
						flash.pop({
							title: 'Waring',
							body: 'Grid contains some Invalid data, which is not saved',
							type: 'warning'
						});
						$scope.operations = dataTosave.inValidData;
					} else {
						$scope.getOperations($scope.currentPage,true);
						flash.pop({
							title: 'Success',
							body: data,
							type: 'success'
						});
					}
					$scope.templateLoader = false;
				},
				function(data) {
					$scope.templateLoader = false;
					if (data.status === 412) {
						flash.pop({
							title: 'Alert',
							body: 'Some Invalid records not save are in grid, Please correct and save again.',
							type: 'error'
						});
						if ($scope.operations.length > 1) {
							dataTosave.inValidData.pop();
							$scope.operations = dataTosave.inValidData.concat(data.data.doc);
						} else
							$scope.operations = data.data.doc;
						for (var i = 0; i < data.data.invalidMsgList.length; i++) {
							var invalMsg={};
							invalMsg.regex=[];
							invalMsg.mandatory=[];
							invalMsg.length=[];
							invalMsg.serverMsg={};

							for(var prop in data.data.invalidMsgList[i])
							{
								invalMsg.regex.push(prop);
								invalMsg.serverMsg[prop] = (data.data.invalidMsgList[i][prop]).toString();
							}
							invalidMsgList.push(invalMsg);
						}
						fillRowNos();
					}
					else
					flash.pop({
						title: 'Alert',
						body: data.data,
						type: 'error'
					});

					commonService.loader();
				});
		} else {
			$scope.templateLoader = false;
			flash.pop({
				title: 'No Data',
				body: 'No data to save or invalid data!',
				type: 'warning'
			});

		}
	}

	$scope.editTemplate = function() {

		var itemToSend = $scope.templateData;
		itemToSend.templateId = $routeParams.templateId;
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
			$scope.getTemplate();
		}, function(selectedItem) {
			console.log('Modal dismissed ');
		});
	};

	function fillRowNos(){
		$scope.rowNos = [];
		for (var i = 1; i <= $scope.operations.length; i++)
			$scope.rowNos.push(i);
	}

	$scope.nextStep = function() {
		//$location.path("/wizard/accounts/view");
		$scope.redirectTo("/accounts/view");
	}
	$scope.prevStep = function() {
		//$location.path("/wizard/location/view");
		$scope.redirectTo("/location/view");
	}

	//Quick Add System Code//

	$scope.createSystem = function(system) {
		$scope.system = undefined;
		$scope.quickSystemCreateLoader = true;
		var promise = commonService.ajaxCall('GET', '/api/template/default?type=system');
		promise.then(function(result) {
				$scope.system = result;
				$scope.system.fields[0].value = system.systemName;
				$scope.system.fields[1].value = system.systemCompany;
				var promise2 = commonService.ajaxCall('POST', '/api/system', $scope.system);
				promise2.then(function(msg) {
						flash.pop({
							title: 'System Added Successfully',
							body: msg.msg,
							type: 'info'
						});
						$scope.quickSystemCreateLoader = false;
						var last = $scope.operation.systemList.pop();
						last.id = msg.id;
						last.v = msg.id;
						$scope.operation.systemList.push(last);
						$('[name="systemList"]').eq(0).select2('val', $scope.operation.systemList)
					},
					function(msg) {
						$scope.profiletCreateLoader = false;
						flash.pop({
							title: 'Failed to add System',
							body: msg,
							type: 'error'
						});
					}
				);
			},
			function(result) {
				flash.pop({
					title: 'Unable to validate system',
					body: result,
					type: 'info'
				});
			}
		);

	}

	// Code Dialog Start            
	$scope.openCreateDialog = function(item) {
		if (!_.isUndefined(item)) {
			if (item.length > 0) {
				$scope.operation.systemList = item;
				var tempItem = item[item.length - 1];
				var itemToSend = {
					systemName: tempItem.n
				}; //change as per dialog template            
				var selectionType = tempItem.id;
				var isSelected = tempItem.s;
				if (selectionType.indexOf('new_') == 0 && isSelected === "") {
					var promise = commonService.ajaxCall('GET', '/api/isAvailable?availableFor=systemName&value=' + itemToSend.systemName + '&collection=system');
					promise.then(function(result) {
							if (result.msg != 1) {
								item[item.length - 1].id = "added";
								console.log(itemToSend);
								console.log($scope.operation.systemList);
								var modalInstance = $modal.open({
									templateUrl: 'm.system.new.html',
									controller: 'modalInstanceCtrl',
									resolve: {
										items: function() {
											return angular.copy(itemToSend);
										}
									}
								});
								modalInstance.result.then(function(selectedItem) {
									console.log(selectedItem);
									$scope.createSystem(selectedItem);

								}, function() {
									var opts = $('.select2-search-choice-close');
									var restArr = _.last(opts);
									$(restArr).click();
								});

							} else {
								var opts = $('.select2-search-choice-close');
								var restArr = _.last(opts);
								$(restArr).click();
								flash.pop({
									title: 'Already linked',
									body: "System is already linked.",
									type: 'info'
								});

							}
						},
						function(result) {
							flash.pop({
								title: 'Unable to validate system',
								body: result,
								type: 'info'
							});
							var opts = $('.select2-search-choice-close');
							var restArr = _.last(opts);
							$(restArr).click();
						}
					);
				}
			}
		}


	};
	// Code Dialog End

	$scope.redirectTo = function(path) {
		//redirect based on wizard / organizationsetup
		$location.path($state.current.name.split('.')[0] + path);

	};
});