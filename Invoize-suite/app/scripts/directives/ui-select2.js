/**
 * Enhanced Select2 Dropmenus
 *
 * @AJAX Mode - When in this mode, your value will be an object (or array of objects) of the data used by Select2
 * This change is so that you do not have to do an additional query yourself on top of Select2's own query
 * @params [options] {object} The configuration options passed to $.fn.select2(). Refer to the documentation
 */
angular.module('ui2.select2', []).value('ui2Select2Config', {}).directive('ui2Select2', ['ui2Select2Config', '$timeout',
  function(ui2Select2Config, $timeout) {
    var options = {};
    if (ui2Select2Config) {
      angular.extend(options, ui2Select2Config);
    }
    return {
      require: 'ngModel',
      priority: 1,
      compile: function(tElm, tAttrs) {
        var watch,
          repeatOption,
          repeatAttr,
          isSelect = tElm.is('select'),
          isMultiple = angular.isDefined(tAttrs.multiple);

        // Enable watching of the options dataset if in use
        if (tElm.is('select')) {
          repeatOption = tElm.find('optgroup[ng-repeat], optgroup[data-ng-repeat], option[ng-repeat], option[data-ng-repeat]');

          if (repeatOption.length) {
            repeatAttr = repeatOption.attr('ng-repeat') || repeatOption.attr('data-ng-repeat');
            watch = jQuery.trim(repeatAttr.split('|')[0]).split(' ').pop();
          }
        }

        return function(scope, elm, attrs, controller) {
          // instance-specific options
          var opts = angular.extend({}, options, scope.$eval(attrs.ui2Select2));

          /*
Convert from Select2 view-model to Angular view-model.
*/
          var convertToAngularModel = function(select2_data) {
            var model;
            if (opts.simple_tags) {
              model = [];
              angular.forEach(select2_data, function(value, index) {
                model.push(value.id);
              });
            } else {
              model = select2_data;
            }
            return model;
          };

          /*
Convert from Angular view-model to Select2 view-model.
*/
          var convertToSelect2Model = function(angular_data) {
            var model = [];
            if (!angular_data) {
              return model;
            }

            if (opts.simple_tags) {
              model = [];
              angular.forEach(
                angular_data,
                function(value, index) {
                  model.push({
                    'id': value,
                    'text': value
                  });
                });
            } else {
              model = angular_data;
            }
            return model;
          };

          if (isSelect) {
            // Use <select multiple> instead
            delete opts.multiple;
            delete opts.initSelection;
          } else if (isMultiple) {
            opts.multiple = true;
          }

          if (controller) {
            // Watch the model for programmatic changes
            scope.$watch(tAttrs.ngModel, function(current, old) {
              if (!current) {
                return;
              }
              if (current === old) {
                return;
              }
              controller.$render();
            }, true);
            controller.$render = function() {
              if (isSelect) {
                elm.select2('val', controller.$viewValue);
              } else {
                if (opts.multiple) {
                  var viewValue = controller.$viewValue;
                  if (angular.isString(viewValue)) {
                    viewValue = viewValue.split(',');
                  }
                  elm.select2(
                    'data', convertToSelect2Model(viewValue));
                } else {
                  if (angular.isObject(controller.$viewValue)) {
                    elm.select2('data', controller.$viewValue);
                  } else if (!controller.$viewValue) {
                    elm.select2('data', null);
                  } else {
                    elm.select2('val', controller.$viewValue);
                  }
                }
              }
            };

            // Watch the options dataset for changes
            if (watch) {
              scope.$watch(watch, function(newVal, oldVal, scope) {
                if (angular.equals(newVal, oldVal)) {
                  return;
                }
                // Delayed so that the options have time to be rendered
                $timeout(function() {
                  elm.select2('val', controller.$viewValue);
                  // Refresh angular to remove the superfluous option
                  elm.trigger('change');
                  if (newVal && !oldVal && controller.$setPristine) {
                    controller.$setPristine(true);
                  }
                });
              });
            }

            // Update valid and dirty statuses
            controller.$parsers.push(function(value) {
              var div = elm.prev();
              div
                .toggleClass('ng-invalid', !controller.$valid)
                .toggleClass('ng-valid', controller.$valid)
                .toggleClass('ng-invalid-required', !controller.$valid)
                .toggleClass('ng-valid-required', controller.$valid)
                .toggleClass('ng-dirty', controller.$dirty)
                .toggleClass('ng-pristine', controller.$pristine);
              return value;
            });

            if (!isSelect) {
              // Set the view and model value and update the angular template manually for the ajax/multiple select2.
              elm.bind("change", function(e) {
                e.stopImmediatePropagation();

                if (scope.$$phase || scope.$root.$$phase) {
                  return;
                }
                scope.$apply(function() {
                  controller.$setViewValue(
                    convertToAngularModel(elm.select2('data')));
                });
              });

              if (opts.initSelection) {
                var initSelection = opts.initSelection;
                opts.initSelection = function(element, callback) {
                  initSelection(element, function(value) {
                    var isPristine = controller.$pristine;
                    controller.$setViewValue(convertToAngularModel(value));
                    callback(value);
                    if (isPristine) {
                      controller.$setPristine();
                    }
                    elm.prev().toggleClass('ng-pristine', controller.$pristine);
                  });
                };
              }
            }
          }

          elm.bind("$destroy", function() {
            elm.select2("destroy");
          });

          attrs.$observe('disabled', function(value) {
            elm.select2('enable', !value);
          });

          attrs.$observe('readonly', function(value) {
            elm.select2('readonly', !! value);
          });

          if (attrs.ngMultiple) {
            scope.$watch(attrs.ngMultiple, function(newVal) {
              attrs.$set('multiple', !! newVal);
              elm.select2(opts);
            });
          }

          // Initialize the plugin late so that the injected DOM does not disrupt the template compiler
          $timeout(function() {
            elm.select2(opts);

            // Set initial value - I'm not sure about this but it seems to need to be there
            elm.select2('data', controller.$modelValue);
            // important!
            controller.$render();

            // Not sure if I should just check for !isSelect OR if I should check for 'tags' key
            if (!opts.initSelection && !isSelect) {
              var isPristine = controller.$pristine;
              controller.$setViewValue(
                convertToAngularModel(elm.select2('data'))
              );
              if (isPristine) {
                controller.$setPristine();
              }
              elm.prev().toggleClass('ng-pristine', controller.$pristine);
            }
          });
        };
      }
    };
  }
]);

