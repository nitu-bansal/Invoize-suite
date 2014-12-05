/**
 * Created by pallavi.dandane on 10/13/2014.
 */

angularApp.controller('approvalRequestCtrl', function($scope, $modal,$timeout, commonService,$routeParams,$rootScope, flash, $state) {

    $scope.requestBucket = 'my';
    $scope.tariffRequestData = [];
    $scope.isRowCollapsed = [];
    $scope.currentPage = 1;
    $scope.totalItems = 1;
    $scope.pageLimit = 15;
    $scope.newLane = {};
    $scope.oldLane = {};
//    $scope.newLane = {};
//    $scope.oldLane = {};
    $scope.laneData = [];
    $scope.effIndex1 = null;
    $scope.effIndex2 = null;
    $scope.expIndex1 = null;
    $scope.expIndex2 = null;
    $scope.prevOpenIndex = 0;
    $scope.commentGlobal=null;
    $scope.selectedApprovalDocs =[];

    $scope.dynamicPopover = 'Name :Demo Searce' ;
    $scope.selectedLane = {};
    $scope.selectedLane.fields = [];
//    $scope.modalInstance = undefined;




    $scope.getRequests = function(requestModule) {

        if(requestModule=="tariff") {$scope.currentPage = 1;
            $scope.requestBucket = $state.current.name.split('.')[2]
            $scope.commentGlobal=null;
            $scope.selectedApprovalDocs =[];

            $scope.getTariffRequests($scope.currentPage,true);
            $scope.getTariffRequests($scope.currentPage,false);
        }
    }

//    $scope.getRequests('tariff');

    $scope.getTariffRequests = function(pageNo, isGetCount){
        commonService.loader(true);
        if($scope.requestBucket == "mypending") {
            if(isGetCount)
                var promise = commonService.ajaxCall('GET', '/api/workFlow?count=true&workFlowType=myWorkFlow&status=current');
            else
                var promise = commonService.ajaxCall('GET', '/api/workFlow?status=current&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&workFlowType=myWorkFlow');

        }
        else if($scope.requestBucket == "myapproved") {
            if(isGetCount)
                var promise = commonService.ajaxCall('GET', '/api/workFlow?count=true&workFlowType=myWorkFlow&status=approved');
            else
                var promise = commonService.ajaxCall('GET', '/api/workFlow?pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&workFlowType=myWorkFlow&status=approved');

        }
        else if($scope.requestBucket == "myrejected") {
            if(isGetCount)
                var promise = commonService.ajaxCall('GET', '/api/workFlow?count=true&workFlowType=myWorkFlow&status=rejected');
            else
                var promise = commonService.ajaxCall('GET', '/api/workFlow?pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&workFlowType=myWorkFlow&status=rejected');

        }

        else if($scope.requestBucket == "my") {
            if(isGetCount)
                var promise = commonService.ajaxCall('GET', '/api/workFlow?count=true&workFlowType=myWorkFlow');
            else
                var promise = commonService.ajaxCall('GET', '/api/workFlow?pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&workFlowType=myWorkFlow');

        }
        else if($scope.requestBucket == "pending") {
            if(isGetCount)
                var promise = commonService.ajaxCall('GET', '/api/workFlow?count=true&workFlowType=pendingWorkFlow');
            else
                var promise = commonService.ajaxCall('GET', '/api/workFlow?pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + '&workFlowType=pendingWorkFlow');
        }

        promise.then(function (retData) {
                if(isGetCount) {
                    $scope.totalItems = retData.count;
//                    $scope.totalItems = $scope.tariffRequestData.length;
                }
                else {
                    $scope.tariffRequestData = [];
                    $scope.tariffRequestData = retData;

                    $scope.isRowCollapsed = [];
                    for (var i = 1; i <= $scope.tariffRequestData.length ; i++) {
                        $scope.isRowCollapsed[i] = true;
                    }

                    for (var i = 0; i <= $scope.tariffRequestData[0].length ; i++) {
                        //"id", "templateId", "docId"
                        if($scope.tariffRequestData[0][i] === "id" )
                        {
                            $scope.idIndex = i;
                        }
                        else if($scope.tariffRequestData[0][i] === "templateId" )
                        {
                            $scope.templateIdIndex = i;
                        }
                        else if($scope.tariffRequestData[0][i] === "docId" )
                        {
                            $scope.docIdIndex = i;
                        }
                        else if($scope.tariffRequestData[0][i] === "createdOn" )
                        {
                            $scope.createdOnIndex = i;
                        }
                        else if($scope.tariffRequestData[0][i] === "accountNumber" )
                        {
                            $scope.accountNumberIndex = i;
                        }
                    }

                }
                commonService.loader(false);
            },
            function (data) {
                flash.pop({
                    title: 'Alert',
                    body: data,
                    type: 'error'
                });
                commonService.loader(false);
            });


    }

    $scope.getRequestInfo = function(index){
        commonService.loader(true);
        if($scope.prevOpenIndex !== index )
            $scope.isRowCollapsed[$scope.prevOpenIndex] = true;
        $scope.prevOpenIndex=index;

        if ($scope.isRowCollapsed[index] == undefined)
            $scope.isRowCollapsed[index] = true;
        $scope.isRowCollapsed[index] = !$scope.isRowCollapsed[index];

        if($scope.isRowCollapsed[index] == false) {
            var promise = commonService.ajaxCall('GET', 'api/tariffLane?templateId=' + $scope.tariffRequestData[index][$scope.templateIdIndex] + '&account=' + $scope.tariffRequestData[index][1] + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id + '&docId=' + ($scope.tariffRequestData[index][$scope.docIdIndex] == null ? '' : $scope.tariffRequestData[index][$scope.docIdIndex]) + '&workFlowId=' + $scope.tariffRequestData[index][$scope.idIndex]);
            promise.then(function (retData) {
                    $scope.tariffRequestData[index].laneData= retData.data;
                    $scope.tariffRequestData[index].currentLevel = retData.currentLevel;
                    var approveData = [];

                    if (index == 0)
                    {
                        $scope.tariffRequestData[index].approvalData= retData.comments;
                    }
                    else
                    {

                        approveData = [];

//                        for (var i = 1; i <= retData.comments.length ; i++) {
//                            approveData[i].displaystr = true;
//                        }

                        var i = 1, isApproved = true;
                        angular.forEach(retData.comments, function( approvIndx) {
                            approveData[i]="";
                            i++;
                        });
                        angular.forEach(retData.comments, function(approvItem, approvIndx){
                            if (approvIndx > 0){
                                isApproved=true;

                                var displaystr = '';
                                var tempData = approvItem.all;

                                if(tempData == undefined)
                                {
                                    tempData = approvItem.any;
                                }

                                angular.forEach(tempData, function(childItem) {
                                    displaystr = displaystr + "\n" + childItem.u
                                    if (childItem.action != undefined) {
                                        displaystr = displaystr + "  " + childItem.action;
                                        if (childItem.action === "Reject")
                                        {
                                            isApproved=false;
                                        }
                                    }
                                    if (childItem.time != undefined)
                                        displaystr = displaystr     + "  "  + childItem.time  ;
                                    if (childItem.comment != undefined)
                                        displaystr = displaystr     + "  "  + childItem.comment  ;
                                });
//                                var applyClass = "";
//                                if(retData.currentLevel == approvIndx)
//                                    applyClass = "orange-line"
//                                else if(retData.currentLevel > approvIndx && isApproved)
//                                    applyClass = "green-line"
//                                else if(retData.currentLevel > approvIndx && !isApproved)
//                                    applyClass = "red-line"
//                                else if(retData.currentLevel < approvIndx )
//                                    applyClass = "yellow-line"

//                                approveData[approvIndx].push({"displaystr": displaystr,
//                                "class": applyClass})
                                approveData[approvIndx] = displaystr;

                            }
                        });


                    }

                    $scope.tariffRequestData[index].approvalData = approveData;
//                    console.log(approveData);
//                    console.log($scope.tariffRequestData[index].approvalData );
//                    $scope.tariffRequestData[index].approvalData= retData.comments;
                    $scope.tariffRequestData[index].comment = '';
                    if($scope.tariffRequestData[index].laneData.length>1)
                        $scope.compareLanes($scope.tariffRequestData[index].laneData,index,false);
                    else
                        $scope.compareLanes($scope.tariffRequestData[index].laneData,index,true);

                    commonService.loader(false);
                },
                function (data) {
                    flash.pop({
                        title: 'Alert',
                        body: data,
                        type: 'error'
                    });
                    commonService.loader(false);
                });
        }
        commonService.loader(false);
    }

    $scope.$watch('$state.current.name', function() {
        $scope.getRequests('tariff');
    });

    $scope.compareLanes = function(passedLaneData,parentIndex,onlyCompareDates){
//        var oldLane = passedLaneData[0];
//        var newLane = passedLaneData[1];

        if(onlyCompareDates == false && passedLaneData.length > 1) {
//            $scope.tariffRequestData[parentIndex].diffinLaneData = {};
//            $scope.tariffRequestData[parentIndex].diffinLaneData.parameters = [];
//            $scope.tariffRequestData[parentIndex].diffinLaneData.charges = [];

            angular.forEach(passedLaneData[0].parameters, function (itemOld, indexOld) {
                angular.forEach(passedLaneData[1].parameters, function (itemNew, indexNew) {
                    if (itemOld.displayName === itemNew.displayName) {
//                        $scope.tariffRequestData[parentIndex].diffinLaneData.parameters[indexNew] = itemNew.value == itemOld.value;
                        $scope.tariffRequestData[parentIndex].laneData[1].parameters[indexNew].diff = itemNew.value === itemOld.value;
                    }
                });


            });

            angular.forEach(passedLaneData[0].charges, function (itemOld, indexOld) {

                angular.forEach(passedLaneData[1].charges, function (itemNew, indexNew) {
                    if (itemOld.displayName === itemNew.displayName) {
//                        $scope.tariffRequestData[parentIndex].diffinLaneData.charges[indexNew] = itemNew.value == itemOld.value;
//                        console.log('New : ' + itemNew.value);
//                        console.log('Old : ' + itemOld.value);
//                        console.log(itemNew.value === itemOld.value);
                        $scope.tariffRequestData[parentIndex].laneData[1].charges[indexNew].diff = itemNew.value === itemOld.value;
                    }
                });
            });


//            console.log($scope.tariffRequestData[parentIndex].diffinLaneData.charges);
//            console.log($scope.tariffRequestData[parentIndex].diffinLaneData.parameters);
        }

//        console.log($scope.tariffRequestData[parentIndex]);

        angular.forEach(passedLaneData[0].parameters , function(itemOld,indexOld){
            if(itemOld.displayName == 'effectiveDate' || itemOld.displayName == 'Effective Date' ){
                $scope.effIndex1 = indexOld;
            }
            if(itemOld.displayName == 'expiryDate' || itemOld.displayName == 'Expiry Date'){
                $scope.expIndex1 = indexOld;
            }
        });
        if(passedLaneData.length > 1) {
            angular.forEach(passedLaneData[1].parameters, function (itemNew, indexNew) {
                if (itemNew.displayName == 'effectiveDate' || itemNew.displayName == 'Effective Date') {
                    $scope.effIndex2 = indexNew;
                }
                if (itemNew.displayName == 'expiryDate' || itemNew.displayName  == 'Expiry Date') {
                    $scope.expIndex2 = indexNew;
                }
            });

            if(passedLaneData[0].parameters[$scope.effIndex1].value !== passedLaneData[1].parameters[$scope.effIndex2].value )
            {
                $scope.tariffRequestData[parentIndex].laneData[1].parameters.effdiff = true;
            }
            else
                $scope.tariffRequestData[parentIndex].laneData[1].parameters.effdiff = false;

            if(passedLaneData[0].parameters[$scope.expIndex1].value !== passedLaneData[1].parameters[$scope.expIndex2].value )
            {
                $scope.tariffRequestData[parentIndex].laneData[1].parameters.expdiff = true;
            }
            else
                $scope.tariffRequestData[parentIndex].laneData[1].parameters.expdiff = false;
        }



    }

    $scope.setPage = function() {
        setTimeout(function() {
            $scope.currentPage = angular.element("ul.pagination li.active.ng-scope").scope().page.number;
            $scope.getTariffRequests($scope.currentPage, false);
        }, 300);
    };

    $scope.processRequest = function(action,index,isBulkAction){
        if (isBulkAction){
            if (($scope.commentGlobal == null || $scope.commentGlobal == undefined || $scope.commentGlobal.length ==0) && (action=="Reject" || action=="reject"))
            {
                flash.pop({
                    title: 'Alert',
                    body: 'Provide comment first',
                    type: 'error'
                });
                return;
            }
            $scope.selectedApprovalDocs =[];

            angular.forEach($scope.tariffRequestData, function(obj,iindex){
               if (iindex !== 0){
                   if (obj[0] == true)
                       $scope.selectedApprovalDocs.push(obj[$scope.idIndex])
               }
            });

            if (($scope.selectedApprovalDocs == null || $scope.selectedApprovalDocs == undefined || $scope.selectedApprovalDocs.length ==0) )
            {
                flash.pop({
                    title: 'Alert',
                    body: 'Select at least one Approval request',
                    type: 'error'
                });
                return;
            }
            if ( $scope.commentGlobal == undefined || $scope.commentGlobal ==0 || $scope.commentGlobal == "" )
            {
                $scope.commentGlobal = null;
            }
            var objRequest = {
                Ids: $scope.selectedApprovalDocs,
                "action": action,
                "comment": $scope.commentGlobal
            };

            var promise = commonService.ajaxCall('PUT', '/api/workFlowBulk', objRequest);
        }
        else {
            if (($scope.tariffRequestData[index].comment == null || $scope.tariffRequestData[index].comment == undefined || $scope.tariffRequestData[index].comment.length ==0) && (action=="Reject" || action=="reject"))
            {
                flash.pop({
                    title: 'Alert',
                    body: 'Provide comment first',
                    type: 'error'
                });
                return;
            }

            if ( $scope.tariffRequestData[index].comment == undefined || $scope.tariffRequestData[index].comment.length ==0 || $scope.tariffRequestData[index].comment == "" )
            {
                $scope.tariffRequestData[index].comment = null;
            }
            var objRequest = {
                "action": action,
                "comment": $scope.tariffRequestData[index].comment
            };

            var promise = commonService.ajaxCall('PUT', '/api/workFlow/' + $scope.tariffRequestData[index][$scope.idIndex], objRequest);
        }
        promise.then(function (retData) {
                flash.pop({
                    title: 'Success',
                    body: retData,
                    type: 'success'
                });

                $scope.getRequests('tariff');
            },
            function (data) {
                flash.pop({
                    title: 'Alert',
                    body: data,
                    type: 'error'
                });

            });
    }


    ///handles checkbox check event of checkboxes in grid
    $scope.updateSelection = function($event,  arrIndex) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        if (action === 'add') {
            $scope.tariffRequestData[arrIndex][0] = true;
            $scope.selectedApprovalDocs.push($scope.tariffRequestData[arrIndex][11]);
        } else if (action === 'remove') {
            $scope.tariffRequestData[arrIndex][0] = false;
            var removeIndex = $scope.selectedApprovalDocs.indexOf($scope.tariffRequestData[arrIndex][11]);
            if (removeIndex !== -1) {
                $scope.selectedApprovalDocs.splice(removeIndex,1);
            }
        }
    };

    ///function to check all check boxes on checked of checkall checkbox
    $scope.checkAll = function($event) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        $scope.selectedApprovalDocs =[];

        if (action === 'add') {
            angular.forEach($scope.tariffRequestData, function(element, i) {
                if (i > 0) {
                    $scope.tariffRequestData[i][0] = true;
                    $('[name="chk_' + i + '"]').prop('checked', true);
                    $scope.selectedApprovalDocs.push(element[11]);
                }
            });
        } else if (action === 'remove') {
            angular.forEach($scope.tariffRequestData, function(element, i) {
                if (i > 0) {
                    $scope.tariffRequestData[i][0] = false;
                    $('[name="chk_' + i + '"]').prop('checked', false);
                }
            });
        }
    }


    $scope.reInitiateRequest = function(requestIndex){
//        var obj = {
//            systemId: $rootScope.loggedInUser.userSystem[0].id,
//            templateId: $routeParams.templateId,
//            groupId: $scope.global.account[0].id,
//            data: dataTosave.validData.data
//        };
        var effectiveDateIndexLane = 0;
        var expiryDateIndexLane = 0;

        var promise = commonService.ajaxCall('GET', 'api/tariffConfig/template?type=data&id=' +
            $scope.tariffRequestData[requestIndex][$scope.templateIdIndex] + '&account=' +
            $scope.tariffRequestData[requestIndex][$scope.accountNumberIndex] + '&systemId=' +
            $rootScope.loggedInUser.userSystem[0].id );

        promise.then(function(data) {
            $scope.selectedLane = data;
            var sc = data.fields.sort(function(a, b) {
                return parseInt(a.displayOrder) - parseInt(b.displayOrder)
            });

            $scope.selectedLane.fields = sc;


            angular.forEach($scope.selectedLane.fields, function(col , i) {
                if (col.key == 'effectiveDate') {
                     effectiveDateIndexLane = i;
                }
                if (col.key == 'expiryDate') {
                     expiryDateIndexLane = i;
                }
            });

            var tempLane;
            if ($scope.tariffRequestData[requestIndex].laneData.length === 2)
                tempLane = $scope.tariffRequestData[requestIndex].laneData[1];
            else
                tempLane = $scope.tariffRequestData[requestIndex].laneData[0];
            var isParametere = false;
//            console.log(tempLane);
//            console.log($scope.selectedLane);

            for (var i=0; i<$scope.selectedLane.fields.length; i++)
            {
                var j=0;
                isParametere=false;
                for(j=0; j<tempLane.parameters.length;j++) {
                    if ($scope.selectedLane.fields[i].label === tempLane.parameters[j].displayName) {
                        isParametere=true;
                        if ($scope.selectedLane.fields[i].type == "multiselect" || $scope.selectedLane.fields[i].type == "dropdown") {
                            var obj = {
                                "id":tempLane.parameters[j].value,
                                "v": "",
                                "n": tempLane.parameters[j].value
                            }
                            $scope.selectedLane.fields[i].value = obj;
                        } else {
                            $scope.selectedLane.fields[i].value = tempLane.parameters[j].value;
                        }

                    }
                }
                if(isParametere === false) {
                    for (j = 0; j < tempLane.charges.length; j++) {
                        if ($scope.selectedLane.fields[i].label === tempLane.charges[j].displayName) {
                            if ($scope.selectedLane.fields[i].type == "multiselect" || $scope.selectedLane.fields[i].type == "dropdown") {
                                var obj = {
                                    "id":tempLane.charges[j].value,
                                    "v": "",
                                    "n": tempLane.charges[j].value
                                }
                                $scope.selectedLane.fields[i].value = obj;
                            } else {
                                $scope.selectedLane.fields[i].value = tempLane.charges[j].value;
                            }
                        }
                    }
                }
            }
//            console.log('after update lane' + $scope.selectedLane);

        }).then(function(){
//                console.log('modal call before' + $scope.selectedLane);
                var itemReInitiate = {};

                itemReInitiate = {
                    systemId: $rootScope.loggedInUser.userSystem[0].id,
                    templateId: $scope.tariffRequestData[requestIndex][$scope.templateIdIndex],
                    account:  $scope.tariffRequestData[requestIndex][$scope.accountNumberIndex],
                    ReInitiatelaneData: $scope.selectedLane,
                    effectiveDateIndexLane :effectiveDateIndexLane,
                    expiryDateIndexLane:expiryDateIndexLane
                };
            $scope.modalInstance = $modal.open({
                templateUrl: 'tariffManagement.FormViewModal.html',
                controller: 'approvalRequestReInitiateCtrl',
                resolve: {
                    items: function () {
                        return angular.copy({
                            fields: itemReInitiate
                        });
                    }
                }
            });
            $scope.modalInstance.result.then(function(selectedItem) {
//                console.log('modal call after' + $scope.selectedLane);
//                console.log('selected Item' + selectedItem);

            }, function(selectedItem) {

            });
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


});
//, ng-if=" row1.displayName!== 'effectiveDate'&& row1.displayName!== 'expiryDate' && row1.displayName!== 'Effective Date'&& row1.displayName!== 'Expiry Date'")
