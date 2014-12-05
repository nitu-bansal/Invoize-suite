//angularApp.directive('customSelect', function() {
//	return {
//		restrict: 'A',
//		replace: true,
//		require: '?ngModel',
//		scope: {
//			datasource: '='
//		},
//		link: function($scope, elem, attrs, ngModel) {
//			function toHumanReadable2(str) {
//				var out = str.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
//					if (offset == 0)
//						return (str.toUpperCase());
//					else {
//						return (str.substr(0, 1) + " " + str.substr(1).toUpperCase());
//					}
//				});
//				return (out);
//			};
//
//			function formatResult2(data) {
//				var markup = "<div>" + data.n + "</div>";
//				return markup;
//			}
//
//			function formatSelection2(data) {
//				return "<div>" + data.n + "</div>";
//			}
//
//			elem.select2({
//				placeholder: "Choose ..",
//				minimumInputLength: 0,
//				multiple: false,
//				allowClear: false,
//				query: function(query) {
//					var data = {
//						results: []
//					};
//					var items = [];
//					if ($scope.datasource) {
//						items = $scope.datasource;
//					}
//					angular.forEach(items, function(item, key) {
//						if (query.term.toUpperCase() === item.n.substring(0, query.term.length).toUpperCase()) {
//							data.results.push(item);
//						}
//					});
//					query.callback(data);
//				},
//				initSelection: function(element, callback) {
//					callback($(element).data('$ngModelController').$modelValue);
//				},
//				formatResult: formatResult2,
//				formatSelection: formatSelection2,
//				dropdownCssClass: "bigdrop",
//				escapeMarkup: function(m) {
//					return m;
//				}
//			});
//			$scope.$watch('$parent.' + attrs.ngModel, function(current, old) {
//				console.log(current);
//				if (!current) {
//					return;
//				}
//				if (current === old) {
//					return;
//				}
//				elem.select2('val', current);
//			}, true);
//		}
//	}
//});


angularApp.directive('dynamicSelect', function($compile, $parse,$state,$filter) {
	return {
		restrict: 'E',
		priority: 1,
		require: '?ngModel',
		scope: true,
		compile: function($scope, element) {
			// var fieldGetter = $parse(attrs.field);

			return function($scope, element, attr) {
				$scope.requiredVal = '';

				var readonly = "";
				if (eval(attr.ngReadonly))
					readonly = 'readonly';

                if(attr.placeholder == null || attr.placeholder == undefined )
                    attr.placeholder = '';

                if(attr.tooltip == null || attr.tooltip == undefined )
                    attr.tooltip = '';


				var isMultiple = attr.multiselect  ? 0 : 1;
				if (attr.required || attr.ngRequired)
					$scope.requiredVal = 'select-validate';

				function formatResult(data) {
                    if ( isNaN(data.id)) {
                        if (data.id.indexOf('new_') == 0)
                            return "<div> <button class='inz-btn btn-xs btn-success'><i class='icon-plus icon-white'></i> Add : \"" + data.n + "\"</button></div>";
                    }
                    return "<div>" + data.n + "</div>";
				}

				function formatSelection(data) {
					return "<div class='itemNew'>" + data.n + "</div>";
				}

				function toHumanReadable(str) {
					var out = str.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
						if (offset == 0)
							return (str.toUpperCase());
						else {
							return (str.substr(0, 1) + " " + str.substr(1).toUpperCase());
						}
					});
					return (out);
				}
				$scope.v = function() {
					return attr.ph;
				};
				$scope.mdl = function() {
					try {
						var vals = $('input[name="' + attr.name + '"]').select2('val');
						var selectedIds = [];
						//						var selectedList = eval('scope.' + attr.ngModel);
						if (vals != null)
							for (var i = 0; i < vals.length; i++)
								selectedIds.push(vals[i].id)
						return selectedIds.toString();
					} catch (e) {
						return '';
					}
				};

				var fnSearchChoice;
				var dialog = "";

				if (attr.enterchoice) { //this will allow user to enter his own text directly
					fnSearchChoice = function(term, data) {
						if (term.trim().length > 1) {
							if ($(data).filter(function() {
								return this.n.toLowerCase().localeCompare(term.toLowerCase()) === 0;
							}).length === 0) {
								return {
									// to make id Unique so that for the same term which was removed and then addded, next time button shows up.
									id: 'new_' + term + '_' + Math.floor((Math.random() * 1000) + 1).toString(),
									v: term,
									n: term,
									s: ""
								};
							}
						}
					}
				} else {
					fnSearchChoice = function(term, data) { };
				}

				if (attr.quickcreation) // this will allow user to enter his own text directly into database with a dialog
					dialog = '  ng-change="openCreateDialog(' + attr.ngModel + ')" ';
				else if (attr.change)
					dialog = '  ng-change="' + attr.change + '"';


				$scope.config = {
//					placeholder: attr.placeholder,
					minimumInputLength: 0,
					multiple: true,
					allowClear: true,
					maximumSelectionSize: isMultiple,
					createSearchChoice: fnSearchChoice,
					ajax: {
                        type: attr.type,
						url: attr.url||"/api/suggestion",
						dataType: 'json',
						quietMillis: 100,
						data: function(term, page) {
							var s = {
								q: term,
								pageLimit: 10,
								page: page,
								selected: $scope.mdl,
								suggestionFor: $scope.v,
                                currentContext: $state.$current.context && $state.$current.context.module?$state.$current.context.product+"."+$state.$current.context.module:null
							};
							if (attr.customobj) {
								var c = JSON.parse(attr.customobj);
								for (var k in c)
									s[k] = c[k];
							}

                            try {
                                if (attr.dependent && $scope[attr.dependent]['isdependent'].length) {
                                    var reqDependents = '', dependents = $scope[attr.dependent]['isdependent'], row = $scope[attr.data];

                                    if (dependents.length) {
                                        var j = 0;
                                        for (var i = 0; i < row.length && j < dependents.length; i++)
                                            if (row[i].key == dependents[j] && row[i].value.length) {
                                                reqDependents += (dependents[j] + '|' + $filter("selectToText")(row[i].value,'^') + ',');
                                                j++;
                                            }
                                        s.dependent = reqDependents.substr(0,reqDependents.length-1);
                                    }
                                }
                            }
                            catch (e) {
                                console.log("Error in Dependent");
                            }
							return s;
						},
						results: function(data, page) {
							return {
								results: data.msg,
								more: data.msg.length >= 10
							};
						}
					},
					initSelection: function(element, callback) {
						try {
							callback($(element).data('$ngModelController').$modelValue);
						} catch (e) {}
					},
					formatResult: formatResult,
					formatSelection: formatSelection,
					dropdownCssClass: "bigdrop",
					escapeMarkup: function(m) {
						return m;
					}
				};
				element.replaceWith($compile('<input ' + 'ng-disabled="' + attr.disabled + '" ' + 'ng-hide="' + attr.ngHide + '" ' + $scope.requiredVal + dialog + ' name="' + attr.name + '" class="input-large" ui-select2="config" ' + readonly + ' ng-model="' + attr.ngModel + '" data-placeholder="' + (attr.tooltip || attr.placeholder ) + '" data-toggle="tooltip">')($scope));
			}
		}
	}
});

