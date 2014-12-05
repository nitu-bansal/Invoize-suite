/**
 * Created by pallavi.dandane on 9/30/2014.
 */
angularApp.controller('docManagementUserGroupctrl', function($scope, $location, flash, $http, $q, $timeout, commonService, $modal, $modalInstance, $routeParams, $rootScope) {

    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    }

    $scope.getUserGroupList = function(q,type,systemId,Company) {
        $scope.groupLoader = true;
        var promise = commonService.ajaxCall('GET', '/api/groups?pageLimit=10&pageNo=1&q=&type=user&system=' + $rootScope.loggedInUser.userSystem[0].id  + '&company=' + $rootScope.loggedInUser.userCompany[0].id);
        promise.then(function (data) {
                $scope.groupList = data;
                $scope.groupLoader = false;
            },
            function (data) {
                flash.pop({
                    title: 'Alert',
                    body: data.msg,
                    type: 'error'
                });
                $scope.groupLoader = false;
            });
    };
});