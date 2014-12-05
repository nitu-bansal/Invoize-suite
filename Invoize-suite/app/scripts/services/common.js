/**
 * Created by kamalsingh.saini on 30/10/13.
 */
'use strict';

angularApp.service('commonService', function($http, $location, $rootScope, CryptionService, $q, flash) {
    var invalidMsgList = [];
    var chtml = null;

    var self = {
        ajaxCall: function remoteCall(type, url, reqData) {
            var deferred = $q.defer();
            var separator = url.indexOf('?') === -1 ? '?' : '&';
            var configUrl = url + separator + 'noCache=' + new Date().getTime();
            $http({

                method: type,
                url: configUrl,
                headers: {
                    currentContext: $rootScope.currentContext
                },
                data: reqData
            }).success(function(data, status, headers, config) {
                deferred.resolve(data);
            }).
            error(function(data, status, headers, config) {
                self.loader();
                if (status == 401)
                    $location.path("/main/landing");
                else if (status == 500)
                    deferred.reject({
                        'data': 'Please try after some time.',
                        'status': status
                    });
                else
                    deferred.reject({
                        'data': data,
                        'status': status
                    });
            });
            return deferred.promise;
        },
        getSelect2Ajax: function(ph, obj) { //obj to append request obj.
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
                        selected: '', //selected values
                        suggestionFor: ph // suggestions for
                    };
                    if (obj) {
                        var c = JSON.parse(obj);
                        for (var k in c)
                            s[k] = c[k];
                    }
                    return s;
                },
                results: function(data, page) {
                    var more = false;
                    data.total = 100;
                    if (data.msg.length > 9)
                        more = (page * 10) < data.total;
                    return {
                        results: data.msg,
                        more: more
                    };
                }
            }
        },
        validateGridData: function(data, columns, templateId, action) {
            var arrInvalidMsg = [];
            var inValid = false;
            var inValidData = [];
            var invalidRow = {};


            function isValidDate(value) {
                try {
                    if (Object.prototype.toString.call(value) === "[object String]")
                        value = new Date(value);
                    if (Object.prototype.toString.call(value) === "[object Date]") {
                        // d.valueOf() could also work
                        return !isNaN(value.getTime());
                    } else
                        return false;
                } catch (e) {
                    return false;
                }
            }


            var tmpCnt = 0;

            if (action == "InvoiceCharges") {
                var validData = {
                    charges: []
                };
                angular.forEach(data, function(k, l) {
                    tmpCnt = tmpCnt + 1;


                    invalidRow = {};
                    invalidRow.mandatory = [];
                    invalidRow.length = [];
                    invalidRow.regex = [];
                    angular.forEach(columns, function(i, j) {
                        if (i.readOnly != true) {
                            if (i.isMandatory) {
                                if (k[i.key] == null) {
                                    invalidRow.mandatory.push(i.key);
                                    inValid = true;
                                }
                            }
                            if (i.type == 'date' && k[i.key] != null && !isValidDate(k[i.key])) {
                                invalidRow.regex.push(i.key);
                                inValid = true;
                            } else {
                                if (i.length != "") {
                                    if (k[i.key] != null && k[i.key].length > i.length) {
                                        invalidRow.length.push(i.key);
                                        inValid = true;
                                    }
                                }
                                if (i.regex != null && i.regex != "") {
                                    var regex = eval(i.regex);
                                    if (k[i.key] != null && !regex.test(k[i.key])) {
                                        invalidRow.regex.push(i.key);
                                        inValid = true;
                                    }
                                }
                            }
                        }
                    });
                    if (inValid) {
                        //                        k.updateField = true;
                        inValidData.push(k);
                        arrInvalidMsg.push(invalidRow);
                        inValid = false;

                    } else {
                        validData.charges.push(k);
                    }

                });
                return {
                    'inValidData': inValidData,
                    'arrInvalidMsg': arrInvalidMsg,
                    'validData': validData
                }
            } else if (action == "directSave") {
                var validData = {
                    data: []
                };
                angular.forEach(data, function(k, l) {
                    tmpCnt = tmpCnt + 1;


                    invalidRow = {};
                    invalidRow.mandatory = [];
                    invalidRow.length = [];
                    invalidRow.regex = [];
                    angular.forEach(columns, function(i, j) {
                        if (i.readOnly != true) {
                            if (i.isMandatory) {
                                if (k[i.key] == null) {
                                    invalidRow.mandatory.push(i.key);
                                    inValid = true;
                                }
                            }
                            if (i.type == 'date' && k[i.key] != null && !isValidDate(k[i.key])) {
                                invalidRow.regex.push(i.key);
                                inValid = true;
                            } else {
                                if (i.length != "") {
                                    if (k[i.key] != null && k[i.key].length > i.length) {
                                        invalidRow.length.push(i.key);
                                        inValid = true;
                                    }
                                }
                                if (i.regex != null && i.regex != "") {
                                    var regex = eval(i.regex);
                                    if (k[i.key] != null && !regex.test(k[i.key])) {
                                        invalidRow.regex.push(i.key);
                                        inValid = true;
                                    }
                                }
                            }
                        }
                    });
                    if (inValid) {

                        inValidData.push(k);
                        arrInvalidMsg.push(invalidRow);
                        inValid = false;

                    } else {
                        validData.data.push(k);
                    }

                });
                return {
                    'inValidData': inValidData,
                    'arrInvalidMsg': arrInvalidMsg,
                    'validData': validData
                }
            } else {
                var validData = {
                    data: []
                };
                angular.forEach(data, function(k, l) {
                    tmpCnt = tmpCnt + 1;
                    if (k.updateField) {
                        k.updateField = false;
                        invalidRow = {};
                        invalidRow.mandatory = [];
                        invalidRow.length = [];
                        invalidRow.regex = [];
                        angular.forEach(columns, function(i, j) {
                            if (i.readOnly != true) {
                                if (i.isMandatory) {
                                    if (k[i.key] == null) {
                                        invalidRow.mandatory.push(i.key);
                                        inValid = true;
                                    }
                                }
                                if (i.type == 'date' && k[i.key] != null && !isValidDate(k[i.key])) {
                                    invalidRow.regex.push(i.key);
                                    inValid = true;
                                } else {
                                    if (i.length != "") {
                                        if (k[i.key] != null && k[i.key].length > i.length) {
                                            invalidRow.length.push(i.key);
                                            inValid = true;
                                        }

                                    }
                                    if (i.regex != null && i.regex != "") {
                                        var regex = eval(i.regex);
                                        if (k[i.key] != null && !regex.test(k[i.key])) {
                                            invalidRow.regex.push(i.key);
                                            inValid = true;
                                        }

                                    }
                                }
                            }
                        });
                        if (inValid) {
                            //                        k.updateField = true;
                            inValidData.push(k);
                            arrInvalidMsg.push(invalidRow);
                            inValid = false;

                        } else {
                            k.templateId = templateId;
                            if (action == 'calculateTariff') {
                                k.rownum = tmpCnt;
                            }

                            validData.data.push(k);

                        }
                    }
                });
                return {
                    'inValidData': inValidData,
                    'arrInvalidMsg': arrInvalidMsg,
                    'validData': validData
                }
            }


        },
        setInvalList: function(d) {
            invalidMsgList = d;
        },
        cellRenderer: function(instance, td, row, col, prop, value, cellProperties) {
            if (cellProperties.type == 'autocomplete')
                Handsontable.AutocompleteCell.renderer.apply(this, arguments);
            else if (cellProperties.type == 'date')
                Handsontable.DateCell.renderer.apply(this, arguments);
            else
                Handsontable.TextCell.renderer.apply(this, arguments);

            if (row === 0) {
                setTimeout(function() {
                    var headers = instance.$table.find('thead th');
                    for (var i = 0; i < headers.length; i++)
                        if (cellProperties.columns[col] && headers.eq(i).text() === cellProperties.columns[col].title) {
                            headers[i].title = cellProperties.toolTip || '';
                            break;
                        }
                }, 1000);
            }
            td.title = value || '';
            if (invalidMsgList.length - 1 >= row) {
                var colIndx = invalidMsgList[row].mandatory.indexOf(prop);
                if (colIndx != -1) {
                    td.title = 'Mandatory!\n';
                    td.style.backgroundColor = 'pink';
                }
                colIndx = invalidMsgList[row].length.indexOf(prop);
                if (colIndx != -1) {
                    td.title += 'Length Exceed!\n';
                    td.style.backgroundColor = 'pink';
                }
                colIndx = invalidMsgList[row].regex.indexOf(prop);
                if (colIndx != -1) {
                    if (invalidMsgList[row].serverMsg != null)
                        td.title += invalidMsgList[row].serverMsg[prop];
                    else
                        td.title += cellProperties.errorMessage;
                    td.style.backgroundColor = 'pink';
                }
            }
            td.innerHtml = value;
            return td;
        },
        loader: function(show) {
            var ele = $("div.loader-backdrop");
            if (show)
                ele.show();
            else
                ele.fadeOut(500);
        },
        createColumns: function(fieldName, fields, cellRenderer, system) {
            if (cellRenderer == null)
                cellRenderer = this.cellRenderer;
            var sc = fields.sort(function(a, b) {
                return parseInt(a.displayOrder) - parseInt(b.displayOrder)
            });

            var columns = [{
                value: fieldName + '.updateField',
                type: 'checkbox',
                title: 'update',
                width: 50
            }];

            angular.forEach(sc, function(col) {
                if (col.isActive) {
                    switch (col.type) {
                        case 'dropdown':
                        case 'multiselect':
                            columns.push({
                                value: fieldName + '.' + col.key,
                                type: 'autocomplete',
                                title: col.label,
                                src: col.suggestionsSource + (system ? '&systemId=' + system : ''),
                                width: col.length * 9,
                                length: col.length,
                                renderer: cellRenderer,
                                isMandatory: col.isMandatory,
                                key: col.key,
                                readOnly: col.isReadonly,
                                regex: col.regex,
                                toolTip: col.toolTip,
                                errorMessage: col.errorMessage,
                                isDependent: col.isDependent,
                                suggestionField: col.suggestionField,
                                displayOrder: col.displayOrder
                            });
                            break;
                        default:
                            if (col.type == 'multiline')
                                col.type = 'text';
                            columns.push({
                                value: fieldName + '.' + col.key,
                                type: col.type,
                                allowInvalid: false,
                                renderer: cellRenderer,
                                title: col.label,
                                width: col.length * 9,
                                length: col.length,
                                readOnly: col.isReadonly,
                                isMandatory: col.isMandatory,
                                key: col.key,
                                regex: col.regex,
                                toolTip: col.toolTip,
                                errorMessage: col.errorMessage,
                                isDependent: col.isDependent,
                                suggestionField: col.suggestionField,
                                displayOrder: col.displayOrder
                            });
                    }
                }
            });

            return columns;
        },
        applyPermission: function(permission) {
            var isAdmin = CryptionService.decrypt(JSON.parse(localStorage.a));
            if (isAdmin)
                return true;
            var permissions = CryptionService.decrypt(JSON.parse(localStorage.pid));
            if (permissions.split(',').indexOf(permission) === -1) {
                flash.pop({
                    title: 'Permission denied!',
                    body: "You don't have permission to perform this action.",
                    type: 'warning'
                });
                return false;
            }
            return true;
        },
        popError: function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        },
        hideDropPanel: function() {
            setTimeout(function() {
                $('div.btn-group').removeClass('open');
            }, 100);
        },
        setHtml: function(h) {
            chtml = h;
        },
        getHtml: function() {
            return chtml;
        }
    };
    return self;
});