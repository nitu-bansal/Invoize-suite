angularApp.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});

angularApp.directive('niceScroll', function() {
    return function(scope, elm, attr) {
        $(elm).niceScroll({
            cursorcolor: "#6F6F6F",
            cursorwidth: "12px",
            cursorborder: "0px solid #fff",
            'z-index': '1000',
            hidecursordelay: 8000,
            railVisible: true,
            scrollspeed: 60,
            // background: "#fff"

            // size: '10px',
            // color: '#888888',
            railVisible: true
            //       railColor: '#fff'
        });
    };
});

angularApp.directive('fixScroll', function() {
    return function(scope, elm, attr) {
        $(window).scroll(function() {
            if ($(window).scrollTop() > 10)
                $(elm).css('position', 'fixed');
            else
                $(elm).css('position', '');
            //console.log($(window).scrollTop());
        });

    };
});

angularApp.directive('maxHeight', function() {
    return function(scope, elm, attr) {
        var wh = $(window).height();
        var tt = $(elm).offset().top;
        $(elm).css('max-height', (wh - tt - 10)).css('height', (wh - tt - 30));

        $(window).resize(function() {
            wh = $(window).height();
            tt = $(elm).offset().top;
            $(elm).css('height', (wh - tt - 40));
        });

        //		$(elm).scroll(function() {
        //			if($(this).scrollTop() > 20)
        //				//$(this).css({'box-shadow':'0 4px 6px -6px rgba(0,0,0,0.4) inset', 'z-index':'100000'});
        //				$(this).addClass('in-top-shadow');
        //			else
        //				$(this).removeClass('in-top-shadow');
        //			//console.log($(this).scrollTop());
        //		});
    };
});

//angularApp.directive('toolTip', function() {
//    return function(scope, element, attrs) {
//        $(element).tooltip(); //.find('[data-toggle="tooltip"]')
//    };
//});

angularApp.directive('showmore', function() {
    return function(scope, element, attrs) {
        //console.log( Object.keys(scope.fields));
        $(element).click(function() {
            if ($('.showme').css('overflow') == 'auto') {
                $('.showme').scrollTop(0).css('overflow', 'hidden');
                $(this).text('more..')

            } else {
                $('.showme').css('overflow', 'auto');
                $(this).text('less..');
            }

        });
    };
});


angularApp.directive('setWidth', ['$timeout',
    function($timeout) {
        return {
            link: function($scope, element, attrs) {
                $timeout(function() {
                    $('head').append('<style>.in-fix-scroll{width:' + $('#main-content').width() + 'px}</style>');
                }, 0, false);
            }
        };
    }
]);

angularApp.directive('hidePop', function() {
    return function(scope, element, attrs) {
        $(element).click(function() {
            $('.popover').hide();
        });
    };
});

angularApp.directive('toggleEle', function() {
    return function(scope, element, attrs) {
        $(element).click(function() {
            $(attrs.toggletarget).toggle();
        });
    };
});


angularApp.directive('clickHideShow', function() {
    return function(scope, element, attrs) {
        $('#' + element.attr('clickHide')).click(function() {
            $(element).hide();
        });

        var li = $('.minfo').offset().left;
        var ti = (li) - 190;
        $('.info-block').css('left', ti);

        $(window).resize(function() {
            li = $('.minfo').offset().left;
            ti = (li) - 210;
            $('.info-block').css('left', ti);
        });
    };
});

angularApp.directive('altRender', function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs, ngModel) {
            var parent = element.prev('div');
            if (parent.attr('class') == null || parent.attr('class').split(' ').indexOf(attrs.hasparent) == -1 || parent.children().length == parseInt(attrs.hascount))
                $(element).wrapAll("<div class=" + attrs.hasparent + ">");
            else
                parent.append(element);
        }
    }
});

