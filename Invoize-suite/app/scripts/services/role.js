'use strict';

angularApp.service('roleService', function($http,$q,$stateParams){
        var charges =[];
        var selectedCharge = {};

        return{
                list: function(value){
                   
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/suggestion/', data:value}).
                                success(function(data, status, headers, config){
                                        if(data.type === 1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },

                read: function(id){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/read/role/', data:{"id":id}}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },

                accountList: function(){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/account/', data:{}}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve([{id: 1, text: 'ibm'}, {id: 2, text: 'intel'}, {id: 3, text: 'delldomestic'}, {id: 4, text: 'gapdomestic'}, {id: 5, text: 'apple'}, {id: 6, text: 'gulfStream'}]);}
                                        else
                                                {deferred.resolve(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        return null;
                                })
                        return deferred.promise;
                },

                templateList: function(accountId){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/laneTemplate/', data:{"accountId":accountId}}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve([{id: 1, text: "freight"},{id: 2, text: "FSC"},{id: 3, text: "SSC"},{id: 4, text: "RBI"},{id: 5, text: "BTI"},{id: 6, text: "IHI"},{id: 7, text: "BEY"}]);}
                                        else
                                                {deferred.resolve(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        return null;
                                })
                        return deferred.promise;
                },

                chargeList: function(templateId){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/charge/', data:{"templateId":templateId}}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve([{id: 1, text: "freight"},{id: 2, text: "FSC"},{id: 3, text: "SSC"},{id: 4, text: "RBI"},{id: 5, text: "BTI"},{id: 6, text: "IHI"},{id: 7, text: "BEY"}]);}
                                        else
                                                {deferred.resolve(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        return null;
                                })
                        return deferred.promise;
                }, 

                selectionList: function(chargeId){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/charge/', data:{"chargeId":chargeId}}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve([{dn:"Merge Code",n:"MergeCode"},{dn:"Amendmen No",n:"AmendmentNo"},{dn:"Shipment Mode",n:"ShipmentMode"},{dn:"Origin Airport Code",n:"OriginAirportCode"},{dn:"Origin Country Code",n:"OriginCountryCode"},{dn:"Origin Geo",n:"OriginGeo"},{dn:"Destination Airport Code",n:"DestinationAirportCode"},{dn:"Destination Geo",n:"DestinationGeo"},{dn:"Weight Type",n:"WeightType"},{dn:"Dim Factor",n:"DimFactor"},{dn:"Service Code",n:"ServiceCode"},{dn:"Service Level",n:"ServiceLevel"},{dn:"Supplier Code",n:"SupplierCode"},{dn:"Intel Code",n:"IntelCode"}]);}
                                        else
                                                {deferred.resolve(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        return null;
                                })
                        return deferred.promise;
                },

                getCharge: function(){
                        return selectedCharge
                },

                update: function(role){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/update/role', data:{data:role,id:$stateParams.roleId}}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                },

                delete: function(id){                        
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/delete/role', data:{"id":id}}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                },

                create: function(role){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/create/role', data:role}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        return null
                                });
                        return deferred.promise;
                },

                totalRole: function(data){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/count', data:data}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                }
        };
});