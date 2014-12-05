'use strict';
angularApp.controller('emailInvoiceCtrl', function($scope,$rootScope,$routeParams, flash, $timeout, commonService, $modal, $modalInstance, items) {
    $scope.email={};
    $scope.email.details=items.details;
    $scope.email.template={};
    console.log(items);


    $scope.setData=function()
    {

        $scope.email.template = items.template;
        setTimeout(function() {
            var a = "txtBody";
            $('#' + a).code($scope.email.template.body);
            $('.note-editable').attr('contenteditable', false);

        }, 1500);
    }
    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };
    if(items.template!=null)
    {
        $scope.setData();
    }
});