angularApp.directive('dynamicSingleSelect', function($compile, $parse) {
	return {
		restrict: 'E',
		priority: 1,
		require: '?ngModel',
		scope: true,
		compile: function($scope, element) {
			// var fieldGetter = $parse(attrs.field);

			return function($scope, element, attr) {
				var requiredVal = '';

				var readonly = "";
				if (eval(attr.ngReadonly))
					readonly = 'readonly';



				var isMultiple = attr.multiselect ? 0 : 1;

				if (attr.required || attr.ngRequired)
                    requiredVal = 'required';

				function formatResult(data) {
                    if (isNaN(data.id)) {
                        if (data.id.indexOf('new_') == 0)
                            var markup = "<div> <button class='inz-btn btn-xs btn-success'><i class='icon-plus icon-white'></i> Add : \"" + data.n + "\"</button></div>";
                        else
                            var markup = "<div>" + data.n + "</div>";
                    }
                    else
                        var markup = "<div>" + data.n + "</div>";
					return markup;
				}

				function formatSelection(data) {
					return "<div class='itemNew'>" + data.n + "</div>";
				}

				function toHumanReadable(str) {
					var out = str.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
						if (offset == 0)
							return (str.toUpperCase());
						else {
							return (str.substr(0, 1) + " " + str.substr(1).toUpperCase());
						}
					});
					return (out);
				}
				$scope.v = function() {
					return attr.ph;
				};
				$scope.mdl = function() {
					try {
						var vals = $('input[name="' + attr.name + '"]').select2('val');
						var selectedIds = [];
						//						var selectedList = eval('scope.' + attr.ngModel);
						if (vals != null)
							for (var i = 0; i < vals.length; i++) {
                                if(vals[i].id != undefined)
                                    selectedIds.push(vals[i].id)
                            }
						return selectedIds.toString();
					} catch (e) {
						return '';
					}
				};

				var fnSearchChoice;
				var dialog = "";


				if (attr.enterchoice) { //this will allow user to enter his own text directly
					fnSearchChoice = function(term, data) {
						if (term.trim().length > 1) {
							if ($(data).filter(function() {
								return this.n.toLowerCase().localeCompare(term.toLowerCase()) === 0;
							}).length === 0) {
								return {
									// to make id Unique so that for the same term which was removed and then addded, next time button shows up.
									id: 'new_' + term + '_' + Math.floor((Math.random() * 1000) + 1).toString(),
									v: term,
									n: term,
									s: ""
								};
							}
						}
					}
				} else {

					fnSearchChoice = function(term, data) {};
				}

				if (attr.quickcreation) // this will allow user to enter his own text directly into database with a dialog
					dialog = '  ng-change="openCreateDialog(' + attr.ngModel + ')" ';
				else if (attr.change)
					dialog = '  ng-change="' + attr.change + '"';



				$scope.config = {
//					placeholder: attr.placeholder,
                    minimumInputLength: 0,
					multiple: false,
					allowClear: false,
					maximumSelectionSize: isMultiple,
					createSearchChoice: fnSearchChoice,
					ajax: {
						method: 'POST',
						url: attr.url||"/api/suggestion",
						dataType: 'json',
						quietMillis: 100,

						data: function(term, page) {
							var s = {
								q: term,
								pageLimit: 10,
								page: page,
								selected: $scope.mdl,
								suggestionFor: $scope.v
							};
							if (attr.customobj) {
								var c = JSON.parse(attr.customobj);
								for (var k in c)
									s[k] = c[k];
							}
							return s;
						},
						results: function(data, page) {
							data.total = 100;
                            $scope.data1 = {};
                            $scope.data1.msg = [];

                            var emptySelect = 0;
                            if (attr.emptyselect != undefined) emptySelect = attr.emptyselect ? 1 : 0;
                            if(emptySelect == 1){
                                $scope.data1.msg.push({id: "",
                                    v: "",
                                    n: "Select",
                                    s: ""});
                                angular.forEach(data.msg, function(item){
                                    $scope.data1.msg.push(item);
                                });
                            }
                            else
                            {
                                $scope.data1=data;
                            }
							if ($scope.data1.msg.length < 10)
								var more = false
							else
								var more = (page * 10) < data.total;

                            return {
								results: $scope.data1.msg,
								more: more
							};
						}
					},
					initSelection: function(element, callback) {
						try {
							callback($(element).data('$ngModelController').$modelValue);
						} catch (e) {}
					},
                    formatResult: formatResult,
					formatSelection: formatSelection,
					dropdownCssClass: "bigdrop",
					escapeMarkup: function(m) {
						return m;
					}
				};
				element.replaceWith($compile('<input auto-select-sync ' + 'ng-disabled="' + attr.disabled + '" ' + 'ng-hide="' + attr.ngHide + '" ' + requiredVal + dialog + ' name="' + attr.name + '" class="input-large" ui-select2="config" ' + readonly + ' ng-model="' + attr.ngModel + '" data-placeholder="' + (attr.tooltip || attr.placeholder || attr.data-placeholder)  + '" data-toggle="tooltip">')($scope));
			}
		}
	}
});

