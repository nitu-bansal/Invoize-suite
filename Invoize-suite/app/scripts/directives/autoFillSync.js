/**
 * Created by nishith.modi on 14/11/14.
 */

/**
 * @author nishith.modi@searce.com
 * @name autoFillSync
 * @directive
 *
 * @description ng-model does not work with auto-fill of the form by the browser.
 * To overcome it, autoFillSync is given as an attribute to input element.
 * link function takes the value of input and check if its new and ngModel checks for the first time use($pristine).
 * If condition mets, sets the ngModel with the value of view($setViewValue)
 *
 */
angularApp.directive("autoFillSync", ['$timeout', function($timeout){
    var directive = {
        restrict: 'A',
        require: 'ngModel',
        link: link
    }

    return directive;

    ///////////////////

    // link function set the model attribute to be same as auto filled value done by browser
    function link(scope, element, attrs, ngModel) {
        // take val of input element
        var origVal = element.val();
        $timeout(function () {
            // 500ms after, take the value to allow browser to autofill
            var newVal = element.val();
            // user must not have used this field before
            if(ngModel.$pristine && origVal !== newVal) {
                ngModel.$setViewValue(newVal);
            }
        }, 500);
    }
}]);

