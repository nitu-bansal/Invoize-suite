'use strict';

angularApp.controller('uploadNewInvoiceCtrl', function($scope, $location, flash, $http, $q, $timeout, commonService, $modal, $modalInstance, items, $rootScope) {
    $scope.items = angular.copy(items);
    $scope.templates = [];
    $scope.hw = null;
    var invalidMsgList = [];
    $scope.showConfigurationDD = true;
    $scope.showBackBtn = false;


    $scope.hw = null;

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.pageLimit = 50;
    $scope.paginationSize = 10;
    $scope.rowNos = [];
    $scope.templateData = {};

    $scope.dlgColumns = [];

    $scope.datas = {};

    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };

    $scope.afterRender = function() {
        renderHT();
    }

    $scope.RenderHTW = function() {
        $timeout(function() {

            $scope.hw = $('div.tabbable.ng-isolate-scope').width() - 30;

        }, 300);
    }

    function renderHT() {
        if ($scope.datas != null && $scope.datas.length > 20)
            $scope.hh = $(window).height() - 300;
        else
            $scope.hh = null;
        $scope.hw = $('div.tabbable.ng-isolate-scope').width() - 10;
    }

    function initialGrid() {
        $scope.datas = [{}];

        $scope.dlgColumns = [];
    }

    var cellRenderer = function(instance, td, row, col, prop, value, cellProperties) {
        if (cellProperties.type == 'autocomplete')
            Handsontable.AutocompleteCell.renderer.apply(this, arguments)
        else if (cellProperties.type == 'date')
            Handsontable.DateCell.renderer.apply(this, arguments)
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
        td.title = value;
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
    }


    $scope.getTemplate = function() {
        // $scope.initialTab();
        commonService.loader(true);
        initialGrid();

        var promise = commonService.ajaxCall('GET', '/api/uploadNewInvoice/template');
        promise.then(function(data) {


                $scope.templateData = data;

                var sc = data.fields.sort(function(a, b) {
                    return parseInt(a.displayOrder) - parseInt(b.displayOrder)
                });
                $scope.templateData.fields = sc;
                angular.forEach(sc, function(col, i) {
                    if (col.isActive == true) {
                        switch (col.type) {
                            case 'dropdown':
                            case 'multiselect':
                                if (col.key != "asPerTariff") {
                                    $scope.dlgColumns.push({
                                        value: 'data.' + col.key,
                                        type: 'autocomplete',
                                        title: col.label,
                                        strict: true,
                                        src: col.suggestionsSource,
                                        width: 120,
                                        length: col.length,
                                        readOnly: col.isReadonly,
                                        isMandatory: col.isMandatory,
                                        key: col.key,
                                        regex: col.regex,
                                        toolTip: col.toolTip,
                                        renderer: cellRenderer,
                                        errorMessage: col.errorMessage,
                                        suggestionField: col.suggestionField,
                                        displayOrder: col.displayOrder
                                    })
                                }
                                break;
                            default:
                                if (col.type == 'multiline')
                                    col.type = 'text';
                                if (col.key == "chargeCodeDescription") {
                                    $scope.dlgColumns.push({
                                        value: 'data.' + col.key,
                                        type: col.type,
                                        allowInvalid: false,
                                        renderer: cellRenderer,
                                        title: col.label,
                                        width: 160,
                                        'text-overflow': 'ellipsis',
                                        length: col.length,
                                        readOnly: col.isReadonly,
                                        isMandatory: col.isMandatory,
                                        key: col.key,
                                        regex: col.regex,
                                        toolTip: col.toolTip,
                                        errorMessage: col.errorMessage,
                                        displayOrder: col.displayOrder,
                                        suggestionField: col.suggestionField
                                    });
                                } else if (col.key == "replaceChargeCode") {} else {
                                    $scope.dlgColumns.push({
                                        value: 'data.' + col.key,
                                        type: col.type,
                                        allowInvalid: false,
                                        renderer: cellRenderer,
                                        title: col.label,
                                        width: 130,
                                        'text-overflow': 'ellipsis',
                                        length: col.length,
                                        readOnly: col.isReadonly,
                                        isMandatory: col.isMandatory,
                                        key: col.key,
                                        regex: col.regex,
                                        toolTip: col.toolTip,
                                        errorMessage: col.errorMessage,
                                        displayOrder: col.displayOrder,
                                        suggestionField: col.suggestionField
                                    });
                                }
                        }
                    }
                });



                commonService.loader(false);

            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });

            });

    }

    $scope.saveData = function() {
        invalidMsgList = [];
        var dataTosave = commonService.validateGridData($scope.datas, $scope.dlgColumns, $scope.templateData.templateId, 'directSave');
        invalidMsgList = dataTosave.arrInvalidMsg;
        if (dataTosave.inValidData.length > 0) {
            $scope.datas = dataTosave.inValidData;

        }

        if (dataTosave.validData.data.length > 0) {
            commonService.loader(true);

            dataTosave.validData.systemId = $rootScope.loggedInUser.userSystem[0].id;


            var promise = commonService.ajaxCall('PUT', '/api/uploadNewInvoice', dataTosave.validData);
            promise.then(function(data) {
                    commonService.loader();
                    if (dataTosave.inValidData.length > 0) {
                        flash.pop({
                            title: 'Warning',
                            body: 'Grid contains some Invalid data, which is not saved',
                            type: 'warning'
                        });
                        $scope.datas = dataTosave.inValidData;


                    } else {

                        flash.pop({
                            title: 'Success',
                            body: data,
                            type: 'success'
                        });

                    }

                    commonService.loader(false);
                },
                function(data) {

                    commonService.loader();
                    if (data.status === 412) {
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records not save are in grid, Please correct and save again.',
                            type: 'error'
                        });
                        if ($scope.datas.length > 1) {
                            dataTosave.inValidData.pop();
                            $scope.datas = dataTosave.inValidData.concat(data.data.doc);
                        } else
                            $scope.datas = data.data.doc;
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


                        commonService.loader(false);
                    } else
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                    commonService.loader(false);
                });
        } else {
            if (dataTosave.inValidData.length > 0) {
                flash.pop({
                    title: 'No Data',
                    body: 'Grid contains invalid data!',
                    type: 'warning'
                });
                $scope.datas = dataTosave.inValidData;

            } else {

                flash.pop({
                    title: 'No Data',
                    body: 'No data to save',
                    type: 'warning'
                });

            }

            commonService.loader(false);
        }


    }

});