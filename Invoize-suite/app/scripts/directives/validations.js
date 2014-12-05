'use strict';
angularApp.directive('matcher', [

	function() {
		return {
			require: 'ngModel',
			link: function(scope, elm, attr, ctrl) {
				var form_name = $(elm).parents("form").attr("name");
				var params = eval("(" + attr.matcher + ")");
				var field_to_match = params.field_to_match;
				var error_name = params.error_name;
				ctrl.$parsers.unshift(function(viewValue, $scope) {
					viewValue === eval("scope." + form_name + "." + field_to_match + ".$viewValue") ? ctrl.$setValidity(error_name, true) : ctrl.$setValidity(error_name, false);
				});
			}
		};
	}
]);

angularApp.directive('unique', ['$http',
	function($http) {
		return {
			require: 'ngModel',
			link: function(scope, elm, attrs, ctrl) {
				ctrl.$parsers.unshift(function(viewValue, $scope, currentUser) {
					var d = attrs.unique.split(',');
					var docId = "";
					if (d.length == 4)
						docId = d[3];
					if (eval(d[1]) == true) {
						$http({
							method: 'GET',
							url: '/api/isAvailable?availableFor=' + d[0] + '&value=' + viewValue + '&collection=' + d[2] + '&docId=' + docId
						}).
						success(function(data, status, headers, config) {
							if (data.msg === 1) {
								ctrl.$setValidity('unique', false);
							} else {
								ctrl.$setValidity('unique', true);
							}
						}).
						error(function(data, status, headers, config) {
							return null
						})
					}
					return viewValue;
				});
			}
		};
	}
]);

angularApp.directive('duplicate', ['$http',
	function($http) {
		return {
			require: 'ngModel',
			link: function(scope, elm, attrs, ctrl) {
				ctrl.$parsers.unshift(function(viewValue, $scope, currentUser) {
					var duplicateFor = attrs.duplicate.split(',');
					$http({
						method: 'GET',
						url: '/api/isAvailable?availableFor=' + duplicateFor[0] + '&value=' + viewValue + '&docId=' + (duplicateFor[1] == null ? '' : duplicateFor[1])
					}).
					success(function(data, status, headers, config) {
						if (data.msg === 1) {
							ctrl.$setValidity('duplicate', false);
						} else {
							ctrl.$setValidity('duplicate', true);
						}
					}).
					error(function(data, status, headers, config) {
						return null
					})
					return viewValue;
				});
			}
		};
	}
]);

// directive on widget
angularApp.directive('passwordValidator', [

	function() {
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
	}
]);

// directive on form
angularApp.directive('formPwdValidator', [

	function() {
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
	}
]);

angularApp.directive('integer', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				if (INTEGER_REGEXP.test(viewValue)) {
					// it is valid
					ctrl.$setValidity('integer', true);
					return viewValue;
				} else {
					// it is invalid, return undefined (no model update)
					ctrl.$setValidity('integer', false);
					return undefined;
				}
			});
		}
	};
});

angularApp.directive('selectValidate', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function(viewValue) {
                if (viewValue.length > 0) {
                    // it is valid
                    ctrl.$setValidity('required', true);
                    return viewValue;
                } else {
                    ctrl.$setValidity('required', false);
                    return undefined;
                }

            });
		}
	};
});

angularApp.directive('metadataCollections', function(getCollection) {
	return {
		restrict: "E",
		link: function(scope, element, attrs) {
			scope.items = getCollection.ajaxItems(element, attrs, scope);
		}
		// template: "<select ui-select2='ui-select2' multiple='multiple' style='width:220px'  name='chargeType' data-placeholder='select'><option ng-repeat='row in items' value = '{{row.v}}' > {{row.n}} </option></select > "
	};
});

'use strict';
angularApp.factory('getCollection', function($http, $q, $compile) {
	return {
		ajaxItems: function(element, attrs, scope) {
			var deferred = $q.defer();
			$http({
				method: 'POST',
				url: '/api/list/suggestion',
				data: {
					suggestionFor: attrs.collections,
					q: '',
					pageLimit: 20,
					page: 1
				}
			})
				.success(function(data, status, headers, config) {
					// var htmltext = "<select ui-select2='ui-select2' multiple='multiple' name='chargeType' data-placeholder='select' style='width:220px'>";
					var htmltext = "<select ui-select2='ui-select2' ng-model='" + attrs.model + "' name='" + attrs.name + "' data-placeholder='" + attrs.placeholder + "' style='width:220px'>";
					data.msg.forEach(function(val, idx) {
						htmltext = htmltext + "<option value='" + val.v + "'>" + val.n + "</option>";
					});
					htmltext = htmltext + "</select>";
					element.html($compile(htmltext)(scope));
					deferred.resolve(data.msg);
				}).error(function(data, status, headers, config) {
					deferred.reject(data.msg);
				});
			return deferred.promise;
		}
	}
});

angularApp.directive('ngTrim', function($timeout) {
	return function(scope, element, attrs) {
		element.bind("change", function(event) {
			element.val(element.val().trim());
		});
	};
});

