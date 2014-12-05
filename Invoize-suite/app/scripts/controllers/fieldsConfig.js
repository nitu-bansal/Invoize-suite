/**
 * Created by kamalsingh.saini on 13/11/13.
 */
'use strict';
angularApp.controller('fieldsConfigCtrl', function($scope, $rootScope, $routeParams, flash, $timeout, commonService, $modal, $modalInstance, items) {
    $scope.isRuleProfile = false;
//    $scope.selectedTemplate = 'Shipment';
    $scope.profile = items;
    $scope.loader = true;
    $scope.isKeys = false;
    $scope.isDuplicateKey = false;
    $scope.keys = [];
    $scope.keyColumns = [{
        value: 'key.fieldKey',
        title: 'Field key <span class="red"></span>',
        renderer: commonService.cellRenderer,
        regex:alphanumeric,
        width: 500
    }];
    $scope.group = {};
    $scope.fieldTypes = ["text", "numeric", "multiline", "dropdown", "date", "multiselect"];
    $scope.dependentFields=[];
    $scope.selectedFields =[];
    $scope.selectedField = null;
    var alphanumeric =/^([a-z]|[a-z]+\d)[a-z\d]*$/i;
    var allData = [];
    var render = function(instance, td, row, col, prop, value, cellProperties) {
        if (cellProperties.type == 'autocomplete')
            Handsontable.AutocompleteCell.renderer.apply(this, arguments);
        else if (cellProperties.type == 'date')
            Handsontable.DateCell.renderer.apply(this, arguments);
        else
            Handsontable.TextCell.renderer.apply(this, arguments);

        td.title = cellProperties.title;
        $(td).html('<i id="df_'+row+'" class="icon-file fa-2x" onclick="angular.element(this).scope().editDependents(this.id)" style="cursor:pointer"></i>');
    };

    $scope.columns = [{
            value: 'field.key',
            title: 'Field key <span class="red"> &#10038; </span>',
            strict: true,
            src: 'metadata_globalFields',
            type: 'autocomplete',
            width: 150
        }, {
            value: 'field.label',
            title: 'Field Name              <span class="red"> &#10038; </span>',
            width: 150
        }, {
            value: 'field.type',
            title: 'Field Type                          <span class="red"> &#10038; </span>',
            strict: true,
            src: $scope.fieldTypes,
            type: 'autocomplete',
            width: 100
        }, {
            value: 'field.suggestionsSource',
            title: 'Suggestion Source',
            type: 'autocomplete',
            src: 'suggestion',
            //strict: true,
            width: 150
        },{
            value: 'field.suggestionField',
            title: 'Suggestion Field',
            type: 'autocomplete',
            src: 'suggestionField',
            //strict: true,
            width: 150
        },{
            value: 'field.length',
            title: 'Length       <span class="red"> &#10038; </span>',
            type: 'numeric',
            allowInvalid: false,
            width: 80
        }, {
            value: 'field.defaultValue',
            title: 'Default Value',
            width: 150
        }, {
            value: 'field.isDefault',
            type: 'checkbox',
            title: 'Is Default',
            readOnly: true,
            width: 80
        }, //validator: email_validator_fn,
        {
            value: 'field.isMandatory',
            type: 'checkbox',
            title: 'Is Mandatory',
            width: 80
        }, {
            value: 'field.isMasterField',
            type: 'checkbox',
            title: 'Is Master Field',
            width: 80
        }, {
            value: 'field.isUniqueField',
            type: 'checkbox',
            title: 'Is Unique Field',
            width: 80
        }, {
            value: 'field.regex',
            title: 'Regular expression',
            width: 250
        }, {
            value: 'field.toolTip',
            title: 'Tool Tip',
            width: 150
        }, {
            value: 'field.errorMessage',
            title: 'Error message',
            width: 250
        }, {
            value: 'field.displayOrder',
            title: 'Display Order <span class="red"> &#10038; </span>',
            type: 'numeric',
            allowInvalid: false,
            width: 80
        }, {
            value: 'field.description',
            title: 'Description',
            width: 200
        }, {
            value: 'field.isActive',
            type: 'checkbox',
            title: 'Active'
        }, {
            value: 'field.isReadonly',
            type: 'checkbox',
            title: 'Read Only'
        }
        ,{
            value: 'field.isDependent',
            type: 'checkbox',
            title: 'Is Dependent',
            width: 50
        },{
            value: 'field.dependentFields',
            readOnly: true,
            title: 'Dependent Fields',
            renderer:render,
            width: 50
        }
    ];




    if ($scope.profile.docType.substring(0,3) === 'IMS'){
        $scope.columns.push({
            value: 'field.issueIdentifier',
            title: 'Issue Identifier',
            type: 'checkbox',
            width: 50
        });
        $scope.columns.push({
            value: 'field.duplicateIdentifier',
            title: 'Duplicate Identifier',
            type: 'checkbox',
            width: 50
        });
        $scope.columns.push({
            value: 'field.addInSummary',
            title: 'Summary Field',
            type: 'checkbox',
            width: 50
        });
        $scope.columns.push({
            value: 'field.activeForFilter',
            title: 'Active For Filter',
            type: 'checkbox',
            width: 50
        });
        $scope.columns.push({
            value: 'field.isReadOnlyAfterRaise',
            title: 'ReadOnly After Raise',
            type: 'checkbox',
            width: 50
        });
//        $scope.columns.push({
//            value: 'field.isActiveAfterRaise',
//            title: 'Active After Raise',
//            type: 'checkbox',
//            width: 50
//        });
    }

    function popAlert(msg) {
        flash.pop({
            title: 'Alert',
            body: msg,
            type: 'error'
        });
    }

    function saveValidFields(dataTosave) {
        $scope.loader = true;
        $scope.profile.fields = dataTosave;
        var apiUrl = '/api/template/'+$scope.profile.templateId;
        if ($scope.profile.docType === "company" || $scope.profile.docType === "system")
            apiUrl = '/api/template/virtual/'+$scope.profile.templateId;
        else if($scope.profile.docType.substring(0,3) === 'IMS')
            apiUrl = '/api/IMS/template';
        var promise = commonService.ajaxCall('PUT', apiUrl + '?type=' + $scope.profile.docType, $scope.profile);
        promise.then(function(msg) {
                $scope.fielsLoader = false;
                $scope.loader = false;

                if($scope.profile.docType.substring(0,3) === 'IMS' && msg.id) $scope.profile.templateId = msg.id;
                else if(msg.templateId) $scope.profile.templateId = msg.templateId;
                else  flash.pop({
                        title: 'Success',
                        body: msg.msg,
                        type: 'success'
                    });

                if(msg.profileName) $scope.profile.profileName=msg.profileName;

                $modalInstance.close($scope.profile.docType === "company" || $scope.profile.docType === "system"?$scope.profile.templateId:$scope.profile);
            },
            function(msg) {
                $scope.fielsLoader = false;
                popAlert(msg.data);
                $scope.loader = false;
            }
        );
    }

    function showModel(msg, dataTosave) {
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
            if ($scope.profile.docType == 'systemShipment') {
                $scope.profile.affectAccounts = 'True';
                saveValidFields(dataTosave);
            } else
                saveValidFields(dataTosave);
        }, function(selectedItem) {
            if ($scope.profile.docType == 'systemShipment') {
                $scope.profile.affectAccounts = 'False';
                saveValidFields(dataTosave);
            }
        });
    }

    $scope.editDependents = function(id){
        $scope.selectedField = $scope.profile.fields[id.split('_')[1]];
        $scope.dependentFields = $scope.selectedField.dependentFields;
        if($scope.dependentFields==null)
            $scope.dependentFields =  $scope.selectedField.dependentFields=[{fieldKey:null,fieldValue:null}];
        $scope.setSelected();
        $scope.$apply();
    };

    $scope.updateTemplate = function() {
        $scope.loader = true;

        if ($scope.profile.docType == 'systemShipment') {
            if ($scope.isDuplicateKey == true) {
                $scope.loader = false;
                return false;
            }
        }
        if ($scope.isKeys) {
            if($scope.keys.length<2){
                flash.pop({
                    title: 'Alert',
                    body: 'No data to save!',
                    type: 'warning'
                });
                $scope.loader = false;
                return;
            }
            var invalidMsgList = [];
            var dataToSave = [];
            var inValFieldKeys = [];
            for (var i = 0; i < $scope.keys.length; i++) {
                if($scope.keys[i]["fieldKey"]){
                    if (alphanumeric.test($scope.keys[i]["fieldKey"]) === false){
                        var invalMsg = {};
                        invalMsg.regex = [];
                        invalMsg.mandatory = [];
                        invalMsg.length = [];
                        invalMsg.serverMsg = {};
                        invalMsg.regex.push("fieldKey");
                        invalMsg.serverMsg["fieldKey"] = "Only Alphanumeric value starting with alphabet(s) is allowed!";
                        invalidMsgList.push(invalMsg);
                        inValFieldKeys.push($scope.keys[i]);
                    }
                    else dataToSave.push($scope.keys[i]);
                }
            }
            commonService.setInvalList(invalidMsgList);
            if(invalidMsgList.length>0) setTimeout(function(){ $('div#keyHT .handsontable').handsontable('render')},100);
            if(dataToSave.length>0){
                var promise = commonService.ajaxCall('PUT', ' api/grid/metadata', {
                    'data': dataToSave,
                    'type': 'globalFields'
                });
                promise.then(function(msg) {
                        $scope.fielsLoader = false;
                        flash.pop({
                            title: 'Success',
                            body: msg,
                            type: 'info'
                        });
                        $scope.loader = false;
                    },
                    function(data) {
                        $scope.fielsLoader = false;
                        if (data.status === 412) {
//                            var invalidMsgList = [];
                            flash.pop({
                                title: 'Alert',
                                body: 'Some Invalid fields not saved are in grid, Please correct and save again.',
                                type: 'warning'
                            });
                            $scope.keys = Array.concat(inValFieldKeys,data.data.doc);
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
                            commonService.setInvalList(invalidMsgList);
                        } else
                            popAlert(msg.data);
                        $scope.loader = false;
                    }
                );
            }
            else{
                flash.pop({
                    title: 'Alert',
                    body: 'Some Invalid fields not saved are in grid, Please correct and save again.',
                    type: 'warning'
                });
                $scope.loader = false;
            }
        } else {
            var hasMasterField = false;
            var invalidRows = '';
            var dataTosave = [];
            if (allData.length > 0)
                $scope.profile.fields = allData;
            for (var i = 0; i < $scope.profile.fields.length - 1; i++) {
                if ('value' in $scope.profile.fields[i])
                    delete $scope.profile.fields[i].value;
                if ($scope.profile.fields[i].isMasterField)
                    hasMasterField = true;
                var duplicateCount = 0;

                if ($scope.profile.fields[i].displayOrder != null)
                    for (var j = 0; j < $scope.profile.fields.length - 1; j++)
                        if ($scope.profile.fields[j].displayOrder == $scope.profile.fields[i].displayOrder) {
                            duplicateCount += 1;
                            if (duplicateCount > 1) {
                                popAlert('Duplicate display order Value at row No.' + (i + 1));
                                $scope.loader = false;
                                return false;
                            }
                        }

                if ($scope.profile.fields[i].key == null || $scope.profile.fields[i].label == null || $scope.profile.fields[i].type == null || $scope.profile.fields[i].length == null || $scope.profile.fields[i].displayOrder == null) {
                    invalidRows += '\t ' + (i + 1);
                    continue;
                }

                if ($scope.profile.fields[i].suggestionsSource && $scope.profile.fields[i].suggestionsSource.indexOf(',') !== -1) {
                    $scope.profile.fields[i].suggestionsSource = $scope.profile.fields[i].suggestionsSource.split(',');
                }
                console.log($scope.profile.fields[i].regex);
                if (!$scope.profile.fields[i].regex ||  $scope.profile.fields[i].regex == null) {
                    $scope.profile.fields[i].regex="";
                }
                dataTosave.push($scope.profile.fields[i]);
            }

            if ($scope.profile.fields[0].key === null && $scope.profile.fields.length < 2) {
                popAlert('No valid data to save.');
                $scope.loader = false;
                return false;
            }

            if (!hasMasterField) {
                popAlert('template should have a master field!');
                $scope.loader = false;
                return false;
            }

            if (invalidRows !== '')
                showModel('Some mandatory fields are not filled! at row no.' + invalidRows + ', Press Yes to continue or No to abort.', dataTosave);
            else if ($scope.profile.docType == 'systemShipment')
                showModel('Do you want to apply the changes to linked accounts ?', dataTosave);
            else
                saveValidFields(dataTosave);
        }
    };

    $scope.celChange = function(values) {
        var field = null;
        for (var i = 0; i < values.length; i++) {


            if ((values[i][1] == 'key' || values[i][1] == 'label' || values[i][1] == 'type' || values[i][1] == 'length' || values[i][1] == 'displayOrder') && values[i][3] === '') {
                popAlert('Field is mandatory!');
                return false;
            }
            if (values[i][3] === '')
                values[i][3] = null;
            else if (values[i][3] === 'true' || values[i][3] === 'false')
                values[i][3] = eval(values[i][3]);
            else {
                var totalFields = $scope.profile.fields.length;
                field = $scope.profile.fields[values[i][0]];
                //$rootScope.loggedInUser.permissions.pid.indexOf('*') == -1 &&
                if ((values[i][1] == 'key' || values[i][1] == 'isMandatory' || values[i][1] == 'isMasterField' || values[i][1] == 'isUnique' || values[i][1] == 'isActive') && (field && field.isDefault)) {
                    popAlert('you can not change this value of default field.');
                    $('#fch .handsontable').handsontable('render');
                    return false;
                }

                if (values[i][1] == 'key') {
                    for (var j = 0; j < totalFields; j++) {
                        if ($scope.profile.fields[j].key == values[i][3]) {
                            popAlert('Can\'t fill duplicate value in "Field key".');
                            return false;
                        }
                    }
                }

                if (values[i][1] == 'type' && $scope.profile.templateId) { //&& $scope.profile.templateId !=="default"
                    popAlert('"Type" can\'t be changed.');
                    return false;
                }

                else if (values[i][1] == 'isMasterField') {
                    for (var j = 0; j < totalFields; j++) {
                        if (values[i][3] && $scope.profile.fields[j].isMasterField) {
                            popAlert('Only one "Master Field" is allowed.');
                            $('#fch .handsontable').handsontable('render');
                            return false;
                        }
                    }
                }
                else if (values[i][1] == 'displayOrder' && (values[i][3] < 1 || values[i][3] > totalFields - 1)) {
                    popAlert('Out of range display order!');
                    return false;
                }
                else if (values[i][1] == 'regex') {
                    try {
                        var r = null;
                        if (values[i][3].indexOf('/') === 0)
                            r = eval(values[i][3]);
                        else
                            r = eval('/' + values[i][3] + '/');
                        values[i][3] = r.toString();
                    } catch (e) {
                        popAlert('Invalid regex');
                        return false;
                    }
                }
                else if (values[i][1] == 'addInAccessSet') {
                    var promisePermission = commonService.ajaxCall('PUT', 'api/permissionMetadata', {
                        'fieldKey': field.key,
                        'docType': $scope.profile.docType,
                        'change': values[i][3] ? 'add' : 'delete'
                    });
                    promisePermission.then(function (msg) {
                    }, function (msg) {
                    });
                }
            }
        }
    };

    $scope.afterChange = function(values) {
        if (values != null) {
            for (var i = 0; i < values.length; i++) {
                if (values[i][1] != 'displayOrder' && values[i][2] == null && $scope.profile.fields[values[i][0]].displayOrder == null) {
                    var maxOrder = 0; //$('#fch .handsontable').handsontable('getDataAtCol',12);
                    //allOrders = allOrders.max();
                    for (var j = 0; j < $scope.profile.fields.length; j++) {
                        if ($scope.profile.fields[j].displayOrder != null && maxOrder < $scope.profile.fields[j].displayOrder)
                            maxOrder = $scope.profile.fields[j].displayOrder;
                    }
                    if (maxOrder < $scope.profile.fields.length - 1)
                        $scope.profile.fields[values[i][0]].displayOrder = maxOrder + 1;
                    else
                        popAlert('Display order is invalid!');
                }
            }


            if ($scope.profile.docType == 'systemShipment') {
                $scope.isDuplicateKey = false;
                var totalFields = $scope.profile.fields.length;
                for (var i = 0; i < totalFields; i++) {

                    if (i != values[0][0]) {
                        if (($scope.profile.fields[i].key + '~' + $scope.profile.fields[i].group) == ($scope.profile.fields[values[0][0]].key + '~' + $scope.profile.fields[values[0][0]].group)) {

                            popAlert('You can not fill duplicate value in "Field key". Please verify key in row ' + (i + 1) + ' and ' + values[0][0] + '.');
                            $scope.isDuplicateKey = true;

                        }
                    }
                }
            }
        }
    };

    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    };

    $scope.beforeKeyChange = function(values) {
//            for (var i = 0; i < values.length; i++) {
//                if(values[i][3] != '' && values[i][3] != null){
//                    if (alphanumeric.test(values[i][3]) == false) {
//                        popAlert('Spacial Characters are not allowed At Row#' + (values[i][0] + 1));
//                        return false;
//                    }
//                    if (values[i][3].length > 100) {
//                        popAlert('Max Length 100 Characters Exceeded At Row#' + (values[i][0] + 1));
//                        return false;
//                    }
//                }
//            }
            commonService.setInvalList([]);
      //  }
    };

    $scope.addKeys = function(e) {
        if ($(e).text() == 'Add Keys') {
            $scope.isKeys = true;
            $(e).text('Edit Fields')
        } else {
            $scope.isKeys = false;
            $(e).text('Add Keys')
        }
    };

    $scope.setSelected=function(){
        $scope.selectedFields =[];
        for (var i = 0; i < $scope.dependentFields.length; i++) {
            if($scope.dependentFields[i].fieldKey && $scope.dependentFields[i].fieldKey[0])
                $scope.selectedFields.push($scope.dependentFields[i].fieldKey[0].id)
        }
    };

    $scope.loader = false;
});