angularApp.directive('rules', function($compile) {
    return {
        restrict: "A",
        link: function(scope, ele) {
            scope.opraters = {
                equalTo: 'Equal To',
                isInList: 'Is In List',
                lessThanEqualTo: 'Less Than Or Equal To',
                greaterThanEqualTo: 'Greater Than Or Equal To',
                lessThan: 'Less Than',
                greaterThan: 'Greater Than',
                isNotInList: 'Is Not In List',
                notEqualTo: 'Not Equal To',
                contains: 'Contains',
                doesNotContain: 'Does Not Contains',
                betweenInclusive: 'Between Inclusive',
                betweenExclusive: 'Between Exclusive',
                beginsWith: 'Begins With',
                doesNotBeginWith: 'Does Not Begin With',
                endsWith: 'Ends With',
                doesNotEndWith: 'Does Not End With',
                day: 'Day'
            };
            var template = null;

            function getCondition() {
                return '<div group="condition" class="row rule"><div class="col-md-12 condition">' +
                    '<select cname="name" ui-select2 onchange="angular.element(\'#rules\').scope().applyCondition(this)" class="input-medium" placeholder="Field Name">' +
                    '<option value="-1">-- Select Field --</option>' +
                    '<option ng-repeat="(k,v) in fields" value="{{k}}">{{v.label}}</option></select>' +
                    '<select cname="operator" ui-select2 placeholder="Operator" onchange="angular.element(\'#rules\').scope().applyCondition(this)" class="input-medium">' +
                    '<option ng-repeat="(k,o) in opraters" value="{{k}}">{{o}}</option></select>' +
                    '<input cname="value" class="input-medium" type="text"  maxlength="100" placeholder="value" name="ruleTag" />' +
                    '<label class="iz-switch"><input name="isField" onchange="angular.element(\'#rules\').scope().applyCondition(this)" class="ace ace-switch" type="checkbox"><span class="lbl"></span></label>' +
                    '<button class="command" onclick="angular.element(\'#rules\').scope().removeCondition(this)" data-toggle="tooltip" data-placement="top" tool-tip type="button" data-original-title="Remove Condition"><i class="fa fa-trash-o"></i></button></div></div>';
            }

            function getSubCondition(i, sel) {
                var r = Date.now() + i;
                return '<div index="' + i + '" class="row rule" ' + (i == 0 ? 'style="padding: 10px 0 0 5px;"' : '') + '><div class="col-md-12 sub-condition"><div class="inz-chk">' +
                    '<input type="checkbox" id="c' + r + '" class="btn-opt" ' + (sel == "and" ? 'checked' : '') + ' />' +
                    '<label class="btn-opt-lbl" for="c' + r + '"></label></div><span class="text"> of the following rules:</span>' +
                    '<button type="button" tool-tip data-placement="top" data-toggle="tooltip" title="Add Sub Condition" onclick="angular.element(\'#rules\').scope().addSubCondition(this)" class="btn btn-sm inz-btn btn-success btn-ico btn-round"><i class="fa fa-plus"></i></button>' +
                    '<button type="button" tool-tip data-placement="top" data-toggle="tooltip" title="Add Condition" onclick="angular.element(\'#rules\').scope().addCondition(this)" class="btn btn-sm inz-btn btn-success btn-ico btn-round"><i class="fa fa-chevron-right"></i></button>' +
                    (i == 0 ? '' : '<button type="button" tool-tip data-placement="top" data-toggle="tooltip" onclick="angular.element(\'#rules\').scope().removeCondition(this,true)" title="Remove" class="btn btn-sm inz-btn btn-success btn-ico btn-round"><i class="fa fa-trash-o"></i></button>');
            }

            scope.addCondition = function(e) {
                var parent = $(e).parent();
                parent.append($compile(getCondition())(scope));
            };


            scope.objf = {
                formatResult: function formatSelection2(data) {
                    if (data.text.indexOf('()') >= 0)
                        return "<div class='green'> <i class='fa-bolt icon-white'></i>&nbsp;" + data.text + "</div>";
                    else
                        return data.text;
                },
                formatSelection: function formatSelection2(data) {
                    if (data.text.indexOf('()') >= 0)
                        return "<div> <button class='inz-btn btn-xs btn-warning'><i class='fa-bolt icon-white'></i> &nbsp;" + data.text + "</button></div>";
                    else
                        return data.text;
                }
            };

            scope.addSubCondition = function(e) {
                var parent = $(e).parent();
                var i = parseInt(parent.parent().attr("index")) + 1;
                parent.append($compile(getSubCondition(i, 'and') + getCondition())(scope));
            };

            scope.removeCondition = function(e, isParent) {
                function rc(els) {
                    var i = 0;
                    if ($(e).data('isDisabled')) {
                        for (; i < els.length; i++) els.eq(i).removeAttr('disabled');
                        $(e).data('isDisabled', false).attr('data-original-title', 'Add Condition');
                    } else {
                        for (; i < els.length; i++) els.eq(i).attr('disabled', 'disabled');
                        $(e).data('isDisabled', true).attr('data-original-title', 'Remove Condition');
                    }
                }

                if (isParent) {
                    rc($(e).parent().find('[cname],button,input[type="checkbox"]'));
                    $(e).removeAttr('disabled');
                } else
                    rc($(e).parent().find('[cname]'));
            };

            scope.applyCondition = function(e) {
                if (e.value != '-1') {
                    var parent = $(e).parent().parent();
                    var type = scope.fields[e.value] ? scope.fields[e.value].type : scope.fields[parent.find('select[cname="name"]').val()].type;
                    var ele = parent.find('[cname="value"]');
                    if (e.hasAttribute('cname')) {
                        if (ele.length) {
                            if (e.getAttribute('cname') === "operator" && $(e).val().indexOf('InList') !== -1) {
                                if (ele[0].tagName !== 'TEXTAREA')
                                    ele.replaceWith('<textarea cname="value" class="input-medium" placeholder="value" name="ruleTag">');
                            } else if (parent.find('select[cname="operator"]').val().indexOf('InList') === -1) {
                                if (ele.hasClass('hasDatepicker') || (ele.length && ele[0].tagName === 'TEXTAREA')) {
                                    var $tempObj = $('<input cname="value" class="input-medium" type="text" maxlength="100" placeholder="value" name="ruleTag" />');
                                    ele.replaceWith($tempObj);
                                    ele = $tempObj;
                                }
                                if (type === 'date')
                                    ele.datepicker({
                                        dateFormat: "yy-mm-dd"
                                    });
                                else if (type === 'numeric')
                                    ele.addClass('numeric');
                                else if (ele.hasClass('numeric'))
                                    ele.removeClass('numeric');
                            }
                            ele.attr('ftype', type);
                        }
                    } else {
                        if (parent.find('select[cname="name"]').val() != '-1') {
                            if (e.checked) {
                                scope.allFields = scope.destinationFields ? scope.destinationFields : scope.fields;
                                ele.replaceWith($compile('<select cname="matchField" ui-select2="objf" class="input-medium," placeholder="Field Name">' +
                                    '<option ng-repeat="(k,v) in allFields" value="{{k}}">{{v.label}}</option></select>')(scope));
                                //                                parent.append();
                            } else if (parent.find(' > select[cname="matchField"]').length) {
                                var ele = parent.find(' > select[cname="matchField"]');
                                var type = scope.fields[parent.find('select[cname="name"]').val()].type;
                                var newEle = null;
                                ele.prev().remove();
                                if (parent.find('select[cname="operator"]').val().indexOf('InList') === -1)
                                    newEle = $('<input class="input-medium" cname="value" type="text" maxlength="100" name="ruleTag" placeholder="value"/>');
                                else newEle = $('<textarea cname="value" class="input-medium" ftype="' + type + '" placeholder="value" name="ruleTag">');

                                if (type == 'date')
                                    newEle.datepicker({
                                        dateFormat: "yy-mm-dd"
                                    });
                                else if (type == 'numeric')
                                    newEle.addClass('numeric');
                                ele.replaceWith(newEle);
                            }
                        } else e.checked = !e.checked;
                    }
                }
            };

            function generateRules(c, level) {
                if (template == null)
                    template = $('<div>' + getSubCondition(level, c.condition));
                else
                    template.find('div[index="' + (parseInt(level) - 1) + '"] > div.sub-condition').append(getSubCondition(level, c.condition));

                for (var i = 0; i < c.fields.length; i++) {
                    if ('condition' in c.fields[i]) generateRules(c.fields[i], c.fields[i].level);
                    else {
                        if (c.fields[i].value == null)
                            c.fields[i].value = '';
                        var typeClass = '';
                        if (scope.fields[c.fields[i].name].type == "date")
                            typeClass = ' datepicker';
                        else if (scope.fields[c.fields[i].name].type == "numeric")
                            typeClass = ' numeric';

                        template.find('div[index="' + level + '"] > div.sub-condition:last').append('<div group="condition" class="row rule"><div class="col-md-12 condition">' +
                            '<select cname="name" ui-select2 class="input-medium" placeholder="Field Name" onchange="angular.element(\'#rules\').scope().applyCondition(this)">' +
                            '<option value="' + c.fields[i].name + '" selected>' + scope.fields[c.fields[i].name].label + '</option>' +
                            '<option ng-repeat="(k,v) in fields" value="{{k}}" ng-if="k!=\'' + c.fields[i].name + '\'">{{v.label}}</option></select>' +
                            '<select cname="operator" ui-select2 placeholder="Operator" onchange="angular.element(\'#rules\').scope().applyCondition(this)" class="input-medium">' +
                            '<option value="' + c.fields[i].operator + '" selected>' + scope.opraters[c.fields[i].operator] + '</option>' +
                            '<option ng-repeat="(k,o) in opraters" value="{{k}}" ng-if="k!=\'' + c.fields[i].operator + '\'">{{o}}</option></select>' +
                            ('matchField' in c.fields[i] ? '<select cname="matchField" ui-select2 class="input-medium">' +
                                '<option value="' + c.fields[i].matchField + '" selected>' + (scope.fields[c.fields[i].matchField] ? scope.fields[c.fields[i].matchField].label : scope.destinationFields[c.fields[i].matchField].label) + '</option>' +
                                '<option ng-repeat="(k,v) in fields" value="{{k}}" ng-if="k!=\'' + c.fields[i].matchField + '\'">{{v.label}}</option></select>' :
                                (c.fields[i].operator.indexOf('InList') === -1 ? '<input class="input-medium' + typeClass + '" cname="value" type="text" maxlength="100" name="ruleTag" value="' + c.fields[i].value + '" />' :
                                    '<textarea cname="value" class="input-medium" ftype="' + c.fields[i].type + '" placeholder="value" name="ruleTag">' + c.fields[i].value + '</textarea>')) +
                            '<label class="iz-switch"><input name="isField" placeholder="value" ' + ('matchField' in c.fields[i] ? 'checked="true"' : '') + ' onchange="angular.element(\'#rules\').scope().applyCondition(this)" class="ace ace-switch" type="checkbox"><span class="lbl"></span></label>' +
                            '<button class="command" onclick="angular.element(\'#rules\').scope().removeCondition(this)" data-toggle="tooltip" data-placement="top" tool-tip type="button" data-original-title="Remove Condition"><i class="fa fa-trash-o"></i></button></div></div>');
                    }
                }
                template.find('input.datepicker').datepicker({
                    dateFormat: "yy-mm-dd"
                });
            }

            scope.$watch('rule.conditions', function() {
                if (scope.rule.conditions.ruleDef == null)
                    template = '<div>' + getSubCondition(0, 'and') + getCondition();
                else {
                    template = null;
                    generateRules(scope.rule.conditions.ruleDef, 0);
                }
                ele.html($compile(template)(scope));

                $('div[rules]').on('blur', 'input.numeric', function(e) {
                    var numeric = /^[0-9]{0,}$/;
                    if (!numeric.test(this.value))
                        this.value = '';
                });
            }, true);

            if (scope.destinationFields)
                scope.$watch('rule.destinationFields', function() {
                    scope.allFields = scope.destinationFields ? scope.destinationFields : scope.fields;
                });
        }
    }
});

