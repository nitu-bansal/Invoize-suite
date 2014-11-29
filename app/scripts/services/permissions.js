'use strict';

angularApp.service('permissionService', function($http,$q){

        return{
                read: function(email){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/read/permissions/', data:{"email":email}}).
                                success(function(data, status, headers, config){
                                        if(data.result===1)
                                                {return data;}
                                        else
                                                {return null;}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                },

                create: function(permission){
                        var deferred = $q.defer();
                        console.log('creating permission');
                        $http({method: 'POST', url: '/api/create/permission', data:permission}).
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

                update: function(){
                        return 2
                },

                delete: function(id){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/delete/permissions', data:{"id":id}}).
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

                totalPermission: function(data){
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