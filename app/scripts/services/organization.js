'use strict';

angularApp.service('organizationService', function($http,$q,$stateParams){

        return{
                list: function(value){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/suggestion', data:value}).
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

                read: function(id){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/read/organization', data:{"id":id}}).
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

                create: function(organization){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/create/organization', data:organization}).
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

                update: function(organization){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/update/organization', data:{id:$stateParams.organizationId,data:organization}}).
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

                delete: function(id){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/delete/organization', data:{"id":id}}).
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

                setup: function(data){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/setup/organization', data:data}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve(data);}
                                        else
                                                {deferred.reject(data);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                },

                totalOrganization: function(data){
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