'use strict';

angularApp.controller('permissionCtrl', function($scope, $http, $routeParams,$timeout, $modal, $modalInstance, commonService, flash, items) {
    $scope.users = items;
    $scope.permission = {};
    $scope.userclone = {};
    $scope.mainTab = 'save';
    $scope.companies = [];
    $scope.systems = [];
    $scope.currentTab=0;
    $scope.selectedModule=0;
    $scope.dependents = '';
    var CompanyPromise = commonService.ajaxCall('GET', '/api/suggestions?suggestionFor=company');
    CompanyPromise.then(function (data) {
        $scope.companies = data.msg;
    }, commonService.popError.bind(data));

    $scope.clearSystem = function () {
        getSystem();
    };

    $scope.close = function () {
        $modalInstance.dismiss(undefined);
    };

    function getSystem() {
        if ($scope.permission.company) {
            var Promise = commonService.ajaxCall('GET', '/api/suggestions?suggestionFor=system&companyId=' + $scope.permission.company);
            Promise.then(function (data) {
                $scope.systems = data.msg;
            }, commonService.popError.bind(data));
        }
    }

//    $scope.getSubModules = function(){
//        if($scope.permission.module){
//            $scope.permission.pid=[];
//            $scope.subModules = [];
//            var promise = commonService.ajaxCall('GET','/api/suggestions?suggestionFor=permissionModules&parentModule='+$scope.permission.module);
//            promise.then(function(data) {
//                $scope.subModules = data.msg;
//                $scope.subModules.push({n:'All',id:'all'});
////                pids = angular.copy($scope.subModules);
//                $scope.getPermissions();
//            },commonService.popError(data));
//        }
//    }

//    $scope.checkForAll= function(){
//        if($scope.permission.pid.length>0 && $scope.subModules.length>1){
//            if($scope.permission.pid[0]=='all')
//                $scope.subModules = [{n:'All',id:'all'}];
//            else{
//                if($scope.subModules[$scope.subModules.length-1].id=='all')
//                    $scope.subModules.pop();
//            }
//            }
//        else if($scope.permission.pid.length==0) $scope.subModules = angular.copy(pids);
//    }

//    $scope.fieldKeyChanged = function(id,field){
//        $scope.fieldKeys = [];
//        if(field)
//        field.fieldVal = null;
//        if(id)
//        $('input[name="fieldVal_'+id+'"]').select2('val',null);
//        for(var i=0;i<$scope.permission.lpid.length;i++)
//            if($scope.permission.lpid[i].fieldKey && $scope.permission.lpid[i].fieldKey.length>0)
//                $scope.fieldKeys.push($scope.permission.lpid[i].fieldKey[0].id);
//    }

    $scope.getRoles = function() {
        if($scope.permission.system) {
            $scope.loader = true;

            var promise = commonService.ajaxCall("GET", "/api/suggestions?suggestionFor=groups&type=permission&systemId=" + $scope.permission.system + "&companyId=" + $scope.permission.company);
            promise.then(function (data) {
                $scope.roles = data.msg;
                $scope.loader = false;
            }, function (data) {
                commonService.popError(data.data);
                $scope.loader = false;
            });

            if($scope.users.length == 1) {
                var singleRolePromise = commonService.ajaxCall("GET", "/api/selectedRole?system=" + $scope.permission.system + "&company=" + $scope.permission.company+"&email="+$scope.users[0].name);
                singleRolePromise.then(function (data) {
                    $scope.permission.role = data.id;
                    $scope.getPermissions();
                }, function () {
                    commonService.popError(data.data);
                });
            }
        }
    };

    $scope.getPermissions = function () {
        if ($scope.permission.role) {

            var promise = commonService.ajaxCall('GET', 'api/permissions?companyID='+$scope.permission.company+'&systemID='+$scope.permission.system+
                ($scope.users.length == 1?'&userId='+$scope.users[0].id:'')+'&role=' + $scope.permission.role);//Only If selected user is 1 then query for user permission.
            promise.then(function (data) {
                $scope.permission.products = data;
                if(data.length>0) $scope.currentTab = 0;
            }, commonService.popError.bind(data));
        }
	};

	$scope.updatePermissions = function() {
//
//        if($scope.permission.lpid.length==0){
//            flash.pop({
//                title: 'Alert',
//                body: 'No Permission to save!',
//                type: 'warning'
//            });
//            return;
//        }
//
        $scope.permission.users = [];
		angular.forEach($scope.users, function(v, k) {
//			if (v.update)
                $scope.permission.users.push(v.id);
		});
//		if ($scope.permission.users.length > 0) {
//			$scope.loader = true;
//            var isAllPids = false;
//            for(var i=0;i<$scope.permission.pid.length;i++)
//                if($scope.permission.pid[i]=='all'){
//                    isAllPids=true;
//                    break;
//                }
//            if(isAllPids){
//                var allIds = [];
//                for(var i=0;i<$scope.subModules.length-1;i++)
//                    allIds.push($scope.subModules[i].id);
//                $scope.permission.pid = allIds;
//            }

			var promise = commonService.ajaxCall('PUT', 'api/permissions', $scope.permission);
			promise.then(function(data) {
					$scope.loader = false;
					flash.pop({
						title: 'Success',
						body: "Permissions updated successfully",
						type: 'success'
					});
					$modalInstance.close();
				},
				function(data) {
					commonService.popError(data);
					$scope.loader = false;
				});
//		} else flash.pop({
//			title: 'Warning',
//			body: 'None User Selected!',
//			type: 'warning'
//		});
	};

	$scope.clonePermissions = function() {
		var clone = {};
		clone.toUser = [];
		clone.fromUser = $scope.userclone.value[0].id;
		for (var i = 0; i < $scope.users.length; i++)
			clone.toUser.push($scope.users[i].id);
		console.log(clone);
		var promise = commonService.ajaxCall('PUT', 'api/permissionClone', clone);
		promise.then(function(data) {
				flash.pop({
					title: 'Success',
					body: "User permissions are cloned",
					type: 'success'
				});
				$modalInstance.close();
			},
			function(data) {
				flash.pop({
					title: 'Alert',
					body: data,
					type: 'error'
				});
				//$scope.loader = false;
			});
	};

    $scope.setCurrentTab = function(index){
        $scope.currentTab=index;
    };

    $scope.addRow = function(module,r){
        var tempAry=angular.copy(r);
        angular.forEach(tempAry, function(i, j) {
            i.value=null;
        });
        module.push(tempAry);
    };

    $scope.setSelectedModule = function(index){
       $scope.selectedModule=index;
    };

});