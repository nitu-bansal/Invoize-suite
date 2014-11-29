'use strict';

angularApp.service('metadataService', function($http,$q){
        return{
                list: function(data){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/metadataType', data:data}).
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
                selectMetadataType: function(data){                        
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/list/metadata', data:data}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                // {deferred.resolve([{"n":"airportcodes","v":"A","id":"4"},{"n":"airportcodes","v":"B","id":"5"},{"n":"airportcodes","v":"C","id":"6"}]);}
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
                        $http({method: 'POST', url: '/api/read/metadata', data:{"id":id}}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                // {deferred.resolve({"n":"airportcodes","v":"A","id":"4"});}
                                                {deferred.resolve(data.msg);}
                                        else                                                
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config){
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                })
                        return deferred.promise;
                },

                createMetadataType: function(metadataType){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/create/metadataType', data:metadataType}).
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

                getMetadataFields: function(data){                        
                        var deferred = $q.defer();                        
                        $http({method: 'POST', url: '/api/list/metadataFields', data:data}).
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

                createMetadata: function(metadata){                        
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/create/metadata', data:metadata}).
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
                deleteMetadataType: function(id){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/delete/metadataType', data:{"id":id}}).
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
                deleteMetadata: function(id){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/delete/metadata', data:{"id":id}}).
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
                updateMetadata: function(metadata){                        
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/update/metadata', data:metadata}).
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

                downloadMetadata: function(metadataType){                        
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/download/metadata', data:{"metadataType":metadataType}}).
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

                totalMetadata: function(data){
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
                },

                totalMetadataType: function(data){
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