'use strict';
angularApp.controller('invoiceCaptureCtrl', function($scope, $http, $location, $routeParams, $route, $stateParams, flash, items, $modalInstance, commonService, $rootScope) {
    $scope.isRowCollapsed = true;
    $scope.invoiceCaptureData = [];
    $scope.invoiceCaptureData = items.msg.invoices;
    $scope.isUpdate = false;


    //this function get invoices info by profili for EDI
    $scope.getInvoiceChargesInfo = function(index, shipmentId, invoiceNumber) {
        $scope.isRowCollapsed = !$scope.isRowCollapsed;
        if (_.isUndefined($scope.invoiceCaptureData[index].doc)) {

            $scope.invoiceCaptureData[index].dataPresent = true;
            var promise = commonService.ajaxCall('GET', '/api/invoiceCharges?shipmentId=' + shipmentId + '&invoiceNumber=' + invoiceNumber + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
            promise.then(function(result) {
                $scope.invoiceCaptureData[index].doc = result;
                $scope.invoiceCaptureData[index].dataPresent = false;

            }, function(result) {
                $scope.invoiceCaptureData[index].dataPresent = false;
                flash.pop({
                    title: 'Alert',
                    body: "Please try after sometime..!",
                    type: 'error'
                });
            });
        }
    }

    $scope.saveInvoiceCaptureData = function() {
        $scope.isUpdate = true;
        var invoiceDate = dateConvert($scope.invoiceCaptureData[0][10].v, "YYYY-MM-DD");
        // var invDate = new Date(invoiceDate);
        $scope.invoiceCaptureData[0][10].v = new Date(invoiceDate);
        var promise = commonService.ajaxCall('PUT', '/api/invoiceCapture', $scope.invoiceCaptureData);
        promise.then(function(data) {
                flash.pop({
                    title: 'Success',
                    body: "invoice Captured Successfully",
                    type: 'success'
                });
                $modalInstance.close(data);
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: 'Some Invalid records not save are in grid, Please correct and save again.',
                    type: 'warning'
                });
                if (data.data.errorRows.length > 0) {
                    $scope.invoiceCaptureData = data.data.errorRows;
                }
                setTimeout(function() {
                    $('#invoiceCaptureData tr.invoice').each(function(i) {
                        $(this).find("input.customerIDCell").css('background-color', 'pink');
                        $(this).find("input.customerIDCell").parent().attr('title', data.data.errors[i]);
                    })
                }, 500);

            });
    }


    $scope.close = function() {
        if ($scope.isUpdate)
            $modalInstance.close({});
        else
            $modalInstance.dismiss(undefined);
    };

    function dateConvert(dateobj1, format) {
        var dateobj = new Date(dateobj1);
        var year = dateobj.getFullYear();
        var month = ("0" + (dateobj.getMonth() + 1)).slice(-2);
        var date = ("0" + dateobj.getDate()).slice(-2);
        var hours = ("0" + dateobj.getHours()).slice(-2);
        var minutes = ("0" + dateobj.getMinutes()).slice(-2);
        var seconds = ("0" + dateobj.getSeconds()).slice(-2);
        var day = dateobj.getDay();
        var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        var dates = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        var converted_date = "";

        switch (format) {
            case "YYYY-MMM-DD DDD":
                converted_date = year + " - " + months[parseInt(month,10) - 1] + " - " + date + "" + dates[parseInt(day,10)];
                break;
            case "YYYY-MM-DD":
                converted_date = year + "-" + month + "-" + date;
                break;
            case "dd-MMM-yyyy":
                converted_date = date + "-" + months[parseInt(month,10) - 1] + "-" + year;
                break;
            case "dd-MM-yyyy":
                converted_date = date + "-" + month + "-" + year;
                break;
        }

        return converted_date;
    }

});