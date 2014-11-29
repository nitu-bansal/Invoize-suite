'use strict';

angularApp.service('workflowService', function($http,$q, $stateParams){

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
                        $http({method: 'POST', url: '/api/read/workflow', data:{"id":id}}).
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

                update: function(workflow){
                        var deferred = $q.defer();                   
                        $http({method: 'POST', url: '/api/update/workflow', data:{data:workflow,id:$stateParams.workflowId}}).
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
                        $http({method: 'POST', url: '/api/delete/workflow', data:{"id":id}}).
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

                create: function(value){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/create/workflow', data:value}).
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

                totalWorkflow: function(data){
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