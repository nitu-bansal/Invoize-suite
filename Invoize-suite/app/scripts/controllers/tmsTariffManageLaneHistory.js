/**
 * Created by pallavi.dandane on 10/28/2014.
 */
angularApp.controller('tmsTariffLaneHistoryCtrl', function($scope, $state, $routeParams, $route, $location, $modal, $modalInstance, commonService, flash, $rootScope, $upload, $timeout, $filter, items) {
    $scope.laneID = items.fields.laneId;
    $scope.templateId = items.fields.templateId;
    $scope.laneHistoryData = items.fields.laneHistoryData;
    $scope.totalItemslaneHistory = items.fields.totalItemslaneHistory;
    $scope.isRowCollapsed = items.fields.isRowCollapsed;


    $scope.getlaneHistoryInfo = function(index, id){
        if($scope.prevOpenIndex !== index && $scope.prevOpenIndex !== undefined )
            $scope.isRowCollapsed[$scope.prevOpenIndex] = true;
        $scope.prevOpenIndex=index;

        if ($scope.isRowCollapsed[index] == undefined)
            $scope.isRowCollapsed[index] = true;
        $scope.isRowCollapsed[index] = !$scope.isRowCollapsed[index];
        var laneData = {};

        console.log($scope.isRowCollapsed);

        laneData = {
            templateId: $scope.templateId,
            Ids:  id
        };

        var promise = commonService.ajaxCall('PUT', 'api/tariffLaneHistory', laneData);
        promise.then(function(data) {
            $scope.laneHistoryData[index].laneData = data;
            if($scope.laneHistoryData[index].laneData.new!== undefined && $scope.laneHistoryData[index].laneData.old!== undefined)
                $scope.compareLanes($scope.laneHistoryData[index].laneData,index,false);
            else
                $scope.compareLanes($scope.laneHistoryData[index].laneData,index,true);


        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data,
                type: 'error'
            });
        });
    }

    $scope.compareLanes = function(passedLaneData,parentIndex,onlyCompareDates){
//        var oldLane = passedLaneData[0];
//        var newLane = passedLaneData.old;
        var flgfound = false;

        if(onlyCompareDates == false && passedLaneData.new != undefined && passedLaneData.old != undefined ) {


            angular.forEach(passedLaneData.new.parameters, function (itemOld, indexOld) {
                flgfound = false;

                angular.forEach(passedLaneData.old.parameters, function (itemNew, indexNew) {
                    if (itemOld.displayName == itemNew.displayName) {
                        $scope.laneHistoryData[parentIndex].laneData.old.parameters[indexNew].diff = itemNew.value == itemOld.value;
                        flgfound = true;
                    }
                });

                if (flgfound == false) {
                    $scope.laneHistoryData[parentIndex].laneData.new.parameters[indexOld].notFound = true;
                }
            });

            angular.forEach(passedLaneData.new.charges, function (itemOld, indexOld) {
                flgfound = false;

                angular.forEach(passedLaneData.old.charges, function (itemNew, indexNew) {
                    if (itemOld.displayName == itemNew.displayName) {
                        $scope.laneHistoryData[parentIndex].laneData.old.charges[indexNew].diff = itemNew.value == itemOld.value;
                        flgfound = true;
                    }
                });
                if (flgfound == false) {
                    $scope.laneHistoryData[parentIndex].laneData.new.charges[indexOld].notFound = true;
                }
            });
        }
        angular.forEach(passedLaneData.new.parameters , function(itemOld,indexOld){
            if(itemOld.displayName == 'effectiveDate' || itemOld.displayName == 'Effective Date' ){
                $scope.effIndex1 = indexOld;
            }
            if(itemOld.displayName!== 'expiryDate' || itemOld.displayName!== 'Expiry Date'){
                $scope.expIndex1 = indexOld;
            }
        });
        if(passedLaneData.old !== undefined) {
            angular.forEach(passedLaneData.old.parameters, function (itemNew, indexNew) {
                if (itemNew.displayName == 'effectiveDate' || itemNew.displayName == 'Effective Date') {
                    $scope.effIndex2 = indexNew;
                }
                if (itemNew.displayName !== 'expiryDate' || itemNew.displayName !== 'Expiry Date') {
                    $scope.expIndex2 = indexNew;
                }
            });


            if(passedLaneData.old.parameters[$scope.effIndex1].value !== passedLaneData.new.parameters[$scope.effIndex2].value )
            {
                $scope.laneHistoryData[parentIndex].laneData.old.parameters.effdiff = true;
            }
            else
                $scope.laneHistoryData[parentIndex].laneData.old.parameters.effdiff = false;

            if(passedLaneData.old.parameters[$scope.expIndex1].value !== passedLaneData.new.parameters[$scope.expIndex2].value )
            {
                $scope.laneHistoryData[parentIndex].laneData.old.parameters.expdiff = true;
            }
            else
                $scope.laneHistoryData[parentIndex].laneData.old.parameters.expdiff = false;
        }



    }

    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    }
});