// angularApp.directive('dynamicElement', function($compile) {
// 	return {
// 		restrict: 'E',
// 		/*template: '<input ng-transclude class="input-large" ui-select2="config">',
// 		replace: true,*/

// 		// require: '?ngModel',
// 		// scope: {
// 		// 	ngModel: '='
// 		// },
// 		link: function($scope, elem, attr, ctrl) {

// 			scope.v = function() {
// 				return attr.ph;
// 			};

// 			$scope.config = {
// 				placeholder: "Please Select..",
// 				minimumInputLength: 0,
// 				multiple: true,
// 				maximumSelectionSize: 1,
// 				tokenSeparators: [","],
// 				allowClear: true,
// 				createSearchChoice: function(term, data) {
// 					if ($(data).filter(function() {
// 						return this.v.localeCompare(term) === 0;
// 					}).length === 0) {
// 						return {
// 							id: term,
// 							v: term,
// 							n: "new",
// 							ds: ""
// 						};
// 					}
// 				},
// 				ajax: {
// 					method: 'POST',
// 					url: "/api/suggestion",
// 					dataType: 'json',
// 					quietMillis: 100,

// 					data: function(term, page) {
// 						return {
// 							q: term,
// 							pageLimit: 10,
// 							page: page,
// 							suggestionFor: $scope.v,
// 						};
// 					},
// 					results: function(data, page) {
// 						var data = data
// 						data.total = 100;
// 						if (data.msg.length < 10)
// 							var more = false
// 						else
// 							var more = (page * 10) < data.total;

// 						return {
// 							results: data.msg,
// 							more: more
// 						};
// 					}
// 				},
// 				initSelection: function(element, callback) {
// 					callback($(element).data('$ngModelController').$modelValue);
// 				},
// 				formatResult: formatResult,
// 				formatSelection: formatSelection,
// 				dropdownCssClass: "bigdrop",
// 				escapeMarkup: function(m) {
// 					return m;
// 				}
// 			};


// 			function formatResult(data) {
// 				var markup = "<div>" + data.v + "</div>";
// 				return markup;
// 			}

// 			function formatSelection(data) {
// 				return data.v;
// 			}

// 			function toHumanReadable(str) {
// 				var out = str.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
// 					if (offset == 0)
// 						return (str.toUpperCase());
// 					else {
// 						return (str.substr(0, 1) + " " + str.substr(1).toUpperCase());
// 					}
// 				});
// 				return (out);
// 			};

// 			elem.replaceWith($compile('<input name="' + attr.name + '" class="input-large"  ng-model="attr.ngModel" ui-select2="config">')($scope));
// 			// elem.html('<input class="input-large" ui-select2="config">').show();
// 			// $compile(elem.contents())($scope);

// 		}
// 	};
// });

