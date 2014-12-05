'use strict';

angularApp.controller('shipmentInvoiceCtrl', function($scope, $location, flash, $http, $q, $timeout, commonService, $modal, $modalInstance, items) {
    $scope.items = angular.copy(items);
    $scope.templates = [];
    $scope.hw = null;
    var invalidMsgList = [];
    $scope.showConfigurationDD = true;
    $scope.showBackBtn = false;

    $scope.tabs = [];
    $scope.tabsets = [];
    $scope.datas = {};
    $scope.datas.Invoices = [];
    // $scope.newInvoiceType = {};
    $scope.invoiceTypes = [];

    $scope.hw = null;


    $scope.totalInvoiceValue = [];
    $scope.totalTariffValue = [];

    $scope.invoiceStatuses = [];
    $scope.isNewInvoiceActive = false;
    $scope.isCorrectInvoice = [];

    var chargeCodeIndex;
    var roundingPoint = 2;

    var currentCellNumber;
    var invoiceToSave = "";
    var activeTabIndex = 0;

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

    function calculateTotal(tabNo) {

        var invoiceValue = 0;
        var tariffValue = 0;

        for (var i = 0; i < $scope.datas.Invoices.length; i++) {
            if (i == tabNo) {
                for (var j = 0; j < $scope.datas.Invoices[i].charges.length; j++) {
                    if ($scope.datas.Invoices[i].charges[j] != undefined) {

                        if ($scope.datas.Invoices[i].charges[j].invoiceValue != undefined)
                            invoiceValue = invoiceValue + $scope.datas.Invoices[i].charges[j].invoiceValue;
                        if ($scope.datas.Invoices[i].charges[j].tariffValue != undefined)
                            tariffValue = tariffValue + $scope.datas.Invoices[i].charges[j].tariffValue;
                    }
                }


                $scope.totalInvoiceValue[i] = roundNumber(invoiceValue, roundingPoint);
                $scope.totalTariffValue[i] = roundNumber(tariffValue, roundingPoint);
            }
        }
    }

    $scope.initialTab = function() {

        $scope.totalInvoiceValue = [];
        $scope.totalTariffValue = [];

        if (items.type == "update") {
            $scope.tabs = [];
            $scope.tabsets = [];


            var invoiceValue = 0;
            var tariffValue = 0;

            // var tmlCharges = [];
            // for (var i = 0; i < $scope.datas.Invoices.length; i++) {
            //     for (var j = 0; j < $scope.datas.Invoices[i].charges.length; j++) {
            //         tmlCharges.push($scope.datas.Invoices[i].charges[j]);
            //     }

            // }
            // var tmpNewInvoice = {
            //     'status': 'Not Rated',
            //     'charges': tmlCharges,
            //     'invoiceType': '',
            //     'invoiceNumber': ''
            // };

            // $scope.datas.Invoices.push(tmpNewInvoice);
            // $scope.datas.Invoices = $scope.datas.Invoices.slice().reverse();

            for (var i = 0; i < $scope.datas.Invoices.length; i++) {


                invoiceValue = 0;
                tariffValue = 0;

                if ($scope.datas.Invoices[i].invoiceNumber == "") {
                    items.type = "new"
                    $scope.datas.Invoices[i].invoiceNumber = "new"
                }

                if ($scope.datas.Invoices[i].status == "Invoiced")
                    $scope.isCorrectInvoice.push(true);
                else
                    $scope.isCorrectInvoice.push(false);



                if (i == 0) {

                    $scope.tabs.push({
                        title: $scope.datas.Invoices[i].invoiceNumber,
                        active: true
                    });
                } else {
                    $scope.tabs.push({
                        title: $scope.datas.Invoices[i].invoiceNumber,
                        active: false
                    });
                }



                for (var j = 0; j < $scope.datas.Invoices[i].charges.length; j++) {
                    if ($scope.datas.Invoices[i].charges[j] != undefined) {

                        if ($scope.datas.Invoices[i].charges[j].invoiceValue != undefined) {
                            invoiceValue = invoiceValue + $scope.datas.Invoices[i].charges[j].invoiceValue;
                            $scope.isNewInvoiceActive = true;
                        }
                        if ($scope.datas.Invoices[i].charges[j].tariffValue != undefined) {
                            tariffValue = tariffValue + $scope.datas.Invoices[i].charges[j].tariffValue;
                            $scope.isNewInvoiceActive = true;
                        }
                    }
                }


                $scope.totalInvoiceValue.push(roundNumber(invoiceValue, roundingPoint));
                $scope.totalTariffValue.push(roundNumber(tariffValue, roundingPoint));

                if ($scope.datas.Invoices[i].invoiceNumber == "new")
                    $scope.datas.Invoices[i].invoiceNumber = ""

                // if ($scope.invoiceTypes.indexOf($scope.datas.Invoices[i].invoiceType) < 0)
                //     $scope.invoiceTypes.push($scope.datas.Invoices[i].invoiceType);
                // $scope.invoiceTypes.push({
                //     "c": "",
                //     "g": "",
                //     "n": $scope.datas.Invoices[i].invoiceType,
                //     "v": $scope.datas.Invoices[i].invoiceType,
                //     "id": $scope.datas.Invoices[i].invoiceType,
                //     "tc": null
                // });

            }

            $scope.tabsets = [];

            $scope.tabsets.push({
                "name": "Invoice# ",
                "tabs": $scope.tabs
            });
        } else {
            $scope.tabs = [];
            $scope.tabsets = [];

            for (var i = 0; i < $scope.datas.Invoices.length; i++) {


                invoiceValue = 0;
                tariffValue = 0;

                // if (i == 0) {
                //     $scope.tabs.push({
                //         title: items.type,
                //         active: true
                //     });
                // } else {
                //     $scope.tabs.push({
                //         title: items.type,
                //         active: false
                //     });
                // }

                if ($scope.datas.Invoices[i].invoiceNumber == "") {
                    if (items.type != "correct")
                        items.type = "new"
                    $scope.datas.Invoices[i].invoiceNumber = "new"
                }

                if ($scope.datas.Invoices[i].status == "Invoiced")
                    $scope.isCorrectInvoice.push(true);
                else
                    $scope.isCorrectInvoice.push(false);

                if (i == 0) {

                    $scope.tabs.push({
                        title: $scope.datas.Invoices[i].invoiceNumber,
                        active: true
                    });
                } else {
                    $scope.tabs.push({
                        title: $scope.datas.Invoices[i].invoiceNumber,
                        active: false
                    });
                }

                for (var j = 0; j < $scope.datas.Invoices[i].charges.length; j++) {
                    if ($scope.datas.Invoices[i].charges[j] != undefined) {

                        if ($scope.datas.Invoices[i].charges[j].invoiceValue != undefined) {
                            invoiceValue = invoiceValue + $scope.datas.Invoices[i].charges[j].invoiceValue;
                            $scope.isNewInvoiceActive = true;
                        }
                        if ($scope.datas.Invoices[i].charges[j].tariffValue != undefined) {
                            tariffValue = tariffValue + $scope.datas.Invoices[i].charges[j].tariffValue;
                            $scope.isNewInvoiceActive = true;
                        }
                    }
                }


                $scope.totalInvoiceValue.push(roundNumber(invoiceValue, roundingPoint));
                $scope.totalTariffValue.push(roundNumber(tariffValue, roundingPoint));

                if ($scope.datas.Invoices[i].invoiceNumber == "new")
                    $scope.datas.Invoices[i].invoiceNumber = ""

                // if ($scope.invoiceTypes.indexOf($scope.datas.Invoices[i].invoiceType) < 0)
                //     $scope.invoiceTypes.push($scope.datas.Invoices[i].invoiceType);

                // $scope.invoiceTypes.push({
                //     "c": "",
                //     "g": "",
                //     "n": $scope.datas.Invoices[i].invoiceType,
                //     "v": $scope.datas.Invoices[i].invoiceType,
                //     "id": $scope.datas.Invoices[i].invoiceType,
                //     "tc": null
                // });
            }

            $scope.tabsets = [];

            $scope.tabsets.push({
                "name": "Invoice# ",
                "tabs": $scope.tabs
            });
        }
    }
    $scope.beforeKeydown = function(e) {
        if (e.keyCode == 9) {
            if (currentCellNumber == $scope.dlgColumns.length) {
                e.keyCode = 40;
            }
        }
    }
    $scope.afterSelection = function(r, c, r2, c2) {
        currentCellNumber = c + 1;
    }

    $scope.celChange = function(values) {

        var existingChargeCode = [];

        // if (values[0][1] == "isReplaceCharge") {
        //     for (var i = 0; i < $scope.tabs.length; i++) {
        //         if ($scope.tabs[i].active == true) {
        //             var tmpChargeCode = $scope.datas.Invoices[i].charges[values[0][0]].chargeCode;
        //             $scope.datas.Invoices[i].charges[values[0][0]].chargeCode = $scope.datas.Invoices[i].charges[values[0][0]].replaceChargeCode;
        //             $scope.datas.Invoices[i].charges[values[0][0]].replaceChargeCode = tmpChargeCode;
        //         }
        //     }
        // }

        if (values[0][1] == "chargeCode") {
            for (var i = 0; i < $scope.tabs.length; i++) {
                if ($scope.tabs[i].active == true) {
                    for (var j = 0; j < $scope.datas.Invoices[i].charges.length - 1; j++) {
                        // if ($scope.datas.Invoices[i].charges[j].chargeCode == values[0][3]) {

                        //     flash.pop({
                        //         title: 'Alert',
                        //         body: values[0][3] + ' charge is already exist...!!!',
                        //         type: 'error'
                        //     });
                        //     values[0][3] = values[0][2]
                        //     break;
                        // }
                        if ($scope.datas.Invoices[i].charges[j].chargeCode)
                            existingChargeCode.push($scope.datas.Invoices[i].charges[j].chargeCode);
                    }
                    $scope.dlgColumns[chargeCodeIndex].src = "invoiceChargeCode&systemId=" + items.systemId + "&accountId=" + items.accountId + "&existingChargeCode=" + existingChargeCode + "&invoiceType=" + $scope.datas.Invoices[i].invoiceType;
                }
            }
        }
        var cellCount = values.length;

        var invoiceValue = 0;
        var tariffValue = 0;

        for (var i = 0; i < cellCount; i++) {
            if (values[i][3] !== values[i][2]) {
                if (values[i][3] === '')
                    values[i][3] = null;
                else if (values[i][3] === 'true' || values[i][3] === 'false')
                    values[i][3] = eval(values[i][3]);
            }
        }
        $scope.$parent.validForm = false;


        for (var i = 0; i < $scope.tabs.length; i++) {
            if ($scope.tabs[i].active == true) {
                for (var k = 0; k < values.length; k++) {



                    if (values[k][1] == "invoiceValue") {
                        for (var j = 0; j < $scope.datas.Invoices[i].charges.length - 1; j++) {
                            if (values[k][0] != j)
                                if ($scope.datas.Invoices[i].charges[j].invoiceValue != undefined)
                                    invoiceValue = invoiceValue + $scope.datas.Invoices[i].charges[j].invoiceValue;
                        }
                        // if ($scope.totalInvoiceValue[i] != "") {
                        //     if (values[0][2] != undefined)
                        //         $scope.totalInvoiceValue[i] = $scope.totalInvoiceValue[i] - values[0][2];
                        // }
                        // else {
                        //     if (values[0][2] != "")
                        //         $scope.totalInvoiceValue[i] = values[0][2];
                        // }
                        // if ($scope.totalInvoiceValue[i] != "") {
                        //     if (values[0][3] != undefined)
                        //         $scope.totalInvoiceValue[i] = $scope.totalInvoiceValue[i] + values[0][3];
                        // } else {
                        //     if (values[0][3] != undefined)
                        //         $scope.totalInvoiceValue[i] = values[0][3];
                        // }
                        invoiceValue = invoiceValue + values[k][3];
                        $scope.totalInvoiceValue[i] = roundNumber(invoiceValue, roundingPoint);
                    }

                    if (values[k][1] == "tariffValue") {
                        for (var j = 0; j < $scope.datas.Invoices[i].charges.length - 1; j++) {
                            if (values[k][0] != j)
                                if ($scope.datas.Invoices[i].charges[j].tariffValue != undefined)
                                    tariffValue = tariffValue + $scope.datas.Invoices[i].charges[j].tariffValue;
                        }
                        // if ($scope.totalTariffValue[i] != "") {
                        //     if (values[0][2] != undefined)
                        //         $scope.totalTariffValue[i] = $scope.totalTariffValue[i] - values[0][2];
                        // }
                        // else {
                        //     if (values[0][2] != "")
                        //         $scope.totalTariffValue[i] = values[0][2];
                        // }
                        // if ($scope.totalTariffValue[i] != "") {
                        //     if (values[0][3] != undefined)
                        //         $scope.totalTariffValue[i] = $scope.totalTariffValue[i] + values[0][3];
                        // } else {
                        //     if (values[0][3] != undefined)
                        //         $scope.totalTariffValue[i] = values[0][3];
                        // }
                        tariffValue = tariffValue + values[k][3];
                        $scope.totalTariffValue[i] = roundNumber(tariffValue, roundingPoint);
                    }
                }

            }

        }

    }

    var cellRenderer = function(instance, td, row, col, prop, value, cellProperties) {

        var existingChargeCode = [];
        for (var i = 0; i < $scope.tabs.length; i++) {
            if ($scope.tabs[i].active == true) {
                for (var j = 0; j < $scope.datas.Invoices[i].charges.length - 1; j++) {
                    // if ($scope.datas.Invoices[i].charges[j].chargeCode == values[0][3]) {

                    //     flash.pop({
                    //         title: 'Alert',
                    //         body: values[0][3] + ' charge is already exist...!!!',
                    //         type: 'error'
                    //     });
                    //     values[0][3] = values[0][2]
                    //     break;
                    // }
                    if ($scope.datas.Invoices[i].charges[j].chargeCode)
                        existingChargeCode.push($scope.datas.Invoices[i].charges[j].chargeCode);
                }
                $scope.dlgColumns[chargeCodeIndex].src = "invoiceChargeCode&systemId=" + items.systemId + "&accountId=" + items.accountId + "&existingChargeCode=" + existingChargeCode + "&invoiceType=" + $scope.datas.Invoices[i].invoiceType;
            }
        }



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

        if (prop == "reasonComment") {
            for (var i = 0; i <= $scope.tabs.length - 1; i++) {
                if ($scope.tabs[i].active == true) {
                    if ($scope.datas.Invoices[i].charges) {
                        if ($scope.datas.Invoices[i].charges[row]) {
                            if ($scope.datas.Invoices[i].charges[row].chargeCode) {
                                if (($scope.datas.Invoices[i].charges[row].invoiceValue != $scope.datas.Invoices[i].charges[row].tariffValue) && !$scope.datas.Invoices[i].charges[row].reasonComment) {
                                    if ($scope.datas.Invoices[i].charges[row].asPerTariff == "Yes" || $scope.datas.Invoices[i].charges[row].asPerTariff == "yes") {
                                        td.title = 'Mandatory!\n';
                                        td.style.backgroundColor = 'pink';
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }

        td.innerHtml = value;
        return td;
    }
    $scope.getTemplate = function() {
        // $scope.initialTab();
        commonService.loader(true);
        initialGrid();

        var metadataTypeId = 0;

        var promise = commonService.ajaxCall('GET', 'api/suggestion?q=chargeCode&pageLimit=10&page=1&selected=&suggestionFor=suggestion');
        promise.then(function(data) {
                var dict = _.where(data.msg, {
                    "n": "metadata_chargeCode"
                });
                if (dict.length > 0) {
                    $scope.selectMetadata = dict;
                    if ($scope.selectMetadata != undefined) {
                        metadataTypeId = $scope.selectMetadata[0].id;

                        // 534e4b377fa64272cae99478
                        promise = commonService.ajaxCall('GET', '/api/metadataType/' + metadataTypeId);
                        promise.then(function(data) {
                                for (var i = 0; i < data.fields.length; i++) {
                                    if (data.fields[i].key == "chargeCode") {
                                        data.fields[i].type = "dropdown";
                                        data.fields[i].suggestionsSource = "invoiceChargeCode&systemId=" + items.systemId + "&accountId=" + items.accountId;
                                        data.fields[i].suggestionField = "chargeCode";

                                        break;
                                    }
                                }

                                $scope.templateData = data;

                                var sc = data.fields.sort(function(a, b) {
                                    return parseInt(a.displayOrder) - parseInt(b.displayOrder)
                                });
                                $scope.templateData.fields = sc;
                                angular.forEach(sc, function(col, i) {
                                    if (col.isActive == true && col.invoiceCharge == true) {
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

                                // $scope.dlgColumns.push({
                                //     value: 'data.isReplaceCharge',
                                //     type: 'checkbox',
                                //     title: 'Replace Charge',
                                //     key: 'isReplaceCharge',
                                //     width: 100,
                                //     visible: true
                                // });

                                for (var i = 0; i < $scope.dlgColumns.length; i++) {
                                    if ($scope.dlgColumns[i].key == "chargeCode") {
                                        chargeCodeIndex = i;
                                    }
                                }

                                if (items.type == "new" || items.type == "correct")
                                    $scope.addNewInvoice(items.invoiceType);
                                else
                                    $scope.getData();
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
                }
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });

            });

        commonService.loader(true);
        promise = commonService.ajaxCall('GET', 'api/suggestion?q=&pageLimit=100&page=1&selected=&suggestionFor=listing_Status&groupCategory=BillRight&statusCategory=In Process&associateAt=Invoice');
        promise.then(function(data) {
            $scope.invoiceStatuses = data.msg;
            $timeout(renderHT, 100);
            commonService.loader(false);
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
            commonService.loader(false);
        });

        var promise = commonService.ajaxCall('GET', '/api/invoice/charge/getType?systemId=' + items.systemId + '&accountId=' + items.accountId);
        promise.then(function(data) {
            $scope.invoiceTypes = data;
        }, function(data) {
            commonService.loader(false);
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });

    }

    $scope.getData = function() {

        invalidMsgList = [];
        commonService.loader(true);

        var promise = commonService.ajaxCall('GET', '/api/invoice/charge?accountId=' + items.accountId + '&systemId=' + items.systemId + '&Id=' + items.shipmentId);
        promise.then(function(data) {

                if (items.type == "new" || items.type == "correct") {
                    var tmpData = angular.copy(data);
                    var tmpIndex = 0;
                    var tmpFlag = false;

                    for (var i = 0; i < data.Invoices.length; i++) {
                        if (items.invoiceType == data.Invoices[i].invoiceType) {
                            tmpFlag = true;
                            tmpData.Invoices.push(data.Invoices[i]);
                            tmpData.Invoices[i].invoiceNumber = "";
                            for (var j = 0; j < tmpData.Invoices[i].charges.length; j++) {

                                if (tmpData.Invoices[i].charges[j].tariffValue != undefined)
                                    tmpData.Invoices[i].charges[j].tariffValue = "";
                                if (tmpData.Invoices[i].charges[j].invoiceValue != undefined)
                                    tmpData.Invoices[i].charges[j].invoiceValue = "";
                            }

                            tmpIndex = i;


                            break;
                        }
                    }

                    for (var i = tmpData.Invoices.length - 1; i >= 0; i--) {
                        if (i != tmpIndex)
                            tmpData.Invoices.splice(i, 1);

                    }

                    if (tmpFlag == false) {
                        $scope.datas = [];
                        flash.pop({
                            title: 'Alert',
                            body: 'Please select correct invoice type...',
                            type: 'error'
                        });
                    } else {
                        $scope.datas = tmpData;
                    }

                } else {
                    $scope.datas = data;
                }
                commonService.loader(false);
                // if (items.type == "update") {
                $scope.initialTab();
                $timeout(renderHT, 1000);

                $timeout(function() {
                    var existingChargeCode = [];
                    for (var i = 0; i < $scope.tabs.length; i++) {
                        if ($scope.tabs[i].active == true) {
                            for (var j = 0; j < $scope.datas.Invoices[i].charges.length - 1; j++) {
                                // if ($scope.datas.Invoices[i].charges[j].chargeCode == values[0][3]) {

                                //     flash.pop({
                                //         title: 'Alert',
                                //         body: values[0][3] + ' charge is already exist...!!!',
                                //         type: 'error'
                                //     });
                                //     values[0][3] = values[0][2]
                                //     break;
                                // }
                                if ($scope.datas.Invoices[i].charges[j].chargeCode)
                                    existingChargeCode.push($scope.datas.Invoices[i].charges[j].chargeCode);
                            }
                            $scope.dlgColumns[chargeCodeIndex].src = "invoiceChargeCode&systemId=" + items.systemId + "&accountId=" + items.accountId + "&existingChargeCode=" + existingChargeCode + "&invoiceType=" + $scope.datas.Invoices[i].invoiceType;
                        }
                    }

                }, 100);
                // }
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

        var invoiceToSave = "";

        if (items.type == "update") {
            for (var i = 0; i <= $scope.tabs.length - 1; i++) {
                if ($scope.tabs[i].active == true)
                    invoiceToSave = $scope.tabs[i].title;
            }
        }

        var dataTosave = {};

        var hasRateMismatch = false;

        for (var i = 0; i <= $scope.datas.Invoices.length - 1; i++) {
            for (var j = 0; j < $scope.datas.Invoices[i].charges.length; j++) {
                if ($scope.datas.Invoices[i].charges[j] != undefined)
                    if ($scope.datas.Invoices[i].charges[j].chargeCode == null)
                        delete $scope.datas.Invoices[i].charges[j];
                    else {
                        if ($scope.datas.Invoices[i].charges[j].asPerTariff == "Yes" || $scope.datas.Invoices[i].charges[j].asPerTariff == "yes") {
                            if (($scope.datas.Invoices[i].charges[j].tariffValue != $scope.datas.Invoices[i].charges[j].invoiceValue) && !$scope.datas.Invoices[i].charges[j].reasonComment) {
                                hasRateMismatch = true;

                            }
                        }

                    }
            }
        }

        if (hasRateMismatch == true) {
            flash.pop({
                title: 'Error',
                body: 'Please correct error...!!!',
                type: 'error'
            });
        } else {
            var hasSave = true;

            for (var i = 0; i <= $scope.datas.Invoices.length - 1; i++) {
                if ($scope.datas.Invoices[i].invoiceNumber == invoiceToSave) {
                    if ($scope.totalTariffValue[i] == 0 && $scope.totalInvoiceValue[i] == 0) {
                        hasSave = false;
                        flash.pop({
                            title: 'Error',
                            body: 'Either invoice or tariff total should be greater than 0...!!!',
                            type: 'error'
                        });
                    }

                }
            }

            if (hasSave == true) {
                for (var i = 0; i <= $scope.datas.Invoices.length - 1; i++) {
                    if ($scope.datas.Invoices[i].invoiceNumber == invoiceToSave) {
                        // dataTosave = $scope.datas.Invoices[i];
                        dataTosave = commonService.validateGridData($scope.datas.Invoices[i].charges, $scope.dlgColumns, $scope.items.templateId, 'InvoiceCharges');
                        dataTosave.validData.invoiceNumber = $scope.datas.Invoices[i].invoiceNumber;
                        dataTosave.validData.invoiceType = $scope.datas.Invoices[i].invoiceType;
                        dataTosave.validData.accountId = items.accountId;
                        dataTosave.validData.systemId = items.systemId;
                        dataTosave.validData.Id = items.shipmentId;
                        dataTosave.validData.type = items.type;
                        dataTosave.validData.status = $scope.datas.Invoices[i].status;
                        dataTosave.validData.tariffTotal = $scope.totalTariffValue[i];
                        dataTosave.validData.invoiceTotal = $scope.totalInvoiceValue[i];
                        if (items.type == "correct")
                            dataTosave.validData.correctInvoice = items.correctInvoice;
                    }
                }
                invalidMsgList = dataTosave.arrInvalidMsg;
                if (dataTosave.inValidData.length > 0) {
                    $scope.datas = dataTosave.inValidData;
                }

                commonService.loader(true);
                if (dataTosave.validData.charges.length > 0) {

                    var promise = commonService.ajaxCall('POST', '/api/invoice/charge', dataTosave.validData);
                    promise.then(function(data) {

                            if (dataTosave.inValidData.length > 0) {
                                flash.pop({
                                    title: 'Waring',
                                    body: 'Grid contains some Invalid data, which is not saved',
                                    type: 'warning'
                                });
                                $scope.datas = dataTosave.inValidData;
                            } else {
                                if (items.type == "update")
                                    $scope.getData();
                                flash.pop({
                                    title: 'Success',
                                    body: data,
                                    type: 'success'
                                });
                            }

                            commonService.loader(false);
                        },
                        function(data) {

                            commonService.loader(false);

                            if (data.status === 412) {
                                flash.pop({
                                    title: 'Alert',
                                    body: 'Some Invalid records are not save in grid, Please correct and save again.',
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
                        $scope.datas = dataTosave.inValidData;
                    } else
                        flash.pop({
                            title: 'No Data',
                            body: 'No data to save',
                            type: 'warning'
                        });

                    commonService.loader(false);
                }

                if (items.type == "update")
                    $modalInstance.close($scope.items.data);
                else
                    $modalInstance.close();
            }

        }
    }


    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };

    $scope.addNewInvoice = function(newInvoiceType) {

        if (newInvoiceType != "") {
            commonService.loader(true);
            var tmpData = angular.copy($scope.datas);
            // // var tmpIndex = 0;

            // for (var i = 0; i < $scope.datas.Invoices.length; i++) {
            //     if (newInvoiceType == $scope.datas.Invoices[i].invoiceType) {
            //         tmpData.Invoices.push($scope.datas.Invoices[i]);
            //         tmpData.Invoices[i].invoiceNumber = "";
            //         for (var j = 0; j < tmpData.Invoices[i].charges.length; j++) {

            //             if (tmpData.Invoices[i].charges[j].tariffValue != undefined)
            //                 tmpData.Invoices[i].charges[j].tariffValue = "";
            //             if (tmpData.Invoices[i].charges[j].invoiceValue != undefined)
            //                 tmpData.Invoices[i].charges[j].invoiceValue = "";
            //         }

            //         // tmpIndex = i;


            //         break;
            //     }
            // }

            // // for (var i = tmpData.Invoices.length - 1; i >= 0; i--) {
            // //     if (i != tmpIndex)
            // //         tmpData.Invoices.splice(i, 1);

            // // }

            // $scope.datas = tmpData;

            var promise = commonService.ajaxCall('GET', '/api/invoice/charge?accountId=' + items.accountId + '&systemId=' + items.systemId + '&Id=' + items.shipmentId + '&type=' + newInvoiceType);
            promise.then(function(data) {
                data.Invoices[0].invoiceNumber = "";
                if ($scope.datas.Invoices == undefined)
                    $scope.datas = data;
                else
                    $scope.datas.Invoices.push(data.Invoices[0]);
                $scope.initialTab();
                $timeout(renderHT, 1000);
                commonService.loader(false);
            }, function(data) {
                commonService.loader(false);
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
            // $scope.initialTab();
            // $timeout(renderHT, 1000);
            // commonService.loader(false);

        } else {
            flash.pop({
                title: 'Information',
                body: "Please select Invoice Type...!!!",
                type: 'warning'
            });
        }
    };

    $scope.calculateTariff = function() {
        // invalidMsgList = [];
        // var dataTosave = commonService.validateGridData($scope.shipments, $scope.columns, $scope.templateData.templateId, 'calculateTariff');
        // invalidMsgList = dataTosave.arrInvalidMsg;
        // if (dataTosave.inValidData.length > 0) {
        //     $scope.shipments = dataTosave.inValidData;
        //     fillRowNos();
        // }
        // $scope.shipmentLoader = true;
        // if (dataTosave.validData.data.length > 0) {
        //     commonService.loader(true);

        //     for (var i = 0; i < dataTosave.validData.data.length; i++) {
        //         for (var j = 0; j < charges.length; j++) {
        //             if (dataTosave.validData.data[i][charges[j]] == undefined) {

        //                 dataTosave.validData.data[i][charges[j]] = null;
        //             }
        //         }
        //     }

        //     dataTosave.validData.accountId = $scope.search.account[0].id;
        //     dataTosave.validData.templateId = $scope.templateData.templateId;
        //     var promise = commonService.ajaxCall('PUT', '/api/calculateRates/' + $rootScope.loggedInUser.userSystem[0].id, dataTosave.validData);
        //     promise.then(function(data) {
        //             commonService.loader();
        //             if (dataTosave.inValidData.length > 0) {
        //                 flash.pop({
        //                     title: 'Waring',
        //                     body: 'Grid contains some Invalid data, which is not able to calculate',
        //                     type: 'warning'
        //                 });
        //                 // $scope.shipments = dataTosave.inValidData;

        //             } else {
        //                 if (data.length) {

        //                     // $scope.shipments = data;
        //                     for (var i = 0; i < data.length; i++) {
        //                         $scope.shipments[data[i].rownum - 1] = data[i];
        //                         $scope.shipments[data[i].rownum - 1].updateField = true;
        //                         delete $scope.shipments[data[i].rownum - 1].rownum;
        //                     }
        //                 }

        //                 flash.pop({
        //                     title: 'Success',
        //                     body: 'Tariff Calculate Successfully',
        //                     type: 'success'
        //                 });
        //             }
        //             $scope.shipmentLoader = false;
        //         },
        //         function(data) {
        //             $scope.shipmentLoader = false;
        //             commonService.loader();
        //             if (data.status === 412) {
        //                 flash.pop({
        //                     title: 'Alert',
        //                     body: 'Some Invalid records not calculate are in grid, Please correct and calculate again.',
        //                     type: 'warning'
        //                 });
        //                 if ($scope.shipments.length > 1) {
        //                     dataTosave.inValidData.pop();
        //                     $scope.shipments = dataTosave.inValidData.concat(data.data.doc);
        //                 } else
        //                     $scope.shipments = data.data.doc;
        //                 for (var i = 0; i < data.data.invalidMsgList.length; i++) {
        //                     var invalMsg = {};
        //                     invalMsg.regex = [];
        //                     invalMsg.mandatory = [];
        //                     invalMsg.length = [];
        //                     invalMsg.serverMsg = {};

        //                     for (var prop in data.data.invalidMsgList[i]) {
        //                         invalMsg.regex.push(prop);
        //                         invalMsg.serverMsg[prop] = (data.data.invalidMsgList[i][prop]).toString();
        //                     }
        //                     invalidMsgList.push(invalMsg);
        //                 }
        //                 fillRowNos();
        //             } else
        //                 flash.pop({
        //                     title: 'Alert',
        //                     body: data.data,
        //                     type: 'error'
        //                 });
        //         });
        // } else {
        //     if (dataTosave.inValidData.length > 0) {
        //         flash.pop({
        //             title: 'No Data',
        //             body: 'Grid contains invalid data!',
        //             type: 'warning'
        //         });
        //         $scope.shipments = dataTosave.inValidData;
        //     } else
        //         flash.pop({
        //             title: 'No Data',
        //             body: 'No data to calculate',
        //             type: 'warning'
        //         });
        //     $scope.shipmentLoader = false;
        // }

        invoiceToSave = "";
        activeTabIndex = 0;
        if (items.type == "update") {
            for (var i = 0; i <= $scope.tabs.length - 1; i++) {
                if ($scope.tabs[i].active == true) {
                    invoiceToSave = $scope.tabs[i].title;
                    activeTabIndex = i;
                }
            }
        }

        var dataTosave = {};

        for (var i = 0; i <= $scope.datas.Invoices.length - 1; i++) {
            for (var j = 0; j < $scope.datas.Invoices[i].charges.length; j++) {
                if ($scope.datas.Invoices[i].charges[j] != undefined)
                    if ($scope.datas.Invoices[i].charges[j].chargeCode == null)
                        delete $scope.datas.Invoices[i].charges[j];
            }
        }

        for (var i = 0; i <= $scope.datas.Invoices.length - 1; i++) {
            if ($scope.datas.Invoices[i].invoiceNumber == invoiceToSave) {
                // dataTosave = $scope.datas.Invoices[i];
                dataTosave = commonService.validateGridData($scope.datas.Invoices[i].charges, $scope.dlgColumns, $scope.items.templateId, 'InvoiceCharges');
                dataTosave.validData.invoiceNumber = $scope.datas.Invoices[i].invoiceNumber;
                dataTosave.validData.invoiceType = $scope.datas.Invoices[i].invoiceType;
                dataTosave.validData.accountId = items.accountId;
                dataTosave.validData.systemId = items.systemId;
                dataTosave.validData.Id = items.shipmentId;

            }
        }

        invalidMsgList = dataTosave.arrInvalidMsg;
        if (dataTosave.inValidData.length > 0) {
            $scope.datas = dataTosave.inValidData;
        }

        commonService.loader(true);
        if (dataTosave.validData.charges.length > 0) {

            callCalculateTariff(dataTosave);
        } else {
            if (dataTosave.inValidData.length > 0) {
                flash.pop({
                    title: 'No Data',
                    body: 'Grid contains invalid data!',
                    type: 'warning'
                });
                $scope.datas = dataTosave.inValidData;
            } else
                flash.pop({
                    title: 'No Data',
                    body: 'No data to calculate',
                    type: 'warning'
                });

            commonService.loader(false);
        }
    }

    function callCalculateTariff(param) {
        var promise = commonService.ajaxCall('POST', '/api/rating', param.validData);
        promise.then(function(data) {

                if (param.inValidData.length > 0) {
                    flash.pop({
                        title: 'Waring',
                        body: 'Grid contains some Invalid data, which is not able to calculate',
                        type: 'warning'
                    });
                    $scope.datas = param.inValidData;
                } else {



                    // for (var i = 0; i <= data.charges.length - 1; i++) {

                    //     if (data.charges[i].status == "unmatched") {

                    //         // $('#invoice_' + activeTabIndex + ' tr').each(function(j) {
                    //         //     if ((j - 1) == i) {
                    //         //         var td = $(this).find("td")[4];

                    //         //         if (td != undefined)
                    //         //             td.css('background-color', 'pink');
                    //         //         // td.style.backgroundColor = '#000';
                    //         //     }

                    //         // })
                    //         // $('#invoice_' + activeTabIndex + ' tr:nth-child(2) td:nth-child(4)').css("background-color", "blue");
                    //         // $('#invoice_' + activeTabIndex + ' tr:nth-child(' + (i + 1) + ') td:nth-child(6)').css("background-color", "blue");
                    //         // $('#invoice_' + activeTabIndex + ' tr:nth-child(' + (i + 1) + ') td:nth-child(7)').css("background-color", "blue");
                    //         tmpTariffFlg = false;


                    //     }
                    // }

                    if (data.status == undefined) {

                        var strLabel = "Please enter your choice : ";

                        for (var i = 0; i <= data.length - 1; i++) {
                            strLabel = strLabel.concat(i + 1).concat(". ");

                            for (var ii = 0; ii <= data[i].identifiers.length - 1; ii++) {
                                if (ii == (data[i].identifiers.length - 1) && ii > 0)
                                    strLabel = strLabel.concat(" and ").concat(data[i].identifiers[ii].key).concat(" : ").concat(data[i].identifiers[ii].value);
                                else if (ii == 0)
                                    strLabel = strLabel.concat(data[i].identifiers[ii].key).concat(" : ").concat(data[i].identifiers[ii].value);
                                else
                                    strLabel = strLabel.concat(" , ").concat(data[i].identifiers[ii].key).concat(" : ").concat(data[i].identifiers[ii].value);
                            }
                        }

                        var itemToSend = {
                            "title": "Calculate Tariff",
                            "label": strLabel,
                            "type": "numeric",
                            "regex": "",
                            "isMandatory": true,
                            "length": "5",
                            "value": "",
                            "toolTip": "",
                            "isReadonly": false,
                            "suggestionsSource": ""
                        };

                        var modalInstance = $modal.open({
                            templateUrl: 'inputDialog.html',
                            controller: 'inputDialogCtrl',
                            resolve: {
                                items: function() {
                                    return angular.copy(itemToSend);
                                }
                            }
                        });
                        modalInstance.result.then(function(data1) {
                            if (data1.data < 1 || data1.data > data.length) {
                                flash.pop({
                                    title: 'Error',
                                    body: "Invalid Choice...!!!",
                                    type: 'error'
                                });
                            } else {
                                var choiceNumber = data1.data - 1;
                                param.validData.templateId = data[choiceNumber].id;
                                callCalculateTariff(param);

                            }


                        }, function(selectedItem) {
                            console.log('Modal dismissed ');

                        });
                    } else {

                        for (var i = 0; i <= $scope.datas.Invoices.length - 1; i++) {
                            if ($scope.datas.Invoices[i].invoiceNumber == invoiceToSave) {
                                $scope.datas.Invoices[i].status = data.status;
                                for (var j = 0; j <= data.charges.length - 1; j++) {
                                    if ($scope.datas.Invoices[i].charges[j] != undefined)
                                        $scope.datas.Invoices[i].charges[j].tariffValue = data.charges[j].tariffValue;


                                }
                                calculateTotal(i);
                            }
                        }

                        // $scope.initialTab();

                        var noOfColumns = 1;
                        $('#invoice_' + activeTabIndex + ' tr:nth-child(' + (i + 1) + ') td').each(function(j) {
                            noOfColumns = noOfColumns + 1;
                        })

                        setTimeout(function() {
                            var tmpTariffFlg = true;
                            for (var i = 0; i <= data.charges.length - 1; i++) {

                                if (data.charges[i].invoiceValue != data.charges[i].tariffValue) {
                                    tmpTariffFlg = false;
                                    // $('#invoice_' + activeTabIndex + ' tr').each(function(j) {
                                    //     if ((j - 1) == i) {
                                    //         var td = $(this).find("td")[4];

                                    //         if (td != undefined)
                                    //             td.css('background-color', 'pink');
                                    //         // td.style.backgroundColor = '#000';
                                    //     }

                                    // })
                                    // $('#invoice_' + activeTabIndex + ' tr:nth-child(2) td:nth-child(4)').css("background-color", "blue");
                                    $('#invoice_' + activeTabIndex + ' tr:nth-child(' + (i + 1) + ') td:nth-child(' + (noOfColumns - 3) + ')').css("background-color", "#FF4D4D");
                                    $('#invoice_' + activeTabIndex + ' tr:nth-child(' + (i + 1) + ') td:nth-child(' + (noOfColumns - 4) + ')').css("background-color", "#FF4D4D");



                                }
                            }
                            if (tmpTariffFlg == true) {
                                flash.pop({
                                    title: 'Success',
                                    body: "Tariff Calculate Successfully...!!!",
                                    type: 'success'
                                });
                            } else {
                                flash.pop({
                                    title: 'Success',
                                    body: "Tariff Calculate With Rate Mismatch...!!!",
                                    type: 'success'
                                });
                            }

                            $timeout(renderHT, 1000);


                        }, 500);
                    }

                }

                commonService.loader(false);
            },
            function(data) {

                commonService.loader(false);

                if (data.status === 412) {
                    flash.pop({
                        title: 'Alert',
                        body: 'Some Invalid records are not calculate in grid, Please correct and save again.',
                        type: 'error'
                    });
                    if ($scope.datas.length > 1) {
                        param.inValidData.pop();
                        $scope.datas = param.inValidData.concat(data.data.doc);
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
                } else
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
            });
    }

    function roundNumber(number, precision) {
        precision = Math.abs(parseInt(precision, 10)) || 0;
        var multiplier = Math.pow(10, precision);
        return (Math.round(number * multiplier) / multiplier);
    }

});