'use strict';

angularApp.controller('loginCtrl', function($scope,$http,$rootScope, $window, $state, $location,$routeParams,loginService,rateRequestService, flash) {
        // $scope.email = loginService.email();
        $scope.loadingRegister = false;
        $scope.loadingLogin = false;
        $scope.loadingChangePassword = false;
        $scope.register = {};

        $scope.change = function(){
                $scope.register.subDomain = $scope.register.organization;
        }

        $scope.forgotPassword = function(userName){                
                if(_.isEmpty(userName)){                                
                                flash.pop({title: 'Alert', body: "User Name / Email Required.", type: 'error'});
                        }
                else{
                        var promise = loginService.forgotPassword(userName);
                        promise.then(function(msg){
                                        flash.pop({title: 'Success', body: msg, type: 'info'});},
                                function(msg){                                        
                                        flash.pop({title: 'Alert', body: msg, type: 'error'});}
                        );
                }
        }

        $scope.changePassword = function(user){
                $scope.loadingChangePassword = true;
                // if(_.isEmpty(user))
                //         flash.pop({title: 'Alert', body: "User Name / Email required.", type: 'error'});
                var promise = loginService.changePassword(user);
                promise.then(function(msg){
                                $scope.loadingChangePassword = false;
                                flash.pop({title: 'Success', body: msg, type: 'info'});},
                        function(msg){
                                $scope.loadingChangePassword = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});}
                );
        }

        $scope.login = function(userName,password){
                $scope.loginLoader = true;
                var promise = loginService.login(userName,password);
                promise.then(function(){
                                $rootScope.isAuthenticated = true;
                                        var prom = loginService.checkSetupDone();
                                        prom.then(function(msg){
                                                        $scope.loginLoader = false;                                                         
                                                        $location.path("/home");},
                                                function(msg){
                                                        $scope.loginLoader = false;                                                        
                                                        $location.path("/wizard");}
                                        );
                                $scope.getRequestCount();
                                },
                        function(msg){
                                $scope.loginLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});}
                );
        }       

        $scope.logout = function(){
                var promise = loginService.logout();
                promise.then(function(){
                                $rootScope.isAuthenticated = false;
                                $rootScope.user = "";                                
                                $location.path("/");},
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});}
                );
        }

        $scope.signup = function(register){
                $scope.registerLoader = true;
                var promise = loginService.signup(register);
                promise.then(function(data){
                                $scope.registerLoader = false;
                                flash.pop({title: 'Confirm', body: 'Registration Successful.', type: 'info'});
                                $window.location.href ="http://"+data+"."+$rootScope.host+"/#/wizard";},
                        function(data){
                                $scope.registerLoader = false;
                                flash.pop({title: 'Alert', body: data, type: 'error'});}
                );
        }

        $scope.confirm = function(){
                var promise = loginService.confirm($routeParams.url);
                promise.then(function(data){
                                $scope.message = data.msg;
                                if(data.type===1)
                                        flash.pop({title: 'Success', body: 'Registration Confirmed.', type: 'success'});
                                if(data.type===2)
                                        flash.pop({title: 'Warning', body: 'You registration is already confirmed.', type: 'warning'});},
                        function(msg){
                                $scope.message = msg;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});}
                );
        }

        $scope.getRequestCount = function(){                
                var promise = rateRequestService.rateRequestCount({countFor:'rateRequests'});
                promise.then(function(result){
                                $scope.requestCount = result;  
                                $scope.rateRequestCountLoader = false;
                                $rootScope.pendingRateRequestCount=$scope.requestCount.rate.pending;
                                $rootScope.inProcessRateRequestCount=$scope.requestCount.rate.inProcess;
                                $rootScope.pendingTmsRequestCount=$scope.requestCount.tariff.pending;
                                $rootScope.inProcessTmsRequestCount=$scope.requestCount.tariff.inProcess;
                        },
                        function(result){                                
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        };

        $scope.loading = false;
});