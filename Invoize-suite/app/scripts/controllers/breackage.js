/**
 * Created by kamalsingh.saini on 28/2/14.
 */
"use strict";
angularApp.controller("breakageCtrl", function($scope, $rootScope, $routeParams, flash, $timeout, $modalInstance, commonService,items) {

    $scope.breakage={};
    $scope.breakage.breaks = [
         {
            "id":1,
            "key": "weightBreaks",
            "label": "Weight Breaks",
            "fields": [
                {
                    "from": 0,
                    "to": null,
                    "method": ""
                }
            ]
        },
        {
            "id":2,
            "key": "miles",
            "label": "Miles",
            "fields": [
                {
                    "from": 0,
                    "to": null,
                    "method": ""
                }
            ]
        },
        {
            "id":3,
            "key": "zipCodes",
            "label": "Zip codes",
            "fields": [
                {
                    "from": 0,
                    "to": null,
                    "method": ""
                }
            ]
        },
        {
            "id":4,
            "key": "timeBreaks",
            "label": "Time Breaks",
            "category": {
                "$label": "Day",
                "$fields": [
                    {
                        "key": "weekday",
                        "label": "weekday",
                        "fields": [
                            {
                                "from": 0,
                                "to": null,
                                "method": ""
                            }
                        ]
                    },
                    {
                        "key": "weekend",
                        "label": "weekend",
                        "fields": [
                            {
                                "from": 0,
                                "to": null,
                                "method": ""
                            }
                        ]
                    },
                    {
                        "key": "holiday",
                        "label": "holiday",
                        "fields": [
                            {
                                "from": 0,
                                "to": null,
                                "method": ""
                            }
                        ]
                    }
                ],
                "value": null
            }
        }
    ];
    var tempItems = items;
    $scope.savedBreakages = {};
    $scope.savedBreakages.break = [];
    $scope.removedBrakages = [];
    $scope.breakage.removedBrakages = [];

    var promise = commonService.ajaxCall("GET", "api/suggestion?suggestionFor=calculationCode&systemId="+$rootScope.loggedInUser.userSystem[0].id);
    promise.then(function(data) {
        $scope.breakage.methods = data.msg;

        if (tempItems.breackage!==null) {
            $scope.breakage.break = tempItems.breackage;
            $scope.breakage.consider =  tempItems.consider;
        }
        else {
            $scope.breakage.break = [];
        }

        //Get the saved brakages first
        angular.forEach($scope.breakage.break, function(item) {
            $scope.savedBreakages.break.push({
                "fields" : item.fields,
                "key" : item.key,
                "label" : item.label
            });
        });
        console.log($scope.savedBreakages);
        console.log($scope.breakage);
    }, function(data) {
        flash.pop({
            title: "Alert",
            body: data.data,
            type: "error"
        });
    });

    $scope.AddBreakage = function(fields, i) {
        if (fields[i].to) {
            if (!fields[i].to.toString().match(/^\d*(\.\d+)?$/))
                fields[i].to = null;
            var v = parseFloat(fields[i].to);
            if (isNaN(v) || v <= parseFloat(fields[i].from)) {
                fields[i].to = null;
                flash.pop({
                    title: "Alert",
                    body: "Invalid Value!",
                    type: "error"
                });
            }
            if (fields[i].to != null && fields.length < (i + 2))
                fields.push({
                    from: (v + 0.01).toFixed(2),
                    to: null,
                    method: null
                });
            else fields[i+1].from = (v + 0.01).toFixed(2);
        }
    };

    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };

    $scope.updateBreakages = function() {
        console.log($scope.breakage.consider);
        $scope.removedBrakages = [];

        angular.forEach($scope.savedBreakages.break, function(searchTerm){
            console.log( searchTerm);
            var isFound;

            isFound = isBreakageExists(searchTerm.key)

            if( isFound < 0){
                console.log('Breakage Not Found : ' + searchTerm.key);
                $scope.removedBrakages.push(searchTerm.key);
            }

        });

        if($scope.removedBrakages.length > 0) {
            $scope.breakage.removedBrakages = $scope.removedBrakages;
        }else{
            $scope.breakage.removedBrakages = [];
        }

        $modalInstance.close($scope.breakage);

        // var promise = commonService.ajaxCall("PUT", "api/test", {
        //     'breakages': $scope.breakage.
        //     break
        // });
        // promise.then(function(data) {

        // }, function(data) {
        //     flash.pop({
        //         title: "Alert",
        //         body: data.data,
        //         type: "error"
        //     });
        // });
    }

    function isBreakageExists(keyName){
        var returnIndex=-1;
        angular.forEach($scope.breakage.break, function(item, index){
            if(item.key === keyName){
                returnIndex = index;
            }
        });

        return returnIndex;
    }
});