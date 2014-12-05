'use strict';

angularApp.service('groupService', function($http,$q,$stateParams){
        return{
                list: function(data){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/suggestion/', data:data}).
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

                checkWorkflow: function(data){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/check/workflow', data:data}).
                                success(function(data, status, headers, config){
                                        deferred.resolve(data);
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                },      

                read: function(id){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/read/group', data:{"id":id}}).
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

                update: function(group){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/update/group', data:{data:group,id:$stateParams.groupId}}).
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
                        $http({method: 'POST', url: '/api/delete/group', data:{"id":id}}).
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

                create: function(group){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/create/group', data:group}).
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

                totalGroup: function(data){
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