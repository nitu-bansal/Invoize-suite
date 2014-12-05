'use strict';
angularApp.controller('dsshboardCtrl', function($scope,$route, $state, $routeParams, $location, $modal, $modalInstance, commonService, flash,items) {

        $scope.close = function() {
        // alert(3)
        $modalInstance.dismiss(undefined);
    };

    $scope.abc=items;


})