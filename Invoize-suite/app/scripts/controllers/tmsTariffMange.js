angularApp.controller('tmsTariffManageCtrl', function($scope, $state, $routeParams, $route, $location, $modal, commonService, flash, $rootScope, $upload, $timeout, $filter) {
	$scope.perKG = false;
	$scope.perChargeCurrencyConversion = false;
	$scope.exchangeRateAppldOnDateTypesDS = [];
	$scope.calculationDS = [];
	$scope.weightDS = [];
	$scope.operandDS = [];
	$scope.currencyFrequencyDS = [];
	$scope.currencySourceDS = [];
	$scope.currencyDS = [];
	$scope.Loader = false;
	$scope.profileID = "default";
	$scope.basicInfo = {};
	$scope.identifiers = {};
	$scope.identifiers.fields = [];
	$scope.additionalTariffInfo = {};
	$scope.additionalTariffInfo.tariffAppliedOn = null;
	$scope.allChargeCurrency = {};
	$scope.allChargeCurrency.currencySource = null;
	$scope.allChargeCurrency.currencyFrequency = null;
	$scope.allChargeCurrency.tariffAppliedOnDate = null;
	$scope.allChargeCurrency.currency = null;
	$scope.parameters = {};
	$scope.parameters.fields = [];
	$scope.charge = {};
	$scope.chargeData = [];
	$scope.chargesDataArray = [];
	$scope.objToSend = {};
	$scope.objToSave = {};
    var invalidateFlag;

    $scope.indexAccountclone = 0;

//    if($scope.$parent.global == undefined)
//    {
//        if(!items)
//            $scope.$parent.global = items;
//        else
//            $scope.$parent.global =[];
//    }
//    $scope.global = JSON.parse(localStorage.account)[0];
//    $scope.global = {
//        account : [$scope.global],
//        account1 : [$scope.global]
//    };
//    //console.log(localStorage,' locale string is ',$scope.global);
//    $scope.global.isGroupSelected = $scope.$parent.global.isGroupSelected ? $scope.$parent.global.isGroupSelected : false;
//
//
//    if (!$scope.global.account) {
//        $scope.global.account = [];
//        $scope.accounts = [];
//    }
//    else if ($scope.global.account.length === 0) {
//        $scope.global.account = [];
//        $scope.accounts = [];
//    }
//    else
//    {
//        $scope.accounts= [];
//        //$scope.accounts.push( $scope.global.account[0].id);
//        $scope.account1= [];
//        $scope.accounts.push( $scope.global.account[0].id);
//        $scope.account1.push( $scope.global.account[0].id);
//
//    }
//
//    if(!$scope.global.account) $scope.global.account=[];
//    if(!$scope.global.accountGroup) $scope.global.accountGroup=[];
//    if(!$scope.global.account1) $scope.global.account1=[];
    $scope.global = $scope.$parent.global;
    console.log($scope.$parent.global);

//    $scope.accounts = [];
	$scope.tariffList = [];
	$scope.showGoBtn = false;
	$scope.applyclicked = false;
	$scope.btnDoneShow = false;

	//editTariff
	$scope.lanes = [];
	$scope.laneProfileData = {};
	$scope.tariffTemplateData = {};
	$scope.columns = [];
	$scope.totalItems = 0;
	$scope.currentPage = 1;
	$scope.pageLimit = 100;
    $scope.pageLimitListTariff = 100;
    $scope.totalItemsListTariff = 0;
    $scope.currentPageListTariff = 1;
	$scope.columnsTariff = [];
	$scope.TempR = [{}];
	var invalidMsgList = [];
	$scope.chargeList = {};
	$scope.chargeList.fields = [];
	$scope.chargesAvailable = [];
	$scope.rowNos = [];
	$scope.showPreviewTable = false;
	$scope.fieldKeys = [];
	$scope.fieldKeysParams = [];
	$scope.minDate = '2000-01-01';
    $scope.effectiveDate=null;
    $scope.expiryDate=null;
    $scope.fieldKeysCharges = [];
    $scope.fieldKeysChargeNames = [];


//    confirm parameter and charge deletion
    $scope.savedParameters = [];
    $scope.savedChrges = {};
    $scope.savedChrges.fields = [];
    $scope.fieldKeysCalculationOnCharges = [];
//    $scope.savedCalculationCodes = [];
//    $scope.savedCalculationCodes = [];

    $scope.objExpireTariff = {};

    $scope.expiryDialog = false;
    $scope.objExpireTariff.expireLanes = '';
    $scope.objExpireTariff.tariffExpiryDt = null;
    $scope.expireTariffIDs = [];
    $scope.isFilterApplied = false;

    $scope.addMode = false;
    $scope.sparerow = 0;
    $scope.selectedRow = 0;
    $scope.showGrid = false;
    $scope.hw = null;
    $scope.selectedLane = {};
    $scope.selectedLane.fields = [];
    $scope.isRowDoubleClicked = false;
    $scope.currentRowIndex = 0;
    $scope.lastRowIndex = 0;
    $scope.effectiveDateID = 0;
    $scope.expiryDateID = 0;
    $scope.effectiveDateIndexLane = 0;
    $scope.expiryDateIndexLane = 0;

    var chargeObj = {
		chargeID: null,
		chargeRounding: null,
		chargeDecimal: null,
		chargeNearest: null,
		calculation: null,
		weight: null,
		calculationOnCharge: null,
		operand: null,
		currencySource: null,
		exchangeRateAppldOn: null,
		currencyFrequency: null,
		currency: null,
		min: false,
		max: false,
		breackage: null
	};


    $scope.accountGroup = [];
    $scope.isvalidTariffGroup = false;
    $scope.flgUpdate = false;

    //used to store actual width in template of all columns of lanes handson
    $scope.columnsActualWidth =[];
    //used to store width of all columns of lanes handson run time
    $scope.showHideColumnsWidth =[];
    $scope.addNewTariff = false;

    //////////////////////////// filter varibles exposed to html ////////////////////////////////
    // keys of all filter fields
    $scope.sortedFields = [];
    // contains filter fields' properties
    $scope.fields = {};
    // extra fields for suggestion in filter input
    $scope.custObj = {};
    // global property, contains selected filter as an preDefined object
    var selectedTMSFilter = {};
    // global property, indicates that save filter for current account is going to be called, reuse the global filter object and save one call to backend for get filters
    var saveGetFilterCall = false;
    ///////////////////////////// initialize the meta information for this page ////////////////////
    /**
     * @author nishith.modi@searce.com
     * @name initMetaInfo
     * @function
     *
     * @description initialize/fetch required information to process ahead in page
     * we require fields for filter, preselected filter values and if global account is set, do search for user.
     * Since each above call has to be made in sequnce of previos one's success, it is chained with promises.
     *
     * first call 'api/getTemplateType' to get filter template, in response store required info in $scope.fields.
     * second call 'api/tariffTypeFilter' to get preapplied filter for selected account.
     * third call to search if account is already selected
     * @param
     * @return
     */
    $scope.initMetaInfo = function(whichPage) {

        // this function is used to load filter template
        var loadFilterTemplate = function() {
            // return promise tobe chained with next call
            return commonService.ajaxCall('GET', 'api/getTemplateType')
                .then(function(response){
                    // successfull call to template api for filter
                    // loop through all the fields and store required in $scope.fields object and store the key in $scope.sortedFields for ngRepeat in html
                    angular.forEach(response.fields, function(i) {
                        // check if field is active or not
                        if (i.isActive) {
                            // field is active
                            if (i.type != "checkbox") {
                                // its not checkbox
                                // required hash is stored in fields with key as key
                                $scope.fields[i.key] = {
                                    type: i.type,
                                    label: i.label,
                                    autoSuggestSource: 'tariffType'
                                };
                                // push key on sortedFields array
                                $scope.sortedFields.push(i.key);
                                // required extra parameters for suggestion call within filter input
                                $scope.custObj[i.label] = {
                                    key: i.key,
                                    accountId: $scope.global.account[0].n,
                                    systemId: $scope.loggedInUser.userSystem[0].id
                                }
                            }//if
                        }//if
                    });
                }, function(error){
                    //error
                    flash.pop({
                        title: 'Alert',
                        body: error.data,
                        type: 'error'
                    });
                })//then
            }//loadFilterTemplate
        var doSearch = function() {
                // perform search on behalf of user for the first time if account is already populated
                if($scope.global.account) {
                    //account is selected
                    // perform search
                    $scope.quickSearch($scope.currentPage,true,whichPage);
                }
            }//doSearch


        // chaining of call with promises returned
        loadFilterTemplate().then(doSearch);
    }//end

    //////////////////////////////////////

    $scope.RenderHTW = function(isSplit) {
//        console.log(isSplit);
        if (isSplit) {
            $timeout(function() {
                $('.stretch.ui-splitbar').css("left", "50%");
                $('.west-back.stretch').css("right", "50%");
                $('.east-back.stretch').css("left", "50%");
                $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
            }, 300);
        } else {
            $timeout(function() {

                $('.stretch.ui-splitbar').css("left", "100%");
                $('.west-back.stretch').css("right", "0%");
                $('.east-back.stretch').css("left", "100%");
                $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
            }, 300);
        }

    }
	function initialGrid() {
		$scope.lanes = [{
			updateField: false,
			id: null
		}];
//        console.log($state.current.url);
        if($state.current.url.indexOf('/editTariff') != -1){
            $scope.RenderHTW($scope.showGrid);
        }
//        $scope.global.isGroupSelected = false;
	}

	initialGrid();

	$scope.addCharge = function() {
		var ob = angular.copy(chargeObj);
		$scope.chargeList.fields.push(ob);
	}
	$scope.getCharges = function() {
		commonService.loader(true);
        if($scope.basicInfo.tariffType == undefined)
            $scope.basicInfo.tariffType="";
        if($scope.basicInfo.tariffName == undefined)
            $scope.basicInfo.tariffName="";

//		var chargepromise = commonService.ajaxCall('GET', '/api/suggestion?q=&pageLimit=10&page=1&selected=&suggestionFor=systemChargeCode&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
//      var chargepromise = commonService.ajaxCall('GET', '/api/suggestion?q=&pageLimit=10&page=1&selected=&suggestionFor=systemChargeCode&systemId=' + $rootScope.loggedInUser.userSystem[0].id + '&tariffName=' + $scope.basicInfo.tariffName + '&tariffType=' + $scope.basicInfo.tariffType + '&account=' + $scope.global.account[0].id || '');
        var chargepromise = commonService.ajaxCall('GET', '/api/suggestion?q=&pageLimit=1000&page=1&selected=&suggestionFor=systemChargeCode&systemId=' + $rootScope.loggedInUser.userSystem[0].id + '&tariffName=' + $scope.basicInfo.tariffName + '&tariffType=' + $scope.basicInfo.tariffType);
        chargepromise.then(function(data) {
			commonService.loader();
			$scope.chargeData = data.msg;
		}, function() {
			commonService.loader();
			flash.pop({
				title: 'Alert',
				body: data.data,
				type: 'error'
			});
		});
	};



	$scope.reset = function() {
		$('input[name^="TypeValue_"]').each(function(k, v) {
			$(v).select2('val', null);
			delete $scope.basicInfo.template[k].value;
		});
	}
	$scope.setUniqueParamTrue = function(index, $event) {
		var checkbox = $event.target;
		$scope.parameters.fields[index].uniqueCalculationParam = (checkbox.checked ? true : false);

	}
	$scope.fieldKeyChanged = function(id, field) {

		$scope.fieldKeys = [];

		if (field)
			field.fieldVal = null;
		if (id)
			$('input[name="fieldVal_' + id + '"]').select2('val', null);
		for (var i = 0; i < $scope.identifiers.fields.length; i++)
			if ($scope.identifiers.fields[i].fieldKey && $scope.identifiers.fields[i].fieldKey.length > 0) {
				//				$scope.fieldKeys.push($scope.identifiers.fields[i].fieldKey[0].n);
				$scope.fieldKeys.push($scope.identifiers.fields[i].fieldKey[0].v);
			}
	}

	$scope.fieldKeyChangedParameters = function(id, field) {
		$scope.fieldKeysParams = [];
		if (field)
			field.fieldVal = null;
		if (id)
			$('input[name="fieldVal_' + id + '"]').select2('val', null);
		for (var i = 0; i < $scope.parameters.fields.length; i++)
			if ($scope.parameters.fields[i].fieldKey && $scope.parameters.fields[i].fieldKey.length > 0) {
				//				$scope.fieldKeysParams.push($scope.parameters.fields[i].fieldKey[0].n);
				$scope.fieldKeysParams.push($scope.parameters.fields[i].fieldKey[0].v);
			}
	}



	$scope.openDialogChargeBreakage = function(index) {
		var modalInstance = $modal.open({
			templateUrl: 'tms.breackage.html',
			controller: 'breakageCtrl',
			resolve: {
				items: function() {
					return angular.copy($scope.chargeList.fields[index]);
				}
			}
		});
		modalInstance.result.then(function(selectedItem) {
			$scope.chargeList.fields[index].breackage = selectedItem.break;
			$scope.chargeList.fields[index].consider = selectedItem.consider;
            $scope.chargeList.fields[index].removedBrakages = selectedItem.removedBrakages;

		}, function(selectedItem) {
			console.log('Modal dismissed');
		});
	}

	$scope.CreateandSendTemplate = function() {
		commonService.loader(true);
		$scope.objToSave = {};
		$scope.objToSend = {};



		if ($scope.identifiers.fields.length <= 0) {
			flash.pop({
				title: 'Warning',
				body: 'Please select at least one identifier and then edit template',
				type: 'warning'
			});

		} else if ($scope.parameters.fields.length <= 0) {
            flash.pop({
                title: 'Warning',
                body: 'Please select at least one parameter and then edit template',
                type: 'warning'
            });

//        } else if ($scope.chargeList.operand.length != $scope.chargeList.calculationOnCharge.length) {
//            flash.pop({
//                title: 'Warning',
//                body: 'Please select proper operand with charge and then edit template',
//                type: 'warning'
//            });

        } else {

			$scope.objToSend = {
				account: $scope.global.account,
				systemId: $rootScope.loggedInUser.userSystem[0].id,
				tariffName: $scope.basicInfo.tariffName,
				tariffType: $scope.basicInfo.tariffType,
				identifiers: $scope.identifiers.fields,
				additionalTariffInfo: $scope.additionalTariffInfo,
				perChargeCurrencyConversion: $scope.perChargeCurrencyConversion,
				parameters: $scope.parameters.fields,
				charges: $scope.chargeList.fields,
				type: "preview"
			};


			if ($state.current.name.split('.')[2] == 'viewTariff')
				$scope.objToSend.id = $routeParams.templateId;
			var promise1 = commonService.ajaxCall('PUT', 'api/tariff', $scope.objToSend);
			promise1.then(function(data) {
				commonService.loader();
				$scope.showPreviewTable = true;
				$scope.objToSave = data;
				getPreviewTable(data);
			}, function(data) {
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
		}
		commonService.loader();
	};

	$scope.openEditTemplate = function() {
		//currency checkbox should get checked
		if ($scope.global.account.length == 0) {
			flash.pop({
				title: 'Warning',
				body: 'Please select account and then edit template',
				type: 'warning'
			});
			$scope.redirectTo("/tariffManagement");

		}
		$scope.showPreviewTable = false;
		$scope.btnDoneShow = false;
        $scope.savedParameters=[];
        $scope.savedChrges.fields = [];
        $scope.fieldKeysCharges = [];
        $scope.fieldKeysChargeNames = [];

		var promise1 = commonService.ajaxCall('GET', 'api/tariffConfig/template?type=template&id=' + $routeParams.templateId);
		promise1.then(function(data) {
			$scope.basicInfo.tariffName = data.tariffName;
			$scope.basicInfo.tariffType = data.tariffType;
			$scope.identifiers.fields = data.identifiers;
			$scope.additionalTariffInfo = data.additionalTariffInfo;
			$scope.parameters.fields = data.parameters;
			$scope.chargeList.fields = data.charges;

			$scope.perChargeCurrencyConversion = data.perChargeCurrencyConversion;
//            if ($state.current.name.split('.')[2] == 'viewTariff') {
//                $scope.savedChrges = $scope.chargeList.fields;
//            }
            angular.forEach($scope.chargeList.fields, function(item) {
                    $scope.savedChrges.fields.push({
                        "breackage" : item.breackage,
                        "calculation" : item.calculation,
                        "calculationOnCharge" : item.calculationOnCharge,
                        "chargeDecimal" : item.chargeDecimal,
                        "chargeID" : item.chargeID,
                        "chargeNearest" : item.chargeNearest,
                        "chargeRounding" : item.chargeRounding,
                        "noRounding" : item.noRounding,
                        "consider" : item.consider,
                        "currency" : item.currency,
                        "currencyFrequency" : item.currencyFrequency,
                        "currencySource" : item.currencySource,
                        "isLaneCurrency" : item.isLaneCurrency,
                        "exchangeRateAppldOn" : item.exchangeRateAppldOn,
                        "max" : item.max,
                        "min" : item.min,
                        "operand" : item.operand,
                        "weight" : item.weight,
                        "displayName" : item.displayName
                    });

                $scope.fieldKeysCharges.push(item.chargeID.n);
                $scope.fieldKeysChargeNames.push(item.chargeName.n);
            });

            $scope.fieldKeysCalculationOnCharges=$scope.fieldKeysCharges;
//            console.log($scope.fieldKeysCalculationOnCharges);
            $scope.fieldKeys = [];
			angular.forEach($scope.identifiers.fields, function(col, i) {
				angular.forEach(col.fieldKey, function(val, j) {
					$scope.fieldKeys.push(val.v);
				});
			});

			$scope.fieldKeysParams = [];
			angular.forEach($scope.parameters.fields, function(col, i) {
				angular.forEach(col.fieldKey, function(val, j) {
					$scope.fieldKeysParams.push(val.v);
                    $scope.savedParameters.push(val.v);
				});

			});

            $scope.getCharges();
		}, function(data) {
			flash.pop({
				title: 'Alert',
				body: data,
				type: 'error'
			});
		});


	}

    function isChargeExists(chargeId){
        var returnIndex=-1;
        angular.forEach($scope.chargeList.fields, function(item, index){
           if(item.chargeID.n === chargeId){
               returnIndex = index;
           }
        });

        return returnIndex;
    }

	$scope.saveTemplate = function() {
        //check if template already added in group or not and vice versa
        $scope.isvalidTariffGroup = true;// $scope.validateTariffGroup();

//        if($scope.isvalidTariffGroup == false)
//            return;


//      confirm to remove parameters / charges if any deleted by user
        var isFound;
        var removedParameters = [];
        var removedCharges = [];
        var removedCalculationCodes = [];
        var removedMins = [];
        var removedMaxs = [];
        var removedBrakages = [];
        var removedBrakagesCalculationCodes = [];
        var removedDisplayNames = [];

        if($scope.addNewTariff == false) {
//      First check for Parameters
            angular.forEach($scope.savedParameters, function (searchTerm) {
                isFound = $scope.fieldKeysParams.indexOf(searchTerm);
                if (isFound < 0) {
//                console.log('Para Not Found : ' + searchTerm);
                    removedParameters.push(searchTerm);
                }
            });


//      Then check for Charges
            angular.forEach($scope.savedChrges.fields, function (searchTerm) {
                isFound = isChargeExists(searchTerm.chargeID.n) //$scope.chargeList.fields.indexOf(searchTerm);

                if (isFound < 0) {
//                console.log('Charge Not Found : ' + searchTerm);
                    removedCharges.push(searchTerm.chargeName.n);
                } else {
//                Check whether Min, Max or Calculation Code or Breakages are removed or not
                    if (($scope.chargeList.fields[isFound].min == null || $scope.chargeList.fields[isFound].min == undefined || $scope.chargeList.fields[isFound].min == false) && (searchTerm.min == true )) {
//                    console.log('Min Removed : ' + searchTerm.chargeID.n);
                        removedMins.push(searchTerm.chargeName.n);
                    }

                    if (($scope.chargeList.fields[isFound].max == null || $scope.chargeList.fields[isFound].max == undefined || $scope.chargeList.fields[isFound].max == false) && (searchTerm.max == true )) {
//                    console.log('Max Removed : ' + searchTerm.chargeID.n);
                        removedMaxs.push(searchTerm.chargeName.n);
                    }

                    if (($scope.chargeList.fields[isFound].calculation == null || $scope.chargeList.fields[isFound].calculation == undefined || $scope.chargeList.fields[isFound].calculation == "") && (searchTerm.calculation != "" && searchTerm.calculation != null )) {
//                    console.log('Calculation Code Removed : ' + searchTerm.chargeID.n);
                        removedCalculationCodes.push({
                            "key": searchTerm.chargeName.n,
                            "value": null
                        });
                    } else if (($scope.chargeList.fields[isFound].calculation != searchTerm.calculation) && ($scope.chargeList.fields[isFound].calculation != null && searchTerm.calculation != null && $scope.chargeList.fields[isFound].calculation != "" && searchTerm.calculation != "")) {
//                    console.log('Calculation Code Updated : ' + searchTerm.chargeID.n);
                        removedCalculationCodes.push({
                            "key": searchTerm.chargeName.n,
                            "value": $scope.chargeList.fields[isFound].calculation.id
                        });
                    } else if (($scope.chargeList.fields[isFound].displayName != searchTerm.displayName) && ($scope.chargeList.fields[isFound].displayName != null && searchTerm.displayName != null && $scope.chargeList.fields[isFound].displayName != "" && searchTerm.displayName != "")) {
//                    console.log('Display Name Updated : ' + searchTerm.chargeID.n);
                        removedDisplayNames.push({
                            "key": searchTerm.chargeName.n,
                            "value": searchTerm.displayName + '#' + $scope.chargeList.fields[isFound].displayName
                        });
                    }

                    if ($scope.chargeList.fields[isFound].removedBrakages != undefined) {
                        if ($scope.chargeList.fields[isFound].removedBrakages.length > 0) {
//                        console.log('Breakage Removed : ' + searchTerm.chargeID.n);
                            removedBrakages.push(searchTerm.chargeName.n);
                            if (searchTerm.calculation == null || searchTerm.calculation == undefined) {
                                removedBrakagesCalculationCodes.push(null);
                            }
                            else if (searchTerm.calculation.id == null || searchTerm.calculation.id == undefined) {
                                removedBrakagesCalculationCodes.push(null);
                            }
                            else {
                                removedBrakagesCalculationCodes.push(searchTerm.calculation.id);
                            }
                        }
                    }
                }
            });

            var msg = '';
            if (removedParameters.length > 0) {
                msg += 'You have removed the Parameter(s) ' + removedParameters + '.';// Parameter(s) will be removed from linked lanes also. Do you still want to remove these Parameters?";
            }

            if (removedCharges.length > 0) {
                msg += ' \n' + ' You have removed the Charge(s) ' + removedCharges + '.';
            }

            if (removedMins.length > 0) {
                msg += ' \n You have removed Minimum for Charge(s) ' + removedMins + '.';
            }

            if (removedMaxs.length > 0) {
                msg += ' \n You have removed Maximum for Charge(s) ' + removedMaxs + '.';
            }

            if (removedCalculationCodes.length > 0) {
                msg += ' \n You have removed Calculation Codes for Charge(s) ';
                angular.forEach(removedCalculationCodes, function (obj) {
                    msg += obj.key;
                })
                msg += '.';
            }

            if (removedBrakages.length > 0) {
                msg += ' \n You have removed Breakage for Charge(s) ' + removedBrakages + '.';
            }

            if (removedDisplayNames.length > 0) {
                msg += ' \n You have removed/updated Display Name for Charge(s) ';
                angular.forEach(removedDisplayNames, function (obj) {
                    msg += obj.key;
                })
                msg += '.';
            }

            msg += ' \n Parameter(s)/Charge(s) will be removed from linked lanes also. \n Do you still want to remove these Parameters/Charges?';
        }
        if(removedBrakages.length > 0 || removedDisplayNames.length > 0 || removedParameters.length > 0 || removedCharges.length > 0 ||
            removedMins.length > 0 || removedMaxs.length > 0 || removedCalculationCodes.length > 0)  {
//            var msg = "You have removed the Parameter(s) " + removedParameters + ". Parameter(s) will be removed from linked lanes also. Do you still want to remove these Parameters?";
            var modalInstance = $modal.open({
                templateUrl: 'confirm.html',
                controller: 'modalInstanceCtrl',
                resolve: {
                    items: function() {
                        return angular.copy({
                            msg:  msg//'<p>' + msg.replace(/[\n]+/, '</p><p>') + '</p>'
                        });
                    }

                }
            });
            modalInstance.result.then(function (selectedItem) {


                //Remove Parameters
                if(removedParameters.length > 0 ) {
                    var parameterObj = {

                        "data": {
                            "type": "parameters",
                            "key": removedParameters
                        },
                        "templateId": $routeParams.templateId,
                        "systemId": $rootScope.loggedInUser.userSystem[0].id,
                        "account": $scope.global.account[0].n

                    };
                    var promise = commonService.ajaxCall('POST', '/api/tariffConfig/unlink', parameterObj);
                    promise.then(function (retData) {
                            flash.pop({
                                title: 'Alert',
                                body: 'Parameter(s) removed successfully.',
                                type: 'success'
                            });
                            return true;
                        },
                        function (data) {
                            flash.pop({
                                title: 'Alert',
                                body: data.data.invalidMsgList + ' : ' + data.data.doc,
                                type: 'error'
                            });
                            return false;
                        });
                }

                //Remove Charges
                if(removedCharges.length > 0 ) {
                    var parameterObj = {

                        "data": {
                            "type": "charges",
                            "key": removedCharges
                        },
                        "templateId": $routeParams.templateId,
                        "systemId": $rootScope.loggedInUser.userSystem[0].id,
                        "account": $scope.global.account[0].n

                    };
                    var promise = commonService.ajaxCall('POST', '/api/tariffConfig/unlink', parameterObj);
                    promise.then(function (retData) {
                            flash.pop({
                                title: 'Alert',
                                body: 'Charge(s) removed successfully.',
                                type: 'success'
                            });
                            return true;
                        },
                        function (data) {
                            flash.pop({
                                title: 'Alert',
                                body: data.data.invalidMsgList + ' : ' + data.data.doc,
                                type: 'error'
                            });
                            return false;
                        });
                }

                //Remove Mins
                if(removedMins.length > 0 ) {
                    var parameterObj = {

                        "data": {
                            "type": "charges",
                            "key": removedMins,
                            "internalKey": "min",
                            "value": false
                        },
                        "templateId": $routeParams.templateId,
                        "systemId": $rootScope.loggedInUser.userSystem[0].id,
                        "account": $scope.global.account[0].n

                    };
                    var promise = commonService.ajaxCall('POST', '/api/tariffConfig/unlink', parameterObj);
                    promise.then(function (retData) {
                            flash.pop({
                                title: 'Alert',
                                body: 'Minimum for charges removed successfully.',
                                type: 'success'
                            });
                            return true;
                        },
                        function (data) {
                            flash.pop({
                                title: 'Alert',
                                body: data.data.invalidMsgList + ' : ' + data.data.doc,
                                type: 'error'
                            });
                            return false;
                        });
                }

                //Remove Maxs
                if(removedMaxs.length > 0 ) {
                    var parameterObj = {

                        "data": {
                            "type": "charges",
                            "key": removedMaxs,
                            "internalKey": "max",
                            "value": false
                        },
                        "templateId": $routeParams.templateId,
                        "systemId": $rootScope.loggedInUser.userSystem[0].id,
                        "account": $scope.global.account[0].n

                    };
                    var promise = commonService.ajaxCall('POST', '/api/tariffConfig/unlink', parameterObj);
                    promise.then(function (retData) {
                            flash.pop({
                                title: 'Alert',
                                body: 'Maximum for charges removed successfully.',
                                type: 'success'
                            });
                            return true;
                        },
                        function (data) {
                            flash.pop({
                                title: 'Alert',
                                body: data.data.invalidMsgList + ' : ' + data.data.doc,
                                type: 'error'
                            });
                            return false;
                        });
                }

                //Remove Calculation Codes
                if(removedCalculationCodes.length > 0 ) {
                    var parameterObj = {};
                    var key = [];
                    angular.forEach(removedCalculationCodes, function (item){
                        key = [];
                        key.push(item.key);
                        parameterObj = {

                            "data": {
                                "type": "charges",
                                "key": key,
                                "internalKey": "calculation",
                                "value": item.value
                            },
                            "templateId": $routeParams.templateId,
                            "systemId": $rootScope.loggedInUser.userSystem[0].id,
                            "account": $scope.global.account[0].n

                        };
                        var promise = commonService.ajaxCall('POST', '/api/tariffConfig/unlink', parameterObj);
                        promise.then(function (retData) {
                            flash.pop({
                                title: 'Alert',
                                body: 'Calculation Codes for charges removed successfully.',
                                type: 'success'
                            });
                            return true;
                        },
                        function (data) {
                            flash.pop({
                                title: 'Alert',
                                body: data.data.invalidMsgList + ' : ' + data.data.doc,
                                type: 'error'
                            });
                            return false;
                        });

                    });
                }

                //update Display Names
                if(removedDisplayNames.length > 0 ) {
                    var parameterObj = {};
                    var key = [];
                    angular.forEach(removedDisplayNames, function (item){
                        key = [];
                        key.push(item.key);
                        parameterObj = {

                            "data": {
                                "type": "charges",
                                "key": key,
                                "internalKey": "displayName",
                                "value": item.value
                            },
                            "templateId": $routeParams.templateId,
                            "systemId": $rootScope.loggedInUser.userSystem[0].id,
                            "account": $scope.global.account[0].n

                        };
                        var promise = commonService.ajaxCall('POST', '/api/tariffConfig/unlink', parameterObj);
                        promise.then(function (retData) {
                                flash.pop({
                                    title: 'Alert',
                                    body: 'Display Name for charges updated successfully.',
                                    type: 'success'
                                });
                                return true;
                            },
                            function (data) {
                                flash.pop({
                                    title: 'Alert',
                                    body: data.data.invalidMsgList + ' : ' + data.data.doc,
                                    type: 'error'
                                });
                                return false;
                            });

                    });
                }

                //Remove Breakages
//                if(removedBrakages.length > 0 ) {
//                    var parameterObj = {};
//
//                    parameterObj = {
//
//                        "data": {
//                            "type": "charges",
//                            "key": removedBrakages,
//                            "internalKey": "breackage",
//                            "value": removedBrakagesCalculationCodes
//                        },
//                        "templateId": $routeParams.templateId,
//                        "systemId": $rootScope.loggedInUser.userSystem[0].id,
//                        "account": $scope.global.account[0].n
//
//                    };
//                    var promise = commonService.ajaxCall('POST', '/api/tariffConfig/unlink', parameterObj);
//                    promise.then(function (retData) {
//                            flash.pop({
//                                title: 'Success',
//                                body: 'Breakages for charges removed successfully.',
//                                type: 'success'
//                            });
//                            return true;
//                        },
//                        function (data) {
//                            flash.pop({
//                                title: 'Alert',
//                                body: data.data.invalidMsgList + ' : ' + data.data.doc,
//                                type: 'error'
//                            });
//                            return false;
//                        });
//
//                }


                // Save the data now
                $scope.objToSave.type = "save";
                var promise1 = commonService.ajaxCall('PUT', 'api/tariff', $scope.objToSave);
                promise1.then(function (data) {
                    flash.pop({
                        title: 'Success',
                        body: data.msg,
                        type: 'success'
                    });
                    $scope.redirectTo("/tariffLane/editTariff/" + data.id);
                }, function (data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.msg,
                        type: 'error'
                    });
                });
            }, function (selectedItem) {
                console.log('Modal dismissed');
                return false;

            });
        }else {
            $scope.objToSave.type = "save";
            if($scope.global.isGroupSelected)
                $scope.objToSave.groupName=$scope.global.account[0].n;
            var promise1 = commonService.ajaxCall('PUT', 'api/tariff', $scope.objToSave);
            promise1.then(function (data) {
                $scope.editedLane = [null,null,null,null,null,$scope.objToSave.tariffName,$scope.objToSave.tariffType,'']; // To Do : Need to take from other source.
                flash.pop({
                    title: 'Success',
                    body: data.msg,
                    type: 'success'
                });
//                console.log($scope.editedLane)
                $scope.redirectTo("/tariffLane/editTariff/" + data.id);
            }, function (data) {
                flash.pop({
                    title: 'Alert',
                    body: data,
                    type: 'error'
                });
            });
        }

//        }
	};
	$scope.listTariffs = function() {
		$scope.objToSave.type = "save";
        if($scope.global.isGroupSelected)
            $scope.objToSave.groupName=$scope.global.account[0].n;
		var promise1 = commonService.ajaxCall('PUT', 'api/tariff', $scope.objToSave);
		promise1.then(function(data) {
			flash.pop({
				title: 'Success',
				body: data.msg,
				type: 'success'
			});
			$scope.redirectTo("/tariffLane/editTariff");
		}, function(data) {
			flash.pop({
				title: 'Alert',
				body: data,
				type: 'error'
			});
		});

	};

	function getPreviewTable(data) {
		$scope.columnsTariff = [];
		if (data) {
			var sc = data.fields.sort(function(a, b) {
				return parseInt(a.displayOrder) - parseInt(b.displayOrder)
			});
			angular.forEach(sc, function(col, i) {
				if (col.isActive) {
					if (col.key == 'email')
						col.isReadonly = true;
					switch (col.type) {
						case 'dropdown':
						case 'multiselect':
							$scope.columnsTariff.push({
								value: 't.' + col.key.replace(".","|"),
								type: 'autocomplete',
								title: col.label.replace("|", "."),
								src: col.suggestionsSource + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id ,
								suggestionField: col.suggestionField,
								width: col.length * 9,
								length: col.length,
								readOnly: true,
								renderer: cellRenderer,
								isMandatory: col.isMandatory,
								key: col.key.replace(".","|"),
								regex: col.regex,
								toolTip: col.toolTip,
								errorMessage: col.errorMessage,
								displayOrder: col.displayOrder
//                                systemId:  $rootScope.loggedInUser.userSystem[0].id
							})
							break;
						default:
							if (col.type == 'multiline')
								col.type = 'text';
							$scope.columnsTariff.push({
								value: 't.' + col.key.replace(".","|"),
								type: col.type,
								allowInvalid: false,
								renderer: cellRenderer,
								readOnly: true,
								title: col.label.replace("|", "."),
								width: col.length * 9,
								length: col.length,
								isMandatory: col.isMandatory,
								key: col.key.replace(".","|"),
								regex: col.regex,
								toolTip: col.toolTip,
								errorMessage: col.errorMessage,
								displayOrder: col.displayOrder
//                                systemId:  $rootScope.loggedInUser.userSystem[0].id
							});
					}
				}
			});
			$scope.loader = false;
			$scope.btnDoneShow = true;
		} else {
			$scope.loader = false;
			flash.pop({
				title: 'Alert',
				body: data.data,
				type: 'error'
			});
		}
	}
	$scope.clearAccountModel = function() {
		$('input[name="accountNumberlist"]').select2('val', null);

		$scope.tariffList.length = 0;
		$scope.global.account = [];
		$scope.accounts = [];
        $scope.global.account1 = [];
        $scope.accountGroup = [];
	};


	$scope.setAccounts = function(acc, isGroupSelect) {
        if(isGroupSelect!=undefined)
            $scope.global.isGroupSelected = isGroupSelect;

        if(isGroupSelect)
        {
            $scope.accounts = [];
            $scope.global.account1 = [];
            $scope.tariffList = [];
//            $scope.global.account = $scope.global.accountGroup;
        }
        else
        {
            $scope.global.accountGroup = [];
            if (acc && acc.length)
                $scope.accounts = $filter('toArrayId')(acc).split(',');
            else {
                $scope.accounts = [];
                $scope.tariffList = [];
                $scope.showGoBtn = false;
            }
//            $scope.global.account = $scope.global.account1;
        }

//        $scope.accountGlobal = angular.copy(acc);
        $scope.global.account = angular.copy(acc);

    };
	$scope.quickSearch = function(pageNo, isGetCount,type) {
		$scope.Loader = true;
        $scope.totalItemsListTariff = 0;
        var obj = {
            account: $scope.global.account,
            systemId: $rootScope.loggedInUser.userSystem[0].id,
            type : type
        };
        obj.isGroup = $scope.global.isGroupSelected;

        // if quicksearch is called from apply filter, save get call for filter since new filters are available in 'selectedTMSFilter'
        if(saveGetFilterCall) {
            saveGetFilterCall = false;
            // search now
            doSearchNow();
        } else {
            // called this function from other places, hence first get the filters and then call dosearch
            commonService.ajaxCall('GET', 'api/tariffTypeFilter?accountId='+$scope.global.account[0].id+'&currentContext='+($state.$current.context && $state.$current.context.module?$state.$current.context.product+"."+$state.$current.context.module:null))
                .then(function(response){
                    // successfull
                    // response is hash, loop through it
                    var eachField = [];
                    angular.forEach(response, function(value, key){
                        // check if object is not empty
                        if(response.hasOwnProperty(key)) {
                            // make object for filter
                            eachField.push({
                                "name": key,
                                "operator":"equalTo",
                                "value": value
                            });
                            // populate the filter
                            $scope.fields[key].val = [{"id":'', "v":value,"n":value}];
                        }//if
                    });//for

                    // response contains some hash
                    if(eachField.length > 0) {
                        // store it in global variable to be used in quick search
                        selectedTMSFilter = {
                            "condition": "and",
                            "fields": eachField
                        }
                    } else {
                        selectedTMSFilter = {};
                    }//if-else

                    // now make a search
                    doSearchNow();

                }, function(error){
                    //error
                    flash.pop({
                        title: 'Alert',
                        body: error.data,
                        type: 'error'
                    });
                });
        }//if-else

        // call search api
        function doSearchNow() {
            // append new filters
            obj.rules = selectedTMSFilter;
            var promise = commonService.ajaxCall('POST', 'api/tariff', obj);

            promise.then(function (data) {
                $scope.Loader = false;
                $scope.tariffList = data;
                $scope.totalItemsListTariff = data.length;

                angular.forEach(data, function (item, index) {
                    if (item.key == "effectivedate") {
                        $scope.effectiveDateID = index;
                    }
                    else if (item.key == "expirydate") {
                        $scope.expiryDateID = index;
                    }
                });

                if ($scope.tariffList.length && type == 'tariffConfig') {
                    $scope.redirectTo("/tariffManagement/listTariff");
                } else
                    $scope.showGoBtn = true;

            }, function (data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                $scope.Loader = false;
            });
        }//end
	};

    $scope.cloneAndAddNewTariff = function (){
        if($scope.indexAccountclone != 0){
            console.log($scope.indexAccountclone);
        }

        if ($scope.global.account.length == 0) {
            flash.pop({
                title: 'Warning',
                body: 'Please select account and then edit template',
                type: 'warning'
            });
            $scope.redirectTo("/tariffManagement");

        }
        $scope.showPreviewTable = false;
        $scope.btnDoneShow = false;
        $scope.savedParameters=[];
        $scope.savedChrges.fields = [];
        $scope.fieldKeysCharges = [];
        $scope.fieldKeysChargeNames = [];

        var promise1 = commonService.ajaxCall('GET', 'api/tariffConfig/template?type=template&id=' + $scope.tariffList[$scope.indexAccountclone][1]);
        promise1.then(function(data) {
            $scope.basicInfo.tariffName = "";
            $scope.basicInfo.tariffType = data.tariffType;
            $scope.identifiers.fields = data.identifiers;
            $scope.additionalTariffInfo = data.additionalTariffInfo;
            $scope.parameters.fields = data.parameters;
            $scope.chargeList.fields = data.charges;

            $scope.perChargeCurrencyConversion = data.perChargeCurrencyConversion;

            angular.forEach($scope.chargeList.fields, function(item) {
                $scope.savedChrges.fields.push({
                    "breackage" : item.breackage,
                    "calculation" : item.calculation,
                    "calculationOnCharge" : item.calculationOnCharge,
                    "chargeDecimal" : item.chargeDecimal,
                    "chargeID" : item.chargeID,
                    "chargeNearest" : item.chargeNearest,
                    "chargeRounding" : item.chargeRounding,
                    "noRounding" : item.noRounding,
                    "consider" : item.consider,
                    "currency" : item.currency,
                    "currencyFrequency" : item.currencyFrequency,
                    "currencySource" : item.currencySource,
                    "isLaneCurrency" : item.isLaneCurrency,
                    "exchangeRateAppldOn" : item.exchangeRateAppldOn,
                    "max" : item.max,
                    "min" : item.min,
                    "operand" : item.operand,
                    "weight" : item.weight,
                    "displayName" : item.displayName
                });

                $scope.fieldKeysCharges.push(item.chargeID.n);
                $scope.fieldKeysChargeNames.push(item.chargeName.n);
            });

            $scope.fieldKeysCalculationOnCharges=$scope.fieldKeysCharges;
            $scope.fieldKeys = [];
            angular.forEach($scope.identifiers.fields, function(col, i) {
                angular.forEach(col.fieldKey, function(val, j) {
                    $scope.fieldKeys.push(val.v);
                });
            });

            $scope.fieldKeysParams = [];
            angular.forEach($scope.parameters.fields, function(col, i) {
                angular.forEach(col.fieldKey, function(val, j) {
                    $scope.fieldKeysParams.push(val.v);
                    $scope.savedParameters.push(val.v);
                });

            });

            $scope.getCharges();

            $scope.addNewTariff = true;
            $scope.redirectTo("/tariffManagement/newTariff/" + $scope.global.account[0].id);

        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data,
                type: 'error'
            });
        });


    }

    $scope.changeSelectedIndex = function(listIndex){
        $scope.indexAccountclone = listIndex;
        $scope.tariffList[listIndex][0] = !$scope.tariffList[listIndex][0];
        for(var i=1; i<$scope.tariffList.length; i++)
        {
            if(i!=listIndex)
                $scope.tariffList[i][0] = false;
        }
    }

	$scope.redirectToAddNewTariff = function() {
		//check if $scope.accounts array contains more than one accounts
		$scope.columnsTariff = [];
		if ($scope.accounts.length > 1)
			$scope.openSelectSingleAccountDialog();

		else {
            $scope.addNewTariff = true;
			resetTemplateModel();
//            if($scope.global.isGroupSelected){
//                $scope.redirectTo("/tariffManagement/newTariff/" + $scope.accountGroup[0]);
//            }
//            else {
                $scope.redirectTo("/tariffManagement/newTariff/" + $scope.accounts[0]);
//            }

		}

	};

	$scope.currencyPercharge = function(currencyPerCharge) {
		if (currencyPerCharge == true)
			$scope.perChargeCurrencyConversion = true;
		else {
			$scope.perChargeCurrencyConversion = false;
            $scope.allChargeCurrency=$scope.additionalTariffInfo;
			angular.forEach($scope.chargeList.fields, function(i) {
				var ob = angular.copy($scope.allChargeCurrency);
				i.currencySource = ob.currencySource;
				i.currencyFrequency = ob.currencyFrequency;
				i.exchangeRateAppldOn = ob.tariffAppliedOnDate;
				i.currency = ob.currency;

			});
		}

	};

	function getCurrencySource() {
		commonService.loader(true);
		var promise = commonService.ajaxCall('GET', '/api/suggestion?pageLimit=10&page=1&suggestionFor=metadata_currencySource');
		promise.then(function(data) {
				commonService.loader();
				$scope.currencySourceDS = data.msg;
			},
			function(data) {
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	}

	function getExchangeRateAppldOnDateTypes() {
		commonService.loader(true);
		var promise = commonService.ajaxCall('GET', '/api/suggestion?pageLimit=10&page=1&suggestionFor=tarrifAppliedOnDates&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
		promise.then(function(data) {
				commonService.loader();
				$scope.exchangeRateAppldOnDateTypesDS = data.msg;
			},
			function(data) {
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	}

	function getCurrencyFrequency() {
		commonService.loader(true);
		var promise = commonService.ajaxCall('GET', '/api/suggestion?pageLimit=10&page=1&suggestionFor=metadata_currencyFrequency');
		promise.then(function(data) {
				commonService.loader();
				$scope.currencyFrequencyDS = data.msg;
			},
			function(data) {
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	}

	function getCurrency() {
		commonService.loader(true);
		var promise = commonService.ajaxCall('GET', '/api/suggestion?pageLimit=10&page=1&suggestionFor=currency&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
		promise.then(function(data) {
				commonService.loader();
				$scope.currencyDS = data.msg;
			},
			function(data) {
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	}

	 $scope.getCalculation = function() {
		commonService.loader(true);
		var promise = commonService.ajaxCall('GET', '/api/suggestion?pageLimit=10&page=1&suggestionFor=metadata_calculationMethod');
		promise.then(function(data) {
				commonService.loader();
				$scope.calculationDS = data.msg;
			},
			function(data) {
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	}

	 $scope.getCalculationCodes = function() {
		commonService.loader(true);
		var promise = commonService.ajaxCall("GET", "api/suggestion?suggestionFor=calculationCode&system=" + $rootScope.loggedInUser.userSystem[0].id + "&suggestionTariffConfig=true");
		promise.then(function(data) {
				commonService.loader();
				$scope.calculationCodes = data.msg;
			},
			function(data) {
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	}

	 $scope.getWeight = function() {
		commonService.loader(true);
//		var promise = commonService.ajaxCall('GET', '/api/suggestion?pageLimit=10&page=1&suggestionFor=metadata_weightMethod');
        var promise = commonService.ajaxCall('GET', '/api/suggestion?pageLimit=10&page=1&suggestionFor=weight&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
		promise.then(function(data) {
				commonService.loader();
				$scope.weightDS = data.msg;

				//				$scope.weightDS.push("");

			},
			function(data) {
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	}

	 $scope.getOperand = function() {
		commonService.loader(true);
		var promise = commonService.ajaxCall('GET', '/api/suggestion?pageLimit=10&page=1&suggestionFor=metadata_operandMethod');
		promise.then(function(data) {
				commonService.loader();
				$scope.operandDS = data.msg;
            },
			function(data) {
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	}
	$scope.onloadAddTariffPage = function() {
		//commonService.loader(true);
		$scope.perChargeCurrencyConversion = false;
//		$scope.getCharges();
	}


	$scope.enableWeightDD = function(name) {
		if (name == "Per KG") {
			$scope.perKG = true;
		}
	}
//	$scope.openTariffEditDialog = function(templateId, accountId, accountNumber) {
//		var modalInstance = $modal.open({
//			templateUrl: 'confirmEditTariff.html',
//			controller: 'modalInstanceCtrl',
//			resolve: {
//				items: function() {
//					return angular.copy({
//						msg: 'What do you want to edit?',
//						templateId: templateId,
//						accountId: accountId
//					});
//				}
//			}
//		});
//		modalInstance.result.then(function(selectedItem) {
//			resetTemplateModel();
//			var temp = [{
//				id: accountId,
//				v: accountId,
//				n: accountNumber
//			}]
//            if($scope.global.isGroupSelected)
//            {
//                $scope.setAccounts($scope.global.account,true);
//            }else
//			    $scope.setAccounts(temp,false);
//			$scope.redirectTo(selectedItem);
//		}, function(selectedItem) {
//			console.log('Modal dismissed ');
//		});
//	}
	$scope.chargeRemoveConfirmation = function(index) {
		var tmpMsg = 'Are you sure yo want to remove this charge ? Note : Once removed,to get it again you will have to refresh the whole page';
		var modalInstance = $modal.open({
			templateUrl: 'confirm.html',
			controller: 'modalInstanceCtrl',
			resolve: {
				items: function() {
					return angular.copy({
						msg: tmpMsg
					});
				}
			}
		});
		modalInstance.result.then(function(selectedItem) {
			$scope.chargeList.fields.splice(index, 1);
            $scope.fieldKeysCharges.splice(index, 1);
            $scope.fieldKeysCalculationOnCharges = $scope.fieldKeysCharges;
//            console.log($scope.fieldKeysCalculationOnCharges);
		}, function(selectedItem) {
			console.log('Modal dismissed ');
		});
	}
	$scope.openSelectSingleAccountDialog = function() {
		var modalInstance = $modal.open({
			templateUrl: 'confirmMessageSingleAcc.html',
			controller: 'modalInstanceCtrl',
			resolve: {
				items: function() {
					return angular.copy({
						msg: 'Please select only one account !!'
					});
				}
			}
		});
		modalInstance.result.then(function(selectedItem) {

		}, function(selectedItem) {
			console.log('Modal dismissed ');
		});
	}
	$scope.redirectTo = function(path) {
		//redirect based on wizard / organizationsetup
		$location.path($state.current.name.split('.')[0] + path);

	};
	//edit Tariff

    $scope.updateLanebyFormView = function (move){

        for (var i=0 ; i<$scope.selectedLane.fields.length;i++) {
            if ($scope.lanes[$scope.currentRowIndex] != undefined) {
                if($scope.lanes[$scope.currentRowIndex][$scope.selectedLane.fields[i].key] !=$scope.selectedLane.fields[i].value) {

                    if ($scope.selectedLane.fields[i].type == "multiselect" || $scope.selectedLane.fields[i].type == "dropdown") {
                        if ($scope.selectedLane.fields[i].value.n != undefined)
                            var val = $scope.selectedLane.fields[i].value.n;
                        else
                            var val = $scope.selectedLane.fields[i].value[0].n;
                        $scope.lanes[$scope.currentRowIndex][$scope.selectedLane.fields[i].key] = val;

                    } else if ($scope.selectedLane.fields[i].type == "date") {
                        $scope.lanes[$scope.currentRowIndex][$scope.selectedLane.fields[i].key] = $filter('date')($scope.selectedLane.fields[i].value, "yyyy-MM-dd");
                    } else {
                        $scope.lanes[$scope.currentRowIndex][$scope.selectedLane.fields[i].key] = $scope.selectedLane.fields[i].value;
                    }
                    $scope.flgUpdate = true;
                }
            }
        }
        $scope.lanes[$scope.currentRowIndex].updateField = true;

        if(move=="close"){
            $scope.showGrid = false;
        } else if(move=="prev")
        {
            if ($scope.currentRowIndex >1)
            {
                $scope.currentRowIndex = $scope.currentRowIndex -1;
                $scope.showHideTariffFormView($scope.currentRowIndex,false);
            }
        }else if(move=="next"){
            if ($scope.currentRowIndex < $scope.lanes.length-1)
            {
                $scope.currentRowIndex = $scope.currentRowIndex + 1;
                $scope.showHideTariffFormView($scope.currentRowIndex,false);
            }
        }
    }
    $scope.showHideTariffFormView = function (rowIndex,isShowUpdate){
        if($scope.addMode)
        {
            flash.pop({
                title: 'Alert',
                body: 'Form View can not be shown in Add Mode',
                type: 'warning'
            });
            return;
        }

        if(isShowUpdate)
            $scope.showGrid = !$scope.showGrid;
//        console.log($scope.showGrid);

        $scope.isRowDoubleClicked = false;
//        $scope.selecteLane = $scope.lanes[rowIndex];
        for (var i=0 ; i<$scope.selectedLane.fields.length;i++) {
            if ($scope.lanes[$scope.currentRowIndex] != undefined) {
                if ($scope.selectedLane.fields[i].type == "multiselect" || $scope.selectedLane.fields[i].type == "dropdown") {
                    var obj = {
                        "id": $scope.lanes[$scope.currentRowIndex][$scope.selectedLane.fields[i].key],
                        "v": "",
                        "n": $scope.lanes[$scope.currentRowIndex][$scope.selectedLane.fields[i].key]
                    }
                    $scope.selectedLane.fields[i].value = obj;
                } else {
                    $scope.selectedLane.fields[i].value = $scope.lanes[$scope.currentRowIndex][$scope.selectedLane.fields[i].key];
                }
            }
        }
        $scope.RenderHTW($scope.showGrid);
    }

	var cellRenderer = function(instance, td, row, col, prop, value, cellProperties) {
//        console.log('prop: ' + prop + ', value :' + value + ', cellProperties : ' + cellProperties );
//        $scope.currentRowIndex = row;
//        var isEditPermission = commonService.applyPermission("editTariffLanes");
//        console.log(isEditPermission);
//        cellProperties.readOnly = ! isEditPermission;

        if(instance.getSelected()!=undefined) {
//            console.log(instance.getSelected()[0]);
            $scope.currentRowIndex = instance.getSelected()[0];
//            $scope.showHideTariffFormView($scope.currentRowIndex);
        }
		if (cellProperties.type == 'autocomplete')
			Handsontable.AutocompleteCell.renderer.apply(this, arguments)
		else if (cellProperties.type == 'date')
			Handsontable.DateCell.renderer.apply(this, arguments)
		else
			Handsontable.TextCell.renderer.apply(this, arguments);

		if (cellProperties.toolTip)
			td.title = '';

        if($scope.lanes[row].expiryDate != undefined){
            $scope.getDatetime = new Date;
            if ($filter('date')($scope.getDatetime,"yyyy-MM-dd")  > $scope.lanes[row].expiryDate) {
                td.title = 'Lane Expired!\n';
                td.style.color = 'red';
            }
        }
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
				td.title += cellProperties.errorMessage;
				td.style.backgroundColor = 'pink';
			}
		}
        else
            td.title = value;

//        console.log($scope.isRowDoubleClicked);
//        if($scope.isRowDoubleClicked)
//            $scope.showHideTariffFormView(row);

        for (var i=0 ; i<$scope.selectedLane.fields.length;i++)
        {
            if($scope.laneProfileData[row] != undefined)
                $scope.selectedLane.fields[i].value = $scope.lanes[row][$scope.selectedLane.fields[i].key];
        }

        td.innerHtml = value;
		return td;
	}

    var buttonRenderer = function(instance, td, row, col, prop, value, cellProperties) {
        var escaped = Handsontable.helper.stringify(value);
        var $btn = $('<a class="command" type="submit"> <i class="fa fa-list"></i></a>');
        $btn.on('click', function() {
            $scope.viewHistory(cellProperties.prop, $scope.lanes [row].id, row);
        });
        $(td).empty().append($btn); //empty is needed because you are rendering to an existing cell
        return td;
        // }
    };


    $scope.viewHistory = function(prop,laneid,rowid)
    {
        var promise = commonService.ajaxCall('GET', 'api/tariffLaneHistory?laneId=' + laneid);
        promise.then(function(data) {
//            $scope.laneHistoryData = data.historyDoc;

            var isRowCollapsed = [];
            for (var i = 1; i < data.historyDoc.length ; i++) {
                isRowCollapsed[i] = true;
            }
            $scope.Loader = true;
//            console.log(isRowCollapsed);
//        $scope.redirectTo("/documentManagement");

            var itemlaneHistory = {};

            itemlaneHistory = {
                systemId: $rootScope.loggedInUser.userSystem[0].id,
                templateId: $routeParams.templateId,
                account:  $scope.global.account[0].n,
                laneId: laneid,
                laneHistoryData: data.historyDoc,
                totalItemslaneHistory: data.count,
                isRowCollapsed: isRowCollapsed
            };

            var modalInstance = $modal.open({
                templateUrl: 'tariffManagement.lanehistory.html',
                controller: 'tmsTariffLaneHistoryCtrl',
                resolve: {
                    items: function () {
                        return angular.copy({
                            fields: itemlaneHistory
                        });
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {

//            console.log(selectedItem);

            }, function(selectedItem) {
//            console.log(selectedItem);
            });

            $scope.Loader = false;
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data,
                type: 'error'
            });
        });
    }



    $scope.doubleClick = function(rowIndex){
//        console.log('doubl click' + rowIndex);
    }

	$scope.aftercellchange = function(values) {
        console.log('Cell change event fired')
		$scope.selectedLanes = [];
		for (var i = 0; i < $scope.lanes.length; i++) {
			if ($scope.lanes[i].updateField === true || $scope.lanes[i].updateField === "true") {
				$scope.selectedLanes.push({
					id: $scope.lanes[i].id,
					name: $scope.lanes[i].email,
					update: true,
					index: i
				});
			}
		}
		if ($scope.selectedLanes.length == 1) {
			counter = 2;
		}
	}

	function popAlert(msg, type) {
		flash.pop({
			title: 'Alert',
			body: msg,
			type: type
		});
	}

    $scope.dblclick = function (e,n){
//        console.log('hey its dbl click');
//        console.log(e + n);
    }

    $scope.afterOnCellMouseDown = function(e, c, td){
    };

	$scope.celChange = function(values, source) {
        invalidateFlag = invalidateRow(values);
		var cellCount = values.length;
		for (var i = 0; i < cellCount; i++) {
			if (values[i][3] !== values[i][2]) {
				if (values[i][3] === '')
					values[i][3] = null;
				else if (values[i][3] === 'true' || values[i][3] === 'false')
					values[i][3] = eval(values[i][3]);
				if (values[i][1] !== ' ' && (!$scope.lanes[values[i][0]] || !$scope.lanes[values[i][0]].updateField))
                    values.push([values[i][0], 'updateField', 'null', true]);

                if(values[i][1]==="updateField")
                {
                    $scope.currentRowIndex = values[i][0];
                    $scope.showHideTariffFormView($scope.currentRowIndex,false);
                }
			}

			if (values[i][1] === "effectiveDate" && $scope.lanes[values[i][0]] != undefined) {
                if($scope.lanes[values[i][0]].expiryDate != undefined){
                    if (values[i][3] > $scope.lanes[values[i][0]].expiryDate) {
                        popAlert('effective date should be less than expiry date.', 'warning');
                        $('.handsontable').handsontable('render');
                        return false;
                    }
				}

                if (values[i][3] < $scope.effectiveDate) {
                    popAlert('effective date should be greater than template effective date - ' + $scope.effectiveDate , 'warning');
                    $('.handsontable').handsontable('render');
                    return false;
                }

                if (values[i][3] > $scope.expiryDate) {
                    popAlert('effective date should be less than template expiry date - ' + $scope.expiryDate, 'warning');
                    $('.handsontable').handsontable('render');
                    return false;
                }

			}
			if (values[i][1] === "expiryDate" && $scope.lanes[values[i][0]] != undefined) {
                if($scope.lanes[values[i][0]].effectiveDate != undefined) {
                    if (values[i][3] < $scope.lanes[values[i][0]].effectiveDate) {
                        popAlert('expiry date should be greater than effective date.', 'warning');
                        $('.handsontable').handsontable('render');
                        return false;
                    }
                }
                if (values[i][3] > $scope.expiryDate) {
                    popAlert('expiry date should be less than template expiry date - ' + $scope.expiryDate, 'warning');
                    $('.handsontable').handsontable('render');
                    return false;
                }

                if (values[i][3] < $scope.effectiveDate) {
                    popAlert('expiry date should be greater than template effective date - ' + $scope.effectiveDate, 'warning');
                    $('.handsontable').handsontable('render');
                    return false;
                }

			}

		}
	}

    var invalidateRow = function (array) {
        if(array[0][1] !== 'effectiveDate' && array[0][1] !== 'expiryDate')
            if(array[0][2] !== array[0][3])
                return true;
        return false;
    };

    $scope.celSelect = function(){
//        console.log('celSelect');
    }

	$scope.afterRender = function() {
		$scope.hw = $('.west-back.div-west.stretch').width() - 12;
	}

	function renderHT() {
//		if ($scope.lanes != null && $scope.lanes.length > 20)
//			$scope.hh = $(window).height() - 130;
//		else
//			$scope.hh = null;

        if ($scope.lanes.length > 20)
            $scope.hh = $(".west-back.div-west.stretch").height() - 40;
        else
            $scope.hh = null;
	}

    $scope.handleChkAllClick = function() {
       var tmpFlag = $('#chkAll').is(':checked');

        for (var i = 0; i < $scope.lanes.length; i++) {

            $scope.lanes[i].updateField = tmpFlag;

        }

        $timeout(function() {
            renderHT();
            // Loadind done here - Show message for 3 more seconds.

            $timeout(function() {
                $('#chkAll').attr('checked', tmpFlag);

            }, 100);

        }, 100);



    };

	$scope.getTemplate = function() {
		if ($scope.global.account.length==0) {
			flash.pop({
				title: 'Warning',
				body: 'Please select account and then edit lanes',
				type: 'warning'
			});
			$scope.redirectTo("/tariffLane");
		} else {
			$scope.loader = true;
			invalidMsgList = [];

            //If Group is selected and user selects to Edit Lanes , check the Accounts in Group and Lanes are in sync or not
            if($scope.global.isGroupSelected)
            {
                var obj={
                    "account": $scope.global.account,
                    "systemId": $rootScope.loggedInUser.userSystem[0].id,
                    "templateId": $rootScope.$routeParams.templateId,//$rootScope.templateId,
                    "syncCheck": false
                };
                var promise1 = commonService.ajaxCall('POST', 'api/tariffConfig/syncCheck',obj);
                promise1.then(function(data) {

                }, function(data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });

                    var tmpMsg = 'Account list in Group and Tariff Lanes is not in sync. Do you want to sync it?';
                    var modalInstance = $modal.open({
                        templateUrl: 'confirm.html',
                        controller: 'modalInstanceCtrl',
                        resolve: {
                            items: function() {
                                return angular.copy({
                                    msg: tmpMsg
                                });
                            }
                        }
                    });
                    modalInstance.result.then(function(selectedItem) {
//                        console.log('want to sync .Modal yes ');
                        obj ={
                            "account": $scope.global.account,
                            "systemId": $rootScope.loggedInUser.userSystem[0].id,
                            "templateId": $rootScope.$routeParams.templateId,
                            "syncCheck": true
                        };
                        var promise1 = commonService.ajaxCall('POST', 'api/tariffConfig/syncCheck',obj);
                        promise1.then(function(data) {
//                            console.log('accounts sync done. ');
                        }, function(data) {
                            flash.pop({
                                title: 'Alert',
                                body: data.data,
                                type: 'error'
                            });
                    });
                    }, function(selectedItem) {
                        //send back to main page
                        $scope.redirectTo("/tariffManagement");
                    });


                });

            }


//			$scope.columns = [{
//				value: 'lane.updateField',
//				type: 'checkbox',
//				title: 'Select',
//				width: 50
//			}];
            var chk = " <input id='chkAll' type='checkbox' class='checker' ";
            chk += 'onclick="angular.element(\'.handsontable\').scope().handleChkAllClick();"> ';


            $scope.columns = [{
                value: 'lane.updateField',
                type: 'checkbox',
                title: chk,
                width: 50,
                visible: true
            }];
//            console.log($scope.columns);
            $scope.effectiveDate=null;
            $scope.expiryDate=null;
            $scope.totalItems = 0;


			var promise = commonService.ajaxCall('GET', 'api/tariffConfig/template?type=data&id=' + $routeParams.templateId + '&account=' + $scope.global.account[0].n + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id );
			promise.then(function(data) {
					$scope.laneProfileData = data;
                    $scope.selectedLane = data;
                    $scope.columnsActualWidth = [];

					var sc = data.fields.sort(function(a, b) {
						return parseInt(a.displayOrder) - parseInt(b.displayOrder)
					});
                    sc.push({profileBased: false,
                        key: "history",
                        isReadonly: false,
                        isMandatory: false,
                        tariffIdentifier: false,
                        isMultiple: true,
                        regex: null,
                        group: "history",
                        label: "History",
                        isMasterField: false,
                        displayOrder: data.fields.length + 1,
                        type: "text",
                        isDefault: false,
                        validationActive: false,
                        description: "",
                        suggestionsSource: null,
                        parentGroup: null,
                        errorMessage: null,
                        toolTip: null,
                        isDependent: false,
                        isUniqueField: false,
                        addInAccessSet: false,
                        isActive: true,
                        readOnly: false,
                        uniqueCalculationParam: false,
                        length: 7,
                        customFlag: false,
                        visible: true});

					$scope.laneProfileData.fields = sc;
                    $scope.selectedLane.fields = sc;


					angular.forEach(sc, function(col, i) {
						if (col.isActive) {
                            if (col.key == 'email')
                                col.isReadonly = true;
                            if (col.key == 'effectiveDate') {
                                $scope.effectiveDate = col.value;
                                $scope.effectiveDateIndexLane = i;
                            }
                            if (col.key == 'expiryDate'){
                                $scope.expiryDate = col.value;
                                $scope.expiryDateIndexLane = i;
                            }
                            if(col.key == 'history')
                            {
                                $scope.columns.push({
                                    renderer: buttonRenderer,
                                    toolTip: col,
                                    readOnly: true,
                                    visible: true,
                                    value: '',
                                    type: 'text',
                                    title: 'history',
                                    src: null,
                                    suggestionField: null,
                                    width: col.length * 9,
                                    length: col.length,
                                    isMandatory: false,
                                    key: col.key.replace(".", ""),
                                    regex: null,
                                    errorMessage: col.errorMessage,
                                    displayOrder: col.displayOrder,
                                    visible: true
                                })
                            }
                            else {
                                switch (col.type) {
                                    case 'dropdown':
                                    case 'multiselect':
                                        $scope.columns.push({
                                            value: 'lane.' + col.key.replace(".", "|"),
                                            type: 'autocomplete',
                                            title: col.label.replace("|", "."),
                                            src: col.suggestionsSource + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id,
                                            suggestionField: col.suggestionField,
                                            width: col.length * 9,
                                            length: col.length,
                                            readOnly: col.isReadonly,
                                            renderer: cellRenderer,
                                            isMandatory: col.isMandatory,
                                            key: col.key.replace(".", ""),
                                            regex: col.regex,
                                            toolTip: col.toolTip,
                                            errorMessage: col.errorMessage,
                                            displayOrder: col.displayOrder,
                                            visible: true
//                                        systemId: $rootScope.loggedInUser.userSystem[0].id
                                        })
                                        break;
                                    default:
                                        if (col.type == 'multiline')
                                            col.type = 'text';
                                        $scope.columns.push({
                                            value: 'lane.' + col.key.replace(".", "|"),
                                            type: col.type,
                                            allowInvalid: false,
                                            renderer: cellRenderer,
                                            readOnly: col.isReadonly,
                                            title: col.label.replace("|", "."),
                                            width: col.length * 9,
                                            length: col.length,
                                            isMandatory: col.isMandatory,
                                            key: col.key.replace(".", ""),
                                            regex: col.regex,
                                            toolTip: col.toolTip,
                                            errorMessage: col.errorMessage,
                                            displayOrder: col.displayOrder,
                                            visible: true
//                                        systemId:  $rootScope.loggedInUser.userSystem[0].id
                                        });
                                }
                            }

                            //store the template widths first
                            //use to unhide column at run time then
                            $scope.columnsActualWidth.push({
                                key: col.key.replace(".", ""),
                                width: col.length * 9
                            })
						}
					});

//                    $scope.columns.push({
//                        value: '',
//                        type: 'text',
//                        title: 'History',
//                        width: 50,
//                        renderer: historyRenderer,
//                        visible: true
//                    });
                    if ($scope.addMode)
                    {
                        $scope.lanes = [
                            {
                                updateField: false,
                                id: null
                            }
                        ];
                    }
                    else {
                        $scope.getLanes($scope.currentPage, true);
//                        console.log("gettemplate");
                    }
					//only used when getlanes returning 0 lanes
					$scope.lanes = [{
						updateField: true,
						id: null
					}];
				},
				function(data) {
					$scope.loader = false;
					flash.pop({
						title: 'Alert',
						body: data.data,
						type: 'error'
					});
				});
		}

	}

    $scope.setWidth = function(index) {
        if ($scope.columns[index].visible == false) {
//            if ($scope.columns[index].isMandatory) {
//                $scope.columns[index].visible = true;
//                flash.pop({
//                    title: 'Mandatory',
//                    body: 'Mandatory fields can not be hide.',
//                    type: 'warning'
//                });
//
//            } else {
                $scope.columns[index].visible = false;
                $scope.columns[index].width = 1
//            }
        } else {
            $scope.columns[index].visible = true;
            $scope.columns[index].width = $scope.columns.length * 9;
        }


    }


	$scope.getLanes = function(pageNo, isGetCount,reqData,isFilter) {
//        console.log(pageNo + "lane start");
		initialGrid();
		invalidMsgList = [];

		commonService.loader(true);
		if (isGetCount) {
            $scope.totalItems = 0;
            if($scope.global.isGroupSelected){
                if(isFilter==true){
                    var promise1 = commonService.ajaxCall('POST', 'api/tariffLane?count=true&isGroup=true&templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&account=' + $scope.global.account + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id, reqData);
                }else
                    var promise1 = commonService.ajaxCall('GET', 'api/tariffLane/count?isGroup=true&templateId=' + $routeParams.templateId + '&groupId=' + $scope.global.account[0].id + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id);

            }else {
                if (isFilter == true) {
                    var promise1 = commonService.ajaxCall('POST', 'api/tariffLane?count=true&templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&account=' + $scope.global.account[0].n + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id, reqData);
                } else
                    var promise1 = commonService.ajaxCall('GET', 'api/tariffLane/count?templateId=' + $routeParams.templateId + '&account=' + $scope.global.account[0].n + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
            }
			promise1.then(function(data) {
				$scope.totalItems = data;
			}, function(data) {
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
		}
		$scope.currentPage = pageNo;
		$scope.loader = true;

        if($scope.global.isGroupSelected){
            if(isFilter==true){
                var promise = commonService.ajaxCall('POST', 'api/tariffLane?isGroup=true&templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&account=' + $scope.global.account + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id, reqData);
            }else
                var promise = commonService.ajaxCall('GET', 'api/tariffLane?isGroup=true&templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&groupId=' + $scope.global.account[0].id + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id);

        }else {
            if (isFilter == true) {
                var promise = commonService.ajaxCall('POST', 'api/tariffLane?templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&account=' + $scope.global.account[0].n + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id, reqData);
            } else
                var promise = commonService.ajaxCall('GET', 'api/tariffLane?templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&account=' + $scope.global.account[0].n + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
        }
        promise.then(function(data) {
				$scope.lanes = data;

				if ($scope.lanes.length == 0) {
					$scope.lanes = [{
						updateField: false,
						id: null
					}];

				}
				$scope.rowNos = [];
				var totalPages = pageNo * $scope.pageLimit;
				for (var i = totalPages - ($scope.pageLimit - 1), j = 0; i <= totalPages, j < data.length; i++, j++) {

					$scope.lanes[j].updateField = false;
					$scope.rowNos.push(i);
				}
                $scope.rowNos.push(i);
				$scope.loader = false;
				$scope.templateLoader = false;
                $scope.currentRowIndex = 0;
                if($scope.showGrid)
                    $scope.showHideTariffFormView($scope.currentRowIndex, false);

                renderHT();

				commonService.loader();
				$scope.loader = false;
			},
			function(data) {
				$scope.loader = false;
				commonService.loader();
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});

//        console.log("lane end");

	}

	function fillRowNos() {
		$scope.rowNos = [];
		for (var i = 1; i <= $scope.lanes.length; i++)
			$scope.rowNos.push(i);
	}

	$scope.updateLanes = function() {
		invalidMsgList = [];
        if(invalidateFlag){
            popAlert("New effective date should be greater than today's Date please update it.",'warning')
            return;
        }
		var dataTosave = commonService.validateGridData($scope.lanes, $scope.columns, $routeParams.templateId);
		invalidMsgList = dataTosave.arrInvalidMsg;
		if (dataTosave.inValidData.length > 0) {
			$scope.lanes = dataTosave.inValidData;
			fillRowNos();
		}
		if (dataTosave.validData.data.length > 0) {
			commonService.loader(true);
            if($scope.global.isGroupSelected){
                var obj = {
                    systemId: $rootScope.loggedInUser.userSystem[0].id,
                    templateId: $routeParams.templateId,
                    groupId: $scope.global.account[0].id,
                    data: dataTosave.validData.data,
                    isGroup:true
                };
            }else {
                var obj = {
                    systemId: $rootScope.loggedInUser.userSystem[0].id,
                    templateId: $routeParams.templateId,
                    account: $scope.global.account[0].n,
                    data: dataTosave.validData.data
                };
            }
			var promise = commonService.ajaxCall('PUT', 'api/tariffLane', obj);
			promise.then(function(data) {
					commonService.loader();
					if (dataTosave.inValidData.length > 0) {
						flash.pop({
							title: 'Warning',
							body: 'Grid contains some Invalid data, which is not saved',
							type: 'warning'
						});
						$scope.lanes = dataTosave.inValidData;
					} else {
                        $scope.flgUpdate = false;
						$scope.getLanes($scope.currentPage, true);
//                        console.log("updatelanes");
						flash.pop({
							title: 'Success',
							body: data,
							type: 'success'
						});
					}
				},
				function(data) {
                    commonService.loader();
                    if (data.status === 412) {
                        var errormsg = '';
                        for (var i = 0; i < data.data.invalidMsgList.length; i++) {
                            var invalMsg = {};
                            invalMsg.regex = [];
                            invalMsg.mandatory = [];
                            invalMsg.length = [];
                            invalMsg.serverMsg = {};

                            for (var prop in data.data.invalidMsgList[i]) {
                                invalMsg.regex.push(prop);
                                invalMsg.serverMsg[prop] = (data.data.invalidMsgList[i][prop]).toString();
                                if(prop !== undefined){
                                    errormsg = errormsg + prop + ' : ' + (data.data.invalidMsgList[i][prop]).toString() + '                                               '  ;
                                }
                            }
                            invalidMsgList.push(invalMsg);
                        }
                        flash.pop({
                            title: 'Alert',
                            body: errormsg,//'Some Invalid records not save are in grid, Please correct and save again.',
                            type: 'error'
                        });
						if ($scope.lanes.length > 1) {
							dataTosave.inValidData.pop();
							$scope.lanes = dataTosave.inValidData.concat(data.data.doc);
						} else
							$scope.lanes = data.data.doc;

						fillRowNos();
					} else
						flash.pop({
							title: 'Alert',
							body: data.data,
							type: 'error'
						});
				});
		} else {

			if (dataTosave.inValidData.length > 0) {
				flash.pop({
					title: 'No Data',
					body: 'Grid contains invalid data!',
					type: 'warning'
				});
				$scope.lanes = dataTosave.inValidData;
			} else
				flash.pop({
					title: 'No Data',
					body: 'No data to save',
					type: 'warning'
				});
		}
	}

	$scope.removeIdentifier = function(index) {

		$scope.identifiers.fields.splice(index, 1);
		if ($scope.fieldKeys[index] != null)
			$scope.fieldKeys.splice(index, 1);

	};
	$scope.exportLanes = function() {
        if($scope.global.isGroupSelected) {
            var promise = commonService.ajaxCall('GET', 'api/tariffLane?isGroup=true&templateId=' + $routeParams.templateId + "&isExcel=true&systemId=" + $rootScope.loggedInUser.userSystem[0].id + "&groupId=" + $scope.global.account[0].id);
        }
        else {
            var promise = commonService.ajaxCall('GET', 'api/tariffLane?templateId=' + $routeParams.templateId + "&isExcel=true&systemId=" + $rootScope.loggedInUser.userSystem[0].id + "&account=" + $scope.global.account[0].n);
        }
        promise.then(function(data) {
            $("body").append("<iframe src='/api/tms/download/file?id=" + data.msg + "&temp=1' style='display: none;' ></iframe>");
        },function(data){
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });

//        if($scope.global.isGroupSelected){
//            $.get('api/tariffLane?isGroup=true&templateId=' + $routeParams.templateId  + "&isExcel=true&systemId=" + $rootScope.loggedInUser.userSystem[0].id + "&groupId=" + $scope.global.account[0].id, function(retData) {
//                $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
//            });
//        }else {
//            $.get('api/tariffLane?templateId=' + $routeParams.templateId +  "&isExcel=true&systemId=" + $rootScope.loggedInUser.userSystem[0].id + "&account=" + $scope.global.account[0].n, function (retData) {
//                $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
//            });
//        }
        commonService.hideDropPanel();

	};

    $scope.exportTemplate = function() {

        if($scope.global.isGroupSelected) {
            var promise = commonService.ajaxCall('GET', 'api/tariffLane?isGroup=true&templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + $scope.currentPage + "&isExcel=true&systemId=" + $rootScope.loggedInUser.userSystem[0].id + "&groupId=" + $scope.global.account[0].id + "&isTemplateHeader=true");
        }
        else
        {
            var promise = commonService.ajaxCall('GET', 'api/tariffLane?templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + $scope.currentPage + "&isExcel=true&systemId=" + $rootScope.loggedInUser.userSystem[0].id + "&account=" + $scope.global.account[0].n + "&isTemplateHeader=true");
        }
            promise.then(function (data) {
                $("body").append("<iframe src='/api/tms/download/file?id=" + data.msg + "&temp=1' style='display: none;' ></iframe>");
            }, function (data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });

//        if($scope.global.isGroupSelected){
//            $.get('api/tariffLane?isGroup=true&templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + $scope.currentPage + "&isExcel=true&systemId=" + $rootScope.loggedInUser.userSystem[0].id + "&groupId=" + $scope.global.account[0].id + "&isTemplateHeader=true", function(retData) {
//                $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
//            });
//        }else {
//            $.get('api/tariffLane?templateId=' + $routeParams.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + $scope.currentPage + "&isExcel=true&systemId=" + $rootScope.loggedInUser.userSystem[0].id + "&account=" + $scope.global.account[0].n + "&isTemplateHeader=true", function (retData) {
//                $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
//            });
//        }
        commonService.hideDropPanel();

    };

	$scope.validateIdentifiers = function() {
		commonService.loader(true);
		$scope.parameters.fields = [];
		$scope.identifiers.fields = [];
		$scope.fieldKeys = [];
        $scope.fieldKeysParams = [];

//		var identifierPromise1 = commonService.ajaxCall('POST', '/api/suggestion?q=originCountry&column=countryCode2&pageLimit=10&page=1&selected=&suggestionFor=tarrifShipmentFields&type=identifier&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
//		identifierPromise1.then(function(data) {
//			commonService.loader();
//			if (data.msg.length == 0) {
//				flash.pop({
//					title: 'Warning',
//					body: "Field : Origin Country, Missing in Configuration",
//					type: 'warning'
//				});
//			} else {
//				$scope.parameters.fields.push({
//					fieldKey: data.msg,
//					fieldVal: data.msg[0].n,
//					readOnly: true,
//					displayOrder: 1,
//					uniqueCalculationParam: true,
//					length: 50,
//					regex: "",
//					errorMessage: "",
//					key: "",
//					validationActive: false,
//					type: "text"
//				});
//				$scope.fieldKeysParams.push(data.msg[0].v);
//			}
//		}, function() {
//			commonService.loader();
//			flash.pop({
//				title: 'Alert',
//				body: data.data,
//				type: 'error'
//			});
//		});
//		var identifierPromise2 = commonService.ajaxCall('POST', '/api/suggestion?q=destinationCountry&column=countryCode2&pageLimit=10&page=1&selected=&suggestionFor=tarrifShipmentFields&type=identifier&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
//		identifierPromise2.then(function(data) {
//			commonService.loader();
//			if (data.msg.length == 0) {
//				flash.pop({
//					title: 'Warning',
//					body: "Field : Destination Country, Missing in Configuration",
//					type: 'warning'
//				});
//			} else {
//				$scope.parameters.fields.push({
//					fieldKey: data.msg,
//					fieldVal: data.msg[0].n,
//					readOnly: true,
//					displayOrder: 2,
//					uniqueCalculationParam: true,
//					length: 50,
//					regex: "",
//					errorMessage: "",
//					key: "",
//					validationActive: false,
//					type: "text"
//				});
//				$scope.fieldKeysParams.push(data.msg[0].v);
//			}
//
//		}, function() {
//			commonService.loader();
//			flash.pop({
//				title: 'Alert',
//				body: data.data,
//				type: 'error'
//			});
//		});
		var identifierPromise3 = commonService.ajaxCall('POST', '/api/suggestion?q=transportMode&pageLimit=10&page=1&selected=&suggestionFor=tarrifShipmentFields&type=identifier&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
		identifierPromise3.then(function(data) {
			commonService.loader();
			if (data.msg.length == 0) {
				flash.pop({
					title: 'Warning',
					body: "Field : Transport Mode, Missing in Configuration",
					type: 'warning'
				});
			} else {
				$scope.identifiers.fields.push({
					fieldKey: data.msg,
					fieldVal: null,
					readOnly: true,
					defaultVal: true
				});

                $scope.fieldKeys.push(data.msg[0].v);
			}

		}, function() {
			commonService.loader();
			flash.pop({
				title: 'Alert',
				body: data.data,
				type: 'error'
			});
		});
	}

	function resetTemplateModel() {
		$scope.basicInfo = {};
		$scope.chargesAvailable = [];
		$scope.validateIdentifiers();
		$scope.additionalTariffInfo = {};
		$scope.chargeList.fields = [];

        $scope.getCalculationCodes();
        $scope.addMode = false;
//        $scope.getWeight();
//        $scope.getOperand();
	}

    $scope.validateIdentifiers();

    $scope.setMinData=function(dt)
    {
        $scope.minDate=dt.getFullYear()+'-'+(dt.getMonth()<9?'0'+(dt.getMonth()+1):dt.getMonth()+1)+'-'+(dt.getDate()<9?'0'+dt.getDate():dt.getDate());
        if(new Date($scope.additionalTariffInfo.expiryDate)<dt)
            $scope.additionalTariffInfo.expiryDate="";
    }

    $scope.checkCharge=function(objSelected,idx,type)
    {
//        console.log(objSelected);
        var keepGoing = true;

            angular.forEach($scope.chargeList.fields, function (i, j) {
                if (keepGoing) {
                    if (type == 'chargeCode') {
                        if (objSelected.id == i.chargeID.id && idx != j) {
                            $scope.chargeList.fields[idx].chargeID = null;
                            flash.pop({
                                title: 'Warning',
                                body: "charge already added",
                                type: 'warning'
                            });
                            keepGoing = false;
                        }

                    }
                    else if (type == 'chargeName') {
//                        if (objSelected.id == i.chargeName.id && idx != j) {
//                            $scope.chargeList.fields[idx].chargeName = null;
//                            flash.pop({
//                                title: 'Warning',
//                                body: "charge already added",
//                                type: 'warning'
//                            });
//                            keepGoing = false;
//                        }

                    }
                }
            });

        if(keepGoing)
        {

            if(type == 'chargeCode')
            {
                if($scope.chargeList.fields[idx].chargeName==undefined)
                    $scope.chargeList.fields[idx].chargeName = {};
                $scope.chargeList.fields[idx].chargeName.n = objSelected.v;
                $scope.chargeList.fields[idx].chargeName.v = objSelected.n;
                $scope.chargeList.fields[idx].chargeName.id = objSelected.id;
//                console.log($scope.chargeList.fields[idx].chargeName);
                $scope.fieldKeysCharges.push(objSelected.n);

            }
            else if(type == 'chargeName')
            {
                if($scope.chargeList.fields[idx].chargeCode==undefined)
                    $scope.chargeList.fields[idx].chargeCode = {};
                $scope.chargeList.fields[idx].chargeCode.n = objSelected.v;
                $scope.chargeList.fields[idx].chargeCode.v = objSelected.n;
                $scope.chargeList.fields[idx].chargeCode.id = objSelected.id;
//                console.log($scope.chargeList.fields[idx].chargeCode);
                $scope.fieldKeysChargeNames.push(objSelected.n);

            }


            $scope.fieldKeysCalculationOnCharges = $scope.fieldKeysCharges;
//            console.log($scope.fieldKeysCalculationOnCharges);

            angular.forEach($scope.fieldKeysCalculationOnCharges, function(i , j) {
                if(keepGoing) {
                    if(objSelected.id == i.id )
                    {
                        $scope.fieldKeysCalculationOnCharges.splice(j);
//                        console.log($scope.fieldKeysCalculationOnCharges);
                    }

                }

            });
        }
//        console.log($scope.fieldKeysCalculationOnCharges);
    }

    $scope.updateCalculationChargeList=function(objSelected,idx)
    {
//        console.log($scope.fieldKeysCalculationOnCharges);
        angular.forEach($scope.fieldKeysCalculationOnCharges, function(i , j) {
            if(objSelected.id == i.id )
                {
                    $scope.fieldKeysCalculationOnCharges.splice(j);
//                    console.log($scope.fieldKeysCalculationOnCharges);
                }

        });
//        console.log($scope.fieldKeysCalculationOnCharges);
    }

    $scope.getCalculationChargeList=function(objSelected,idx)
    {
        angular.forEach($scope.fieldKeysCalculationOnCharges, function(i , j) {
            if(objSelected.id == i.id )
            {
                $scope.fieldKeysCalculationOnCharges.splice(j);
//                console.log($scope.fieldKeysCalculationOnCharges);
            }

        });

        return $scope.fieldKeysCalculationOnCharges.join();
    }

    $scope.checkDuplicate = function(obj,j){
        if(obj.displayOrder){
            for(var i=0;i<$scope.parameters.fields.length;i++)
                if(i!==j && obj.displayOrder==$scope.parameters.fields[i].displayOrder){
                    flash.pop({
                        title: 'Duplicate Value',
                        body: 'Duplicate values not allowed!',
                        type: 'info'
                    });
                    obj.displayOrder=null;  break;
                }
        }
    };

    $scope.setPage = function() {
        if($scope.flgUpdate)
        {
            flash.pop({
                title: "Alert",
                body: "Save the updated lanes first...",
                type: "error"
            });
            angular.element("ul.pagination li.active.ng-scope").scope().page.number = $scope.currentPage;
            return;
        }

        setTimeout(function() {
//            if ($scope.filterObj.rules == undefined)
//            console.log(angular.element("ul.pagination li.active.ng-scope").scope().page.number + "setpage");
            $scope.currentPage = angular.element("div#lane li.active.ng-scope").scope().page.number;
            angular.element(".pagination").scope().getLanes($scope.currentPage,false);

//            else
//                angular.element(".pagination").scope().getFilteredData(angular.element("ul.pagination li.active.ng-scope").scope().page.number);
        }, 300);
    };

    $scope.applyFilter = function() {
        var filterObj = {
            rules: {
                condition: 'and',
                fields: []
            }
        };

        for (var k in $scope.laneProfileData.fields) {
            if ($scope.laneProfileData.fields[k].val!=null) {
                if (angular.isArray($scope.laneProfileData.fields[k].val)){
                    var obj = filterObj.rules;
                    if($scope.laneProfileData.fields[k].val.length>1){
                        obj = { condition: 'or',fields: []};
                        filterObj.rules.fields.push(obj);
                    }
                    for (var i = 0; i < $scope.laneProfileData.fields[k].val.length; i++)
                        obj.fields.push({
                            name: $scope.laneProfileData.fields[k].key,
                            operator: 'equalTo',
                            value: $scope.laneProfileData.fields[k].val[i].n
                        });
                }
                else
                    filterObj.rules.fields.push({
                        name: $scope.laneProfileData.fields[k].key,
                        operator: 'equalTo',
                        value: $scope.laneProfileData.fields[k].val
                    });
            }
        }
        $scope.isFilterApplied = true;
        $scope.getLanes($scope.currentPage = 1, true,filterObj,true);
//        console.log("applyfilter");

    };

    $scope.resetFilter = function() {
        for (var k in $scope.laneProfileData.fields) {
            if ($scope.laneProfileData.fields[k].val != null) {
                $scope.laneProfileData.fields[k].val = null;
                $('input[name="' + k + '"]').select2('val', null);
            }
        }
//        if(!$('input[name="switch-field-1"]')[0].checked)
        $scope.isFilterApplied = false;
        $scope.getLanes($scope.currentPage = 1, true);
//        console.log("resetfilter");
    };

    $scope.openDialog = function() {

        $scope.Loader = true;


        var itemToSend = {};

        itemToSend = {
            systemId: $rootScope.loggedInUser.userSystem[0].id,
            templateId: $routeParams.templateId,
            account:  $scope.global.account[0].n
        };

        var modalInstance = $modal.open({
            templateUrl: 'tmsTariffUpload.html',
            controller: 'tmsTariffUploadCtrl',
            resolve: {
                items: function() {
                    return angular.copy({
                        fields: itemToSend
                    });
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {

//            console.log(selectedItem);

        }, function(selectedItem) {
//            console.log(selectedItem);
        });

        $scope.Loader = false;
    }

    $scope.notSorted = function(obj){
//        console.log(obj);
        if (!obj) {
            return [];
        }

        return Object.keys(obj);
    }


    $scope.expireTariff = function(){
//        console.log('expire tariff call : ' + $scope.objExpireTariff.expireLanes );
        var flgContinue = true;

        if ( $scope.objExpireTariff.expireLanes=='select'){
            if($scope.expireTariffIDs.length <=0){
                flash.pop({
                    title: 'Alert',
                    body: 'First select Lanes to expire.',
                    type: 'error'
                });
                flgContinue = false;
                $scope.expiryDialog = false;
            }

        }
        else if ( $scope.objExpireTariff.expireLanes=='all'){
            if($scope.expireTariffIDs.length <=0){
                $scope.expireTariffIDs = [];
                for (var i = 0; i < $scope.lanes.length; i++) {
                    if($scope.lanes[i].id != null)
                        $scope.expireTariffIDs.push($scope.lanes[i].id);

                }
            }

        }
        if($scope.objExpireTariff.tariffExpiryDt.toJSON() > $scope.expiryDate){
            flash.pop({
                title: 'Alert',
                body: 'Expiry Date should be less than or equal to Template Expiry Date.',
                type: 'error'
            });
            flgContinue = false;
            $scope.expiryDialog = false;
        }
        else if($scope.objExpireTariff.tariffExpiryDt.toJSON() < $scope.effectiveDate){
            flash.pop({
                title: 'Alert',
                body: 'Expiry Date should be greater than or equal to Template Effective Date.',
                type: 'error'
            });
            flgContinue = false;
            $scope.expiryDialog = false;
        }

        if(flgContinue){
            var parameterObj = {

                "expiryDate": $scope.objExpireTariff.tariffExpiryDt.toJSON(),
                "ids": $scope.expireTariffIDs

//                "templateId": $routeParams.templateId,
//                "systemId": $rootScope.loggedInUser.userSystem[0].id,
//                "account": $scope.global.account[0].n

            };

            var promise = commonService.ajaxCall('POST', '/api/tariffConfig/unlink?isExpiry=true', parameterObj);
            promise.then(function (retData) {
                    flash.pop({
                        title: 'Alert',
                        body: 'Lane(s) expired successfully.',
                        type: 'success'
                    });

                    if($scope.isFilterApplied)
                        $scope.applyFilter();
                    else
                        $scope.getLanes($scope.currentPage, true);
//                    console.log("expiretariff");
//                    return true;
                },
                function (data) {
                    flash.pop({
                        title: 'Alert',
                        body: data,
                        type: 'error'
                    });
//                    return false;
                });
        }

        $scope.expiryDialog = false;
    }

    $scope.openExpireTariffDialog = function(){
        $scope.expireTariffIDs = [];
        $scope.objExpireTariff.expireLanes=='all';
        for (var i = 0; i < $scope.lanes.length; i++) {
            if($scope.lanes[i].updateField === true && $scope.lanes[i].id != null)
                $scope.expireTariffIDs.push($scope.lanes[i].id);

        }
        $scope.objExpireTariff.tariffExpiryDt = null;
        $scope.expiryDialog = true;
    }

    $scope.close = function() {
        $scope.expiryDialog = false;
    }

    $scope.switchTariffMode = function(e) {
        if (e.target.checked) {
            //Add Mode
            $scope.addMode = true;
            $scope.sparerow = 1;
            $scope.showGrid = false;

        }
        else {
            //edit mode
            $scope.addMode = false;
            $scope.sparerow = 0;
        }

        $scope.getTemplate();
    }

    $scope.validateTariffGroup = function(){
        if($scope.global.account == undefined)
        {
            $scope.isvalidTariffGroup = false;
            return;
        }

        if($scope.global.isGroupSelected == undefined)
        {
            $scope.isvalidTariffGroup = false;
            return;
        }
        if($scope.basicInfo.tariffType == undefined)
        {
            $scope.isvalidTariffGroup = false;
            return;
        }

        if($scope.additionalTariffInfo.expiryDate == undefined)
        {
            $scope.isvalidTariffGroup = false;
            return;
        }
        var parameterObj =
        {
            "account": $scope.global.account,
            "systemId": $rootScope.loggedInUser.userSystem[0].id,
            "isGroup": $scope.global.isGroupSelected,
            "tariffType": $scope.basicInfo.tariffType,
            "expiryDate": $scope.additionalTariffInfo.expiryDate,
            "templateId": $routeParams.templateId
        }
        var promise = commonService.ajaxCall('POST', '/api/tariffConfig/validate', parameterObj);
        promise.then(function (retData) {
//                flash.pop({
//                    title: 'Error',
//                    body: 'Tariff for ' + retData + 'have already configured.',
//                    type: 'error'
//                });

//                $scope.isvalidTariffGroup = true;
                return true;
            },
            function (data) {
                flash.pop({
                    title: 'Error',
                    body: 'Tariff for ' + data + 'have already configured.',
                    type: 'error'
                });
//                $scope.isvalidTariffGroup = false;
                return false;
            });
    };

    $scope.editLane = function(d){
        $scope.editedLane = d;
    };

    $scope.openDialogDocuments = function() {

        $scope.Loader = true;

//        $scope.redirectTo("/documentManagement");

        var modalInstance = $modal.open({
            templateUrl: 'billRightTmsEdit.html',
            controller: 'billRightTmsCtrl',
            resolve: {
                items: function() {
                    return angular.copy($scope.global.account);
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {

//            console.log(selectedItem);

        }, function(selectedItem) {
//            console.log(selectedItem);
        });

        $scope.Loader = false;
    }
//    $scope.RenderHTW(false);


    //////////////////////////////////////////////////// filter functions for tariff dashboard

    /**
     * @author nishith.modi@searce.com
     * @name applyDataForTMS
     * @function
     *
     * @description It is used to apply filter on selected column value.
     * Loop through all $scope.fields which contains all the fields present in filter, check if value is set and based on type of value, create an object to be sent.
     * Make an object only if atleast one filter is selected.
     *
     * object : {
     *  condition : and,
     *  fields : [{
     *          name : <key>,
     *          operator: equalTo,
     *          value: <field.value>
     *      }]
     *  }
     * @param
     * @return
     *
     */
    $scope.applyDataForTMS = function(whichPage) {

        // create temp array to store selected filter as array of objects
        var eachField = [], saveFilter = {};
        // lopp through all active filter fields
        for(var k in $scope.fields) {
            // check value is set or not
            if ($scope.fields[k].val != null) {
                // value is set, check for type
                if($scope.fields[k].type === "text") {
                    // type is 'text', push necessary value as object to array
                    eachField.push({
                        "name": k,
                        "operator": "equalTo",
                        "value": $scope.fields[k].val[0].n
                    });
                    // store filter key-value for saving it in backend for future reference
                    saveFilter[k] = $scope.fields[k].val[0].n;

                } else {
                    // type is 'date' - only  other option right now, push required value as object to array
                    eachField.push({
                        "name": k,
                        "operator": "equalTo",
                        "value": $scope.fields[k].val
                    });
                    // store filter key-value in backend
                    saveFilter[k] = $scope.fields[k].val;
                }//if-else
            }//if
        }//for

        // check if any filter is selected or not
        if(eachField.length > 0) {
            // atleast one filter is selected, create final object in global field 'selectedTMSfilter'
            selectedTMSFilter = {
                "condition": "and",
                "fields": eachField
            }

            // indicate that save filter is called and new filter is already availabel with selectedTMSFilter, hence no need to call for get filter
            saveGetFilterCall = true;

            // call this function to load filtered data
            $scope.quickSearch($scope.currentPage,true,whichPage);
            //close the filter popup
            commonService.hideDropPanel();
            // save current filters in backend for future reference
            var postData = {};
            postData.account = $scope.global.account;
            postData.currentContext = ($state.$current.context && $state.$current.context.module)?$state.$current.context.product+"."+$state.$current.context.module:null;
            postData.filters = saveFilter;
            commonService.ajaxCall('POST','api/setTariffTypeFilter',postData);
        } else {
            // no filter is selected, clear the global object property
            selectedTMSFilter = {};
        }//if-else
    }//end

    /**
     * @author nishith.modi@searce.com
     * @name resetDataForTMS
     * @function
     * @description reset the applied filter
     * @param
     * @return
     */
    $scope.resetDataForTMS = function(whichPage) {
        // reset value of each field in filter
        for (var k in $scope.fields)
            if ($scope.fields.hasOwnProperty(k) && $scope.fields[k].val) {
                $scope.fields[k].val = null;
                if ($scope.fields[k].type == "dropdown" || $scope.fields[k].type == "multiselect")
                    $('input[name="' + k + '"]').select2('val', null);
                // delete $scope.fields[k];
            }

        // reset filter object
        selectedTMSFilter = {};
        // save one call of get filter since 'selectedTMSFilter' contains latest filter object
        saveGetFilterCall = true;
        // reset filter in backend also
        var postData = {};
        postData.account = $scope.global.account;
        postData.currentContext = ($state.$current.context && $state.$current.context.module)?$state.$current.context.product+"."+$state.$current.context.module:null;
        postData.filters = {};
        commonService.ajaxCall('POST','api/setTariffTypeFilter',postData);
        // call this function to load data
        $scope.quickSearch($scope.currentPage,true,whichPage);
        //close the filter popup
        commonService.hideDropPanel();

    }//end
});