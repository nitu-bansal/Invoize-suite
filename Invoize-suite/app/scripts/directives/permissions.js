
angularApp.directive('permission', ['$rootScope','$state','CryptionService',function ($rootScope,$state,CryptionService) {
        'use strict';
        return {
            restrict: 'A',
            link: function (scope, ele, attrs) {
                try{
                    if(localStorage.a)
                    var admin = CryptionService.decrypt(JSON.parse(localStorage.a));
    //
    //                console.log($state.current.permission);
    //                if($rootScope.permissionActive && (permissions.split(',').indexOf($state.current.permission) === -1 || permissions.split(',').indexOf(attrs.permission) === -1)){
    //                    ele.remove();
    //                }

                    if(!admin || admin[0] !== "1"){
                            if(localStorage.pid){
                                var permissions = CryptionService.decrypt(JSON.parse(localStorage.pid));
                                if(permissions.indexOf(attrs.permission.split('.')[1]) === -1){
                                    ele.remove();
                                }
                                else
                                    ele.click(function(e){
                                        $rootScope.currentContext = $state.$current.context.product +'.'+ $(this).attr('permission'); // need to improve
                                        e.stopPropagation();
                                    });
                            }
                            else  ele.remove();
                    }
                    else{
                        if(localStorage.pro){
                            var prodts = CryptionService.decrypt(JSON.parse(localStorage.pro));
                            if(attrs.product && prodts.indexOf(attrs.product) === -1){
                                ele.remove();
                            }
                        }
                        else  ele.remove();
                     }
                }
                catch (e){
                    console.log("Error: in permission directive");
                    ele.remove();
                }
            }
        }
    }]);