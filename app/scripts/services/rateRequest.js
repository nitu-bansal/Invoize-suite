'use strict';

angularApp.service('rateRequestService', function($http,$q){
        var charges =[];
        var selectedCharge = {};

        return{
                rateRequestList: function(data){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/rateRequest/', data:data}).
                                success(function(data, status, headers, config){
                                        if(data.result===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },
                tmsRequestList: function(data){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/tms/list/tmsRequest/', data:data}).
                                success(function(data, status, headers, config){
                                        if(data.result===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },

                rateRequestRead: function(requestId){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/read/rateRequest/', data:{"rateRequestId":requestId}}).
                                success(function(data, status, headers, config){
                                        if(data.result===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },

                defaultFieldsList: function(requestId){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/organization/', data:{"requestId":requestId}}).
                                success(function(data, status, headers, config){
                                        if(data.result===1)
                                                {deferred.resolve([{dn:"Origin",n:"origin"},{dn:"Destination",n:"destination"},{dn:"Service Level",n:"serviceLevel"},{dn:"Service Type",n:"serviceType"}]);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },

                otherFieldsList: function(value){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/suggestion/', data:value}).
                                success(function(data, status, headers, config){
                                        if(data.result===1)
                                        {                                                                                    
                                                deferred.resolve([{n:"Zip Code",v:""},{n:"originAirportCode",v:""},{n:"destinationAirportCode",v:""}]);
                                        }
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },

                rateRequestCount: function(data){                        
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/getCount/rateRequest/', data:data}).
                                success(function(data, status, headers, config){
                                        if(data.result===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },
                updateRateRequest: function(data){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/update/rateRequest', data:data}).
                                success(function(data, status, headers, config){
                                        if(data.result===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                },

                getRateRequestHistory: function(requestId){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/rateRequestHistory/', data:{"rateRequestId":requestId}}).
                                success(function(data, status, headers, config){
                                        if(data.result===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },

                rateRequestHistoryRead: function(data){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/read/rateRequestHistory/', data:data}).
                                success(function(data, status, headers, config){
                                        if(data.result===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },


        };
});