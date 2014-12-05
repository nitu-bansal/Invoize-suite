'use strict';
angularApp.controller('systemMetadataCtrl', function($rootScope, $scope, $location, $timeout, $stateParams, $routeParams, $route, $modal, Restangular, uploadManager, flash, Base64, commonService) {
    $scope.showGrid = false;
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.paginationSize = 20;
    $scope.pageLimit = 500;
    $scope.rowNos = [];
    $scope.hw = null;
    $scope.metadataType = {};
    $scope.metadataTypes = [];
    $scope.metadataType.fields = [{
        isMandatory: false,
        isMasterField: false,
        isUniqueField: false,
        isActive: false,
        isReadonly: false
    }];
    $scope.loader = false;
    var invalidMsgList = [];
    $scope.metadatas = [{
        updateField: null,
        select: null,
        id: null
    }];

    //Start Filter Object
    $scope.rule = {};
    $scope.rule.conditions = {};
    $scope.fields = {};
    $scope.list = [];
    $scope.$parent.filter = {};

    //End Filter Object

    ///function to ser page after paging change event
    $scope.setPage = function() {
        setTimeout(function() {
            angular.element(".pagination").scope().getSystemMetadata(angular.element("li.active.ng-scope").scope().page.number);
        }, 300);
    };

    ///this function is used to intialize the object when page is loaded first time or reset
    $scope.initialMetadataType = function() {
        $scope.metadataType = {};
        $scope.metadataType.fields = [{
            isMandatory: false,
            isMasterField: false,
            isUniqueField: false,
            isActive: false,
            isReadonly: false
        }];
    };

    ///this function is used to intialize the grid when page is loaded
    function initialGrid() {

        $scope.metadatas = [{
            updateField: null,
            select: null,
            id: null
        }];

        $scope.columns = [{
            value: 'metadata.updateField',
            type: 'checkbox',
            title: 'update',
            width: 50
        }, {
            value: 'metadata.select',
            type: 'checkbox',
            title: 'Select',
            width: 50
        }];
    }
    ///handle render events starts
    function renderHT() {
        if ($scope.metadatas != null && $scope.metadatas.length > 20)
            $scope.hh = $(window).height() - 300;
        else
            $scope.hh = null;
        $scope.hw = $('div.page-content').width() - 50;
    }

    $scope.afterRender = function() {
        renderHT();
    }
    ///handle render events ends


    ///handles the cel change event to put some validations on user input for metadata
    $scope.celChangeMetadata = function(values) {
        var cellCount = values.length;
        for (var i = 0; i < cellCount; i++) {
            var dict = _.where($scope.metadataType.fields, {
                key: values[i][1]
            });
            console.log(dict);
            if (dict.length > 0 && dict[0].isReadonly && $scope.metadatas[values[i][0]].id != null) {
                flash.pop({
                    title: 'Alert',
                    body: values[i][1] + " is readonly",
                    type: 'error'
                });
                return false;
            } else {
                if (values[i][3] !== values[i][2]) {
                    if (values[i][3] === '')
                        values[i][3] = null;
                    else if (values[i][3] === 'true' || values[i][3] === 'false')
                        values[i][3] = eval(values[i][3]);
                    if (values[i][1] !== 'updateField' && (!$scope.metadatas[values[i][0]] || !$scope.metadatas[values[i][0]].updateField))
                        values.push([values[i][0], 'updateField', 'null', true]);
                }
            }
        }
        $timeout(renderHT, 1000);
        $scope.$parent.validForm = false;
    }

    var cellRenderer = function(instance, td, row, col, prop, value, cellProperties) {
        if (cellProperties.type == 'autocomplete')
            Handsontable.AutocompleteCell.renderer.apply(this, arguments);
        else if (cellProperties.type == 'date')
            Handsontable.DateCell.renderer.apply(this, arguments);
        else
            Handsontable.TextCell.renderer.apply(this, arguments);

        if (cellProperties.toolTip)
            td.title = cellProperties.toolTip;

        if (invalidMsgList.length - 1 >= row) {
            td.title = '';
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
    }

    function fillRowNos() {
        $scope.rowNos = [];
        for (var i = 1; i <= $scope.metadatas.length; i++)
            $scope.rowNos.push(i);
    }

    /// function to get system metadata list
    $scope.getSystemMetadataList = function(q) {
        $scope.metadataLoader = true;
        commonService.loader(true);
        var promise = commonService.ajaxCall('GET', '/api/metadata?systemId=' + $routeParams.systemId + '&type=systemMetadata&pageLimit=500&pageNo=1&q=' + q + '');
        promise.then(function(result) {
            $scope.metadataTypes = result;
            $scope.metadataLoader = false;
            commonService.loader();
        }, function(result) {
            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
            commonService.loader();
            $scope.metadataLoader = false;
        });
    }

    ///function to get metadatas of metadatatype
    $scope.getSystemMetadata = function(pageNo, isGetCount) {
        if ($scope.selectMetadata != undefined) {
            $scope.metadataLoader = true;
            invalidMsgList = [];
            commonService.loader(true);
            if (isGetCount) {
                var promise1 = commonService.ajaxCall('GET', '/api/metadataSystem?metadataTypeId=' + $scope.selectMetadata[0].id + "&systemId=" + $routeParams.systemId + '&count=true');
                promise1.then(function(data) {
                    $scope.totalItems = data;
                }, function(data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                });
            }
            $scope.currentPage = pageNo;

            var promise = commonService.ajaxCall('GET', '/api/metadataSystem?metadataTypeId=' + $scope.selectMetadata[0].id + "&systemId=" + $routeParams.systemId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo);
            promise.then(function(data) {
                    if (data.length) {
                        $scope.metadatas = data;
                    }
                    $scope.rowNos = [];
                    for (var i = pageNo * 500 - 499; i <= pageNo * 500; i++)
                        $scope.rowNos.push(i);
                    $scope.metadataLoader = false;
                    renderHT();
                    commonService.loader();
                },
                function(data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                    $scope.metadataLoader = false;
                });
        }
    }

    $scope.setMetadataType = function(ListItem) {
        var t = [];
        t.push(ListItem);
        $scope.getMetadataType(t);
    }

    ///function to get the template of metadata
    $scope.getMetadataType = function(t) {
        $scope.selectMetadata = t;

        if ($scope.selectMetadata != undefined) {
            $scope.metadataLoader = true;
            $scope.showGrid = true;
            initialGrid();
            var metadataTypeId = $scope.selectMetadata[0].id;
            var promise = commonService.ajaxCall('GET', '/api/metadataType/' + metadataTypeId);
            promise.then(function(data) {
                    $scope.metadataType = data;
                    if ($scope.metadataType.fields.length == 0) {
                        $scope.metadataType.fields = [{
                            isMandatory: false,
                            isMasterField: false,
                            isUniqueField: false,
                            isActive: false,
                            isReadonly: false
                        }];
                    } else {

                        var sc = $scope.metadataType.fields.sort(function(a, b) {
                            return parseInt(a.displayOrder) - parseInt(b.displayOrder)
                        });

                        if ($scope.selectMetadata[0].n == "metadata_chargeCode") {
                            angular.forEach(sc, function(col, i) {
                                if (col.isActive) {
                                    if (col.key != "userValue" || col.key != "tariffValue" || col.key != "invoiceValue") {
                                        switch (col.type) {
                                            case 'dropdown':
                                            case 'multiselect':
                                                $scope.columns.push({
                                                    value: 'metadata.' + col.key,
                                                    type: 'autocomplete',
                                                    title: col.label,
                                                    //                                            strict: true,
                                                    src: col.suggestionsSource,
                                                    width: col.length * 9,
                                                    length: col.length,
                                                    readOnly: false,
                                                    isMandatory: col.isMandatory,
                                                    key: col.key,
                                                    regex: col.regex,
                                                    toolTip: col.toolTip,
                                                    renderer: cellRenderer,
                                                    suggestionField: col.suggestionField,
                                                    errorMessage: col.errorMessage

                                                })
                                                break;
                                            default:
                                                if (col.type == 'multiline')
                                                    col.type = 'text';
                                                $scope.columns.push({
                                                    value: 'metadata.' + col.key,
                                                    type: col.type,
                                                    allowInvalid: false,
                                                    renderer: cellRenderer,
                                                    title: col.label,
                                                    width: col.length * 9,
                                                    length: col.length,
                                                    readOnly: false,
                                                    isMandatory: col.isMandatory,
                                                    key: col.key,
                                                    regex: col.regex,
                                                    toolTip: col.toolTip,
                                                    errorMessage: col.errorMessage
                                                });
                                        }
                                    }
                                }
                            });
                        } else {
                            angular.forEach(sc, function(col, i) {
                                if (col.isActive) {
                                    switch (col.type) {
                                        case 'dropdown':
                                        case 'multiselect':
                                            $scope.columns.push({
                                                value: 'metadata.' + col.key,
                                                type: 'autocomplete',
                                                title: col.label,
                                                //                                            strict: true,
                                                src: col.suggestionsSource,
                                                width: col.length * 9,
                                                length: col.length,
                                                readOnly: false,
                                                isMandatory: col.isMandatory,
                                                key: col.key,
                                                regex: col.regex,
                                                toolTip: col.toolTip,
                                                renderer: cellRenderer,
                                                suggestionField: col.suggestionField,
                                                errorMessage: col.errorMessage

                                            })
                                            break;
                                        default:
                                            if (col.type == 'multiline')
                                                col.type = 'text';
                                            $scope.columns.push({
                                                value: 'metadata.' + col.key,
                                                type: col.type,
                                                allowInvalid: false,
                                                renderer: cellRenderer,
                                                title: col.label,
                                                width: col.length * 9,
                                                length: col.length,
                                                readOnly: false,
                                                isMandatory: col.isMandatory,
                                                key: col.key,
                                                regex: col.regex,
                                                toolTip: col.toolTip,
                                                errorMessage: col.errorMessage
                                            });
                                    }
                                }
                            });
                        }
                        $scope.getSystemMetadata($scope.currentPage, true);
                        $scope.getRuleFields();
                    }

                    $scope.metadataLoader = false;
                },
                function(data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                    $scope.metadataLoader = false;
                });
        } else {
            $scope.showGrid = false;
        }
    }

    ///function to save metadata
    $scope.saveMetadatas = function() {
        if ($scope.selectMetadata != undefined) {
            invalidMsgList = [];
            var dataTosave = commonService.validateGridData($scope.metadatas, $scope.columns, $scope.selectMetadata[0].id);
            invalidMsgList = dataTosave.arrInvalidMsg;
            if (dataTosave.inValidData.length > 0) {
                $scope.metadatas = dataTosave.inValidData;
                fillRowNos();
            }
            $scope.metadataLoader = true;
            if (dataTosave.validData.data.length > 0) {
                commonService.loader(true);
                console.log(dataTosave.validData);
                var promise = commonService.ajaxCall('PUT', '/api/metadataSystem/' + $routeParams.systemId, dataTosave.validData);
                promise.then(function(data) {
                        commonService.loader();
                        if (dataTosave.inValidData.length > 0) {
                            flash.pop({
                                title: 'Waring',
                                body: 'Grid contains some Invalid data, which is not saved',
                                type: 'warning'
                            });
                            $scope.metadatas = dataTosave.inValidData;
                        } else {
                            flash.pop({
                                title: 'Success',
                                body: data,
                                type: 'success'
                            });
                            $scope.getSystemMetadata($scope.currentPage, true);
                            $scope.getSystemMetadataList();
                        }
                        $scope.metadataLoader = false;
                    },
                    function(data) {
                        $scope.metadataLoader = false;
                        commonService.loader();
                        if (data.status === 412) {
                            flash.pop({
                                title: 'Alert',
                                body: 'Some Invalid records not save are in grid, Please correct and save again.',
                                type: 'error'
                            });
                            if ($scope.metadatas.length > 1) {
                                dataTosave.inValidData.pop();
                                $scope.metadatas = dataTosave.inValidData.concat(data.data.doc);
                            } else
                                $scope.metadatas = data.data.doc;
                            for (var i = 0; i < data.data.invalidMsgList.length; i++) {
                                var invalMsg = {};
                                invalMsg.regex = [];
                                invalMsg.mandatory = [];
                                invalMsg.length = [];
                                invalMsg.serverMsg = {};

                                for (var prop in data.data.invalidMsgList[i]) {
                                    invalMsg.regex.push(prop);
                                    invalMsg.serverMsg[prop] = (data.data.invalidMsgList[i][prop]).toString();
                                }
                                invalidMsgList.push(invalMsg);
                            }
                            fillRowNos();
                        } else
                            flash.pop({
                                title: 'Alert',
                                body: data.data,
                                type: 'error'
                            });
                    });
            } else {

                if (dataTosave.inValidData.length > 0) {
                    flash.pop({
                        title: 'No Data',
                        body: 'Grid contains invalid data!',
                        type: 'warning'
                    });
                    $scope.metadatas = dataTosave.inValidData;
                } else
                    flash.pop({
                        title: 'No Data',
                        body: 'No data to save',
                        type: 'warning'
                    });
                $scope.metadataLoader = false;
            }
        }

    }

    ///handles save metadata event
    $scope.$on("saveMetadataEvent", function(event, args) {
        $scope.saveMetadatas();
    });

    $scope.$on("backMetadataEvent", function(event, args) {
        $scope.getSystemMetadataList('');
        $scope.showGrid = false;
    });

    //Start Filter Function
    $scope.$parent.isMetadataEdit = false;
    $scope.getRuleFields = function() {
        $scope.$parent.autosuggestSource = $scope.selectMetadata[0].n;
        $scope.$parent.isMetadataEdit = true;

        angular.forEach($scope.metadataType.fields, function(i) {
            if (i.isActive == true) {
                $scope.$parent.fields[i.key] = {
                    type: i.type,
                    label: i.label
                };
                $scope.sortedFields.push(i.key);

                $scope.custObj[i.label] = {
                    column: i.key,
                    systemId: $routeParams.systemId,
                    columnType: i.type

                }
            }


        });


    }

    $scope.reset = function() {
        $scope.rule.conditions = {};
        $scope.currentPage = 1;
        $scope.getSystemMetadata($scope.currentPage, true);
    }

    $scope.$on("metadataReset", function(event, args) {
        $scope.reset();

    });
    ///generate the query and get the filtered data
    $scope.getData = function() {

        var rulesData = {};
        rulesData.ruleDef = {};
        rulesData.generateJson = function(root, data) {
            var ruleParents = root.find(' > div[group="condition"]');
            data.condition = root.find(' > div.inz-chk > input')[0].checked ? 'and' : 'or';
            data.level = root.parent().attr('index');
            data.fields = [];
            var rule = {};
            for (var k = 0; k < ruleParents.length; k++) {
                var fields = ruleParents.eq(k).find('[cname]');
                if (!fields[0].hasAttribute('disabled') && fields[0].value != '-1') {
                    rule = {};
                    for (var j = 0; j < fields.length; j++) {
                        rule[fields.eq(j).attr('cname')] = fields.eq(j).val();
                    }
                    rule.type = fields.eq(fields.length - 1).attr('ftype');
                    data.fields.push(rule);
                }
            }
            var nextRoot = root.find(' > div[index]');
            for (var i = 0; i < nextRoot.length; i++) {
                if (!nextRoot.eq(i).find(' > div.sub-condition > button')[0].hasAttribute('disabled')) {
                    data.fields.push({});
                    rulesData.generateJson(nextRoot.eq(i).find(' > div.sub-condition'), data.fields[data.fields.length - 1]);
                }
            }
        }

        rulesData.generateJson($('div[ng-form="rulesForm"] > div > div.row > div.sub-condition'), rulesData.ruleDef);
        $scope.$parent.filterObj = {
            rules: rulesData.ruleDef,
            metadataId: $scope.selectMetadata[0].id

        };

        if ($scope.$parent.filterObj.rules.fields.length <= 0) {
            flash.pop({
                title: 'No filter conditions',
                body: 'No conditions to apply filter',
                type: 'info'
            });
        } else
            getFilteredData(1, true);
    }
    $scope.$on("metadataGetData", function(event, args) {
        $scope.getData();

    });

    /// function to get the filter data after filter apply
    function getFilteredData(pageNo, isGetCount) {

        // $scope.Loader = true;
        commonService.loader(true);
        if (isGetCount) {
            var promise1 = commonService.ajaxCall('PUT', 'api/filter?collection=metadata&count=1', $scope.$parent.filterObj);
            promise1.then(function(data) {
                $scope.totalItems = data.count;
            }, function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
        }
        $scope.currentPage = pageNo;
        var promise = commonService.ajaxCall('PUT', 'api/filter?collection=metadata&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo, $scope.$parent.filterObj);
        promise.then(function(data) {
            // $scope.Loader = false;
            if (data.length) {
                var tmpObj = [];
                for (var i = 0; i < data.length; i++)
                    tmpObj.push(data[i].details)
                $scope.metadatas = tmpObj;
            }
            $scope.rowNos = [];
            for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * 500, j < data.length; i++, j++) {
                $scope.metadatas[j].updateField = false;
                $scope.metadatas[j].select = false;
                $scope.rowNos.push(i);
            }
            commonService.loader(false);
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
            // $scope.Loader = false;
            commonService.loader(false);
        });

    }

    /// function to reset filter
    $scope.resetFilter = function() {
        for (var k in $scope.$parent.filter)
            if ($scope.$parent.filter.hasOwnProperty(k) && $scope.$parent.filter[k]) {
                $scope.$parent.filter[k] = null;
                $('input[name="' + k + '"]').select2('val', null);
            }
        $scope.$parent.filterObj = {};
        $scope.currentPage = 1;
        $scope.getSystemMetadata($scope.currentPage, true);
    }
    /// handles reset filter event
    $scope.$on("metadataResetFilter", function(event, args) {
        $scope.resetFilter();

    });

    ///function to apply filter
    $scope.applyFilter = function() {
        $scope.$parent.filterObj = {
            rules: {
                condition: 'and',
                level: 0,
                fields: []
            },
            metadataId: $scope.selectMetadata[0].id
        }

        for (var k in $scope.$parent.fields) {
            if ($scope.$parent.fields[k].val != null) {
                if (angular.isArray($scope.$parent.fields[k].val)) {
                    var obj = $scope.$parent.filterObj.rules;
                    if ($scope.$parent.fields[k].val.length > 1) {
                        obj = {
                            condition: 'or',
                            fields: []
                        };
                        $scope.$parent.filterObj.rules.fields.push(obj);
                    }
                    for (var i = 0; i < $scope.$parent.fields[k].val.length; i++)
                        obj.fields.push({
                            name: k,
                            operator: 'equalTo',
                            value: $scope.$parent.fields[k].type === 'numeric' ? parseInt($scope.$parent.fields[k].val[i].n, 10) : $scope.$parent.fields[k].val[i].n
                        });
                } else
                    $scope.$parent.filterObj.rules.fields.push({
                        name: k,
                        operator: 'equalTo',
                        value: $scope.$parent.fields[k].type === 'numeric' ? parseInt($scope.$parent.fields[k].val, 10) : $scope.$parent.fields[k].val
                    });
            }
        }
        getFilteredData(1, true);
    }

    ///handles apply filter event
    $scope.$on("metadataApplyFilter", function(event, args) {
        $scope.applyFilter();

    });
    //End Filter Function

});