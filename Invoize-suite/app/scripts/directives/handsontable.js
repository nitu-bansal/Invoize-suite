/**
 * Created by kamalsingh.saini on 8/11/13.
 */
angular.module('uiHandsontable', [])
/**
 * Creates Handsontable settings object if needed
 * @param $element
 * @returns {Object}
 */
.factory('getHandsontableSettings', function() {
	return function getHandsontableSettings($element) {
		var uiDatagrid = $element.data('uiDatagrid');
		if (!uiDatagrid) {
			uiDatagrid = {
				settings: {
					columns: [],
					colHeaders: true,
					outsideClickDeselects: true,
					autoComplete: []
				},
				$container: $('<div class="ui-handsontable-container"></div>')
			};
			$element.data('uiDatagrid', uiDatagrid);
		}
		return uiDatagrid;
	}
})

/**
 * Creates Datacolumn settings object if needed
 * @param $element
 * @returns {Object}
 */
//    .factory('getDatacolumnSettings', function () {
//        return function getDatacolumnSettings($element) {
//            var uiDatagridDatacolumn = $element.data('uiDatagridDatacolumn');
//            if (!uiDatagridDatacolumn) {
//                uiDatagridDatacolumn = {
//                };
//                $element.data('uiDatagridDatacolumn', uiDatagridDatacolumn);
//            }
//            return uiDatagridDatacolumn;
//        }
//    })

