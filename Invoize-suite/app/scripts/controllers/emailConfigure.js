'use strict';
angularApp.controller('emailConfigureCtrl', function($scope, $rootScope, $location, flash, $http, $q, $timeout, commonService, $modal, $modalInstance, items) {

    $scope.profile = items;
    $scope.configureEmail = {};
    $scope.fields = [];

    function popAlert(msg) {
        flash.pop({
            title: 'Alert',
            body: msg,
            type: 'error'
        });
    }

    $scope.setData = function() {
        var promise = commonService.ajaxCall('GET', '/api/emailAccounts');
        promise.then(function(data) {
            $scope.fields = data;

        }, function(data) {

            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });
    }

    $scope.clear = function() {
        $scope.configureEmail = {};
    }

    $scope.getData = function(value) {
        var promise = commonService.ajaxCall('GET', '/api/emailAccounts/' + value);
        promise.then(function(data) {
            $scope.configureEmail = data;
            $scope.configureEmail.id = value;
        }, function(data) {

            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });
    }

    $scope.saveEmailBoxData = function() {

        if ($scope.configureEmail.id == undefined) {
            var promise = commonService.ajaxCall('POST', '/api/emailAccounts', $scope.configureEmail);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $modalInstance.close();
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
            var promise = commonService.ajaxCall('PUT', '/api/emailAccounts/' + $scope.configureEmail.id, $scope.configureEmail);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.templateLoader = false;
                    $modalInstance.close();
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
    };

    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };


});