angularApp.directive('validateForm', function() {
    return {
        restrict: "A",
        link: function(scope, ele, attrs) {
            scope.$watch('form.' + attrs.name + '.$valid', function(newValue) {
                if (newValue)
                    $('button#saveSys').removeAttr('disabled').removeClass('disabled');
                else
                    $('button#saveSys').attr('disabled', 'disabled').addClass('disabled');
            });
        }
    }
});

angularApp.directive('menuGroup', function() {
    return {
        restrict: "A",
        link: function(scope, ele, attrs) {
            ele.click(function(e) {
                e.stopPropagation();
            });
            ele.on('click', 'li', function(e) {
                if ($(this).children().length < 2) {
                    ele.find('button.dropdown-toggle').html($(this).text() + ' <i class="fa fa-angle-down"></i>');
                    ele.removeClass('open');
                }
            });
        }
    }
});

//To Stop Click Event Propagation Use class filter-ddm
angularApp.directive('filterDdm', function() {
    return {
        restrict: "C",
        link: function(scope, ele) {
            ele.click(function(e) {
                e.stopPropagation();
            });
        }
    }
});

angularApp.directive('toggleTable', function($compile, flash, $filter, commonService, $window) {
    return {
        restrict: "A",
        link: function(scope, ele, attrs) {
            var cols;
            // take the header of table if present
            if(attrs.metaKeys) {
                cols = JSON.parse(attrs.metaKeys);
            }
             //= ['region', 'subRegion', 'country', 'station', 'scope', 'accountGroup', 'account', 'status', 'substatus']; // Add remove columns from here and from HTML Page
            var ageGroupLength = null;

            function getData(params, ele) {
                scope.loader = true;

                // first it was get request, so params where appended
                // converting to put request, store in json
                // params is in get req format, split and change it in (key,value) format
                var bprJson = new Object();
                bprJson.date = scope.entryDate ? $filter('date')(scope.entryDate, "yyyy-MM-dd") : '';
                //current date and time in local format
                bprJson.currentTime = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
                if (angular.isString(params)) { // coming is get req parameter
                    var allParams = params.split("&");
                    for (var i = 0; i < allParams.length; i++) {
                        var hash = allParams[i].split("=");
                        if (hash.length == 2)
                            bprJson[hash[0]] = hash[1];
                    } //for
                }
                bprJson.condition = scope.selectedFilterFields;


                var dataPromise = commonService.ajaxCall('PUT', '/api/bpR', bprJson);
                dataPromise.then(function(result) {
                    if (params && angular.isString(params)) createHtml(ele, result.data);
                    else {
                        scope.initData = result;
                        ageGroupLength = result.headers.length;
                        if (result.updatedOn) {
                            scope.updatedOn = "Last updated on : " + result.updatedOn.split(".")[0];
                        } else {
                            scope.updatedOn = "";
                        }
                    }
                    scope.loader = false;
                }, function(result) {
                    flash.pop({
                        title: 'Alert',
                        body: result.data,
                        type: 'error'
                    });
                    scope.loader = false;
                });
            }

            scope.$watch('entryDate', function() {
                getData('');
            });

            // expose getData function to parent controllers
            scope.getSummaryData = function(params, ele) {
                getData(params, ele);
            }

            function removeRows($ele, index, icone) {
                if (icone) {
                    icone[0].setAttribute('class', 'fa fa-folder folder2');
                    $ele.nextAll('td').show();
                }
                var nextAll = $ele.parent().nextAll('tr');
                for (var i = 0; i < nextAll.length; i++) {
                    if (nextAll.eq(i).find('td').eq(index).text() == "All")
                        break;
                    nextAll.eq(i).remove();
                }
            }

            function compareDates(date1, date2) {
                return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
            }


            function createHtml($ele, data) {
                var html = '';
                var name = $ele[0].id.split('_')[0];
                var leftTdCount = $ele.prevAll('td').length;
                var newTdCount = (cols.length - 1) - leftTdCount;
                $ele.nextAll('td').hide();
                var tds = '';
                for (var j = 0; j < leftTdCount; j++)
                    tds += "<td></td>";

                for (var i = 0; i < data.length; i++) {
                    html += '<tr class="minus">' + tds + '<td id="' + name + '_' + i + '"><i class="d"></i>' + data[i][name] + '</td>';
                    for (var j = 0; j < newTdCount; j++)
                        html += '<td ng-click="fillData($event.target)" id="' + cols[leftTdCount + j + 1] + '_' + leftTdCount + j + '"><i class="fa fa-folder folder2"></i>All</td>';
                    for (var k = 0; k < ageGroupLength; k++)
                        html += '<td class="center-text" ng-click="showDetails($event.target,' + k + ')">' + data[i].ageGroup[k].count + ' | $' + data[i].ageGroup[k].amount + '</td>';
                    html += '<td class="center-text" ng-click="showDetails($event.target,' + k + ')"><div class="lbldash">' + data[i].total.count + ' | $' + data[i].total.amount + '</div></td></tr>';
                }
                $ele.parent().after($compile(html)(scope));
            }

            scope.fillData = function(ele) {

                if (ele.hasAttribute('class') && ele.tagName.toLowerCase() !== "td")
                    ele = $(ele).parent()[0];

                var $ele = $(ele);
                var preTds = $ele.prevAll('td');
                var icone = $ele.children('i');
                if (icone.hasClass('fa-folder')) {
                    icone[0].setAttribute('class', 'fa fa-folder-open folder2');
                    var nextRowEleText = $ele.parent().next().find('td').eq(preTds.length).text();
                    if (nextRowEleText != 'All') removeRows($ele, preTds.length);
                    getData('for=' + ele.id.split('_')[0] + getColValues($ele), $ele);
                } else removeRows($ele, preTds.length, icone);
            };

            scope.showDetails = function(ele, col) {
                scope.loader = true;
                if (scope.entryDate == null || compareDates(scope.entryDate, new Date())) {
                    if (ele) {
                        ele = ele.tagName === "TD" ? $(ele) : $(ele).parent().eq(0);
                        // value contains count and amount hence split and take the count for pagination
                        scope.pagination.totalItems = ele.text().split("|")[0];
                        scope.pagination.currentPage = 1;
                        scope.detailsUrl = '/api/bpRdetail?' + (scope.entryDate ? 'entryDate=' + $filter('date')(scope.entryDate, "yyyy-MM-dd") + '&' : '') + getColValues(ele, col) + '&pageLimit=' + scope.pagination.pageLimit;
                    }
                    var promise = commonService.ajaxCall('GET', scope.detailsUrl + '&pageNo=' + scope.pagination.currentPage);
                    promise.then(function(result) {
                        scope.details = {};
                        scope.exclude = [];
                        scope.details = result;
                        //                        scope.pagination.totalItems = result.count;
                        scope.dialog = true;
                        setTimeout('$("input.ex").attr("checked",false);', 50);
                        scope.loader = false;
                    }, function(result) {
                        flash.pop({
                            title: 'Alert',
                            body: result.data,
                            type: 'error'
                        });
                        scope.loader = false;
                    });
                } else flash.pop({
                    title: 'Invalid Date',
                    body: 'Details are available for the current date only!',
                    type: 'warning'
                });
            };

            function getColValues($ele, col) {
                var fieldsCount = cols.length - 1;
                var preTds = $ele.parent().find('td:lt(' + fieldsCount + 1 + ')');
                var query = col != null ? 'ageGroup=' + $('table.inz-table th').eq(col + fieldsCount + 1).text() : '';
                var colText = null;
                while (fieldsCount !== -1) {
                    colText = $.trim(preTds.eq(fieldsCount).text());
                    if (colText && colText != 'All') {
                        query += ('&' + preTds[fieldsCount].id.split('_')[0] + '=' + colText);
                        preTds = preTds.parent().prev().find('td:lt(' + (fieldsCount) + ')');
                        --fieldsCount;
                    } else if (colText === "")
                        preTds = preTds.parent().prev().find('td:lt(' + (fieldsCount + 1) + ')');
                    else --fieldsCount;
                }
                return query;
            }
        }
    };
});