.directive('uiHandsontable', function($compile, $rootScope, getHandsontableSettings, $http, flash) {
	var htOptions = ['afterRender', 'afterCreateRow', 'data', 'width', 'height', 'rowHeaders', 'colHeaders', 'colWidths', 'columns', 'cells', 'dataSchema', 'contextMenu', 'onSelection', 'onSelectionByProp', 'onBeforeChange', 'onChange', 'onCopyLimit', 'startRows', 'startCols', 'minRows', 'minCols', 'maxRows', 'maxCols', 'minSpareRows', 'minSpareCols', 'multiSelect', 'fillHandle', 'undo', 'outsideClickDeselects', 'enterBeginsEditing', 'enterMoves', 'tabMoves', 'autoWrapRow', 'autoWrapCol', 'copyRowsLimit', 'copyColsLimit', 'currentRowClassName', 'currentColClassName', 'asyncRendering', 'stretchH', 'columnSorting', 'manualColumnMove', 'manualColumnResize', 'fragmentSelection', 'scrollbarModelV', 'scrollbarModelH', 'beforeKeyDown', 'afterSelection'];

	var scopeDef = {
		selectedIndex: '=selectedindex'
	};
	for (var i = 0, ilen = htOptions.length; i < ilen; i++) {
		scopeDef[htOptions[i]] = '=' + htOptions[i].toLowerCase();
	}

	var directiveDefinitionObject = {
		restrict: 'EA',
		scope: scopeDef,
		priority: 490,
		compile: function compile(tElement, tAttrs) {

			var parseAutocomplete = function(scope, column, uiDatagrid) {
				column.options = {
					items: 100
				};
				column.source = function(query, process) {
					if (!column.src) {
						flash.pop({
							title: column.title,
							body: 'Please set suggestion for ' + column.title + ' field...',
							type: 'info',
							options: {
								'timeOut': '0',
								"extendedTimeOut": "0"
							}
						});
					} else {
						if (angular.isArray(column.src)) {
							column.source = column.src;
							var machedvals = [];
							for (var i = 0; i < column.src.length; i++)
								if (column.src[i].toLowerCase().indexOf(query) !== -1)
									machedvals.push(column.src[i]);
							process(machedvals);
						} else {
							var dependents = '';
							if (column.isDependent) {
								dependents = '&dependentFields=';
								var val = null;
								for (var i = 0; i < scope.columns.length; i++)
									if (scope.columns[i].isDependent && column.key !== scope.columns[i].key && (val = this.instance.getDataAtRowProp(this.row, scope.columns[i].key)))
										dependents += scope.columns[i].key + '|' + val + ',';
							}

							var srcUrl = column.src.indexOf('/api/') != -1 ? column.src : ('/api/suggestion?q=' + query + '&responseType=array&pageLimit=100&page=1&selected=&suggestionFor=' + column.src + (column.suggestionField ? '&column=' + column.suggestionField : '')) + dependents;
							if (column.src == 'suggestionField') {
								var profile = scope.$parent.profile || scope.$parent.metadataType;
								srcUrl = '/api/suggestion?q=' + query + '&pageLimit=100&page=1&selected=&responseType=array&suggestionFor=columns&docType=' + (profile.fields[this.row].suggestionsSource || '');
							}
							$http({
								method: 'GET',
								url: srcUrl
							}).
							success(function(data, status, headers, config) {
								process(data.msg);
							}).
							error(function(data, status, headers, config) {
								process([]);
							});
						}
					}
				};


				column.sorter = function(items) {
					return items;
				};
			};

			var expression = tAttrs.datarows,
				match, lhs, rhs;
			if (expression) {
				match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/)
			}
			if (!match) {
				throw Error("Expected datarows in form of '_item_ in _collection_' but got '" +
					expression + "'.");
			}
			lhs = match[1];
			rhs = match[2];

			return function postLink(scope, element, attrs) {
				var uiDatagrid = getHandsontableSettings(element),
					i, ilen;

				uiDatagrid.lhs = lhs;
				uiDatagrid.rhs = rhs;
				uiDatagrid.settings = angular.extend(uiDatagrid.settings, scope.$parent.$eval(attrs.uiHandsontable || attrs.settings));

				for (i in htOptions) {
					if (htOptions.hasOwnProperty(i) && typeof scope[htOptions[i]] !== 'undefined') {
						uiDatagrid.settings[htOptions[i]] = scope[htOptions[i]];
					}
				}

				$(element).append(uiDatagrid.$container);

				var data = scope.$parent.$eval(rhs);
				if (typeof data !== 'undefined') {
					uiDatagrid.settings['data'] = data;
				}

				if (uiDatagrid.settings.columns) {
					var pattern = new RegExp("^(" + lhs + "\\.)");
					for (i = 0, ilen = uiDatagrid.settings.columns.length; i < ilen; i++) {
						uiDatagrid.settings.columns[i].data = uiDatagrid.settings.columns[i].value.replace(pattern, '');

						if (uiDatagrid.settings.columns[i].type === 'autocomplete') {
							parseAutocomplete(scope, uiDatagrid.settings.columns[i], uiDatagrid);
						}
					}
				}

				uiDatagrid.settings.afterChange = function() {
					if (!$rootScope.$$phase) { //if digest is not in progress
						scope.$apply(); //programmatic change does not trigger digest in AnuglarJS so we need to trigger it automatically
					}
				};

				uiDatagrid.settings.afterSelectionByProp = function(r, p, r2, p2) {
					scope.$emit('datagridSelection', uiDatagrid.$container, r, p, r2, p2);
				};

				uiDatagrid.$container.handsontable(uiDatagrid.settings);

				// set up watcher for visible part of the table
				var lastTotalRows = 0;
				scope.$watch(function() {
					//check if visible data has changed
					if (scope.$parent.$eval(rhs) !== uiDatagrid.$container.handsontable('getData')) {
						return true;
					}

					var instance = uiDatagrid.$container.data('handsontable'),
						totalRows = instance.countRows();

					if (lastTotalRows !== totalRows) {
						lastTotalRows = totalRows; //needed to render newly added rows
						return lastTotalRows;
					}

					var out = '',
						totalCols = instance.countCols();
					for (var r = instance.rowOffset(), rlen = r + instance.countVisibleRows(); r < rlen; r++) {
						for (var c = 0; c < totalCols; c++) {
							out += instance.getDataAtCell(r, c)
						}
					}
					return out;
				}, function(newVal, oldVal) {
					//if data has changed, render the table
					if (newVal == true) {
						uiDatagrid.$container.handsontable('loadData', scope.$parent.$eval(rhs));
					} else if (newVal !== oldVal) {
						uiDatagrid.$container.handsontable('render');
					}
				}, false);

				// set up watchers for settings
				for (i = 0, ilen = htOptions.length; i < ilen; i++) {
					(function(key) {
						scope.$watch(key, function(newVal, oldVal) {
							//if configuration has changed, call updateSettings
							if (newVal === oldVal) {
								return;
							}

							if (key === 'columns') {
								var pattern = new RegExp("^(" + lhs + "\\.)");
								for (var i = 0, ilen = newVal.length; i < ilen; i++) {
									newVal[i].data = newVal[i].value.replace(pattern, '');

									if (newVal[i].type === 'autocomplete') {
										parseAutocomplete(scope, newVal[i], uiDatagrid);
									}
								}
							}

							var obj = {};
							obj[key] = newVal;
							uiDatagrid.$container.handsontable('updateSettings', obj);
						}, true);
					})(htOptions[i]);
				}
			}
		}
	};
	return directiveDefinitionObject;
});

