/**
 * Created on 27/02/14.
 */
angularApp.controller('invoiceDeliveryWebCtrl', function($scope, $state, $routeParams, $location, $modal, commonService, flash) {

    $scope.$parent.showBackBtn = true;
    $scope.data = {};
    $scope.startTime = new Date();
    $scope.intervalTime = new Date();

    $scope.deliveryParty = {
        'fpc': 'FPC',
        'internal/station': 'INTERNAL/STATION'
    };

    $scope.redirectTo = function(path) {
        $location.path($state.current.name.split('.')[0] + path);
    };
    $scope.data.module = [{
        "c": "",
        "g": "",
        "id": "shipmentFields",
        "v": "shipmentFields",
        "n": "shipmentFields",
        "tc": null
    }];
    $scope.data.event = [{
        "c": "",
        "g": "",
        "id": "invoiceDeliveryWeb",
        "v": "invoiceDeliveryWeb",
        "n": "invoiceDeliveryWeb",
        "tc": null
    }];
    $scope.getList = function(q) {

        commonService.loader(true);
        var promise = commonService.ajaxCall('GET', '/api/invoiceDeliveryWeb?pageLimit=20&pageNo=1&q=' + q + '&systemId=' + $routeParams.systemId.toString() + '&accountId=' + $scope.selectedAccounts.accountIds.toString());
        promise.then(function(result) {
            $scope.invoiceDeliveryTypes = result;
            commonService.loader();


        }, function(result) {
            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
            commonService.loader();



        });
    }
    $scope.setPreData = function() {
        $scope.data.module = [{
            "c": "",
            "g": "",
            "id": "shipmentFields",
            "v": "shipmentFields",
            "n": "shipmentFields",
            "tc": null
        }];
        $scope.data.event = [{
            "c": "",
            "g": "",
            "id": "invoiceDeliveryWeb",
            "v": "invoiceDeliveryWeb",
            "n": "invoiceDeliveryWeb",
            "tc": null
        }];
        if ($state.current.url == "/new")
            $scope.getDefaultProfileBase();

    }

    $scope.saveData = function() {

        if ($routeParams.invoiceDeliveryWebId == undefined) {

            $scope.data.invoicedelivery.type = "invoiceDeliveryWeb";
            $scope.data.invoicedelivery.accountID = $scope.selectedAccounts.accountIds.toString();
            $scope.data.invoicedelivery.systemID = $scope.$routeParams.systemId.toString();

            var promise = commonService.ajaxCall('POST', '/api/invoiceDeliveryWeb', $scope.data);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.data = [];
                    $scope.redirectTo("/system/profile/" + $routeParams.systemName + "/" + $routeParams.systemId + "/account/InvoiceDeliveryWebrules/view");
                },
                function(data) {
                    $scope.templateLoader = false;
                    commonService.loader();
                    if (data.status === 412) {
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records are not saved , Please correct and save again.',
                            type: 'error'
                        });

                    } else
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                });

        } else {
            $scope.data.invoicedelivery.type = "invoiceDeliveryWeb";
            $scope.data.invoicedelivery.accountID = $scope.selectedAccounts.accountIds.toString();
            $scope.data.invoicedelivery.systemID = $scope.$routeParams.systemId.toString();

            var promise = commonService.ajaxCall('PUT', '/api/invoiceDeliveryWeb/' + $routeParams.invoiceDeliveryWebId, $scope.data);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.data = [];
                    $scope.redirectTo("/system/profile/" + $routeParams.systemName + "/" + $routeParams.systemId + "/account/InvoiceDeliveryWebrules/view");
                },
                function(data) {
                    $scope.templateLoader = false;
                    commonService.loader();
                    if (data.status === 412) {
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records are not saved , Please correct and save again.',
                            type: 'error'
                        });

                    } else
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                });

        }
    }

    $scope.$on("saveInvoiceDeliveryWeb", function(event, args) {
        $scope.saveData();
    });

    // $scope.$watch('form.$valid', function() {
    //     $scope.validForm = !$scope.form.$valid;

    // });

    $scope.viewTemplate = function(value) {

        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/InvoiceDeliveryWebrules/detail/' + value);
    }

    $scope.viewInvoiceDeliveryWeb = function() {

        var invoiceDeliveryWebId = $routeParams.invoiceDeliveryWebId;
        var promise = commonService.ajaxCall('GET', '/api/invoiceDeliveryWeb/' + invoiceDeliveryWebId);
        promise.then(function(data) {

                $scope.data = data;
                $scope.data.module = [{
                    "c": "",
                    "g": "",
                    "id": "shipmentFields",
                    "v": "shipmentFields",
                    "n": "shipmentFields",
                    "tc": null
                }];
                $scope.data.event = [{
                    "c": "",
                    "g": "",
                    "id": "invoiceDeliveryWeb",
                    "v": "invoiceDeliveryWeb",
                    "n": "invoiceDeliveryWeb",
                    "tc": null
                }];

                $scope.data.module = $scope.data.module[0].n;
                $scope.data.event = $scope.data.event[0].n;

            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    }

    $scope.editTemplate = function(value) {

        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/InvoiceDeliveryWebrules/edit/' + value);
    }

    $scope.editInvoiceDeliveryWeb = function() {
        var invoiceDeliveryWebId = $routeParams.invoiceDeliveryWebId;
        var promise = commonService.ajaxCall('GET', '/api/invoiceDeliveryWeb/' + invoiceDeliveryWebId);
        promise.then(function(data) {

                $scope.data = data;



            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    }

    $scope.$on("backInvoiceDeliveryWeb", function(event, args) {
        $scope.data = [];
        $scope.goBack();
    });

    $scope.goBack = function() {
        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/InvoiceDeliveryWebrules/view');
    }

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
            case "YYYY - MM - DD ":
                converted_date = year + " - " + month + " - " + date;
                break;
            case "dd-MMM-yyyy":
                converted_date = date + " - " + months[parseInt(month,10) - 1] + " - " + year;
                break;
        }

        return converted_date;
    }

    $scope.getDefaultProfileBase = function() {
        var promise = commonService.ajaxCall('GET', 'api/template/profile/' + $routeParams.systemId);
        promise.then(function(data) {
            $scope.data.profileBase = data;
            var a = 10;
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });

    }

});