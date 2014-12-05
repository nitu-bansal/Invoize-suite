/**
 * Created on 27/02/14.
 */
angularApp.controller('invoiceDeliveryEmailCtrl', function($scope, $state, $routeParams, $location, $modal, commonService, flash) {

    $scope.$parent.showBackBtn = true;
    $scope.data = {};
    $scope.startTime = new Date();
    $scope.intervalTime = new Date();
    $scope.schedulingOnOff = false;
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
        "id": "invoiceDeliveryEmail",
        "v": "invoiceDeliveryEmail",
        "n": "invoiceDeliveryEmail",
        "tc": null
    }];
    $scope.getList = function(q) {
        $scope.notificationLoader = true;
        commonService.loader(true);
        var promise = commonService.ajaxCall('GET', '/api/invoiceDeliveryEmail?pageLimit=20&pageNo=1&q=' + q + '&systemId=' + $routeParams.systemId.toString() + '&accountId=' + $scope.selectedAccounts.accountIds.toString());
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
            $scope.notificationLoader = false;

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
            "id": "invoiceDeliveryEmail",
            "v": "invoiceDeliveryEmail",
            "n": "invoiceDeliveryEmail",
            "tc": null
        }];
        $scope.getDefaultProfileBase();
        $scope.$broadcast("moduleChangeNotification");
    }

    $scope.saveData = function() {

        if ($routeParams.invoiceDeliveryEmailId == undefined) {

            $scope.data.invoicedelivery.type = "invoiceDeliveryEmail";
            $scope.data.invoicedelivery.accountID = $scope.selectedAccounts.accountIds.toString();
            $scope.data.invoicedelivery.systemID = $scope.$routeParams.systemId.toString();

            $scope.data.notifications.body = $('#txtBody').code();

            if ($scope.data.scheduling == undefined) {} else {
                if ($scope.data.notifications.attachment == true) {
                    delete $scope.data.scheduling;
                } else {
                    if ($scope.schedulingOnOff == true)
                        delete $scope.data.scheduling;
                    else {
                        if ($scope.data.scheduling.schedulingStartDate == undefined) {
                            delete $scope.data.scheduling;
                        } else {
                            if ($scope.data.scheduling.schedulingStartDate != undefined)
                                $scope.data.scheduling.schedulingStartDate = $scope.data.scheduling.schedulingStartDate.toString();
                            if ($scope.data.scheduling.schedulingEndOnDate != undefined)
                                $scope.data.scheduling.schedulingEndOnDate = $scope.data.scheduling.schedulingEndOnDate.toString();
                            if ($scope.data.scheduling.schedulingStartTime == undefined)
                                $scope.data.scheduling.schedulingStartTime = $scope.startTime.toString();
                            else
                                $scope.data.scheduling.schedulingStartTime = $scope.data.scheduling.schedulingStartTime.toString();
                            if ($scope.data.scheduling.schedulingIntervalTime == undefined)
                                $scope.data.scheduling.schedulingIntervalTime = $scope.intervalTime.toString();
                            else
                                $scope.data.scheduling.schedulingIntervalTime = $scope.data.scheduling.schedulingIntervalTime.toString();
                        }
                    }
                }
            }

            var promise = commonService.ajaxCall('POST', '/api/invoiceDeliveryEmail', $scope.data);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.data = [];
                    $scope.redirectTo("/system/profile/" + $routeParams.systemName + "/" + $routeParams.systemId + "/account/InvoiceDeliveryEmailrules/view");
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
            $scope.data.invoicedelivery.type = "invoiceDeliveryEmail";
            $scope.data.invoicedelivery.accountID = $scope.selectedAccounts.accountIds.toString();
            $scope.data.invoicedelivery.systemID = $scope.$routeParams.systemId.toString();

            $scope.data.notifications.body = $('#txtBody').code();

            if ($scope.data.scheduling == undefined) {} else {
                if ($scope.data.notifications.attachment == true) {
                    delete $scope.data.scheduling;
                } else {
                    if ($scope.schedulingOnOff == true)
                        delete $scope.data.scheduling;
                    else {
                        if ($scope.data.scheduling.schedulingStartDate == undefined) {
                            delete $scope.data.scheduling;
                        } else {
                            if ($scope.data.scheduling.schedulingStartDate != undefined)
                                $scope.data.scheduling.schedulingStartDate = $scope.data.scheduling.schedulingStartDate.toString();
                            if ($scope.data.scheduling.schedulingEndOnDate != undefined)
                                $scope.data.scheduling.schedulingEndOnDate = $scope.data.scheduling.schedulingEndOnDate.toString();
                            if ($scope.data.scheduling.schedulingStartTime == undefined)
                                $scope.data.scheduling.schedulingStartTime = $scope.startTime.toString();
                            else
                                $scope.data.scheduling.schedulingStartTime = $scope.data.scheduling.schedulingStartTime.toString();
                            if ($scope.data.scheduling.schedulingIntervalTime == undefined)
                                $scope.data.scheduling.schedulingIntervalTime = $scope.intervalTime.toString();
                            else
                                $scope.data.scheduling.schedulingIntervalTime = $scope.data.scheduling.schedulingIntervalTime.toString();
                        }
                    }
                }
            }
            var promise = commonService.ajaxCall('PUT', '/api/invoiceDeliveryEmail/' + $routeParams.invoiceDeliveryEmailId, $scope.data);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.data = [];
                    $scope.redirectTo("/system/profile/" + $routeParams.systemName + "/" + $routeParams.systemId + "/account/InvoiceDeliveryEmailrules/view");
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

    $scope.$on("saveInvoiceDeliveryEmail", function(event, args) {
        $scope.saveData();
    });

    // $scope.$watch('form.$valid', function() {
    //     $scope.validForm = !$scope.form.$valid;

    // });

    $scope.viewTemplate = function(value) {

        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/InvoiceDeliveryEmailrules/detail/' + value);
    }

    $scope.viewInvoiceDeliveryEmail = function() {
        var invoiceDeliveryEmailId = $routeParams.invoiceDeliveryEmailId;
        var promise = commonService.ajaxCall('GET', '/api/invoiceDeliveryEmail/' + invoiceDeliveryEmailId);
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
                    "id": "invoiceDeliveryEmail",
                    "v": "invoiceDeliveryEmail",
                    "n": "invoiceDeliveryEmail",
                    "tc": null
                }];
                if (data.scheduling != undefined) {
                    var dd = dateConvert($scope.data.scheduling.schedulingStartDate, "dd-MMM-yyyy");
                    $scope.data.scheduling.schedulingStartDate = dd;
                    dd = new Date($scope.data.scheduling.schedulingStartTime);
                    $scope.data.scheduling.schedulingStartTime = dd.getHours() + ":" + dd.getMinutes();
                    dd = dateConvert($scope.data.scheduling.schedulingEndOnDate, "dd-MMM-yyyy");
                    $scope.data.scheduling.schedulingEndOnDate = dd;
                    dd = new Date($scope.data.scheduling.schedulingIntervalTime);
                    $scope.data.scheduling.schedulingIntervalTime = dd.getHours() + ":" + dd.getMinutes();
                }
                $scope.data.module = $scope.data.module[0].n;
                $scope.data.event = $scope.data.event[0].n;
                $scope.data.notifications.from = $scope.data.notifications.from[0].n;
                $scope.data.invoicedelivery.deliveryParty = $scope.data.invoicedelivery.deliveryParty[0].n;


                if (data.scheduling != undefined) {
                    var dList = data.scheduling.schedulingDayList;
                    $scope.data.scheduling.schedulingDayList = "";

                    angular.forEach(dList, function(dayList) {

                        if ($scope.data.scheduling.schedulingDayList == "") {
                            $scope.data.scheduling.schedulingDayList = dayList.n;
                        } else {
                            $scope.data.scheduling.schedulingDayList = $scope.data.scheduling.schedulingDayList + ',' + dayList.n;
                        }

                    });

                    var mList = data.scheduling.schedulingMonthList;
                    $scope.data.scheduling.schedulingMonthList = "";
                    angular.forEach(mList, function(monthList) {

                        if ($scope.data.scheduling.schedulingMonthList == "") {
                            $scope.data.scheduling.schedulingMonthList = monthList.n;
                        } else {
                            $scope.data.scheduling.schedulingMonthList = $scope.data.scheduling.schedulingMonthList + ',' + monthList.n.toString();
                        }

                    });

                }
                setTimeout(function() {
                    var tmpHtml = data.notifications.body;
                    var a = "txtBody";

                    $('#' + a).code(tmpHtml);
                    $('.note-editable').attr('contenteditable', false);

                }, 1500);

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

        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/InvoiceDeliveryEmailrules/edit/' + value);
    }

    $scope.editInvoiceDeliveryEmail = function() {
        var invoiceDeliveryEmailId = $routeParams.invoiceDeliveryEmailId;
        var promise = commonService.ajaxCall('GET', '/api/invoiceDeliveryEmail/' + invoiceDeliveryEmailId);
        promise.then(function(data) {

                $scope.data = data;

                if ($scope.data.notifications.attachment == undefined)
                    $scope.data.notifications.attachment = false;

                if (data.scheduling != undefined) {

                    $scope.showScheduling = true;
                    $scope.schedulingOnOff = true;

                    $scope.$broadcast("toggleSchedulingNotification", {});

                    var dd = new Date(data.scheduling.schedulingStartDate);
                    $scope.data.scheduling.schedulingStartDate = dd;
                    dd = new Date(data.scheduling.schedulingStartTime);
                    $scope.data.scheduling.schedulingStartTime = dd;
                    dd = new Date(data.scheduling.schedulingEndOnDate);
                    $scope.data.scheduling.schedulingEndOnDate = dd;
                    dd = new Date(data.scheduling.schedulingIntervalTime);
                    $scope.data.scheduling.schedulingIntervalTime = dd;
                }
                // console.log(data);

                setTimeout(function() {

                    var tmpHtml = data.notifications.body;
                    var a = "txtBody";

                    $('#' + a).code(tmpHtml);


                }, 1500);

            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    }

    $scope.$on("backInvoiceDeliveryEmail", function(event, args) {
        $scope.data = [];
        $scope.goBack();
    });

    $scope.goBack = function() {
        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/InvoiceDeliveryEmailrules/view');
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
                converted_date = year + " - " + months[parseInt(month, 10) - 1] + " - " + date + "" + dates[parseInt(day, 10)];
                break;
            case "YYYY - MM - DD ":
                converted_date = year + " - " + month + " - " + date;
                break;
            case "dd-MMM-yyyy":
                converted_date = date + " - " + months[parseInt(month, 10) - 1] + " - " + year;
                break;
        }

        return converted_date;
    }

    $scope.getDefaultProfileBase = function() {
        var promise = commonService.ajaxCall('GET', 'api/template/profile/' + $routeParams.systemId);
        promise.then(function(data) {
            $scope.data.profileBase = data;

        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });

    }

});