//angularApp.directive('treeTable', function($compile,flash,$filter,commonService) {
//    return {
////        restrict: "E",
////        scope: {
////            headers: '=',
////            data:'='
////		},
//        link: function(scope, ele, attrs) {
//            scope.$watch(attrs.treeTable,function(newVal){
//            if(newVal) {
//                var cols = newVal.headers;//['region', 'subRegion', 'country', 'station', 'accountGroup', 'account', 'status', 'substatus'];
//                var ageGroupLength = null;
//
//                function getData(params, ele) {
//                    scope.loader = true;
//                    var dataPromise = commonService.ajaxCall('GET', '/api/bpR?' + (scope.entryDate ? 'date=' + $filter('date')(scope.entryDate, "yyyy-MM-dd") : '') + params);
//                    dataPromise.then(function (result) {
//                        if (params) createHtml(ele, result.data);
//                        else {
//                            scope.initData = result;
//                            ageGroupLength = result.headers.length;
//                        }
//                        scope.loader = false;
//                    }, function (result) {
//                        flash.pop({
//                            title: 'Alert',
//                            body: result.data,
//                            type: 'error'
//                        });
//                        scope.loader = false;
//                    });
//                }
//
//                scope.$watch('entryDate', function () {
//                    getData('');
//                });
//
//                function removeRows($ele, index, icone) {
//                    if (icone) {
//                        icone[0].setAttribute('class', 'fa fa-folder folder2');
//                        $ele.nextAll('td').show();
//                    }
//                    var nextAll = $ele.parent().nextAll('tr');
//                    for (var i = 0; i < nextAll.length; i++) {
//                        if (nextAll.eq(i).find('td').eq(index).text() == "All")
//                            break;
//                        nextAll.eq(i).remove();
//                    }
//                }
//
//
//                function createHtml($ele, data) {
//                    var html = '';
//                    var name = $ele[0].id.split('_')[0];
//                    var leftTdCount = $ele.prevAll('td').length;
//                    var newTdCount = (cols.length - 1) - leftTdCount;
//                    $ele.nextAll('td').hide();
//                    var tds = '';
//                    for (var j = 0; j < leftTdCount; j++)
//                        tds += "<td></td>";
//
//                    for (var i = 0; i < data.length; i++) {
//                        html += '<tr class="minus">' + tds + '<td id="' + name + '_' + i + '"><i class="d"></i>' + data[i][name] + '</td>';
//                        for (var j = 0; j < newTdCount; j++)
//                            html += '<td ng-click="fillData($event.target)" id="' + cols[leftTdCount + j + 1] + '_' + leftTdCount + j + '"><i class="fa fa-folder folder2"></i>All</td>';
//                        for (var k = 0; k < ageGroupLength; k++)
//                            html += '<td ng-click="showDetails($event.target,' + k + ')">' + data[i].ageGroup[k] + '</td>';
//                        html += '<td ng-click="showDetails($event.target,' + k + ')"><div class="lbldash">' + data[i].total + '</div></td></tr>';
//                    }
//                    $ele.parent().after($compile(html)(scope));
//                }
//
//                scope.fillData = function (ele) {
//
//                    if (ele.hasAttribute('class'))
//                        ele = $(ele).parent()[0];
//
//                    var $ele = $(ele);
//                    var preTds = $ele.prevAll('td');
//                    var icone = $ele.children('i');
//                    if (icone.hasClass('fa-folder')) {
//                        icone[0].setAttribute('class', 'fa fa-folder-open folder2');
//                        var nextRowEleText = $ele.parent().next().find('td').eq(preTds.length).text();
//                        if (nextRowEleText != 'All') removeRows($ele, preTds.length);
//                        getData('&for=' + ele.id.split('_')[0] + getColValues($ele), $ele);
//                    }
//                    else removeRows($ele, preTds.length, icone);
//                };
//
//                scope.showDetails = function (ele, col) {
//                    scope.loader = true;
//                    if (ele) {
//                        ele = ele.tagName==="TD"?$(ele) : $(ele).parent().eq(0);
////                        var $ele = $(ele);
//                        scope.pagination.totalItems = $ele.text();
//                        scope.pagination.currentPage = 1;
//                        scope.detailsUrl = '/api/bpRdetail?' + (scope.entryDate ? 'entryDate=' + $filter('date')(scope.entryDate, "yyyy-MM-dd") + '&' : '') + getColValues(ele, col) + '&pageLimit=' + scope.pagination.pageLimit;
//                    }
//                    var promise = commonService.ajaxCall('GET', scope.detailsUrl + '&pageNo=' + scope.pagination.currentPage);
//                    promise.then(function (result) {
//                        scope.details = {};
//                        scope.exclude = [];
//                        scope.details = result;
//                        scope.dialog = true;
//                        setTimeout('$("input.ex").attr("checked",false);', 50);
//                        scope.loader = false;
//                    }, function (result) {
//                        flash.pop({
//                            title: 'Alert',
//                            body: result.data,
//                            type: 'error'
//                        });
//                        scope.loader = false;
//                    });
//                };
//
//                function getColValues($ele, col) {
//                    var fieldsCount = cols.length - 1;
//                    var preTds = $ele.parent().find('td:lt(' + fieldsCount + 1 + ')');
//                    var query = col != null ? 'ageGroup=' + $('table.inz-table th').eq(col + fieldsCount + 1).text() : '';
//                    var colText = null;
//                    while (fieldsCount !== -1) {
//                        colText = $.trim(preTds.eq(fieldsCount).text());
//                        if (colText && colText != 'All') {
//                            query += ('&' + preTds[fieldsCount].id.split('_')[0] + '=' + encodeURIComponent(colText));
//                            preTds = preTds.parent().prev().find('td:lt(' + (fieldsCount) + ')');
//                            --fieldsCount;
//                        }
//                        else if (colText === "")
//                            preTds = preTds.parent().prev().find('td:lt(' + (fieldsCount + 1) + ')');
//                        else --fieldsCount;
//                    }
//                    return query;
//                }
//            }
//            });
//        }
//    };
//});

