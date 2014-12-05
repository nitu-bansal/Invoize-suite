'use strict';
angularApp.controller('metadataFormCtrl', function($scope,$rootScope,$routeParams, flash, $timeout,$http,limitToFilter, commonService, $modal, $modalInstance, items) {
    $scope.profile = items;
    $scope.selectMetadataList=[];



    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };

    $scope.clearData=function()
    {
        angular.forEach($scope.profile.fields, function(v, k) {
            v.value=null;
        });
        delete($scope.profile.id);

    }

    $scope.getMetadataList = function() {
        var promise = commonService.ajaxCall('GET', 'api/metadataFormView?metadataTypeId=' + $scope.profile.metadataTypeId + "&systemId=" + $routeParams.systemId + '&pageLimit='+500+'&pageNo=' + 1);
        promise.then(function(data) {
            $scope.selectMetadataList=data;


        }, function(data) {

            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });
    }
    $scope.readMetadadata = function(value) {
        var promise = commonService.ajaxCall('GET', '/api/metadataFormView/' + value);
        promise.then(function(data) {
            $scope.profile = data;
        }, function(data) {

            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });
    }

    $scope.saveMetadata = function() {
        $scope.metadataLoader = true;
        $scope.profile.accountId="*";
        $scope.profile.systemId=$routeParams.systemId;
        if($scope.profile.id!=undefined)
            var promise = commonService.ajaxCall('PUT', '/api/metadataFormView/'+$scope.profile.id, $scope.profile);
        else
            var promise = commonService.ajaxCall('POST', '/api/metadataFormView', $scope.profile);

        promise.then(function(data) {
                flash.pop({
                    title: 'Success',
                    body: data.msg,
                    type: 'success'
                });
                if (data.id) {
                    $modalInstance.dismiss(undefined);
                }
                $scope.metadataLoader = false;
            },
            function(data) {
                $scope.metadataLoader = false;
                flash.pop({
                    title: 'Alert',
                    body: data.msg,
                    type: 'error'
                });
            });

    }

    $scope.scriptBar = function(value,scriptType,name) {

        var key="";
        var url='/api/listEdiVariables?type='+scriptType;

        if(name=='fromEdiType' || name=='toEdiType' )
            key=name.replace("Edi","Message");
        else if(name=="script" && scriptType=="mappings" )
            key="toMessageType";

        if(name=='fromEdiType' || name=='toEdiType' || (name=="script" && scriptType=="mappings"))
        {
            var subFolder="undefined";
            var dict=[];
            var dict = _.where($scope.profile.fields, {
                "key": key
            });
            if(dict.length>0 && dict[0].value!=undefined)
                subFolder=dict[0].value;
            url=url+'&subfolder='+subFolder;
        }
        return $http.get(url)
            .then(function(response){
                var res =_.filter(response.data, function(val){ return val.toLowerCase().indexOf(value) != -1 ; })
                if(res.length==0)
                {
                    $('[id="' + name + '"]').val('');
                }
                return limitToFilter(res, 15);
            });

    };

});