angularApp.directive('avoidCutcopy', function() {
	return function(scope, element, attrs) {
		$(element).bind("cut copy", function(e) {
			e.preventDefault();
		});
	};
});

angularApp.directive('chkFormat', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			// only @ - ! # _ : ; '  < >isavailaible for seperator
			//^(([`][a-zA-Z0-9!#:;<>]*[`])*[a9-]*)*$
            console.log(attrs.chkFormat);
			var invoiceFormat = attrs.chkFormat;
			var regEx = "";
			var fStr = "";
			var tiledOpened = false;
			var cntAlpha = 0;
			var cntNumber = 0;
			for (var i = 0; i < invoiceFormat.length; i++) {
				if (tiledOpened && invoiceFormat[i] != '`') {

					fStr = fStr + invoiceFormat[i];

				} else if (invoiceFormat[i] == '`') {
					if (cntNumber > 0) {
						regEx = regEx + "{" + cntNumber + "}";
						cntNumber = 0;
					}
					if (cntAlpha > 0) {
						regEx = regEx + "{" + cntAlpha + "}";
						cntAlpha = 0;
					}
					if (tiledOpened) {
						tiledOpened = false;
						regEx = regEx + fStr;
						fStr = "";
					} else {
						tiledOpened = true;
					}
				} else if (invoiceFormat[i] == 'a') {
					if (cntNumber > 0) {
						regEx = regEx + "{" + cntNumber + "}";
						cntNumber = 0;
					}
					if (cntAlpha > 0)
						cntAlpha++;
					else {
						cntAlpha++;
						regEx = regEx + "[a-zA-Z]";
					}
				} else if (invoiceFormat[i] == '9') {
					if (cntAlpha > 0) {
						regEx = regEx + "{" + cntAlpha + "}";
						cntAlpha = 0;
					}
					if (cntNumber > 0)
						cntNumber++;
					else {
						cntNumber++;
						regEx = regEx + "[0-9]";
					}
				} else {
					if (cntNumber > 0) {
						regEx = regEx + "{" + cntNumber + "}";
						cntNumber = 0;
					}
					if (cntAlpha > 0) {
						regEx = regEx + "{" + cntAlpha + "}";
						cntAlpha = 0;
					}
					regEx = regEx + invoiceFormat[i];

				}
			}
			ctrl.$parsers.unshift(function(viewValue) {
				try {
					var objRegEx = eval("/^" + regEx + "$/");
					if (objRegEx.test(viewValue)) {
						// it is valid
						ctrl.$setValidity('chkformat', true);
						return viewValue;
					} else {
						// it is invalid, return undefined (no model update)
						ctrl.$setValidity('chkformat', false);
						return undefined;
					}
				} catch (e) {
					ctrl.$setValidity('chkformat', false);
					return undefined;
				}
			});
		}
	};
});

angularApp.directive('pwCheck', [

	function() {
		return {
			require: 'ngModel',
			link: function(scope, elem, attrs, ctrl) {
				var firstPassword = '#' + attrs.pwCheck;

				$(elem).add(firstPassword).bind("cut copy paste drop", function(e) {
					e.preventDefault();
				});

				elem.add(firstPassword).on('keyup', function() {
					scope.$apply(function() {
						// console.info(elem.val() === $(firstPassword).val());
						if (elem.val().indexOf(' ') != -1 || $(firstPassword).val().indexOf(' ') != -1)
							ctrl.$setValidity('pwmatch', false);
						else
							ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
					});
				});
			}
		}
	}
]);

angularApp.directive('autoFillSync', function() {
	return {
		restrict: "A",
		require: "?ngModel",
		link: function(scope, element, attrs, ngModel) {
			setInterval(function() {
				var prev_val = '';
				if (!angular.isUndefined(attrs.xAutoFillPrevVal)) {
					prev_val = attrs.xAutoFillPrevVal;
				}
				if (element.val() != prev_val) {
					if (!angular.isUndefined(ngModel)) {
						if (!(element.val() == '' && ngModel.$pristine)) {
							attrs.xAutoFillPrevVal = element.val();
							scope.$apply(function() {
                                ngModel.$setViewValue(element.val());
                            });
						}
					} else {
						element.trigger('input');
						element.trigger('change');
						element.trigger('keyup');
						attrs.xAutoFillPrevVal = element.val();
					}
				}
			}, 300);
		}
	};
});

angularApp.directive('autoSelectSync', function() {
	return {
		restrict: "A",
		require: "?ngModel",
		link: function(scope, element, attrs, ngModel) {

			setInterval(function() {
				var prev_val = '';
				if (!angular.isUndefined(attrs.xAutoFillPrevVal)) {
					prev_val = attrs.xAutoFillPrevVal;
				}
				if (element.val() != prev_val) {
					if (!angular.isUndefined(ngModel)) {
						if (!(element.val() == '' && ngModel.$pristine)) {
							attrs.xAutoFillPrevVal = element.val();
							scope.$apply(function() {
								ngModel.$setViewValue(ngModel.$viewValue);
							});
						}
					} else {
						element.trigger('input');
						element.trigger('change');
						element.trigger('keyup');
						attrs.xAutoFillPrevVal = ngModel.$viewValue;
					}
				}
			}, 300);
		}
	};
});