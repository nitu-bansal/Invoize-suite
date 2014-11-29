'use strict';
angularApp.controller('MainCtrl', function($scope, flash, $state, $routeParams, $stateParams, $location, $rootScope, $window, $cookies, mainService,rateRequestService) {
        $scope.msgTitle = 'Alert';
        $scope.msgBody  = 'The Tomatoes Exploded!';
        $scope.msgType  = 'warning';
        $scope.flash = flash;
        $scope.loading = true;

        $scope.toHumanReadable = function(str){
                var out = str.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
                        if (offset == 0)
                                return(str.toUpperCase());
                        else
                                return(str.substr(0,1) + " " + str.substr(1).toUpperCase());
                        });
                return(out);
        };

        $scope.$watch('$state',getBc);
        function getBc(scope, next, current) {
                if($location.host() === $rootScope.host)
                {
                        $location.path("/main/register");
                }
                else if ($location.host() != $rootScope.host && $location.path() === "/main/register")
                {
                        $window.location.href = "http://" + $rootScope.host; $location.path("/main/register");
                }
                else if($location.host() != $rootScope.host && ($location.path() === "/main" || $location.path() === ""))
                {
                        var promise = mainService.checkDomain();
                        promise.then(function(msg){
                                        $location.path("/main/landing");},
                                function(msg){
                                        $window.location.href = "http://" + $rootScope.host; $location.path("/main/register");
                                });
                }
        };

        $scope.checkType = function(str){
                var result = _.map($rootScope.permissions,function(n){
                        if ((n[0] === str) || (n[0] === "*"))
                                return true;
                        else
                                return false;
                });
                return _.some(result);
        }

        $scope.$on('$stateChangeStart', function(scope, next, current){
                // console.log($location.path());
                // console.log('Changing from '+angular.toJson(current)+' to '+angular.toJson(next));
                if($location.host() === $rootScope.host)
                {
                        $location.path("/main/register");
                }
                else if(!$rootScope.isAuthenticated)
                {
                        if(next.url === "/confirm/:url" || $location.path() === "/wizard" || $location.path() === "/main/register")
                                $rootScope.isAuthenticated = true;
                        else
                                $location.path("/main/landing");

                }
                // else if($rootScope.isAuthenticated && next.url === "/landing" || $rootScope.isAuthenticated && current.url === "/main")
                // {
                //         $location.path("/home");
                // }
                else{
                        if(! _.isUndefined(next.permission))
                                if(! $scope.checkType(next.permission)){
                                        $location.path("/home");
                                }

                }
        });

        $scope.$on('$stateChangeSuccess', function(ev,data) {
                if(_.isUndefined(data.title || $rootScope.emai))
                        document.title = " Invoize Suite";
                else
                        document.title = data.title + " - "+ $rootScope.email + " - Invoize Suite";
        })

        $scope.setSession = function(){
                // if($location.host() === $rootScope.host)
                // {
                var sessionId = $cookies['SID'];
                if (_.isUndefined(sessionId)){
                        $rootScope.isAuthenticated = false;
                }
                else{
                        var path = $location.path();
                        var promise = mainService.getSession(sessionId);
                        promise.then(function(data){
                                        $rootScope.isAuthenticated = true;
                                        $rootScope.email = data.msg.email;
                                        // $rootScope.permissions = data.msg.permissions;
                                        if(path != "/main/landing" || !path.length)
                                                $location.path(path);
                                        else
                                                $location.path("/home");
                                },
                                function(data){
                                        $location.path("/main/landing");
                                });
                }
                // }
        };
        $scope.setSession();

        $scope.getRateRequestCount = function(){
                var promise = rateRequestService.rateRequestCount({countFor:'rateRequests'});
                promise.then(function(result){
                                $scope.rateRequestCount = result;
                                $rootScope.pendingRateRequestCount=$scope.rateRequestCount.pending;
                                $rootScope.inProcessRateRequestCount=$scope.rateRequestCount.inProcess;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        };

        // setInterval(function(){
        //            try
        //            {
        //                 if($rootScope.isAuthenticated)
        //                 {
        //                         $scope.getRateRequestCount();
        //                 }
        //            }
        //            catch(exception)
        //            {

        //            }
        // },5000)



});