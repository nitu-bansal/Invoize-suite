'use strict';

angularApp.controller('accessCtrl', function($scope, $http, $location, $state, $route, $routeParams, $modal, Restangular, commonService, flash) {
    var invalidMsgList = [];
    $scope.modulesSI = [{
        updateField: null,
        actionCode: null,
        action: null,
        desc:null
    }];
    $scope.accessTemplateDataSI = {
        "fields": [{
            "regex": "/^[a-zA-Z0-9]+$/",
            "value": "",
            "isUniqueField": true,
            "description": "",
            "isReadonly": false,
            "suggestionsSource": "",
            "errorMessage": "Invalid Action Code",
            "isMandatory": true,
            "label": "Action Code",
            "length": 50,
            "isMasterField": true,
            "isActive": true,
            "toolTip": "Action Code",
            "key": "actionCode",
            "isDefault": true,
            "type": "text",
            "customFlag": false,
            "displayOrder": 2,
            "validationActive": true
        },{
            "regex": "",
            "value": "",
            "isUniqueField": false,
            "description": "",
            "isReadonly": false,
            "suggestionsSource": "",
            "errorMessage": "",
            "isMandatory": true,
            "label": "Action",
            "length": 50,
            "isMasterField": true,
            "isActive": true,
            "toolTip": "Action",
            "key": "action",
            "isDefault": true,
            "type": "text",
            "customFlag": false,
            "displayOrder": 3,
            "validationActive": true
        }, {
            "regex": "",
            "value": "",
            "isUniqueField": false,
            "description": "",
            "isReadonly": false,
            "suggestionsSource": "",
            "errorMessage": "",
            "isMandatory": false,
            "label": "Description",
            "length": 500,
            "isMasterField": false,
            "isActive": true,
            "toolTip": "",
            "key": "desc",
            "isDefault": true,
            "type": "text",
            "customFlag": false,
            "displayOrder": 4  ,
            "validationActive": true
        }]

    };

    $scope.getTemplateAccessModule = function() {
        $scope.columnsSI = [{
            value: 'moduleSI.updateField',
            type: 'checkbox',
            title: 'Select',
            width: 50
        }];
        angular.forEach($scope.accessTemplateDataSI.fields, function(col, i) {
            if (col.isActive) {
                switch (col.type) {
                    case 'dropdown':
                    case 'multiselect':
                        $scope.columnsSI.push({
                            value: 'moduleSI.' + col.key,
                            type: 'autocomplete',
                            title: col.label,
                            strict: true,
                            src: col.suggestionsSource,
                            width: col.length * 9,
                            length: col.length,
                            renderer: cellRenderer,
                            isMandatory: col.isMandatory,
                            key: col.key,
                            regex: col.regex,
                            toolTip: col.toolTip,
                            errorMessage: col.errorMessage,
                            displayOrder: col.displayOrder
                        })
                        break;

                    default:
                        if (col.type == 'multiline')
                            col.type = 'text';
                        $scope.columnsSI.push({
                            value: 'moduleSI.' + col.key,
                            type: col.type,
                            allowInvalid: false,
                            renderer: cellRenderer,
                            title: col.label,
                            width: col.length * 9,
                            length: col.length,
                            isMandatory: col.isMandatory,
                            key: col.key,
                            regex: col.regex,
                            toolTip: col.toolTip,
                            errorMessage: col.errorMessage,
                            displayOrder: col.displayOrder
                        });
                }
            }
        });
        $scope.getAccessModules();
    }

    var cellRenderer = function(instance, td, row, col, prop, value, cellProperties) {
        if (cellProperties.type == 'autocomplete')
            Handsontable.AutocompleteCell.renderer.apply(this, arguments)
        else if (cellProperties.type == 'date')
            Handsontable.DateCell.renderer.apply(this, arguments)
        else
            Handsontable.TextCell.renderer.apply(this, arguments);

        if (cellProperties.toolTip)
            td.title = '';

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
                if(invalidMsgList[row].serverMsg != null)
                    td.title += invalidMsgList[row].serverMsg[prop];
                else
                    td.title += cellProperties.errorMessage;
                td.style.backgroundColor = 'pink';
            }
        }

        td.innerHtml = value;
        return td;
    }


    $scope.celChange = function(values) {
        var cellCount = values.length;
        for (var i = 0; i < cellCount; i++) {
            if (values[i][3] !== values[i][2]) {
                if (values[i][3] === '')
                    values[i][3] = null;
                if (values[i][1] !== 'updateField' && (!$scope.modulesSI[values[i][0]] || !$scope.modulesSI[values[i][0]].updateField))
                    values.push([values[i][0], 'updateField', 'null', true]);
            }
        }
    }


    $scope.save = function() {
        invalidMsgList = [];
        var dataTosave = commonService.validateGridData($scope.modulesSI, $scope.columnsSI, 'default');
        invalidMsgList = dataTosave.arrInvalidMsg;
        if (dataTosave.inValidData.length > 0) {
            $scope.modulesSI = dataTosave.inValidData;
        }
        $scope.accessLoader = true;

        if (dataTosave.validData.data.length > 0) {

            var promise = commonService.ajaxCall('PUT', '/api/accessRight?type=module', dataTosave.validData);
            promise.then(function(data) {
                    if (dataTosave.inValidData.length > 0) {
                        flash.pop({
                            title: 'Warning',
                            body: 'Grid contains some Invalid data, which is not saved',
                            type: 'warning'
                        });
                        $scope.modulesSI = dataTosave.inValidData;
                    } else {
                        $scope.getAccessModules();
                        flash.pop({
                            title: 'Success',
                            body: data,
                            type: 'success'
                        });
                    }
                    $scope.accessLoader = false;
                },
                function(data) {
                    $scope.accessLoader = false;
                    if (data.status === 412) {
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records not save are in grid, Please correct and save again.',
                            type: 'error'
                        });
                        if ($scope.modulesSI.length > 1) {
                            dataTosave.inValidData.pop();
                            $scope.modulesSI = dataTosave.inValidData.concat(data.data.doc);
                        } else
                            $scope.modulesSI = data.data.doc;
                        for (var i = 0; i < data.data.invalidMsgList.length; i++) {
                            var invalMsg={};
                            invalMsg.regex=[];
                            invalMsg.mandatory=[];
                            invalMsg.length=[];
                            invalMsg.serverMsg={};

                            for(var prop in data.data.invalidMsgList[i])
                            {
                                invalMsg.regex.push(prop);
                                invalMsg.serverMsg[prop] = (data.data.invalidMsgList[i][prop]).toString();
                            }
                            invalidMsgList.push(invalMsg);
                        }
                    }
                    else
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                });
        } else {
            $scope.accessLoader = false;
            flash.pop({
                title: 'No Data',
                body: 'No data to save or invalid data!',
                type: 'warning'
            });

        }
    }

    $scope.getAccessModules = function() {
        invalidMsgList = [];
        $scope.accessLoader = true;
        var promise = commonService.ajaxCall('GET', '/api/accessRight?type=module&pageLimit=' + 500 + '&pageNo=1');
        promise.then(function(data) {
                if (data.length) {
                    $scope.modulesSI = data;
                    for (var i = 0; i < $scope.modulesSI.length; i++)
                    {
                        $scope.modulesSI[i].updateField = false;
                    }
                }
                $scope.accessLoader = false;
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    }

});