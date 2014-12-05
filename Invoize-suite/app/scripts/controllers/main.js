'use strict';
angularApp.controller('MainCtrl', function($scope, flash, $state, $modal, $routeParams, CryptionService, $timeout, $stateParams, $cookies, $cookieStore, $location, $rootScope, $window, commonService) {
    $scope.search = {};
    $scope.validateSession = function(nextUrl) {

        var session = $cookies['Data'];
        if (_.isUndefined(session)) {
            // if session is not valid then redirect user to login page
            $location.path("/main/landing");
        } else {
            if ($.isEmptyObject($rootScope.loggedInUser) || $rootScope.loggedInUser.userSystem == null) {
                $scope.setCompanySystemFromCookie();
            } else if ($scope.search.system == null) {
                $scope.search.company = angular.copy($rootScope.loggedInUser.userCompany);
                $scope.search.system = angular.copy($rootScope.loggedInUser.userSystem);
            }

            if ($rootScope.loggedInUser.email == null) $location.path("/main/landing");
            else if (nextUrl === "/landing") $location.path("/home");

        }
    };

    function setEnvCookies() {
//        debugger;
        var session = $cookies['Data'];
        session = JSON.parse(Base64.decode(session.indexOf('"') === 0 ? session.substr(1, session.length - 2) : session));

        $rootScope.loggedInUser.userCompany = angular.copy($scope.search.company);
        $rootScope.loggedInUser.userSystem = angular.copy($scope.search.system);

        // take the selected company and system, put it in json  and send it to backend to set them in cookies
        // $cookieStore is not working in IE, hence its a proper solution to make it run independent of the system
        var obj = new Object();
        obj.company = $scope.search.company;
        obj.system = $scope.search.system;
        commonService.ajaxCall('POST', 'api/resetCookie', JSON.stringify(obj)).then(function(data) {
            window.location.reload();
        });

    }

    function setEnvironment() {

        if (!localStorage.a) { //if is not a admin
            var promise = commonService.ajaxCall('POST', 'api/suggestion?q=&pageLimit=10&page=1&selected=&suggestionFor=actionCode&company=' + $scope.search.company[0].id + '&system=' + $scope.search.system[0].id + '&responseType=array');
            promise.then(function(data) {
                localStorage.pid = JSON.stringify(CryptionService.encrypt(data.msg.join()));
                setEnvCookies();
            }, function() {
                flash.pop({
                    title: 'Alert',
                    body: data.msg,
                    type: 'error'
                });
            });
        } else setEnvCookies();
    }

    $scope.setCompanySystemFromCookie = function() {
        var session = $cookies['Data'];
        session = JSON.parse(Base64.decode(session.indexOf('"') === 0 ? session.substr(1, session.length - 2) : session));

        if (!session.user) $location.path("/main/landing");
        else {
            if (session.user.userSystem == null) {
                if ($state.current.context && $state.current.context.product.indexOf("Bill Right") !== -1)
                    setTimeout("$('div[clickHide]').show();", 300);
            } else {
                $rootScope.loggedInUser = session.user;
                $scope.search.company = session.user.userCompany;
                $scope.search.system = session.user.userSystem;
            }
        }
    };

    $scope.setCompanySystemCookie = function() {
        var modalInstance = $modal.open({
            templateUrl: 'confirm.html',
            controller: 'modalInstanceCtrl',
            resolve: {
                items: function() {
                    return angular.copy({
                        msg: 'Switching to other system will loss unsaved data, Do you want to continue?'
                    });
                }
            }
        });
        modalInstance.result.then(function(data) {
            setEnvironment();
        }, function(data) {

        });

    };

    $scope.logout = function() {
        var promise = commonService.ajaxCall('GET', '/api/logout');
        promise.then(function() {
                $rootScope.loggedInUser = {};
                // $cookieStore is not working IE, hence check the browser type and accordingly use the methods which supports
                if ($window.navigator.userAgent.indexOf("MSIE") != -1) {
                    // for IE
                    document.cookie = "Data=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                } else {
                    $cookieStore.remove('Data');
                }
                $scope.search.company = null;
                $scope.search.system = null;
                localStorage.clear();
                // $window.location = "http://" + location.host + "/#/main/landing";

                window.location.reload();
            },
            function(msg) {
                flash.pop({
                    title: 'Alert',
                    body: msg,
                    type: 'error'
                });
            }
        );
    };

    $scope.saveCompanyType = function(companyType) {
        var promise = commonService.ajaxCall('POST', '/api/organization', {
            'companyType': companyType
        });
        promise.then(function(msg) {
                flash.pop({
                    title: 'Success',
                    body: msg,
                    type: 'Success'
                });
                var session = $cookies['Data'];
                session = JSON.parse(Base64.decode(session.indexOf('"') === 0 ? session.substr(1, session.length - 2) : session));
                $rootScope.loggedInUser = session.user;
                $rootScope.loggedInUser.companyType = companyType;
                $location.path("/wizard/company/view");
            },
            function(msg) {
                flash.pop({
                    title: 'Alert',
                    body: msg.data,
                    type: 'error'
                });
            }
        );
    };

    $scope.toHumanReadable = function(str) {
        var out = str.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
            if (offset == 0)
                return (str.toUpperCase());
            else
                return (str.substr(0, 1) + " " + str.substr(1).toUpperCase());
        });
        return (out);
    };

    if ($location.path().length < 2)
        $location.path("/main/landing");


    $scope.$on('$stateChangeStart', function(scope, next, current) {
        if (next.url === "/redirection/:id" || next.url === "/registration/:id" || next.url === "/userInvited/:id") {
            //do nothing
        } else if (next.url !== "/") {
            if ($location.host() === $rootScope.host) {
                $location.path("/main/signup");
            } else if (next.url !== "/signup")
                $scope.validateSession(next.url, current.url);
            else
                $location.path("/main/landing");

            if (next.permission && localStorage.a == null && CryptionService.decrypt(JSON.parse(localStorage.pid)).indexOf(next.permission) === -1) $location.path("/na");
            else if ($location.url().indexOf("billright") !== -1 && ($rootScope.loggedInUser.userCompany == null || $rootScope.loggedInUser.userSystem == null)) {

                $timeout(function() {
                    $location.path("/home");
                }, 200);
                setTimeout("$('div[clickHide]').show();", 300);
            }
        }
    });

    $scope.$on('$stateChangeSuccess', function(ev, data) {
        var state = data.name.split('.');
        console.log(state,' state info')
        document.title = data.title ? data.title + " - Invoize Suite" : $rootScope.loggedInUser.email + " Welcome to Invoize Suite";
        if (data.context && data.context.module && data.permission) $rootScope.currentContext = data.context.product + '.' + data.context.module + '.' + data.permission;
        else $rootScope.currentContext = null;
    });

    $scope.clearSystem = function() {
        $scope.search.system = null;
        $('[name="searchSystem"]').select2('val', null)
    }

});