angularApp.controller('accountChargeCtrl', function($rootScope, $scope, $location, $timeout, $stateParams, $routeParams, $route, $modal, Restangular, uploadManager, flash, Base64, commonService) {
    $scope.showGrid = false;
    $scope.totalItems = 0;
    $scope.paginationSize = 10;
    $scope.currentPage = 1;
    $scope.pageLimit = 50;
    $scope.rowNos = [];
    $scope.hh = null;
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

    ///function to ser page after paging change event
    $scope.setPage = function() {
        setTimeout(function() {
            if ($scope.$parent.filterObj.rules == undefined)
                angular.element("div#chargePaginations").scope().getSystemMetadata(angular.element("div#chargePaginations li.active.ng-scope").scope().page.number);
            else
                angular.element(".pagination").scope().getFilteredData(angular.element("li.active.ng-scope").scope().page.number, true);

        }, 300);
    };

    ///this function is used to intialize the grid when page is loaded
    function initialGrid() {

        $scope.metadatas = [{
            updateField: null,
            select: null,
            id: null
        }];

        $scope.chargeColumns = [{
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


    ///handles the cel change event to put some validations on user input for charge
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


    ///function to get metadatas of charge
    $scope.getSystemMetadata = function(pageNo) {
        if ($scope.selectMetadata != undefined) {
            $scope.metadataLoader = true;
            invalidMsgList = [];
            commonService.loader(true);
            $scope.currentPage = pageNo;
            var promise = commonService.ajaxCall('GET', 'api/metadataAccount?metadataTypeId=' + $scope.selectMetadata[0].id + "&systemId=" + $routeParams.systemId + '&account=' + $scope.selectedAccounts.accountIds + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo);
            promise.then(function(data) {
                    if (data.doc.length) {
                        $scope.totalItems = data.count;
                        $scope.metadatas = data.doc;
                    }
                    $scope.rowNos = [];
                    for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * 500, j < data.doc.length; i++, j++) {
                        $scope.rowNos.push(i);
                    }
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

    ///functions to save account charges
    $scope.saveAccountCharge = function() {
        if ($scope.selectMetadata != undefined) {
            invalidMsgList = [];
            var dataTosave = commonService.validateGridData($scope.metadatas, $scope.chargeColumns, $scope.selectMetadata[0].id);
            invalidMsgList = dataTosave.arrInvalidMsg;
            if (dataTosave.inValidData.length > 0) {
                $scope.metadatas = dataTosave.inValidData;
                fillRowNos();
            }
            $scope.metadataLoader = true;
            if (dataTosave.validData.data.length > 0) {
                commonService.loader(true);

                dataTosave.validData.accountId = $scope.selectedAccounts.accountIds;
                console.log(dataTosave.validData)
                var promise = commonService.ajaxCall('PUT', '/api/metadataAccount/' + $routeParams.systemId, dataTosave.validData);
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
                            $scope.getSystemMetadata($scope.currentPage, true);
                            flash.pop({
                                title: 'Success',
                                body: data,
                                type: 'success'
                            });
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

    ///handles save account charge event
    $scope.$on("saveAccountChargeEvent", function(event, args) {
        $scope.saveAccountCharge();
    });

    ///function to save account charge rule account wise
    $scope.saveAccountChargeRule = function() {
        $scope.$parent.$parent.loader = true;
        $scope.chargeRules.accountId = $scope.selectedAccounts.accountIds;;
        $scope.chargeRules.metadataTypeId = $scope.selectMetadata[0].id;
        var promise = commonService.ajaxCall('PUT', '/api/chargeCoderule/' + $routeParams.systemId, $scope.chargeRules);
        promise.then(function(data) {

            flash.pop({
                title: 'Success',
                body: data,
                type: 'success'
            });
            $scope.getChargeTemplate();
            $scope.chargeCodeSelect = [];
            $('[name="chargeCodeList"]').select2('val', null);
            $scope.chargeRules = {};
            $scope.$parent.$parent.loader = false;

        }, function(data) {
            $scope.$parent.$parent.loader = false;
            flash.pop({
                title: 'Fail',
                body: data.data,
                type: 'alert'
            });
        });

    }

    ///function to update template
    $scope.openDialog = function() {
        var promise = commonService.ajaxCall('GET', '/api/template/default?type=accountCharge');
        promise.then(function(data) {
                $scope.chargeRulesTemplate = data;
                var templateId = "default";
                if ('templateId' in data) {
                    templateId = data.templateId;
                }
                var itemToSend = $scope.chargeRulesTemplate;
                itemToSend.templateId = templateId;
                var modalInstance = $modal.open({
                    templateUrl: 'fieldsConfig.html',
                    controller: 'fieldsConfigCtrl',
                    resolve: {
                        items: function() {
                            return angular.copy(itemToSend);
                        }
                    }
                });
                modalInstance.result.then(function(selectedItem) {
                    $scope.getTemplate(selectedItem);
                    console.log(selectedItem);
                }, function(selectedItem) {
                    console.log('Modal dismissed ');
                });
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            }
        );

    };

    ///function to get account charge rules
    $scope.getAccountChargeRules = function(selectedCharge) {
        if (selectedCharge != undefined) {
            var promise = commonService.ajaxCall('GET', '/api/chargeCoderule?chargeCode=' + selectedCharge[0].n + '&accountId=' + $scope.selectedAccounts.accountIds + '&systemId=' + $routeParams.systemId);
            promise.then(function(data) {
                    $scope.chargeRules = data;
                },
                function(data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                }
            );
        } else {
            $scope.chargeRules = {};
        }

    };

    ///function to get charge template
    $scope.getChargeTemplate = function() {
        var promiseOut = commonService.ajaxCall('GET', 'api/suggestion?q=chargeCode&pageLimit=10&page=1&selected=&suggestionFor=suggestion');
        promiseOut.then(function(data) {
                var dict = _.where(data.msg, {
                    "n": "metadata_chargeCode"
                });
                if (dict.length > 0) {
                    $scope.selectMetadata = dict;
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
                                    angular.forEach($scope.metadataType.fields, function(col, i) {
                                        if (col.isActive == true && col.shipmentCharge == true) {
                                            switch (col.type) {
                                                case 'dropdown':
                                                case 'multiselect':
                                                    $scope.chargeColumns.push({
                                                        value: 'metadata.' + col.key,
                                                        type: 'autocomplete',
                                                        title: col.label,
                                                        strict: true,
                                                        src: col.suggestionsSource,
                                                        width: col.length * 9,
                                                        length: col.length,
                                                        readOnly: false,
                                                        isMandatory: col.isMandatory,
                                                        key: col.key,
                                                        regex: col.regex,
                                                        toolTip: col.toolTip,
                                                        //                                                        renderer: cellRenderer,
                                                        suggestionField: col.suggestionField,
                                                        errorMessage: col.errorMessage

                                                    })
                                                    break;
                                                default:
                                                    if (col.type == 'multiline')
                                                        col.type = 'text';
                                                    $scope.chargeColumns.push({
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
                                    //                                    $scope.getTemplateAccountChargeRules();
                                    $scope.getRuleFields();
                                    $scope.getSystemMetadata($scope.currentPage, true);
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

    //Start Filter Function
    $scope.getRuleFields = function() {

        angular.forEach($scope.metadataType.fields, function(i) {
            if (i.isActive == true && i.shipmentCharge == true) {
                $scope.fields[i.key] = {
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

        // console.log($scope.custObj);
    }

    $scope.reset = function() {
        $scope.rule.conditions = {};
        $scope.currentPage = 1;
        $scope.$parent.filterObj = {};
        $scope.getSystemMetadata($scope.currentPage, true);
        commonService.hideDropPanel();
    }
    $scope.$on("accountChargerulesReset", function(event, args) {
        $scope.reset();

    });
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
            systemId: $routeParams.systemId
            //          accounts: ["52aec82c1c80a813874f8529",
            //              "52aec7ae1c80a8130567ac63"
            //          ]
        };

        if ($scope.$parent.filterObj.rules.fields.length <= 0) {
            flash.pop({
                title: 'No filter conditions',
                body: 'No conditions to apply filter',
                type: 'info'
            });
        } else
            $scope.getFilteredData(1, true);
    }
    $scope.$on("accountChargerulesGetData", function(event, args) {
        $scope.getData();

    });


    $scope.getFilteredData = function(pageNo, isGetCount) {
        commonService.loader(true);
        // if (isGetCount) {
        //     var promise1 = commonService.ajaxCall('PUT', 'api/metadataAccount?metadataTypeId=' + $scope.selectMetadata[0].id + "&systemId=" + $routeParams.systemId + '&account=' + $scope.selectedAccounts.accountIds + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo , $scope.$parent.filterObj);
        //     promise1.then(function(data) {
        //         $scope.totalItems = data.count;
        //     }, function(data) {
        //         flash.pop({
        //             title: 'Alert',
        //             body: data.data,
        //             type: 'error'
        //         });
        //     });
        // }
        $scope.currentPage = pageNo;
        var promise = commonService.ajaxCall('PUT', 'api/metadataAccount?metadataTypeId=' + $scope.selectMetadata[0].id + "&systemId=" + $routeParams.systemId + '&account=' + $scope.selectedAccounts.accountIds + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo, $scope.$parent.filterObj);
        promise.then(function(data) {
            // $scope.Loader = false;
            $scope.totalItems =
                data.count;
            if (data.count > 0) {
                $scope.metadatas = data.doc;
                $scope.rowNos = [];
                for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * 500, j < data.length; i++, j++) {
                    $scope.metadatas[j].updateField = false;
                    $scope.rowNos.push(i);
                }
                $timeout(renderHT, 1000);
            } else {
                flash.pop({
                    title: 'Waring',
                    body: 'No data found with specified search criteria...!!!',
                    type: 'warning'
                });

                $scope.metadatas = [{
                    updateField: null,
                    select: null,
                    id: null
                }];
            }
            commonService.hideDropPanel();
            commonService.loader(false);
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
            commonService.loader(false);
        });

    }

    $scope.resetFilter = function() {
        for (var k in $scope.fields)
            if ($scope.fields.hasOwnProperty(k) && $scope.fields[k].val) {
                $scope.fields[k].val = null;
                if ($scope.fields[k].type == "dropdown" || $scope.fields[k].type == "multiselect")
                    $('input[name="' + k + '"]').select2('val', null);
                // delete $scope.fields[k];

            }
            // $scope.filter = {};
        $scope.$parent.filterObj = {};
        $scope.currentPage = 1;
        $scope.getSystemMetadata($scope.currentPage, true);
        commonService.hideDropPanel();
    }
    $scope.$on("accountChargerulesResetFilter", function(event, args) {
        $scope.resetFilter();

    });
    $scope.applyFilter = function() {
        $scope.$parent.filterObj = {
            rules: {
                condition: 'and',
                fields: []
            }

        };

        for (var k in $scope.fields) {
            if ($scope.fields[k].val != null) {
                if (angular.isArray($scope.fields[k].val)) {
                    var obj = $scope.$parent.filterObj.rules;
                    if ($scope.fields[k].val.length > 1) {
                        obj = {
                            condition: 'or',
                            fields: []
                        };
                        $scope.$parent.filterObj.rules.fields.push(obj);
                    }
                    for (var i = 0; i < $scope.fields[k].val.length; i++)
                        obj.fields.push({
                            name: k,
                            operator: 'equalTo',
                            value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val[i].n, 10) : $scope.fields[k].val[i].n
                        });
                } else
                    $scope.$parent.filterObj.rules.fields.push({
                        name: k,
                        operator: 'equalTo',
                        value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val, 10) : $scope.fields[k].val
                    });
            }
        }
        $scope.getFilteredData($scope.currentPage = 1, true);
    };
    $scope.$on("accountChargerulesApplyFilter", function(event, args) {
        $scope.applyFilter();

    });
    //End Filter Function

});