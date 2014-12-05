/**
 * Created by kamalsingh.saini on 3/6/14.
 */

angularApp.controller('environmentSelectionCtrl', function($scope,$rootScope,CryptionService,commonService, $cookies,$modalInstance) {
    $scope.search = {};

    $scope.apply = function(){
        if(!localStorage.a){//if is not a admin
            var promise = commonService.ajaxCall('POST', 'api/suggestion?q=&pageLimit=10&page=1&selected=&suggestionFor=actionCode&company='+ $scope.search.company[0].id+'&system='+ $scope.search.system[0].id+'&responseType=array');
            promise.then(function(data) {
                localStorage.pid = JSON.stringify(CryptionService.encrypt(data.msg.join()));
                $modalInstance.close({company: $scope.search.company,system: $scope.search.system});
            },function(){
//                $modalInstance.dismiss();
            });
        }
    };

    $scope.clearSystem = function(){
        $scope.search.system = null;
        $('[name="searchSystem"]').select2('val',null)
    };
});
