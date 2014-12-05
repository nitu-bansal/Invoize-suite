/**
 * Created on 10/02/13.
 */

angularApp.controller('approvalCtrl', function($scope, $state, $routeParams, $location, $modal, commonService, flash, $filter, $timeout, $http, limitToFilter, $compile) {

    $scope.field = {};
    $scope.field.rulesCondition = [{}];
    $scope.field.workFlow = [{
        condition: "*",
        users: null,
        level: "1"
    }];
    $scope.fieldKeysParams = [];
    $scope.fieldKeysAccountParams = [];
    $scope.custObj = {};
    $scope.phObj = {};

    $scope.clear = function() {
        $scope.field = {};
        $scope.field.rulesCondition = [{}];
        $scope.field.workFlow = [{
            condition: "*",
            users: null,
            level: "1"
        }];
    };

    $scope.redirectTo = function(path) {
        $location.path($state.current.name.split('.')[0] + path);
    };

    $scope.getApprovalList = function(q) {

        commonService.loader(true);
        var promise = commonService.ajaxCall('GET', '/api/workFlowConfiguration?pageLimit=20&pageNo=1&q=' + q + '');
        promise.then(function(result) {
            $scope.approvalList = result;

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

    $scope.saveData = function() {
        $scope.field.module = "Tariff";
        // console.log($scope.field);
        commonService.loader(true);
        var promise = commonService.ajaxCall('PUT', 'api/workFlowConfiguration', $scope.field);
        promise.then(function(data) {
            flash.pop({
                title: 'Success',
                body: data,
                type: 'success'
            });
            commonService.loader();
            $scope.redirectTo("/approval/view");

        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
            commonService.loader();
        });
    };

    $scope.accountSelection = function() {

        if ($scope.field.accounts != undefined) {
            var flgAll = false;
            var all;
            for (var i = 0; i < $scope.field.accounts.length; i++) {
                if ($scope.field.accounts[i].n == "All") {
                    flgAll = true;
                    all = $scope.field.accounts[i];
                    break;
                }
            }

            if (flgAll == true) {
                $scope.field.accounts = [];
                $scope.field.accounts.push(all);
            }

            $scope.fieldKeysAccountParams = [];

            for (var i = 0; i < $scope.field.accounts.length; i++)
                $scope.fieldKeysAccountParams.push($scope.field.accounts[i].n);

        }
    };


    // $scope.addTag = function() {
    //     $scope.field.condition.push({});
    // };

    // ///function to remove selected tag
    // $scope.removeTag = function(index) {
    //     $scope.field.condition.splice(index, 1);
    // };
    // ///end function 

    $scope.addLevel = function() {

        $scope.field.workFlow.push({
            condition: '*',
            users: null,
            level: "" + ($scope.field.workFlow.length + 1)
        })
    };
    $scope.removeLevel = function(index) {

        $scope.field.workFlow.splice(index, 1);
        for (var i = 0; i < $scope.field.workFlow.length; i++)
            $scope.field.workFlow[i].level = "" + (i + 1);

    };

    $scope.editTemplate = function(value) {

        $scope.redirectTo("/approval/edit/" + value);
    }

    $scope.editApproval = function() {
        $scope.field.Id = $routeParams.approvalId;
        var promise = commonService.ajaxCall('GET', '/api/workFlowConfiguration/' + $scope.field.Id);
        promise.then(function(data) {

                var sc = data.workFlow.sort(function(a, b) {
                    return parseInt(a.level) - parseInt(b.level)
                });
                data.workFlow = sc;
                $scope.field = data;



            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    }

    $scope.viewTemplate = function(value) {

        $scope.redirectTo("/approval/details/" + value);
    }

    $scope.fieldKeyChangedParameters = function(id, field) {
        $scope.fieldKeysParams = [];

        // if (id)
        //     $('input[name="ruleTagName_' + id + '"]').select2('val', null);
        for (var i = 0; i < $scope.field.rulesCondition.length; i++)
            if ($scope.field.rulesCondition[i].tagName && $scope.field.rulesCondition[i].tagName.length > 0) {
                //              $scope.fieldKeysParams.push($scope.parameters.fields[i].fieldKey[0].n);
                $scope.fieldKeysParams.push($scope.field.rulesCondition[i].tagName[0].n);
            }


    }

    $scope.setCustObj = function(index, obj) {

        var val = "";
        if ($scope.field.rulesCondition[index].tagName != undefined) {
            for (var i = 0; i < $scope.field.rulesCondition[index].tagName[0].v.length; i++) {
                if (angular.equals($scope.field.rulesCondition[index].tagName[0].v[i], obj)) {
                    val = $scope.field.rulesCondition[index].tagName[0].v.split("|")[1];
                }
            };

            $scope.custObj[index] = {
                column: val
            }

            var valPh = $scope.field.rulesCondition[index].tagName[0].v;
            for (var i = 0; i < $scope.field.rulesCondition[index].tagName[0].v.length; i++) {
                if (angular.equals($scope.field.rulesCondition[index].tagName[0].v[i], obj)) {
                    valPh = $scope.field.rulesCondition[index].tagName[0].v.split("|")[0];
                }
            };


            $scope.phObj[index] = {
                value: valPh
            }
        }
    }

});