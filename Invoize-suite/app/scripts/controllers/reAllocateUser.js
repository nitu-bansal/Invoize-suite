/**
 * Created by nishith.modi on 16/10/14.
 */

angularApp.controller("reAllocateUserCtrl",['$scope','$modalInstance','shipments','$window','commonService','flash',function($scope,$modalInstance,shipments,$window,commonService,flash){

    $scope.data = {};
    // close the modal dialog on cancel or close
    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };

    // shipment allocation to new users
    $scope.shipmentReAllocation = function() {
        var reAllocationData = {
          "id" : shipments,
          "allocatedTo" : $scope.data.user.n
        };

        var promise = commonService.ajaxCall('PUT', '/api/summaryReallocation', reAllocationData);
        promise.then(function(success){
            flash.pop({
                title: 'Success',
                body: success,//"Allocated Successfully"
                type: 'success'
            });
            $modalInstance.dismiss(undefined);
        },function(error){
            flash.pop({
                title: 'Alert',
                body: error.data,
                type: 'error'
            });
        });
    };
}]);