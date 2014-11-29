'use strict';

angularApp.service('mainService', function($http,$location,$q) {
        return{
                checkDomain: function(){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/chk/domain', data:{}}).
                                success(function(data, status, headers, config) {
                                        if(data.type===1)
                                                {deferred.resolve(data.msg);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config) {
                                        deferred.reject(0);
                                });
                        return deferred.promise;
                },

                getSession: function(sessionId){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/get/session', data:{"sessionId":sessionId}}).
                                success(function(data, status, headers, config) {
                                        if(data.type===1)
                                                {deferred.resolve(data);}
                                        else
                                                {deferred.reject(data);}
                                }).
                                error(function(data, status, headers, config) {
                                        deferred.reject(0);
                                });
                        return deferred.promise;
                },
        };

});
