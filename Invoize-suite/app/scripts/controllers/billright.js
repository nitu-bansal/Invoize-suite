angularApp.controller('billRightCtrl', function($scope, $state, $routeParams, $route, $location, $modal, commonService, flash, $rootScope, CryptionService) {
    $scope.allocationColumns = {};
    $scope.inVolumeData = {};
    $scope.accuracyData = {};
    $scope.undeliveredData = {};
    $scope.nonInvTimelinessData = {};
    $scope.invTimelinessData = {};
    $scope.nonUnbilledData = {};
    $scope.outVolumeData = {};
    $scope.unbilledData = {};
    $scope.global = {};
    $scope.globalChartData = {
        count: {},
        unbilled: {
            "detail": [],
            "chart": []
        },
        inVolume: {
            "detail": [],
            "chart": []
        },
        outVolume: {
            "detail": [],
            "chart": []
        },
        nonUnbilled: {
            "detail": [],
            "chart": []
        },
        invTimeliness: {
            "detail": [],
            "chart": []
        },
        nonInvTimeliness: {
            "detail": [],
            "chart": []
        },
        undelivered: {
            "detail": [],
            "chart": []
        },
        accuracy: {
            "detail": [],
            "chart": []
        }
    };
    $scope.opt = "";
    $scope.days = [{
        n: "Monday",
        v: "Monday"
    }, {
        n: "Tuesday",
        v: "Tuesday"
    }, {
        n: "Wednesday",
        v: "Wednesday"
    }, {
        n: "Thursday",
        v: "Thursday"
    }, {
        n: "Friday",
        v: "Friday"
    }, {
        n: "Saturday",
        v: "Saturday"
    }, {
        n: "Sunday",
        v: "Sunday"
    }];
    $scope.months = [{
        n: "January",
        v: "January"
    }, {
        n: "February",
        v: "February"
    }, {
        n: "March",
        v: "March"
    }, {
        n: "April",
        v: "April"
    }, {
        n: "May",
        v: "May"
    }, {
        n: "June",
        v: "June"
    }, {
        n: "July",
        v: "July"
    }, {
        n: "August",
        v: "August"
    }, {
        n: "September",
        v: "September"
    }, {
        n: "October",
        v: "October"
    }, {
        n: "November",
        v: "November"
    }, {
        n: "December",
        v: "December"
    }];
    $scope.quarters = [{
        n: "Q1",
        v: "Q1"
    }, {
        n: "Q2",
        v: "Q2"
    }, {
        n: "Q3",
        v: "Q3"
    }, {
        n: "Q4",
        v: "Q4"
    }];
    $scope.age = [
        "1-2",
        "3-5",
        "6-10",
        "11-15",
        "16-30",
        "31-60",
        "60+"
    ];

    $scope.products = [
        "AE",
        "OE",
        "AI",
        "OI"
    ];
    $scope.scope = [
        "HCL + CEVA",
        "HCL VS CEVA",
        "HCL",
        "CEVA"
    ];

    var selectedCols = [],
        sDate = new Date(),
        eDate = new Date();
    sDate = sDate.setDate(sDate.getDate() - 15);
    sDate = new Date(sDate);

    // check if logged in user has selected account in his/her previous session
    if(localStorage.account) {
        // take the account number and store it in global account object to be used by submodules of billright modules
        $scope.global.account = JSON.parse(localStorage.account);
    }//if

    // changing of account should update the localstorage and backend so that in next session, backend must send this value
    $scope.$watch('global.account', function(newVal, oldVal){

        // account value changed
        if(!angular.equals(newVal, oldVal) && angular.isDefined(newVal) && newVal.length > 0) {
            // it is legal defined value
            // store in backend

            commonService.ajaxCall('PUT','api/setAccountCode',newVal).then(function(success){

                    angular.noop();

                }, function(error){flash.pop({
                    title: 'Alert',
                    body: error.data,
                    type: 'error'
                });
            });
            // update the localstorage
            localStorage.account = JSON.stringify(newVal);
        }

    });

   function initFilter() {
     return { region: [],
         subRegion: [],
         country: [],
         station: [],
         account: [],
         timeRange: {
             year: eDate.getFullYear(),
             type: "Daily",
             axisDesc: "Days",
             startdate: sDate.toISOString(),
             enddate: eDate.toISOString(),
             "age": []
         },
         product: [],
         scope: "HCL + CEVA"
     }
   }

    $scope.filterObj = initFilter();

    $scope.dateFormat = ['dd-MMMM-yyyy', 'yyyy-MM-dd', 'shortDate'];
//    var datefilter = $filter('date');

    $scope.$watch('filterObj.timeRange.type', function(newValue, oldValue) {
        if (newValue == "Quarterly") {
            $scope.filterObj.timeRange.year = 2014;
            $scope.filterObj.timeRange.axisDesc = "Quarters";
            delete $scope.filterObj.timeRange.startdate;
            delete $scope.filterObj.timeRange.enddate;
            delete $scope.filterObj.timeRange.weekday
        }

        if (newValue == "Monthly") {
            $scope.filterObj.timeRange.axisDesc = "Months";
            delete $scope.filterObj.timeRange.quarter;
            delete $scope.filterObj.timeRange.year;
            delete $scope.filterObj.timeRange.weekday
        }
        if (newValue == "Weekly") {
            $scope.filterObj.timeRange.axisDesc = "Weeks";
            delete $scope.filterObj.startdate;
            delete $scope.filterObj.enddate;
        }
        if (newValue == "Daily") {
            $scope.filterObj.timeRange.axisDesc = "Days";
            delete $scope.filterObj.timeRange.weekday;
            delete $scope.filterObj.timeRange.quarter;
            delete $scope.filterObj.timeRange.year;
        }

    });

    $scope.coffeeData = {
        type: "ColumnChart",
        options: {
            'width': 500,
            'height': 250,
            vAxis: {
                minValue: 0,
                title: "Volume (In Thousand Shipments)"
            },
            hAxis: {
                title: "*Lanes in red have expired tarrifs"
            },
            isStacked: 'true',
            chartArea: {
                width: "60%",
                height: "80%"
            }
        },
        values: [
            ['Route', 'Valid Tariff', 'Expired Tariff'],
            ['TYO-BOM', 35, 0],
            ['DFW-HKG', 31, 0],
            ['AMS-BOM', 30, 0],
            ['BOM-DFW', 30, 0],
            ['TYO-DFW', 0, 29],
            ['SIN-HKG', 28, 0],
            ['BOM-TYO', 27, 0],
            ['DFW-LAX', 27, 0],
            ['KUL-HKG', 26, 0],
            ['YKG-TYO', 25, 0],
            ['AMS-HKG', 23, 0],
            ['AMS-TYO', 0, 21]
        ]

    };

    $scope.volumeData = {
        type: "BarChart",
        options: {
            title: "Volume By Organization",
            width: 500,
            height: 250,
            vAxis: {
                title: "Month"
            },
            hAxis: {
                title: "Shipments"
            }
        },
        values: [
            ['Month', 'HCL', 'CEVA'],
            ['MAY 14', 1556, 3869],
            ['APR 14', 16579, 4404],
            ['MAR 14', 16652, 43552],
            ['FEB 14', 19613, 3930],
            ['JAN 14', 19007, 5176]
        ]

    };


    var daftPoints = [
            [100, 4]
        ],
        punkPoints = [
            [120, 20]
        ],
        data1 = [{
        data: daftPoints,
        color: '#00b9d7',
        bars: {
            show: true,
            barWidth: 1,
            fillColor: '#00b9d7',
            order: 1,
            align: "center"
        }
    }, {
        data: punkPoints,
        color: '#3a4452',
        bars: {
            show: true,
            barWidth: 1,
            fillColor: '#3a4452',
            order: 2,
            align: "center"
        }
    }];


    $scope.setTime = function(type) {
        filterObj.weekday = "";
        filterObj.quarter = "";
        filterObj.month = "";
        $scope.opt = type;

    };
    $scope.data = data1;

    $scope.getAllocatedList = function(){
        var promiseList = commonService.ajaxCall('GET', 'api/allocatedShipments?list=true&cols='+selectedCols);
        promiseList.then(function(data) {
                $scope.allocatedShipments = data;
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    };

    function getAllocatedShipmentList() {
        if ($rootScope.loggedInUser.userCompany != null || $rootScope.loggedInUser.userSystem != null) {
            var promise = commonService.ajaxCall('GET', 'api/allocatedShipments');
            promise.then(function(data) {
                    $scope.totalShipments = data.msg;
                },
                function(data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                });

            $scope.getAllocatedList();

        }
    }

    $scope.setSelectedCols = function(ele,val){
        if(ele.checked) selectedCols.push(val);
        else selectedCols.splice(selectedCols.indexOf(val),1);
    };

    $scope.showPendingShipment = function(account, accountID, emailID) {
        if (accountID == undefined)
            flash.pop({
                title: 'Account',
                body: 'Account# doesnot exists, Please contact admin to add account.',
                type: 'warning'
            });
        else

            $location.path("/billright/shipmentEntry/pending/" + account + "/" + accountID + "/" + emailID);
    };

    $scope.openAllocateDialog = function(shipment) {
        var itemToSend = angular.copy(shipment);
        itemToSend.for = "Shipment";
        itemToSend.systemId = $rootScope.loggedInUser.userSystem[0].id;

        var modalInstance = $modal.open({
            templateUrl: 'm.allocation.html',
            controller: 'reallocationCtrl',
            resolve: {
                items: function() {
                    return angular.copy(itemToSend);
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {
            getAllocatedShipmentList();
        }, function(selectedItem) {
            getAllocatedShipmentList();
            $scope.metadataLoader = false;
        });
    };
//
//    $scope.redirectTo = function(path) {
//        if (path == 'billright') {
//            $location.path(path);
//        } else
//            $location.path($state.current.name.split('.')[0] + path);
//    };


    var getDashboardDataByType = function(type) {
        $scope.inVolumeData.values = [];
        $scope.accuracyData.values = [];
        $scope.undeliveredData.values = [];
        $scope.nonInvTimelinessData.values = [];
        $scope.invTimelinessData.values = [];
        $scope.nonUnbilledData.values = [];
        $scope.outVolumeData.values = [];
        $scope.unbilledData.values = [];

        $scope.filterObj.dType = type;
        var promise = commonService.ajaxCall('POST', '/api/bpR', {
            data: $scope.filterObj
        });
        promise.then(function(result) {
            $scope.globalChartData = result;
            processUnbilledObj();
            processinVolumeObj();
            processoutVolumeObj();
            processnonUnbilledObj();
            processinvTimelinessObj();
            processnonUnbilledObj();
            processnonInvTimelinessObj();
            processundeliveredObj();
            processaccuracyObj();
        }, function(result) {
            flash.pop({
                title: 'Alert',
                body: result.data,
                type: 'error'
            });
        });

    };

    function processUnbilledObj() {
        $scope.unbilledData = {
            type: "ComboChart",
            options: {
                tooltip: {
                    textStyle: {
                        bold: false
                    }
                },
                width: 600,
                height: 250,
                pointSize: 4,
                vAxes: {
                    0: {
                        title: "Unbilled"
                    },
                    1: {
                        title: "Unbilled %",
                        minValue: 10,
                        maxvalue: 100
                    }
                },
                hAxis: {
                    title: $scope.filterObj.timeRange.axisDesc
                },
                series: {}
            },
            values: []
        };
        if ($scope.globalChartData.unbilled.chart.length > 0) {
            $scope.unbilledData.values = angular.copy($scope.globalChartData.unbilled.chart);
            for (var count = 0; count < $scope.unbilledData.values[0].length - 1; count++) {
                $scope.unbilledData.options.series[count] = {
                    type: "bars",
                    targetAxisIndex: 0
                };
                $scope.unbilledData.options.series[count + 1] = {
                    type: "line",
                    targetAxisIndex: 1
                };
                count++;
            }
        }
    }

    function processinVolumeObj() {

        $scope.inVolumeData = {
            type: "ColumnChart",
            options: {
//                title: "Volume By Organization",
                legend: { position: 'top'},
                width: 600,
                height: 250,
                vAxis: {
                    title: "Shipments"
                },
                hAxis: {
                    title: $scope.filterObj.timeRange.axisDesc
                }
            },
            values: []
            //                ['Month', 'HCL', 'CEVA'],
            //                ['MAY 14',  1556,   3869],
            //                ['APR 14',  16579,    4404],
            //                ['MAR 14',  16652,    43552],
            //                ['FEB 14',  19613,    3930],
            //                ['JAN 14',  19007,   5176]


        };
        console.log($scope.inVolumeData.values);
        if ($scope.globalChartData.inVolume.chart.length > 0) {
            $scope.inVolumeData.values = angular.copy($scope.globalChartData.inVolume.chart);
        }

    }

    function processoutVolumeObj() {
        $scope.outVolumeData = {
            type: "ComboChart",
            options: {
                tooltip: {
                    textStyle: {
                        bold: false
                    }
                },
                width: 600,
                height: 250,
                pointSize: 4,
                vAxes: {
                    0: {
                        title: "Invoices Billed"
                    },
                    1: {
                        title: "Productivity  %",
                        minValue: 10,
                        maxvalue: 100
                    }
                },
                hAxis: {
                    title: $scope.filterObj.timeRange.axisDesc
                },
                series: {}
            },
            values: []
        };
        if ($scope.globalChartData.outVolume.chart.length > 0) {
            $scope.outVolumeData.values = angular.copy($scope.globalChartData.outVolume.chart);
            for (var count = 0; count < $scope.unbilledData.values[0].length - 1; count++) {
                $scope.outVolumeData.options.series[count] = {
                    type: "bars",
                    targetAxisIndex: 0
                };
                $scope.outVolumeData.options.series[count + 1] = {
                    type: "line",
                    targetAxisIndex: 1
                };
                count++;
            }
        }


    }

    function processnonUnbilledObj() {
        $scope.nonUnbilledData = {
            type: "ComboChart",
            options: {
                tooltip: {
                    textStyle: {
                        bold: false
                    }
                },
                width: 600,
                height: 250,
                pointSize: 4,
                vAxes: {
                    0: {
                        title: "Non-compliant Unbilled "
                    },
                    1: {
                        title: "Non-compliant Unbilled %",
                        minValue: 10,
                        maxvalue: 100
                    }
                },
                hAxis: {
                    title: $scope.filterObj.timeRange.axisDesc
                },
                series: {}
            },
            values: []
        };
        if ($scope.globalChartData.nonUnbilled.chart.length > 0) {
            $scope.nonUnbilledData.values = angular.copy($scope.globalChartData.nonUnbilled.chart);
            for (var count = 0; count < $scope.nonUnbilledData.values[0].length - 1; count++) {
                $scope.nonUnbilledData.options.series[count] = {
                    type: "bars",
                    targetAxisIndex: 0
                };
                $scope.nonUnbilledData.options.series[count + 1] = {
                    type: "line",
                    targetAxisIndex: 1
                };
                count++;
            }
        }

    }

    function processinvTimelinessObj() {
        $scope.invTimelinessData = {
            type: "ColumnChart",
            options: {
//                title: "Volume By Organization",
                legend: { position: 'top'},
                width: 600,
                height: 250,
                vAxis: {
                    title: "Shipments"
                },
                hAxis: {
                    title: $scope.filterObj.timeRange.axisDesc
                }
            },
            values: []
            //                ['Month', 'HCL', 'CEVA'],
            //                ['MAY 14',  1556,   3869],
            //                ['APR 14',  16579,    4404],
            //                ['MAR 14',  16652,    43552],
            //                ['FEB 14',  19613,    3930],
            //                ['JAN 14',  19007,   5176]


        };
        if ($scope.globalChartData.invTimeliness.chart.length > 0) {
            $scope.invTimelinessData.values = angular.copy($scope.globalChartData.invTimeliness.chart);

        }

    }

    function processnonInvTimelinessObj() {
        $scope.nonInvTimelinessData = {
            type: "ComboChart",
            options: {
                tooltip: {
                    textStyle: {
                        bold: false
                    }
                },
                width: 600,
                height: 250,
                pointSize: 4,
                vAxes: {
                    0: {
                        title: "Non-compliant billed "
                    },
                    1: {
                        title: "Non-compliant billed %",
                        minValue: 10,
                        maxvalue: 100
                    }
                },
                hAxis: {
                    title: $scope.filterObj.timeRange.axisDesc
                },
                series: {}
            },
            values: []

        };
        if ($scope.globalChartData.nonInvTimeliness.chart.length > 0) {
            $scope.nonInvTimelinessData.values = angular.copy($scope.globalChartData.nonInvTimeliness.chart);
            for (var count = 0; count < $scope.nonInvTimelinessData.values[0].length - 1; count++) {
                $scope.nonInvTimelinessData.options.series[count] = {
                    type: "bars",
                    targetAxisIndex: 0
                };
                $scope.nonInvTimelinessData.options.series[count + 1] = {
                    type: "line",
                    targetAxisIndex: 1
                };
                count++;
            }
        }

    }

    function processundeliveredObj() {
        $scope.undeliveredData = {
            type: "ComboChart",
            options: {
                tooltip: {
                    textStyle: {
                        bold: false
                    }
                },
                width: 600,
                height: 250,
                pointSize: 4,
                vAxes: {
                    0: {
                        title: "Undelivered"
                    },
                    1: {
                        title: "Undelivered %",
                        minValue: 10,
                        maxvalue: 100
                    }
                },
                hAxis: {
                    title: $scope.filterObj.timeRange.axisDesc
                },
                series: {}
            },
            values: []

        };
        if ($scope.globalChartData.undelivered.chart.length > 0) {
            $scope.undeliveredData.values = angular.copy($scope.globalChartData.undelivered.chart);
            for (var count = 0; count < $scope.undeliveredData.values[0].length - 1; count++) {
                $scope.undeliveredData.options.series[count] = {
                    type: "bars",
                    targetAxisIndex: 0
                };
                $scope.undeliveredData.options.series[count + 1] = {
                    type: "line",
                    targetAxisIndex: 1
                };
                count++;
            }
        }

    }

    function processaccuracyObj() {
        $scope.accuracyData = {
            type: "ComboChart",
            options: {
                tooltip: {
                    textStyle: {
                        bold: false
                    }
                },
                width: 600,
                height: 250,
                pointSize: 4,
                vAxes: {
                    0: {
                        title: "Corrections"
                    },
                    1: {
                        title: "Accuracy %",
                        minValue: 10,
                        maxvalue: 100
                    }
                },
                hAxis: {
                    title: $scope.filterObj.timeRange.axisDesc
                },
                series: {}
            },
            values: []

        };
        if ($scope.globalChartData.accuracy.chart.length > 0) {
            $scope.accuracyData.values = angular.copy($scope.globalChartData.accuracy.chart);
            for (var count = 0; count < $scope.accuracyData.values[0].length - 1; count++) {
                $scope.accuracyData.options.series[count] = {
                    type: "bars",
                    targetAxisIndex: 0
                };
                $scope.accuracyData.options.series[count + 1] = {
                    type: "line",
                    targetAxisIndex: 1
                };
                count++;
            }
        }

    }
    $scope.applyFilter = function() {
        var type = ["unbilled", "inVolume", "outVolume", "nonUnbilled", "invTimeliness", "nonInvTimeliness", "undelivered", "accuracy"];
        getDashboardDataByType(type)
    };

    $scope.resetFilter = function() {
        $scope.filterObj = initFilter();
    };

    $scope.refreshShipments = function(){
        getAllocatedShipmentList();
    };

    $scope.getCurrentState = function(tabs,i){
        var state = $state.current.name.split('.')[i||1];
       return tabs.indexOf(state)!==-1;
    };

    var promiseColumns = commonService.ajaxCall('GET', 'api/suggestions?suggestionFor=workAllocationFields');
    promiseColumns.then(function(data) {
            $scope.allocationColumns = data.msg;
        },
        function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });

    getAllocatedShipmentList();
    $.getScript("/scripts/vendor/ace.js");

});