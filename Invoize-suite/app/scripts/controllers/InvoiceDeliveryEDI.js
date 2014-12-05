'use strict';
angularApp.controller('InvoiceDeliveryEDICtrl', function($scope,$route, $state, $routeParams,$http,limitToFilter, $location, $modal, commonService, flash) {

    $scope.metadataType = {};
    $scope.metadataTypes = [];
    $scope.metadataList=[];


    $scope.openDialog = function(name) {
        var promiseOut = commonService.ajaxCall('GET', 'api/suggestion?q='+name+'&pageLimit=10&page=1&selected=""&suggestionFor=suggestion');
        promiseOut.then(function (data) {
                var dict = _.where(data.msg, {
                    "n": name
                });
                if (dict.length > 0) {
                    $scope.selectMetadata = dict;
                    if ($scope.selectMetadata != undefined) {
                        $scope.metadataLoader = true;
                        var metadataTypeId = $scope.selectMetadata[0].id;
                        var promise = commonService.ajaxCall('GET', '/api/metadataType/' + metadataTypeId);
                        promise.then(function (data) {
                                $scope.templateData = data;
                                var itemToSend = $scope.templateData;
                                itemToSend.metadataTypeId = metadataTypeId;
                                itemToSend.accountId=$scope.selectedAccounts.accountIds;
                                var modalInstance = $modal.open({
                                    templateUrl: 'metadataFormView.html',
                                    controller: 'metadataFormCtrl',
                                    resolve: {
                                        items: function() {
                                            return angular.copy(itemToSend);
                                        }
                                    }
                                });
                                modalInstance.result.then(function(selectedItem) {
                                    $scope.getTemplate(selectedItem);
                                }, function(selectedItem) {
                                    console.log('Modal dismissed ');
                                });
                                $scope.metadataLoader = false;
                            },
                            function (data) {
                                flash.pop({
                                    title: 'Alert',
                                    body: data.data,
                                    type: 'error'
                                });
                                $scope.metadataLoader = false;
                            });
                    }
                }
            },
            function (data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                $scope.metadataLoader = false;
            });

    };

    $scope.getEDITemplate = function () {
        if ($scope.EdiMetadataTypeId != undefined) {
            $scope.metadataLoader = true;
            var metadataTypeId = $scope.EdiMetadataTypeId;
            var promise = commonService.ajaxCall('GET', '/api/metadataType/' + metadataTypeId);
            promise.then(function (data) {
                    $scope.metadataType = data;
                    $scope.metadataType.metadataTypeId=metadataTypeId;
                    $scope.metadataLoader = false;
                    $scope.getDefaultProfileBase();
                },
                function (data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                    $scope.metadataLoader = false;
                });
        }

    }



    $scope.createMetadata = function() {
        $scope.metadataLoader = true;
        $scope.metadataType.accountId=$scope.selectedAccounts.accountIds;
        $scope.metadataType.systemId=$routeParams.systemId;
//        $scope.metadataType.profileBase=$scope.profileBase;
        if($route.current.name=="organizationSetup.system.profile.account.InvoicedeliveryEdirules.edit")
        {
            var promise = commonService.ajaxCall('PUT', '/api/metadataFormView/'+$routeParams.metadataId, $scope.metadataType);
        }
        else
        {

            var promise = commonService.ajaxCall('POST', '/api/metadataFormView', $scope.metadataType);
        }

        promise.then(function(data) {
                flash.pop({
                    title: 'Success',
                    body: data.msg,
                    type: 'success'
                });
                $scope.redirectTo("/system/profile/"+$routeParams.systemName+"/"+$routeParams.systemId+"/account/InvoiceDeliveryEDIrules/view");
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

    $scope.getSystemAccountMetadataList = function(q) {
        $scope.metadataLoader = true;
        commonService.loader(true);
        var promiseOut = commonService.ajaxCall('GET', 'api/suggestion?q=invoiceDeliveryEDI&pageLimit=10&page=1&selected=&suggestionFor=suggestion');
        promiseOut.then(function (data) {
                var dict = _.where(data.msg, {
                    "n": "metadata_invoiceDeliveryEDI"
                });
                if (dict.length > 0) {
                    $scope.selectMetadata = dict;
                    if ($scope.selectMetadata != undefined) {
                        $scope.metadataLoader = true;
                        $scope.EdiMetadataTypeId = $scope.selectMetadata[0].id;
                        var promise = commonService.ajaxCall('GET', 'api/metadataFormView?metadataTypeId=' + $scope.EdiMetadataTypeId + "&systemId=" + $routeParams.systemId + '&accountId=' + $scope.selectedAccounts.accountIds + '&pageLimit='+500+'&pageNo=' + 1);
                        promise.then(function(result) {
                            $scope.metadataList = result;
                            $scope.metadataLoader = false;
                            commonService.loader();
                        }, function(result) {
                            flash.pop({
                                title: 'Alert',
                                body: "Please try after sometime..!",
                                type: 'error'
                            });
                            commonService.loader();
                            $scope.metadataLoader = false;
                        });

                    }
                }
            },
            function (data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                $scope.metadataLoader = false;
            });
    };
    $scope.setMetadata=function(listItem)
    {
        $scope.redirectTo("/system/profile/"+$routeParams.systemName+"/"+$routeParams.systemId+"/account/InvoiceDeliveryEDIrules/"+listItem.id);
    };

    $scope.$watch('form.form.$valid', function(newValue, oldValue) {
        $scope.$parent.$parent.validForm = !newValue;
    });


    $scope.readMetadata = function() {
        $scope.metadataLoader = true;

        var promise = commonService.ajaxCall('GET', '/api/metadataFormView/' + $routeParams.metadataId);
        promise.then(function(data) {
                $scope.metadataType = data;
                console.log($scope.metadataType.profileBase);
                if($scope.metadataType.profileBase==undefined)
                    $scope.getDefaultProfileBase();
                $scope.metadataLoader = false;
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                $scope.metadataLoader = false;
            });

    }


    $scope.$on("saveMetadataEvent", function(event, args) {
        $scope.createMetadata();
    });
    $scope.getDefaultProfileBase = function() {
        var promise = commonService.ajaxCall('GET', 'api/template/profile/' + $routeParams.systemId);
        promise.then(function(data) {
            $scope.metadataType.profileBase = data;

        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });

    }

    $scope.scriptBar = function(value,scriptType,name) {
        return $http.get('/api/listEdiVariables?type='+scriptType)
            .then(function(response){
                var res =_.filter(response.data, function(val){ return val.toLowerCase().indexOf(value) != -1 ; })
                if(res.length==0)
                {
                    $('[name="' + name + '"]').val('');
                }
                return limitToFilter(res, 15);
            });

    };

});
