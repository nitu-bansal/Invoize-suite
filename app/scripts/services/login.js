'use strict';

angularApp.service('loginService', function($http,$location,$q, $rootScope) {
        var userEmail = null;

        // Public API here
        return {
                user: function(){
                        return loggedInUser;
                },

                forgotPassword: function(userName){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: 'api/forgot/password', data:{"userName":userName}}).
                                success(function(data, status, header, config) {
                                        if(data.type===1){
                                                deferred.resolve(data.msg);}
                                        else{deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config) {
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                },

                changePassword: function(user){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: 'api/change/password', data:user}).
                                success(function(data, status, header, config) {
                                        if(data.type===1){
                                                deferred.resolve(data.msg);}
                                        else{deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config) {
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                },

                login: function(userName, password){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/login/', data:{"userName":userName,"password":password}}).
                                success(function(data, status, header, config) {
                                        if(data.type===1){
                                                // $rootScope.permissions = data.msg.permissions;
                                                $rootScope.email = data.msg.email;
                                                deferred.resolve();}
                                        else{
                                                deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config) {
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                },

                logout: function(){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/logout/', data:{}}).
                                success(function(data, status, headers, config) {
                                        if(data.type===1){
                                                deferred.resolve();}
                                        else{
                                                deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config) {
                                       deferred.reject("System has experienced an error. Please contact helpdesk."); 
                                });
                        return deferred.promise;
                },

                records: function(){
                        return rec;
                },

                roles: function(){
                        return "Admin";
                },

                email: function(){
                        return userEmail;
                },

                signup: function(register){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/signup/', data:register}).
                                success(function(data, status, headers, config){
                                        if(data.type===1)
                                                {deferred.resolve(data);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config) {
                                        deferred.reject("System has experienced an error. Please contact helpdesk."); 
                                });
                        return deferred.promise;
                },

                confirm: function(url){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/signup/confirm/', data:{"data":url}}).
                                success(function(data, status, headers, config){
                                        if(data.type===1 || data.type===2)
                                                {deferred.resolve(data);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config) {
                                        deferred.reject("System has experienced an error. Please contact helpdesk."); 
                                });
                        return deferred.promise;
                },

                checkSetupDone: function(){
                        var deferred = $q.defer();
                        $http({method: 'POST', url: '/api/organization/isSetupDone', data:{}}).
                                success(function(data, status, headers, config) {
                                        if(data.type===1)
                                                {deferred.resolve(data);}
                                        else
                                                {deferred.reject(data.msg);}
                                }).
                                error(function(data, status, headers, config) {
                                        deferred.reject("System has experienced an error. Please contact helpdesk.");
                                });
                        return deferred.promise;
                },
        };
});
