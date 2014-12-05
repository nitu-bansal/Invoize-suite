angularApp.controller('reallocationCtrl', function($scope, $rootScope, $routeParams, flash, $timeout, commonService, $modal, $modalInstance, items) {

    $scope.currentPage = 1;
    $scope.pageLimit = 50;
    $scope.rowNos = [];
    $scope.users = [];
    $scope.dataList = [];
    $scope.data = {};
    $scope.data.items = items;
    $scope.data.selectedDocs = [];
    $scope.data.globalSelect = "Consider all";

    $scope.setPage = function() {
        setTimeout(function() {
            angular.element(".pagination").scope().getData(angular.element("li.active.ng-scope").scope().page.number);
        }, 300);
    };

    $scope.getData = function(pageNo) {
        commonService.loader(true);
        $scope.currentPage = pageNo;
        var promise = commonService.ajaxCall('GET', '/api/listingReallocation?for=' + items.for+'&systemId=' + items['systemId'] + '&accountId=' + items['Account ID'] + '&allocatedTo=' + items['User ID'] + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo);
        promise.then(function(data) {
                $scope.dataList = data.msg;
                commonService.loader();
        },
        function(data) {
            flash.pop({
                title: 'Alert',
                body: data.msg,
                type: 'error'
            });
            commonService.loader();
        });
    };

    $scope.updateSelection = function(ele, docID) {
        //if not select all
        if (ele) {
            if (ele.checked)
                $scope.data.selectedDocs.push(docID);
            else
                $scope.data.selectedDocs.splice($scope.data.selectedDocs.indexOf(docID), 1);
            $scope.data.globalSelect = "Consider all";
        }
        else {
            $scope.data.selectedDocs = [];
            if ($scope.data.selectAll) {
                for (var i = 1; i < $scope.dataList.length; i++)
                    $scope.data.selectedDocs.push($scope.dataList[i][0]);
            }
        }
    };

    //this function open email delivery dialog and deliver invoice via email
    $scope.allocateData = function() {
        var updateData = null;

        if($scope.data.globalSelect !== "Consider all")  updateData = {allocatedTo:$scope.data.items['User ID'],accountId:$scope.data.items['Account ID']};
        else updateData={docId : $scope.data.selectedDocs};

        updateData.allocateTo = $scope.data.user.n;
        updateData.stream = "Shipment";

        if (updateData.docId.length || $scope.data.globalSelect !== "Consider all") {
            var promise = commonService.ajaxCall('PUT', '/api/listingReallocation', updateData);
            promise.then(function(data) {
                    $scope.getData(1);
                    flash.pop({
                        title: 'Success',
                        body: data.msg,//"Allocated Successfully"
                        type: 'success'
                    });
                    $modalInstance.dismiss(undefined);
                },
                function(data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });

                });
        } else {
            flash.pop({
                title: 'Alert',
                body: "please select at least one item",
                type: 'warning'
            });
        }
    };

    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };

    $scope.selectUnselectAll = function(){
       if($scope.data.globalSelect === "Consider all"){
           $scope.data.globalSelect = "Consider selected";
       }
       else{
//           $scope.data.selectAll = false;
//           $scope.data.selectedDocs = [];
           $scope.data.globalSelect = "Consider all";
       }
    };

});