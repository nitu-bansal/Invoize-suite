/**
 * Created by pallavi.dandane on 11/27/2014.
 */
angularApp.controller('approvalRequestReInitiateCtrl', function($scope,$filter, $modalInstance,$timeout, commonService,$state,flash, items) {

    $scope.selectedLane = items.fields.ReInitiatelaneData;
    $scope.effectiveDateIndexLane = items.fields.effectiveDateIndexLane;
    $scope.expiryDateIndexLane = items.fields.expiryDateIndexLane;
    $scope.systemId = items.fields.systemId;
    $scope.templateId = items.fields.templateId;
    $scope.account = items.fields.account;
    $scope.lanes = [];


    $scope.close = function() {
        $modalInstance.dismiss( undefined);
    };

    $scope.updateLanebyFormView = function (move) {
        $scope.lanes=[];

        var obj ={};

        for (var i = 0; i < $scope.selectedLane.fields.length; i++) {
            if ($scope.lanes != undefined) {
                var val = null;
//                console.log( $scope.selectedLane.fields[i].type + " " + $scope.selectedLane.fields[i].value);
                if ($scope.selectedLane.fields[i].value === undefined){
                    val=null;
                }
                else {
                    if ($scope.selectedLane.fields[i].type == "multiselect" || $scope.selectedLane.fields[i].type == "dropdown") {
                        if ($scope.selectedLane.fields[i].value.n != undefined)
                            val = $scope.selectedLane.fields[i].value.n;
                        else
                            val = $scope.selectedLane.fields[i].value[0].n;


                    } else if ($scope.selectedLane.fields[i].type == "date") {
                        val = $filter('date')($scope.selectedLane.fields[i].value, "yyyy-MM-dd");
                    } else {
                        val = $scope.selectedLane.fields[i].value;
                    }
                }
                    $scope.flgUpdate = true;
                    obj[$scope.selectedLane.fields[i].key] = val;




            }
        }
        $scope.lanes.push(obj);
        $scope.lanes.updateField = true;
//        console.log($scope.lanes);

        var obj = {
            systemId: $scope.systemId,
            templateId: $scope.templateId,
            account: $scope.account,
            data: $scope.lanes
        };
        var promise = commonService.ajaxCall('PUT', 'api/tariffLane', obj);

        promise.then(function(data){
                flash.pop({
                    title: 'Success',
                    body: data,
                    type: 'success'
                });
                $modalInstance.dismiss( undefined);
            },function(data){
                if (data.status === 412) {
                    var invalidMsgList = [];
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



                } else
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
            }
        );


    }
});