//    .directive('datacolumn', function (getHandsontableSettings, getDatacolumnSettings) {
//        var directiveDefinitionObject = {
//            restrict: 'E',
//            priority: 500,
//            compile: function compile(tElement, tAttrs) {
//                return function postLink(scope, element, attrs) {
//                    var i
//                        , uiDatagrid = getHandsontableSettings(element.parent())
//                        , uiDatagridColumn = getDatacolumnSettings(element)
//                        , title = scope.$parent.$eval(attrs.title)
//                        , width = scope.$parent.$eval(attrs.width)
//                        , type = scope.$parent.$eval(attrs.type)
//                        , options = attrs.options;
//
//                    var keys = [];
//                    for (i in attrs) {
//                        if (tAttrs.hasOwnProperty(i)) {
//                            keys.push(i);
//                        }
//                    }
//
//                    uiDatagridColumn.value = attrs.value;
//                    uiDatagridColumn.source = null;
//                    uiDatagridColumn.saveOnBlur = ($.inArray('saveonblur', keys) !== -1); //true if element has attribute 'saveonblur'
//                    uiDatagridColumn.strict = ($.inArray('strict', keys) !== -1); //true if element has attribute 'strict'
//
//                    var childScope = scope.$new();
//
//                    var column = scope.$parent.$eval(options) || {};
//                    column.value = attrs.value;
//                    column.type = type;
//                    column.title = title;
//                    column.width = width;
//
//                    switch (type) {
//                        case 'autocomplete':
//                            for (i in uiDatagridColumn) {
//                                if (uiDatagridColumn.hasOwnProperty(i)) {
//                                    column[i] = uiDatagridColumn[i];
//                                }
//                            }
//                            break;
//
//                        case 'checkbox':
//                            if (typeof attrs.checkedtemplate !== 'undefined') {
//                                column.checkedTemplate = scope.$parent.$eval(attrs.checkedtemplate); //if undefined then defaults to Boolean true
//                            }
//                            if (typeof attrs.uncheckedtemplate !== 'undefined') {
//                                column.uncheckedTemplate = scope.$parent.$eval(attrs.uncheckedtemplate); //if undefined then defaults to Boolean true
//                            }
//                            break;
//                    }
//
//                    if (typeof attrs.readonly !== 'undefined') {
//                        column.readOnly = true;
//                    }
//
//                    for (i in attrs) {
//                        if (attrs.hasOwnProperty(i)) {
//                            if (i.charAt(0) !== '$' && typeof column[i] === 'undefined') {
//                                column[i] = childScope.$eval(attrs[i]);
//                            }
//                        }
//                    }
//
//                    uiDatagrid.settings.columns.push(column);
//                }
//            }
//        };
//        return directiveDefinitionObject;
//    })
//
//    .directive('optionlist', function (getDatacolumnSettings) {
//        var directiveDefinitionObject = {
//            restrict: 'E',
//            transclude: 'element',
//            priority: 510,
//            compile: function compile(tElement, tAttrs, transclude) {
//
//                return function postLink(scope, element, attrs) {
//                    var uiDatagridColumn = getDatacolumnSettings(element.parent());
//                    uiDatagridColumn.optionList = attrs.datarows;
//                    uiDatagridColumn.clickrow = attrs.clickrow;
//                    uiDatagridColumn.transclude = transclude;
//                }
//            }
//        };
//        return directiveDefinitionObject;
//    })

//    .directive('selectedindex', function (getHandsontableSettings) {
//        var directiveDefinitionObject = {
//            restrict: 'A',
//            priority: 491,
//            compile: function compile() {
//
//                return function postLink(scope, element) {
//                    var $container = getHandsontableSettings(element).$container;
//
//                    var isSelected
//                        , lastSelectionRow
//                        , lastSelectionCol;
//
//                    getHandsontableSettings(element).settings.afterSelection = function (r, c, r2, c2) {
//                        isSelected = true;
//                        lastSelectionRow = r;
//                        lastSelectionCol = c;
//
//                        if (!scope.$$phase && /*typeof scope.selectedIndex === 'object' && */typeof scope.selectedIndex !== 'undefined' && scope.selectedIndex != r) {
//                            //make sure digest is not in progress
//                            //typeof scope.selectedIndex === 'object' was used to make sure selectedIndex is observable (to avoid "Non-assignable model expression" error), but it seems unnecessary now
//
//                            scope.$apply(function () {
//                                scope.selectedIndex = r;
//                            });
//                        }
//                    }
//
//                    getHandsontableSettings(element).settings.afterDeselect = function (event) {
//                        isSelected = false;
//                        lastSelectionRow = null;
//
//                        if (!scope.$$phase && /*typeof scope.selectedIndex === 'object' && */typeof scope.selectedIndex !== 'undefined' && scope.selectedIndex != null) {
//                            //make sure digest is not in progress
//                            //typeof scope.selectedIndex === 'object' was used to make sure selectedIndex is observable (to avoid "Non-assignable model expression" error), but it seems unnecessary now
//                            scope.$apply(function () {
//                                scope.selectedIndex = null;
//                            });
//                        }
//                    };
//
//                    // set up watcher for selectedIndex
//                    scope.$watch('selectedIndex', function (newVal, oldVal) {
//                        //if selectedIndex has changed, change table selection
//                        var row = parseInt(newVal, 10);
//                        if (typeof newVal !== 'undefined' && newVal !== null && row !== lastSelectionRow) {
//                            var col = lastSelectionCol || 0;
//                            $container.handsontable('selectCell', row, col, row, col, true);
//                        }
//                    }, false);
//                }
//            }
//        };
//        return directiveDefinitionObject;
//    });