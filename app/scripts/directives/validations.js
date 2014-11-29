'use strict';

angularApp.directive('matcher', [function(){
    return {
        require: 'ngModel',
        link: function(scope, elm, attr, ctrl){
            var form_name = $(elm).parents("form").attr("name");
            var params = eval("(" + attr.matcher + ")");
            var field_to_match = params.field_to_match;
            var error_name = params.error_name;
            ctrl.$parsers.unshift(function(viewValue, $scope){
                viewValue === eval("scope." + form_name + "." + field_to_match + ".$viewValue")
                  ? ctrl.$setValidity(error_name, true)
                  : ctrl.$setValidity(error_name, false);
            });
        }
    };
}]);

angularApp.directive('duplicate', ['$http',function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue, $scope, currentUser){
              var duplicateFor = attrs.duplicate;
              $http({method: 'POST', url: '/api/isAvailable', data:{"availableFor":duplicateFor,"value":viewValue}}).
                success(function(data, status, headers, config){
                    if(data.msg===1){
                      ctrl.$setValidity('duplicate',false);}
                    else{
                      ctrl.$setValidity('duplicate', true);}}).
                error(function(data, status, headers, config) {return null})
            return viewValue;
            });
        }
    };
}]);

angularApp.directive('collections', ['$http',function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            $http({method: 'POST', url: '/api/list/metadata', data:{suggestionFor:'metadata', q:'', pageLimit:20,page:1,for:attrs.collections}}).
                success(function(data, status, headers, config){
                    if(data.type===1){
                        scope[attrs.listname]=data.msg;
                        return ;}
                    else{
                      return ;}}).
                error(function(data, status, headers, config) {return null})
            return ;
        }
    };
}]);

angularApp.directive('permission', ['$rootScope',function($rootScope) {
        return {
                restrict: 'A',
                link: function(scope, ele, attrs) {
                        // console.log(attrs.permission);
                        var permission = attrs.permission;
                        if(!_.isUndefined(permission)){
                                permission = permission.split(".");
                                if (permission[0] != "*"){
                                        if (checkType(permission[0],$rootScope) != false){
                                                if (permission[1] != "*"){
                                                        if (checkAccount(permission[1],$rootScope) != false){
                                                                if (permission[2] != "*"){
                                                                        if (checkAccountCode(permission[2],$rootScope) != false){
                                                                                return;
                                                                        }
                                                                        else{
                                                                                ele.remove();
                                                                                return false;
                                                                        }
                                                                }
                                                                else
                                                                        return;
                                                        }
                                                        else{
                                                                ele.remove();
                                                                return false;
                                                        }
                                                }
                                                else
                                                        return;
                                        }
                                        else{
                                                ele.remove();
                                                return false;
                                        }
                                }
                                else
                                        return;
                        }
                        else{
                                ele.remove();
                                return false;
                        }
                }
        }
}]);

var checkType = function(str,$rootScope){
        var result = _.map($rootScope.permissions,function(n){
                if ((n[0] === str) || (n[0] === "*"))
                        return true;
                else
                        return false;
        });
        return _.some(result);
}
var checkAccount = function(str,$rootScope){
        var result = _.map($rootScope.permissions,function(n){
                if ((n[1] === str) || (n[1] === "*"))
                        return true;
                else
                        return false;
        });
        return _.some(result);
}
var checkAccountCode = function(str,$rootScope){
        var result = _.map($rootScope.permissions,function(n){
                if ((n[2] === str) || (n[2] === "*"))
                        return true;
                else
                        return false;
        });
        return _.some(result);
}
// directive on widget
angularApp.directive('passwordValidator', [function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attr, ctrl) {
      // must be on the second password, when linking first one, the second one is not registered yet
      var pwdWidget = elm.inheritedData('$form')[attr.passwordValidator];

      ctrl.$parsers.push(function(value) {
        if (value === pwdWidget.viewValue) {
          ctrl.setValidity('MATCH', true);
          return value;
        }
        ctrl.setValidity('MATCH', false);
      });

      pwdWidget.$parsers.push(function(value) {
        ctrl.setValidity('MATCH', value === second.viewValue);
        return value;
      });
    }
  };
}]);

// directive on form
angularApp.directive('formPwdValidator', [function() {
  return {
    require: 'form',
    link: {
      post: function(scope, elm, attr, form) {
        var ids = attr.formPwdValidator.split(' '),
            first = form[ids[0]],
            second = form[ids[1]];

        first.$parsers.push(function(value) {
          second.setValidity('MATCH', value === second.viewValue);
          return value;
        });

        second.$parsers.push(function(value) {
          if (value === first.viewValue) {
            second.setValidity('MATCH', true);
            return value;
          }
          second.setValidity('MATCH', false);
        });
      }
    }
  }
}]);

angularApp.directive('integer', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (INTEGER_REGEXP.test(viewValue)) {
        // it is valid
        ctrl.$setValidity('integer', true);
        return viewValue;}
        else {
        // it is invalid, return undefined (no model update)
        ctrl.$setValidity('integer', false);
        return undefined;}});
    }};
  });

angularApp.directive('selectValidate', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if (viewValue.length) {
        // it is valid
        ctrl.$setValidity('selectvalidate', true);
        return viewValue;}
        else {
        ctrl.$setValidity('selectvalidate', false);
        return viewValue;}});
    }};
  });