angularApp.directive('fixedHeader', function() {
    return {
        link: function(scope, ele, attrs) {
            scope.$watch(attrs.fixedHeader, function(val) {
                console.log(val);
                if (val) {
                    var tabs = ele.find('table');
                    tabs.eq(0).css('position', 'fixed');
                    var tds = tabs.eq(1).find('tr > td');
                    angular.forEach(tabs.eq(0).find('td'), function(el, i) {
                        el.style.width = tds.eq(i).css('width');
                    });
                }

            });
            //            scope.$watch(function() {return dts.eq(0).width();},function(n,o){console.log(n)});
            //
            //            setTimeout(function() {
            //                var dts = ele.next().find('tr').eq(0).find('td');
            //
            //                $.each(ele.find('th'), function (i,th) {
            //                    th.style = dts[i].style;
            //                    th.setAttribute('class',dts[i].getAttribute('class'));
            //                    //$(th).css({'text-overflow':'ellipsis','overflow':'hidden','max-width':dts.eq(i).width(),'width':dts.eq(i).width()});
            //                    console.log(dts.eq(i).width());
            //                });

        }
    }
});

angularApp.directive('innerHtml', function($compile, commonService) {
    return {
        link: function(scope, ele) {
            var msg = commonService.getHtml();
            if (msg) ele.html($compile(msg)(scope));
        }
    }
});