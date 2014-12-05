'use strict';

angularApp.controller('shipmentInvoiceCtrl', function($scope, $location, flash, $http, $q, $timeout, commonService, $modal, $modalInstance, items) {
    $scope.items = angular.copy(items);
    $scope.templates = [];
    $scope.hw = null;
    var invalidMsgList = [];
    $scope.showConfigurationDD = true;
    $scope.showBackBtn = false;
    $scope.workspaces = [];

    $scope.afterRender = function() {
        renderHT();
    }

    function renderHT() {
        if ($scope.datas != null && $scope.datas.length > 20)
            $scope.hh = $(window).height() - 300;
        else
            $scope.hh = null;
        $scope.hw = $('div.page-content').width() - 35;
    }

    function initialGrid() {
        $scope.datas = [{}];

        $scope.dlgColumns = [];
    }

    function initialTab() {
        $scope.workspaces = [];

        for (var i = 0; i < $scope.items.data.length - 1; i++)
            if (i == 0)
                $scope.workspaces.push({
                    id: i,
                    name: $scope.data[i].invoiceNumber,
                    active: true
                });
            else
                $scope.workspaces.push({
                    id: i,
                    name: $scope.data[i].invoiceNumber,
                    active: false
                });
    }

    $scope.celChange = function(values) {
        var cellCount = values.length;
        for (var i = 0; i < cellCount; i++) {
            if (values[i][3] !== values[i][2]) {
                if (values[i][3] === '')
                    values[i][3] = null;
                else if (values[i][3] === 'true' || values[i][3] === 'false')
                    values[i][3] = eval(values[i][3]);
            }
        }
        invalidMsgList = [];
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
    $scope.getTemplate = function() {

        initialTab();

        // commonService.loader(true);
        // initialGrid();

        // var promise = commonService.ajaxCall('POST', '/api/shipmentField/template', {
        //     profileBased: $scope.items.profileBased,
        //     systemId: $scope.items.systemId,
        //     accountId: $scope.items.accountId,
        //     type: $scope.items.parentGroup
        // });
        // promise.then(function(data) {
        //         $scope.templateData = data;
        //         data.profileName = data.profileName + data.templateId;
        //         var sc = data.fields.sort(function(a, b) {
        //             return parseInt(a.displayOrder) - parseInt(b.displayOrder)
        //         });
        //         $scope.templateData.fields = sc;
        //         angular.forEach(sc, function(col, i) {
        //             if (col.isActive) {
        //                 switch (col.type) {
        //                     case 'dropdown':
        //                     case 'multiselect':
        //                         $scope.dlgColumns.push({
        //                             value: 'data.' + col.key,
        //                             type: 'autocomplete',
        //                             title: col.label,
        //                             strict: true,
        //                             src: col.suggestionsSource,
        //                             width: col.length * 12,
        //                             length: col.length,
        //                             readOnly: col.isReadonly,
        //                             isMandatory: col.isMandatory,
        //                             key: col.key,
        //                             regex: col.regex,
        //                             toolTip: col.toolTip,
        //                             renderer: cellRenderer,
        //                             errorMessage: col.errorMessage,
        //                             suggestionField: col.suggestionField,
        //                             displayOrder: col.displayOrder
        //                         })
        //                         break;
        //                     default:
        //                         if (col.type == 'multiline')
        //                             col.type = 'text';
        //                         $scope.dlgColumns.push({
        //                             value: 'data.' + col.key,
        //                             type: col.type,
        //                             allowInvalid: false,
        //                             renderer: cellRenderer,
        //                             title: col.label,
        //                             width: col.length * 12,
        //                             length: col.length,
        //                             readOnly: col.isReadonly,
        //                             isMandatory: col.isMandatory,
        //                             key: col.key,
        //                             regex: col.regex,
        //                             toolTip: col.toolTip,
        //                             errorMessage: col.errorMessage,
        //                             displayOrder: col.displayOrder,
        //                             suggestionField: col.suggestionField
        //                         });
        //                 }
        //             }
        //         });

        //         $scope.getData();
        //         commonService.loader(false);
        //         // $scope.loader = false;
        //     },
        //     function(data) {
        //         flash.pop({
        //             title: 'Alert',
        //             body: data.data,
        //             type: 'error'
        //         });
        //         // $scope.loader = false;
        //     });
        // // $scope.loader = false;
    }

    $scope.getData = function() {

        if ($scope.items.data.length > 0) {
            if ($scope.datas.length > 0) {
                for (var i = 0; i < $scope.items.data.length; i++) {
                    $scope.datas.pop();

                }
            }

            for (var i = 0; i < $scope.items.data.length; i++) {
                $scope.datas.push($scope.items.data[i]);

            }
        }


        // // $scope.loader = true;
        // invalidMsgList = [];
        // commonService.loader(true);
        // // $scope.datas = $scope.items.data;
        // // console.log($scope.datas);
        // // commonService.loader();
        // var tmpData = $scope.items.data;
        // console.log(tmpData);
        // // var promise = commonService.ajaxCall('GET', '/api/shipmentMultipleField?type=' + $scope.items.parentGroup + '&id=' + $scope.items.shipmentId);
        // // promise.then(function(data) {
        // //         console.log(tmpData);
        // //         if (data.doc)
        // //             if (data.doc.length)
        // //                 $scope.datas = tmpData;
        // //             // $scope.datas = data.doc;
        // //             // $scope.loader = false;
        // //         console.log($scope.datas);
        // //         console.log($scope.items.data);
        // //         console.log(tmpData);
        // //         commonService.loader();
        // //     },
        // //     function(data) {
        // //         flash.pop({
        // //             title: 'Alert',
        // //             body: data.data,
        // //             type: 'error'
        // //         });
        // //     });
        // console.log(tmpData);
        // $scope.datas = angular.copy(tmpData);
        // console.log($scope.datas);

    }


    $scope.saveData = function() {
        invalidMsgList = [];
        for (var i = 0; i < $scope.datas.length - 1; i++) {
            $scope.datas[i].updateField = true;
        }
        var dataTosave = commonService.validateGridData($scope.datas, $scope.dlgColumns, $scope.items.templateId);
        invalidMsgList = dataTosave.arrInvalidMsg;
        if (dataTosave.inValidData.length > 0) {
            $scope.datas = dataTosave.inValidData;
        }
        $scope.loader = true;

        if (dataTosave.validData.data.length > 0) {
            // $scope.data[parentGroup]=dataTosave.validData.data;
            $modalInstance.close(dataTosave.validData.data);
            // commonService.loader(true);
            // dataTosave.validData.id = $scope.items.shipmentId;
            // dataTosave.validData.type = $scope.items.parentGroup;
            // var promise = commonService.ajaxCall('PUT', '/api/shipmentMultipleField', dataTosave.validData);
            // promise.then(function(data) {
            //         commonService.loader();
            //         if (dataTosave.inValidData.length > 0) {
            //             flash.pop({
            //                 title: 'Waring',
            //                 body: 'Grid contains some Invalid data, which is not saved',
            //                 type: 'warning'
            //             });
            //             $scope.datas = dataTosave.inValidData;
            //         } else {
            //             $scope.getData();
            //             flash.pop({
            //                 title: 'Success',
            //                 body: data,
            //                 type: 'success'
            //             });
            //         }
            //         $scope.loader = false;
            //     },
            //     function(data) {
            //         $scope.loader = false;
            //         commonService.loader();
            //         if (data.status === 412) {
            //             flash.pop({
            //                 title: 'Alert',
            //                 body: 'Some Invalid records not save are in grid, Please correct and save again.',
            //                 type: 'error'
            //             });
            //             if ($scope.datas.length > 1) {
            //                 dataTosave.inValidData.pop();
            //                 $scope.datas = dataTosave.inValidData.concat(data.data.doc);
            //             } else
            //                 $scope.datas = data.data.doc;
            //             for (var i = 0; i < data.data.invalidMsgList.length; i++) {
            //                 var invalMsg = {};
            //                 invalMsg.regex = [];
            //                 invalMsg.mandatory = [];
            //                 invalMsg.length = [];
            //                 invalMsg.serverMsg = {};

            //                 for (var prop in data.data.invalidMsgList[i]) {
            //                     invalMsg.regex.push(prop);
            //                     invalMsg.serverMsg[prop] = (data.data.invalidMsgList[i][prop]).toString();
            //                 }
            //                 invalidMsgList.push(invalMsg);
            //             }
            //         } else
            //             flash.pop({
            //                 title: 'Alert',
            //                 body: data.data,
            //                 type: 'error'
            //             });
            //     });
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
            $scope.loader = false;
        }
    }
    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };

    $scope.deleteAllData = function() {
        showModel('Do you want to remove all ' + $scope.items.parentGroup + ' ?');
    };

    function showModel(msg) {
        var modalInstance = $modal.open({
            templateUrl: 'confirm.html',
            controller: 'modalInstanceCtrl',
            resolve: {
                items: function() {
                    return angular.copy({
                        msg: msg
                    });
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {
            $modalInstance.close("deleteAll");
        }, function(selectedItem) {

        });
    }

});