/**
 * Created by sushrut.sawarkar on 6/3/2014.
 */

angular.module('ui.bestselect', [])
    //from bootstrap-ui typeahead parser
    .factory('optionParser', ['$parse', function ($parse) {

        //                      00000111000000000000022200000000000000003333333333333330000000000044000
        var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

        return {
            parse: function (input) {

                var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
                if (!match) {
                    throw new Error(
                            "Expected typeahead specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_'" +
                            " but got '" + input + "'.");
                }

                return {
                    itemName: match[3],
                    source: $parse(match[4]),
                    viewMapper: $parse(match[2] || match[1]),
                    modelMapper: $parse(match[1])
                };
            }
        };
    }])

    .directive('multiselect', ['$parse', '$document', '$compile', 'optionParser',

        function ($parse, $document, $compile, optionParser) {
            return {
                restrict: 'E',
                require: 'ngModel',
                link: function (originalScope, element, attrs, modelCtrl) {

                    var exp = attrs.options,
                        parsedResult = optionParser.parse(exp),
                        isMultiple = attrs.multiple ? true : false,
                        required = false,
                        modelidentity = attrs.modelidentity,
                        scope = originalScope.$new(),
                        changeHandler = attrs.change || angular.noop;

                    scope.items = [];
                    scope.header = 'Select';
                    scope.multiple = isMultiple;
                    scope.disabled = false;
                    scope.checkCount = 0;

                    originalScope.$on('$destroy', function () {
                        scope.$destroy();
                    });

                    var popUpEl = angular.element('<multiselect-popup></multiselect-popup>');

                    //required validator
                    if (attrs.required || attrs.ngRequired) {
                        required = true;
                    }
                    attrs.$observe('required', function(newVal) {
                        required = newVal;
                    });

                    //watch disabled state
                    scope.$watch(function () {
                        return $parse(attrs.disabled)(originalScope);
                    }, function (newVal) {
                        scope.disabled = newVal;
                    });

                    //watch single/multiple state for dynamically change single to multiple
                    scope.$watch(function () {
                        return $parse(attrs.multiple)(originalScope);
                    }, function (newVal) {
                        isMultiple = newVal || false;
                    });

                    //watch option changes for options that are populated dynamically
                    scope.$watch(function () {
                        return parsedResult.source(originalScope);
                    }, function (newVal) {
                        if (angular.isDefined(newVal))
                            parseModel();
                    }, true);

                    //watch model change
                    scope.$watch(function () {
                        return modelCtrl.$modelValue;
                    }, function (newVal, oldVal) {
                        //when directive initialize, newVal usually undefined. Also, if model value already set in the controller
                        //for preselected list then we need to mark checked in our scope item. But we don't want to do this every time
                        //model changes. We need to do this only if it is done outside directive scope, from controller, for example.
                        if (angular.isDefined(newVal)) {
                            markChecked(newVal);
                            scope.$eval(changeHandler);
                        }
                        getHeaderText();
                        modelCtrl.$setValidity('required', scope.valid());
                    }, true);

                    function parseModel() {
                        scope.items.length = 0;
                        var model = parsedResult.source(originalScope);
                        if(!angular.isDefined(model)) return;
                        for (var i = 0; i < model.length; i++) {
                            var local = {};
                            local[parsedResult.itemName] = model[i];
                            scope.items.push({
                                label: parsedResult.viewMapper(local),
                                model: model[i],
                                checked: false
                            });
                        }
                    }

                    parseModel();

                    element.append($compile(popUpEl)(scope));

                    function getHeaderText() {
                        if (is_empty(modelCtrl.$modelValue)) return scope.header = 'Select';
                        if (isMultiple) {
                            scope.header = modelCtrl.$modelValue.length + ' ' + 'selected';
                        } else {
                            var local = {};
                            local[parsedResult.itemName] = modelCtrl.$modelValue;

                            scope.header = parsedResult.viewMapper(local);
                        }
                    }

                    function is_empty(obj) {
                        if (!obj) return true;
                        if (obj.length && obj.length > 0) return false;
                        for (var prop in obj) if (obj[prop]) return false;
                        return true;
                    };

                    scope.valid = function validModel() {
                        if(!required) return true;
                        var value = modelCtrl.$modelValue;
                        return (angular.isArray(value) && value.length > 0) || (!angular.isArray(value) && value != null);
                    };

                    function selectSingle(item) {
                        if (item.checked) {
                            scope.uncheckAll();
                        } else {
                            scope.uncheckAll();
                            item.checked = !item.checked;
                        }
                        setModelValue(false);
                    }

                    function selectMultiple(item) {
                        (item.checked = !item.checked)?scope.checkCount+=1:scope.checkCount-=1;
                        setModelValue(true);
                    }

                    function setModelValue(isMultiple) {
                        var value;

                        if (isMultiple) {
                            value = [];
                            angular.forEach(scope.items, function (item) {
                                if (item.checked){
                                    var got = false;
                                    for(var i =0;i< modelCtrl.$modelValue.length;i++){
                                        var a = modelCtrl.$modelValue[i], b = item.model;
                                        if(modelidentity){
                                            a = modelCtrl.$modelValue[i][modelidentity];
                                            b = item.model[modelidentity];
                                        }
                                        if(a === b){
                                            value.push(modelCtrl.$modelValue[i]);
                                            got=true;
                                            break;
                                        }
                                    }
                                    if(!got) value.push(item.model);
                                }
                            });
                        } else {
                            angular.forEach(scope.items, function (item) {
                                if (item.checked) {
                                    value = item.model;
                                    return false;
                                }
                            })
                        }
                        modelCtrl.$setViewValue(value);
                    }

                    function markChecked(newVal) {
                        if (!angular.isArray(newVal)) {
                            angular.forEach(scope.items, function (item) {
                                var a = item.model,b = newVal;
                                if(modelidentity){
                                    a = item.model[modelidentity];
                                    b = newVal[modelidentity];
                                }
                                if (newVal && a === b) {
                                    item.checked = true;
                                    return false;
                                }
                            });
                        } else {
                            angular.forEach(newVal, function (i) {
                                angular.forEach(scope.items, function (item) {
                                    var a = item.model,b = i;
                                    if(modelidentity){
                                        a = item.model[modelidentity];
                                        b = i[modelidentity];
                                    }
                                    if (a === b) {
                                        item.checked = true;
                                    }
                                });
                            });
                        }
                    }

                    scope.checkAll = function () {
                        if (!isMultiple) return;
                        scope.checkCount=scope.items.length;
                        angular.forEach(scope.items, function (item) {
                            item.checked = true;
                        });
                        setModelValue(true);
                    };

                    scope.uncheckAll = function () {
//                        if(modelCtrl.$modelValue && modelCtrl.$modelValue.length===0) return;
                            scope.checkCount=0;
                            angular.forEach(scope.items, function (item) {
                                item.checked = false;
                            });
                            setModelValue(true);
                    };

                    scope.select = function (item) {
                        if (isMultiple === false) {
                            selectSingle(item);
                            scope.toggleSelect();
                        } else {
                            selectMultiple(item);
                        }
                    }
                }
            };
        }])

    .directive('multiselectPopup', ['$document', function ($document) {
        return {
            restrict: 'E',
            scope: false,
            replace: true,
            template: '<div class="dropdown" style="display: inline">'+
                '<button class="btn-multi input-large" ng-click="toggleSelect()" ng-disabled="disabled" ng-class="{\'error\': !valid()}">'+
                    '<span class="pull-left">{{header}}</span>'+
                    '<span class="pull-right">'+
                        '<i class="icon-caret-down"></i>' +
                    '</span>'+
                '</button>' +
                '<ul class="dropdown-multi input-large">'+
                '<li>'+
                '<input class="input-large" type="text" ng-model="searchText.label" autofocus="autofocus" placeholder="Filter" />'+
                '</li>'+
                '<li ng-if="multiple">'+
                '<span>Select : '+
                    '<button ng-class="{\'active\':checkCount===items.length}"  ng-click="checkAll()">All</button>'+
                    '<button ng-class="{\'active\':checkCount===0}" ng-click="uncheckAll()">None</button>'+
                '</span>'+
                '</li>'+
                '<li ng-repeat="i in items | filter:searchText">'+
                '<a ng-click="select(i); focus()">'+
                '<i  ng-class="{\'icon-ok\': i.checked, \'span-i\': !i.checked}"></i> {{i.label}}</a>'+
                '</li>'+
                '</ul>'+
                '</div>',
            link: function (scope, element, attrs) {

                scope.isVisible = false;

                scope.toggleSelect = function () {
                    if (element.hasClass('open')) {
                        element.removeClass('open');
                        $document.unbind('click', clickHandler);
                    } else {
                        element.addClass('open');
                        $document.bind('click', clickHandler);
                        scope.focus();
                    }
                };

                function clickHandler(event) {
                    if (elementMatchesAnyInArray(event.target, element.find(event.target.tagName)))
                        return;
                    element.removeClass('open');
                    $document.unbind('click', clickHandler);
                    scope.$apply();
                }

                scope.focus = function focus(){
                    var searchBox = element.find('input')[0];
                    searchBox.focus();
                }

                var elementMatchesAnyInArray = function (element, elementArray) {
                    for (var i = 0; i < elementArray.length; i++)
                        if (element == elementArray[i])
                            return true;
                    return false;
                }
            }
        }
    }]);