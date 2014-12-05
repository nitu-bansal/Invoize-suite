'use strict';

angularApp.controller('loginCtrl', function($scope, $http, $rootScope, $window, $cookies, CryptionService, $timeout, $cookieStore, $state, $location, $routeParams, commonService, flash) {
    $scope.loadingRegister = false;
    $scope.loadingLogin = false;
    $scope.loadingChangePassword = false;
    $scope.register = {};
    $scope.showlogin = true;
    $scope.showforgotPass = true;
    $scope.forgotPassLoader = false;
    $scope.forgotPasswordSuccess = false;
    $scope.isCevaSubdomain = $window.location.href.split('.')[0].toLowerCase().indexOf("ceva") > 0 ? true : false;
    $scope.change = function() {
        $scope.register.subDomain = $scope.register.organization;
    };
    $scope.forgotPassword = function(emailID) {
        $scope.forgotPassLoader = true;
        if (_.isEmpty(emailID)) {
            flash.pop({
                title: 'Alert',
                body: "User Name / Email Required.",
                type: 'error'
            });
        } else {
            var promise = commonService.ajaxCall('POST', '/api/forgot/password', {
                'emailID': emailID
            });
            promise.then(function(msg) {
                    $scope.forgotPassLoader = false;
                    $scope.forgotPasswordSuccess = true;
                    flash.pop({
                        title: 'Success',
                        body: msg,
                        type: 'info'
                    });
                },
                function(msg) {
                    $scope.forgotPassLoader = false;
                    flash.pop({
                        title: 'Alert',
                        body: msg.data,
                        type: 'error'
                    });
                }
            );
        }
    };

    $scope.changePassword = function(user) {
        $scope.loadingChangePassword = true;
        // if(_.isEmpty(user))
        //         flash.pop({title: 'Alert', body: "User Name / Email required.", type: 'error'});
        var promise = commonService.ajaxCall('POST', '/api/change/password', user);
        promise.then(function(msg) {
                $scope.loadingChangePassword = false;
                $scope.user.password = null;
                $scope.user.newPassword = null;
                $scope.user.confirmPassword = null;
                flash.pop({
                    title: 'Success',
                    body: msg,
                    type: 'info'
                });
            },
            function(msg) {
                $scope.loadingChangePassword = false;
                $scope.user.password = null;
                $scope.user.newPassword = null;
                $scope.user.confirmPassword = null;
                flash.pop({
                    title: 'Alert',
                    body: msg.data,
                    type: 'error'
                });
            }
        );

    };

    $scope.login = function(emailID, password) {
        $scope.loginLoader = true;
        var url = "";
        if ($window.location.host)
            url = $window.location.host.split('.')[0];

        var promise = commonService.ajaxCall('POST', '/api/login/', {
            'emailID': emailID,
            'password': password,
            'url': url
        });
        promise.then(function(res) {
                $scope.loginLoader = false;

                $timeout(function() {

                    var session = $cookies['Data'];
                    session = JSON.parse(Base64.decode(session.indexOf('"') === 0 ? session.substr(1, session.length - 2) : session));

                    $rootScope.loggedInUser = session.user;
                    $rootScope.isCevaUser = session.user.isCevaUser;

                    // store values in localstorage to be accessed throught the session
                    if (res.isAdmin == 1) {
                        // user is admin, localStorage.a flags that user is admin and localStorage.pro stores what all modules to be shown to the user
                        localStorage.a = JSON.stringify(CryptionService.encrypt(res.isAdmin.toString()));
                        localStorage.pro = JSON.stringify(CryptionService.encrypt(res.product.join()));
                    } else if (res.actionCodes) {
                        localStorage.pid = JSON.stringify(CryptionService.encrypt(res.actionCodes.join()));
                    }

                    // previously selected account in billright module for loggedin user
                    if(res.account) {
                        // store that account in localstorage to be used across modules
                        localStorage.account = JSON.stringify(res.account);
                    }

                    if (res.orgStatus == 3) {
                        if ($rootScope.loggedInUser.companyType)
                            $window.location = "http://" + location.host + "/#/wizard/company/view";
                        else
                            $window.location = "http://" + location.host + "/#/main/getstarted";
                    } else $location.path("/home");
                }, 200);
            },
            function(res) {
                $scope.loginLoader = false;
                flash.pop({
                    title: 'Alert',
                    body: res.data,
                    type: 'error'
                });
            }
        );
    };

    //    $scope.chkCompanySystem= function(){
    //        if($rootScope.loggedInUser.permissions.company.length==1)
    //
    //        {
    //            $rootScope.userCompany=$rootScope.loggedInUser.permissions.company;
    //            $rootScope.loggedInUser.userCompany=$rootScope.userCompany;
    //            $scope.search.company=$rootScope.userCompany;
    //            if($rootScope.loggedInUser.permissions.system.length==1)
    //            {
    //                $rootScope.userSystem=$rootScope.loggedInUser.permissions.system;
    //                $rootScope.loggedInUser.userSystem=$rootScope.userSystem;
    //                $scope.search.system=$rootScope.userSystem;
    //            }
    //            else
    //            {
    //                $rootScope.companySystemSelection=true;
    //            }
    //
    //            //set cookie
    //            var session = $cookies['Data'];
    //            if (session.indexOf('"') == 0)
    //                session = JSON.parse(Base64.decode(session.substr(1, session.length - 2)));
    //            else
    //                session = JSON.parse(Base64.decode(session));
    //            session.user=$rootScope.loggedInUser;
    //            $cookieStore.put('Data',btoa(JSON.stringify( session)));
    //        }
    //        else
    //        {
    //            $rootScope.companySystemSelection=true;
    //        }
    //    }

    $scope.signup = function(register) {
        $scope.registerLoader = true;
        var promise = commonService.ajaxCall('POST', '/api/signup/', {
            'data': register
        });
        promise.then(function(data) {
                $scope.registerLoader = false;
                flash.pop({
                    title: 'Confirm',
                    body: 'Registration Successful.',
                    type: 'info'
                });
                $window.location.href = "http://" + data.msg + "." + $rootScope.host + "/#/wizard";
            },
            function(data) {
                $scope.registerLoader = false;
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            }
        );
    };

    $scope.confirm = function() {
        var promise = commonService.ajaxCall('POST', '/api/signup/confirm', {
            'data': $routeParams.url
        });
        promise.then(function(data) {
                $scope.message = data;
                // if (data.type === 1)
                flash.pop({
                    title: 'Success',
                    body: data, //'Registration Confirmed.',
                    type: 'success'
                });
                // if (data.type === 2)
                // 	flash.pop({
                // 		title: 'Warning',
                // 		body: 'You registration is already confirmed.',
                // 		type: 'warning'
                // 	});
            },
            function(msg) {
                $scope.message = msg;
                flash.pop({
                    title: 'Alert',
                    body: msg.data,
                    type: 'error'
                });
            }
        );
    };

    //	$scope.getRequestCount = function() {
    //		var promise = rateRequestService.rateRequestCount({
    //			countFor: 'rateRequests'
    //		});
    //		promise.then(function(result) {
    //				$scope.requestCount = result;
    //				$scope.rateRequestCountLoader = false;
    //				$rootScope.pendingRateRequestCount = $scope.requestCount.rate.pending;
    //				$rootScope.inProcessRateRequestCount = $scope.requestCount.rate.inProcess;
    //				$rootScope.pendingTmsRequestCount = $scope.requestCount.tariff.pending;
    //				$rootScope.inProcessTmsRequestCount = $scope.requestCount.tariff.inProcess;
    //				$rootScope.pendingQuoteRequestCount = $scope.requestCount.quote.pending;
    //				$rootScope.inProcessQuoteRequestCount = $scope.requestCount.quote.inProcess;
    //			},
    //			function(result) {
    //				flash.pop({
    //					title: 'Alert',
    //					body: result,
    //					type: 'error'
    //				});
    //			}
    //		);
    //	};

    // $.getScript("/scripts/vendor/jquery.easy-pie-chart.js");

    // $('.easy-pie-chart.percentage').each(function(){
    //         var $box = $(this).closest('.infobox');
    //         var barColor = $(this).data('color') || (!$box.hasClass('infobox-dark') ? $box.css('color') : 'rgba(255,255,255,0.95)');
    //         var trackColor = barColor == 'rgba(255,255,255,0.95)' ? 'rgba(255,255,255,0.25)' : '#E2E2E2';
    //         var size = parseInt($(this).data('size')) || 50;
    //         $(this).easyPieChart({
    //                 barColor: barColor,
    //                 trackColor: trackColor,
    //                 scaleColor: false,
    //                 lineCap: 'butt',
    //                 lineWidth: parseInt(size/10),
    //                 animate: /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase()) ? false : 1000,
    //                 size: size
    //         });
    // })


    // $scope.show_box = function(id) {
    // 	console.log(id);
    // 	$scope.showlogin = true;
    // 	$('.widget-box.visible').removeClass('visible');
    // 	$('#' + id).addClass('visible');
    // };

    //    $scope.loading = false;
});