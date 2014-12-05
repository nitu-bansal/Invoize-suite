'use strict';

angularApp.controller('groupCtrl', function($scope, $route, $state, $routeParams, $location, $modal, commonService, flash) {
//	$scope.groupTypeList = [{
//		n: "User",
//		v: "user"
//	}, {
//		n: "Account",
//		v: "account"
//	}, {
//		n: "Module",
//		v: "module"
//	}, {
//        n: "Permission",
//        v: "permission"
//    }];

	$scope.group = {};
	$scope.group.type = "user";
	$scope.groupList = [];
	$scope.selectedGroup = {};
    $scope.groupLoader = true;
	function getSelect2Ajax(ph, ckey, obj) { //ckey to evaluate value at run time and obj to append request obj.
		return {
			method: 'GET',
			url: "/api/suggestion",
			dataType: 'json',
			quietMillis: 100,
			data: function(term, page) { // page is the one-based page number tracked by Select2
				var s = {
					q: term, //search term
					pageLimit: 10, // page size
					page: page, // page number
//					selected: '', //selected values
					suggestionFor: typeof ph == "string"?ph:ph.val[ph.key] // suggestions for
				};
				if (obj) {
					var c = JSON.parse(obj);
					for (var k in c)
						s[k] = c[k];
				}
				if (ckey) {
					var a = ckey.split(':');
					s[a[0]] = eval(a[1]);
				}
				return s;
			},
			results: function(data, page) {
				return {
					results: data.msg,
					more: (data.msg.length === 10)
				};
			}
		}
	}

	$scope.getCompany = {
		placeholder: "Select Company",
		minimumInputLength: 0,
		multiple: true,
		maximumSelectionSize: 1,
		ajax: getSelect2Ajax('company'),
		initSelection: function(element, callback) {
			callback($(element).data('$ngModelController').$modelValue);
		},
		formatResult: formatResult,
		formatSelection: formatResult
	};

	$scope.getSystem = {
		placeholder: "Select System",
		minimumInputLength: 0,
		multiple: true,
		maximumSelectionSize: 1,
		ajax: getSelect2Ajax('system', 'companyId:$scope.group.company[0].v'),
		initSelection: function(element, callback) {
			callback($(element).data('$ngModelController').$modelValue);
		},
		formatResult: formatResult,
		formatSelection: formatResult
	};

    $scope.getGroups = {
        placeholder: "Select values",
        minimumInputLength: 0,
        multiple: true,
        ajax: getSelect2Ajax({key:'type',val:$scope.group},'systemId: $scope.group.system[0].v'),
        initSelection: function(element, callback) {
            callback($(element).data('$ngModelController').$modelValue);
        },
        formatResult: formatResult,
        formatSelection: formatResult
    };

//	$scope.groupBar = {
//		placeholder: "Please select...",
//		minimumInputLength: 0,
//		multiple: true,
//		ajax: {
////			method: 'POST',             // Need to implement
//			url: "/api/mfSuggestion",
//			dataType: 'json',
////			quietMillis: 100,
//			data: function(term, page) { // page is the one-based page number tracked by Select2
//				return {
//					q: term, //search term
//					pageLimit: 10, // page size
//					page: page, // page number
////					selected: $filter('selectFormat')($scope.group.definition), //selected values
//					suggestionFor: $scope.group.type, // suggestions for
//					companyId: $scope.group.company[0].v,
//					systemId: $scope.group.system[0].v
//				};
//			},
//			results: function(data, page){
//				$scope.group.templateId = data.templateId;
//				return {
//					results: data.msg,
//					more: data.msg.length === 10
//				};
//			}
//		},
//		initSelection: function(element, callback) {
//			callback($(element).data('$ngModelController').$modelValue);
//		},
//		formatResult: formatResult, // omitted for brevity, see the source of this page
//		formatSelection: formatResult, // omitted for brevity, see the source of this page
//		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
//		escapeMarkup: function(m) {
//			return m;
//		} // we do not want to escape markup since we are displaying html in results
//	};

    var promiseGroupType = commonService.ajaxCall('GET', '/api/suggestions?suggestionFor=groupType');
    promiseGroupType.then(function(data) {
            $scope.groupTypeList = data.msg;
            $scope.groupLoader = false;
        },
        function(data) {
            flash.pop({
                title: 'Alert',
                body: data.msg,
                type: 'error'
            });
            $scope.groupLoader = false;
        });

	$scope.getGroupList = function(q) {
            $scope.groupLoader = true;
            var promise = commonService.ajaxCall('GET', '/api/groups?pageLimit=10&pageNo=1&q=' + q);
            promise.then(function (data) {
                    $scope.groupList = data;
                    $scope.groupLoader = false;
                },
                function (data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.msg,
                        type: 'error'
                    });
                    $scope.groupLoader = false;
                });
	};

	$scope.cloneGroup = function(id) {
		$scope.groupLoader = true;
		var promise = commonService.ajaxCall('GET', '/api/groups/' + id);
		promise.then(function(data) {
                $scope.redirectTo("/group/new");
				$scope.group = data;
				$scope.group.name = "";
                if($scope.group.type=='permission') {
                    angular.forEach($scope.group.definition.products,function(obj,key){
                        for (var i = 0; i < obj.modules.length; i++){
                            obj.modules[i].editMode = false;
                        }
                        obj.modules.splice(0,0,{editMode:true,keys:[]});
                    });
                    delete $scope.group.id;
                    $scope.currentTab = 0;
                }

				$scope.groupLoader = false;
			},
			function(data) {
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	};

	$scope.readGroup = function(id,path) {
		$scope.groupLoader = true;
		var promise = commonService.ajaxCall('GET', '/api/groups/' + id);
		promise.then(function(data) {
                $scope.redirectTo(path + id);
				$scope.group = data;
                if($scope.group.type=='permission' && path.indexOf('edit') !==-1) {
                    angular.forEach($scope.group.definition.products,function(obj,key){
                        for (var i = 0; i < obj.modules.length; i++){
                            obj.modules[i].editMode = false;
                        }
                        obj.modules.splice(0,0,{editMode:true,keys:[]});
                    });
                    $scope.currentTab = 0;
                }
				$scope.groupLoader = false;

			},
			function(data) {
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	};

	$scope.initializeGroup = function() {
		$scope.group = {};
	};

//	$scope.confirmDeleteGroup = function() {
//		// Code Dialog Start
//		$dialog.dialog(angular.extend({
//			controller: 'dialogCtrl',
//			templateUrl: 'confirm.html', // change as per the dialog html needed
//			backdrop: true,
//			keyboard: false,
//			backdropFade: true,
//			dialogFade: true,
//			backdropClick: false,
//			show: true
//		}, {
//			resolve: {
//				item: function() {
//					return angular.copy(true);
//				}
//			}
//		}))
//			.open()
//			.then(function(result) {
//				if (result) {
//					// console.log(result); // user has clicked save ..
//					$scope.delete();
//				} else {
//
//					return; // console.log("close");
//				}
//			});
//		// Code Dialog End
//
//	};

//	$scope.delete = function() {
//		$scope.groupUpdateLoader = true;
//		$scope.group.remove().then(function(result) {
//				$scope.groupUpdateLoader = false;
//				$scope.getGroupList(search);
//				flash.pop({
//					title: 'Success',
//					body: result,
//					type: 'success'
//				});
//				$location.path("/organizationSetup/group");
//			},
//			function(result) {
//				$scope.groupUpdateLoader = false;
//				flash.pop({
//					title: 'Alert',
//					body: result,
//					type: 'error'
//				});
//			}
//		);
//	};

	$scope.backToList = function() {
		$location.path("/wizard/group");
	};

	function formatResult(data) {
		return data.n;
	}

	$scope.getFields = function() {
//		if ($scope.group.company == undefined && $scope.group.system) {
//			$scope.group.system.pop();
//			$('[name="system"]').eq(0).select2('val', $scope.group.system);
//		} else if ($scope.group.system == undefined)
			$scope.group.definition = null;
		if ($scope.group.type === "permission") {
//            $scope.group.definition = {modules : [{module:null,editMode:true,keys:[]}]};
            getProducts();
        }
	};

	$scope.createGroup = function(group) {
		$scope.groupLoader = true;
//        if(group.type == 'permission') {
////            var defaultRadio = $('input[name=isDefault]:checked');
////            if(!group.definition.isDefault) {
////                flash.pop({
////                    title: 'Information',
////                    body: 'Please Select Default Module!',
////                    type: 'warning'
////                });
////                return;
////            }
////            group.definition.modules[defaultRadio.attr('id').split('_')[1]].isDefault= true;
//        }
		var promise = commonService.ajaxCall('POST', '/api/groups', group);
		promise.then(function(data) {
				flash.pop({
					title: 'Success',
					body: data,
					type: 'success'
				});
					$scope.redirectTo("/group/view");
				$scope.groupLoader = false;
			},
			function(data) {
				$scope.groupLoader = false;
				flash.pop({
					title: 'Alert',
					body: data.data,
					type: 'error'
				});
			});
	};

	$scope.redirectTo = function(path) {
		$location.path($state.current.name.split('.')[0] + path);
	};

    $scope.editModules = function(modules,index){
            if (modules[index].module && modules[index].module.length) {
                var promise = commonService.ajaxCall('GET', '/api/suggestions?suggestionFor=permissionField&module='+modules[index].module[0].id);
                promise.then(function(data) {
                        modules[index].keys = data.msg;
                        modules.splice(index, 0, {editMode: true, keys: []});
                        $scope.groupLoader = false;
                    },
                    function(data) {
                        flash.pop({
                            title: 'Alert',
                            body: data.msg,
                            type: 'error'
                        });
                        $scope.groupLoader = false;
                    });
            }
            else if (modules.length > 1) {
                modules.splice(index, 1);
            }
    };

    function getProducts(){
        var productsPromise = commonService.ajaxCall('GET', '/api/suggestions?suggestionFor=products&responseType=array');
        productsPromise.then(function (data) {
            $scope.group.definition = {products: {}};
            for (var i = 0; i < data.msg.length; i++) {
                $scope.group.definition.products[data.msg[i]] = {modules: [
                    {editMode: true, keys: []}
                ]};
            }
            $scope.currentTab = 0;
            $scope.groupLoader = false;
        }, function (data) {
            $scope.groupLoader = false;
            flash.pop({
                title: 'Alert',
                body: data.msg,
                type: 'error'
            });
        });
    }

    $scope.getSelected = function(modules){
        var selectedModules = [];
        for (var i = 0; i < modules.length; i++) {
            if(modules[i].module && modules[i].module.length>0)
            selectedModules.push(modules[i].module[0].id)
        }
        return selectedModules.join(',');
    };

    $scope.setCurrentTab = function(index){
        $scope.currentTab = index;
    };

    $scope.changeData = function(bulk){
        var def = $scope.group.definition;
        if(def) {
            var val,i;
            if (bulk && def.length) {
                val = '';
                for (i = 0; i < def.length; i++)
                    val += def[i].n + '\n';
            }
            else {
                val = [];
                var v,oDef = def.split(def.indexOf(',') == -1 ? '\n' : ',');
                for (i = 0; i < oDef.length; i++) {
                    if(v=oDef[i]) val.push({id:v, n: v});
                }
            }
            $scope.group.definition = val;
        }
    }

});