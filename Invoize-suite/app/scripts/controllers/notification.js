/**
 * Created on 10/02/13.
 */
angularApp.controller('notificationCtrl', function($scope, $state, $routeParams, $location, $modal, commonService, flash, $filter) {

    $scope.fields = {};
    var fieldsdata = {};

    $scope.redirectTo = function(path) {
        $location.path($state.current.name.split('.')[0] + path);
    };



    if ($state.current.name != "organizationSetup.system.profile.account.InvoiceDeliveryEmailrules.new" && $state.current.name != "organizationSetup.system.profile.account.InvoiceDeliveryEmailrules.edit")
        $scope.data = {};


    $scope.attachements = ['true', 'false'];
    $scope.schedulingOnOption = {
        'daily': 'Daily',
        'weekly': 'Weekly',
        'monthly': 'Monthly'
    };
    $scope.schedulingOption = {
        'once': 'Once',
        'interval': 'Interval'
    };
    $scope.endOnOption = {
        'never': 'Never',
        'ondate': 'On Date'
    };

    $scope.setData = function() {

        $('.selectpicker').selectpicker({
            'selectedText': 'cat'
        });
    };

    $scope.moduleChange = function(value) {
        var promise = commonService.ajaxCall('GET', '/api/listNotificationVariables?type=variables&modules=' + value);
        promise.then(function(data) {
            $scope.fields = data.msg;
            fieldsdata = data.msg;

        }, function(result) {

            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });
    }
    $scope.$on("moduleChangeNotification", function() {
        $scope.moduleChange($scope.$parent.data.module[0].n);
    });
    $scope.clear = function() {
        $scope.data = {};
        //$scope.closeScheduling();
        $scope.fields = [];
        $scope.schedulingOnOff = false;
        $scope.onOff = false;

        $scope.$parent.schedulingOnOff = false;

    }
    // disable the scheduling portion
    /** not usable
    $scope.closeScheduling = function() {
        // if ($scope.data.notifications.attachment == false) {

        //     $scope.schedulingOnOff = $scope.data.notifications.attachment;
        //     $scope.schedulingOnOff = true;
        // }
        if ($scope.data.notifications == undefined) {
            $scope.showScheduling = false;
            $scope.showScheduling = $scope.showScheduling === false ? true : false;
        } else if ($scope.data.notifications.attachment == false) {
            $scope.showScheduling = false;
            $scope.showScheduling = $scope.showScheduling === false ? true : false;

        } else if ($scope.data.notifications.attachment == true) {
            if ($scope.onOff == true) {
                $scope.showScheduling = true;
                $scope.showScheduling = $scope.showScheduling === false ? true : false;
            } else if ($state.current.name.contains('edit')) {
                if ($scope.onOff == false) {
                    $scope.showScheduling = false;
                    $scope.showScheduling = $scope.showScheduling === false ? true : false;
                }

            }
        }

    }
     **/
    $scope.saveData = function() {

        if ($routeParams.notificationId == undefined) {



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
                                $scope.data.scheduling.schedulingStartTime = $scope.schedulingStartTime.toString();
                            else
                                $scope.data.scheduling.schedulingStartTime = $scope.data.scheduling.schedulingStartTime.toString();
                            if ($scope.data.scheduling.schedulingIntervalTime == undefined)
                                $scope.data.scheduling.schedulingIntervalTime = $scope.schedulingIntervalTime.toString();
                            else
                                $scope.data.scheduling.schedulingIntervalTime = $scope.data.scheduling.schedulingIntervalTime.toString();
                        }
                    }
                }
            }
            var promise = commonService.ajaxCall('POST', '/api/notification', $scope.data);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.templateLoader = false;
                    $location.path("/organizationSetup/notification/view");
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

            $scope.data.notifications.body = $('#txtBody').code();
            $scope.data.createdBy = $scope.data.createdBy;
            $scope.data.createdOn = $scope.data.createdOn;

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
                                $scope.data.scheduling.schedulingStartTime = $scope.schedulingStartTime.toString();
                            else
                                $scope.data.scheduling.schedulingStartTime = $scope.data.scheduling.schedulingStartTime.toString();
                            if ($scope.data.scheduling.schedulingIntervalTime == undefined)
                                $scope.data.scheduling.schedulingIntervalTime = $scope.schedulingIntervalTime.toString();
                            else
                                $scope.data.scheduling.schedulingIntervalTime = $scope.data.scheduling.schedulingIntervalTime.toString();
                        }
                    }
                }
            }

            var promise = commonService.ajaxCall('PUT', '/api/notification/' + $routeParams.notificationId, $scope.data);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.templateLoader = false;
                    $location.path("/organizationSetup/notification/view");
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

    $scope.showConfigureEmailBox = true;
    $scope.toggleConfigureEmailBox = function() {
        // $scope.showConfigureEmailBox = $scope.showConfigureEmailBox === false ? true : false;
        var itemToSend = [];
        // itemToSend.templateIconfigureEmail.emaild = $scope.templateData.templateId;
        var modalInstance = $modal.open({
            templateUrl: 'emailConfigure.html',
            controller: 'emailConfigureCtrl',
            resolve: {
                items: function() {
                    return angular.copy(itemToSend);
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {
            // $scope.getTemplate();
        }, function(selectedItem) {
            console.log('Modal dismissed ');
        });
    };

    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };

    $scope.showScheduling = true;
    $scope.onOff = false;
    $scope.schedulingOnOff = false;
    $scope.$parent.schedulingOnOff = false;
    $scope.toggleScheduling = function() {
        // $scope.data.notifications = {};
        $scope.showScheduling = $scope.showScheduling === false ? true : false;
        $scope.onOff = !$scope.onOff;
        $scope.$parent.schedulingOnOff = $scope.schedulingOnOff;

    };

    $scope.$on("toggleSchedulingNotification", function(event, args) {
        $scope.showScheduling = true;
        $scope.schedulingOnOff = true;
        $scope.toggleScheduling();
    });

    $scope.showSchedulingDetail = false;
    $scope.toggleSchedulingDetail = function() {
        $scope.showSchedulingDetail = $scope.showSchedulingDetail === false ? true : false;
    };

    $scope.getNotificationList = function(q) {
        $scope.notificationLoader = true;
        commonService.loader(true);
        var promise = commonService.ajaxCall('GET', '/api/notification?pageLimit=20&pageNo=1&q=' + q + '');
        promise.then(function(result) {
            $scope.notificationTypes = result;
            $scope.notificationLoader = false;
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

    $scope.saveEmailBoxData = function() {

        if ($scope.configureEmail.id == undefined) {

            var promise = commonService.ajaxCall('POST', '/api/notification', $scope.configureEmail);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });

                    $scope.templateLoader = false;
                    toggleConfigureEmailBox();
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


        }
    }


    //Time

    $scope.schedulingStartTime = new Date();
    $scope.schedulingIntervalTime = new Date();

    $scope.hstep = 1;
    $scope.mstep = 1;

    $scope.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };

    $scope.ismeridianStart = true;
    $scope.ismeridianInterval = false;

    $scope.viewTemplate = function(value) {

        $scope.redirectTo("/notification/detail/" + value);
    }

    $scope.viewNotification = function() {
        var notificationId = $routeParams.notificationId;
        var promise = commonService.ajaxCall('GET', '/api/notification/' + notificationId);
        promise.then(function(data) {


                $scope.data = data;
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
                            $scope.data.scheduling.schedulingMonthList = $scope.data.scheduling.schedulingMonthList + ',' + monthList.n;
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

        $scope.redirectTo("/notification/edit/" + value);
    }

    $scope.editNotification = function() {
        var notificationId = $routeParams.notificationId;
        var promise = commonService.ajaxCall('GET', '/api/notification/' + notificationId);
        promise.then(function(data) {

                $scope.data = data;
                $scope.moduleChange($scope.data.module[0].n);

                if ($scope.data.notifications.attachment == undefined)
                    $scope.data.notifications.attachment = false;

                if (data.scheduling != undefined) {

                    $scope.showScheduling = true;
                    $scope.schedulingOnOff = true;
                    $scope.toggleScheduling();

                    if (data.scheduling.schedulingStartDate != undefined) {
                        var dd = new Date(data.scheduling.schedulingStartDate);
                        $scope.data.scheduling.schedulingStartDate = dd;
                        dd = new Date(data.scheduling.schedulingStartTime);
                        $scope.data.scheduling.schedulingStartTime = dd;
                    }

                    if (data.scheduling.schedulingEndOnDate != undefined) {
                        var dd = new Date(data.scheduling.schedulingEndOnDate);
                        $scope.data.scheduling.schedulingEndOnDate = dd;
                        dd = new Date(data.scheduling.schedulingIntervalTime);
                        $scope.data.scheduling.schedulingIntervalTime = dd;
                    }
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
                converted_date = year + " - " + months[parseInt(month) - 1] + " - " + date + "" + dates[parseInt(day)];
                break;
            case "YYYY - MM - DD ":
                converted_date = year + " - " + month + " - " + date;
                break;
            case "dd-MMM-yyyy":
                converted_date = date + " - " + months[parseInt(month) - 1] + " - " + year;
                break;
        }

        return converted_date;
    }

    //Search 
    $scope.gridFilter = function(q) {
        $scope.fields = $filter('filter')(fieldsdata, q);

    };

    $scope.fields = fieldsdata;
});