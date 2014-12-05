/**
 * Created by kamalsingh.saini on 13/12/13.
 */
angularApp.controller('accountRulesCtrl', function($scope, $state, $routeParams, $location, $modal, commonService, flash, $filter) {
    $scope.rulesProfile = {};

    $scope.rulesData = {};
    $scope.clone = {};

    var querySearchText = "";
    var profiledata = {};

    $scope.isDefaultTemplate = false;

    //  $scope.selectedAccounts ={};
    //    $scope.$parent.showBackBtn = true;
    $scope.redirectTo = function(path) {
        $location.path($state.current.name.split('.')[0] + path);
    };
    // $scope.$watch("querySearch", function(newValue, oldValue) {

    //     console.log();
    //     console.log($scope.querySearch);
    // });

    //To render Html in handsontable cell
    var render = function(instance, td, row, col, prop, value, cellProperties) {
        if (cellProperties.type == 'autocomplete')
            Handsontable.AutocompleteCell.renderer.apply(this, arguments);
        else if (cellProperties.type == 'date')
            Handsontable.DateCell.renderer.apply(this, arguments);
        else
            Handsontable.TextCell.renderer.apply(this, arguments);

        td.title = cellProperties.title;
        $(td).html('<i id="df_' + row + '" class="icon-file fa-2x" onclick="angular.element(this).scope().editDependents(this.id)" style="cursor:pointer"></i>');
    };

    // body...

    function generateForms(data) {
        $scope.rulesData = {};
        //        $scope.$parent.$parent.validForm = (data.fields.length == 0);

        // Comment by keyur
        // function createSubGroup(a, i) {
        //     var g = data.fields[i].group;
        //     var hasKey = false;
        //     for (var j = 0; j < a.length; j++)
        //         if (g in a[j]) {
        //             a[j][g].push(data.fields[i]);
        //             hasKey = true;
        //             break;
        //         }
        //     if (!hasKey) {
        //         var sb = {};
        //         sb[g] = [];
        //         sb[g].push(data.fields[i]);
        //         a.push(sb);
        //     }
        // }
        // for (var i = 0; i < data.fields.length; i++) {
        //     if (data.fields[i].isActive) {
        //         var g = data.fields[i].parentGroup;
        //         if (g == null) {
        //             g = data.fields[i].group;
        //             if ((g in $scope.rulesData) == false) {
        //                 $scope.rulesData[data.fields[i].group] = [];
        //                 $scope.rulesData[data.fields[i].group].push(data.fields[i]);
        //             } else
        //                 $scope.rulesData[data.fields[i].group].push(data.fields[i]);
        //         } else {
        //             if ((g in $scope.rulesData) == false) {
        //                 var a = $scope.rulesData[data.fields[i].parentGroup] = [];
        //                 createSubGroup(a, i);
        //             } else {
        //                 var a = $scope.rulesData[data.fields[i].parentGroup];
        //                 createSubGroup(a, i);
        //             }
        //         }
        //     }
        // }
        if ($scope.profile.template == null) {
            //Comment by keyur
            // $scope.Template = {};
            var promise = commonService.ajaxCall('GET', 'api/template/profile/' + $routeParams.systemId);
            promise.then(function(data) {
                $scope.profile.template = data;

            }, function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
        }

        for (var i = 0; i < $scope.profile.template.length; i++) {
            if ($scope.profile.template[i].value != null) {
                $scope.isDefaultTemplate = false;
                break;
            }
        }

        allData = $scope.profile.fields;
        $scope.profile.accountId = $scope.selectedAccounts.accountIds[0];
        $scope.getChargeTemplate();
    }

    $scope.getFields = function() {
        commonService.loader(true);
        if ($scope.selectedAccounts == null) {
            $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account');
            return;
        }
        //        $scope.$parent.$parent.loader = true;
        var accountNo = ($scope.clone.accountid && $scope.clone.accountid.length == 1 ?
            '&accountId=' + $scope.clone.accountid[0].id : '&accountId=' + $scope.selectedAccounts.accountIds[0]);
        //        if($scope.rulesProfile.template){
        //            for (var i = 0; i < $scope.rulesProfile.template.length; i++)
        //            if($scope.rulesProfile.template[i].value)
        //                accountNo+= '&'+$scope.rulesProfile.template[i].key+'='+$scope.rulesProfile.template[i].value[0].n;
        //        }
        var promise = null;
        // if ($scope.rulesProfile.template != undefined && $scope.rulesProfile.template.length != 0) {

        if ($scope.rulesProfile.template) {
            var isTemplateExist = false;
            for (var i = 0; i < $scope.rulesProfile.template.length; i++) {
                if ($scope.rulesProfile.template[i].value != null) {
                    if ($scope.rulesProfile.template[i].value.length > 0) {
                        isTemplateExist = true;
                        break;
                    }
                }
            }
            if (isTemplateExist == false)
                delete $scope.rulesProfile.template;
        }


        if ($scope.rulesProfile.template) {
            promise = commonService.ajaxCall('POST', '/api/template/profile/' + accountNo.substr(11) + '?type=accountShipment', $scope.rulesProfile.template);
        } else {
            promise = commonService.ajaxCall('GET', '/api/template/' + ($scope.selectedAccounts.rulesFor == 'Invoice' ? 'default' : 'systemId/' + $routeParams.systemId) + '?type=account' + $scope.selectedAccounts.rulesFor + accountNo);

        }
        promise.then(function(data) {

            if (data.isDefault == true) {
                $scope.isDefaultTemplate = true;

                flash.pop({
                    title: 'Template',
                    body: 'This is default template...!!!',
                    type: 'success'
                });
            } else {
                $scope.isDefaultTemplate = false;
            }
            if (data != 'null') {

                $scope.rulesProfile = data;
                data.fields = $filter('orderBy')(data.fields, 'displayOrder');
                $scope.profile = data;
                profiledata = $scope.profile.fields;

                if (accountShipmentTemplateId == "")
                    accountShipmentTemplateId = $scope.profile.templateId;
                if ($state.current.url == '/Shipmentrules') {
                    generateForms(data)
                }
            } else {
                $scope.rulesData = {};
            }

            // $scope.$parent.$parent.loader = false;
        }, function() {
            // $scope.$parent.$parent.loader = false;
        });
        commonService.loader(false);
    };

    $scope.update = function() {

        if ($state.current.url == '/Shipmentrules') {
            $scope.updateShipmentTemplate();
        } else {
            if ($scope.form.accountRule.$valid) {
                // $scope.$parent.$parent.loader = true;
                $scope.rulesProfile.accountId = $scope.selectedAccounts.accountIds[0];
                var promise = commonService.ajaxCall('PUT', '/api/rulesProfile', $scope.rulesProfile);
                promise.then(function(data) {
                    // $scope.$parent.$parent.loader = false;
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                }, function(data) {
                    // $scope.$parent.$parent.loader = false;
                    flash.pop({
                        title: 'Fail',
                        body: data.data,
                        type: 'alert'
                    });
                });
            } else flash.pop({
                title: 'Invalid Data',
                body: "Some fields are required or contains invalid data!",
                type: 'error'
            });
        }


    };

    $scope.$on("editTemplateAccountRules", function(event, args) {
        $scope.editTemplate();
    });

    $scope.$on("saveAccountRules", function(event, args) {
        $scope.update();

    });

    $scope.editTemplate = function() {
        var itemToSend = $scope.rulesProfile;
        if ($scope.rulesProfile.docType == '/Shipmentrules')
            itemToSend.accountId = $scope.selectedAccounts.accountIds[0];
        itemToSend.groupTab = true;
        var modalInstance = $modal.open({
            templateUrl: 'fieldsConfig.html',
            controller: 'fieldsConfigCtrl',
            resolve: {
                items: function() {
                    return angular.copy(itemToSend);
                }
            }
        });
        modalInstance.result.then(function(data) {
            $scope.rulesProfile = data;
            // if ($scope.currentTab == 'accountShipment') {
            //     generateForms(data);
            // }
        }, function(selectedItem) {
            console.log('Modal dismissed ');
        });
    };

    $scope.deliveryState = 'view';

    $scope.setDeliveryState = function(index) {
        return $scope.deliveryState = index;
    };

    $scope.getFields();


    $scope.RulesState = function(e) {
        var selectedAccounts = [];
        var accountNos = [];
        for (var i = 0; i < $scope.accounts.length; i++) {
            if ($scope.accounts[i].updateField == true && $scope.accounts[i].id != null) {
                selectedAccounts.push($scope.accounts[i].id)
                accountNos.push($scope.accounts[i].accountNumber)
            }
        }
        if (selectedAccounts.length > 0) {
            //accountService.setAccountsInfo({'accountNos': accountNos,'accountIds': selectedAccounts,'rulesFor':e });
            $scope.selectedAccounts = {
                'accountNos': accountNos,
                'accountIds': selectedAccounts,
                'rulesFor': e
            };
            $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/' + e);
        } else
            flash.pop({
                title: 'Information',
                body: "No account selected!.",
                type: 'warning'
            });
    };


    $scope.getInvoiceDeliveryModeList = function() {
        var promise = commonService.ajaxCall('GET', '/api/invoicedeliverymode?pageLimit=5&pageNo=1&systemID=' + $routeParams.systemId + '&accountID=' + $scope.selectedAccounts.accountIds.toString() + '');
        promise.then(function(result) {

            $scope.invoiceDeliveryModeList = result;

        }, function(result) {

            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });

    };

    $scope.invoiceDeliveryModeView = function(value) {
        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/invoiceDeliveryRuleDetails/' + value);
    };

    $scope.invoiceDeliveryModeEdit = function(value) {
        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/invoiceDeliveryRuleEdit/' + value);
    };

    $scope.invoiceDeliveryModeDefault = function(value) {

        var promise = commonService.ajaxCall('POST', '/api/invoicedeliverymodedefault', value);
        promise.then(function(result) {}, function(result) {

            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });

    };

    $scope.reset = function() {
        $('input[name^="TypeValue_"]').each(function(k, v) {
            $(v).select2('val', null);
            delete $scope.rulesProfile.template[k].value;
        });
    };

    //Shipment Field Grid

    var accountShipmentTemplateId = "";
    $scope.isRuleProfile = false;
    $scope.selectedTemplate = 'Shipment';

    $scope.profile = {};
    if ($state.current.url == '/Shipmentrules') {
        $scope.profile.fields = [{
            "isUniqueField": false,
            "isReadonly": false,
            "isMandatory": false,
            "tariffIdentifier": false,
            "isMasterField": false,
            "isDefault": false,
            "validationActive": false,
            "addInAccessSet": false,
            "isActive": false,
            "customFlag": false,
            "isMultiple": false
        }];
        profiledata = [{
            "isUniqueField": false,
            "isReadonly": false,
            "isMandatory": false,
            "tariffIdentifier": false,
            "isMasterField": false,
            "isDefault": false,
            "validationActive": false,
            "addInAccessSet": false,
            "isActive": false,
            "customFlag": false,
            "isMultiple": false
        }];
        // $scope.profile.template = [];
    }

    // $scope.loader = true;
    $scope.isKeys = false;
    $scope.isDuplicateKey = false;
    $scope.keys = [];
    $scope.keyColumns = [{
        value: 'key.fieldKey',
        title: 'Field key <span class="red">    (Only Alphanumeric)     </span>',
        renderer: commonService.cellRenderer,
        width: 500
    }];
    $scope.group = {};
    $scope.fieldTypes = ["text", "numeric", "multiline", "dropdown", "date", "multiselect"];
    var allData = [];
    var saveChange = true; // for accountShipment only.

    $scope.columns = [{
            value: 'field.key',
            title: 'Field key <span class="red"> &#10038; </span>',
            strict: true,
            src: 'metadata_globalFields',
            type: 'autocomplete',
            width: 150
        }, {
            value: 'field.label',
            title: 'Field Name          <span class="red"> &#10038; </span>',
            width: 150
        }, {
            value: 'field.type',
            title: 'Field Type                  <span class="red"> &#10038; </span>',
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
        }, {
            value: 'field.suggestionField',
            title: 'Suggestion Field',
            type: 'autocomplete',
            src: 'suggestionField',
            //strict: true,
            width: 150
        }, {
            value: 'field.length',
            title: 'Length       <span class="red"> &#10038; </span>',
            type: 'numeric',
            allowInvalid: false,
            width: 80
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
            value: 'field.group',
            title: 'Group Name',
            type: 'autocomplete',
            src: 'metadata_shipmentGroup',
            width: 150
        }, {
            value: 'field.parentGroup',
            title: 'Parent Group',
            readOnly: true,
            width: 150
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
        }, {
            value: 'field.addInAccessSet',
            type: 'checkbox',
            title: 'Add To Access',
            width: 50
        }, {
            value: 'field.isDependent',
            type: 'checkbox',
            title: 'Is Dependent',
            width: 50
        }, {
            value: 'field.tariffIdentifier',
            title: 'Tariff Identifier',
            type: 'checkbox',
            width: 50
        }, {
            value: 'field.dependentFields',
            readOnly: true,
            title: 'Dependent Fields',
            renderer: render,
            width: 30
        }, {
            value: 'field.isMultiple',
            type: 'checkbox',
            title: 'Is Multiple Field',
            width: 80
        }
    ];


    $scope.charges = [{
        updateField: null,
        id: null
    }];

    $scope.chargeColumns = [{
        value: 'charge.updateField',
        type: 'checkbox',
        title: 'Update',
        width: 50
    }];

    $scope.editDependents = function(id) {
        $scope.selectedField = $scope.profile.fields[id.split('_')[1]];
        $scope.dependentFields = $scope.selectedField.dependentFields;
        if ($scope.dependentFields == null)
            $scope.dependentFields = $scope.selectedField.dependentFields = [{
                fieldKey: null,
                fieldValue: null
            }];
        $scope.setSelected();
        $scope.$apply();
    };

    $scope.chargeCelChange = function(values) {
        for (var i = 0; i < values.length; i++) {
            if (values[i][3] !== values[i][2]) {
                if (values[i][3] === '')
                    values[i][3] = null;
                else if (values[i][3] === 'true' || values[i][3] === 'false')
                    values[i][3] = eval(values[i][3]);
                if (values[i][1] !== 'updateField' && (!$scope.charges[values[i][0]] || !$scope.charges[values[i][0]].updateField))
                    values.push([values[i][0], 'updateField', 'null', true]);
            }
        }
        commonService.setInvalList([]);
    };

    $scope.isRuleProfile = true;
    allData = $scope.profile.fields;


    $scope.filterByGroup = function() {
        if (this.group.selectedGroup != null && this.group.selectedGroup.length > 0) {
            $scope.profile.fields = [];
            for (var i = 0; i < allData.length; i++) {
                if (this.group.selectedGroup[0].n === allData[i].group)
                    $scope.profile.fields.push(allData[i]);


            }
            profiledata = $scope.profile.fields;
            $scope.group.selectedGroup = this.group.selectedGroup;
        } else {
            $scope.profile.fields = allData;
            profiledata = $scope.profile.fields;
        }
        // $scope.loader = false;
    };

    $scope.assignGroups = function() {
        if (this.group.parentGroup != null && $scope.group.selectedGroup.length > 0) {
            if (this.group.parentGroup.length > 0) {
                for (var i = 0; i < allData.length; i++) {
                    if ($scope.group.selectedGroup[0].n === allData[i].group)
                        allData[i].parentGroup = this.group.parentGroup[0].n;
                }
            } else
                for (var i = 0; i < allData.length; i++) {
                    if ($scope.group.selectedGroup[0].n === allData[i].group)
                        allData[i].parentGroup = null;
                }
        }
    };

    function popAlert(msg) {
        flash.pop({
            title: 'Alert',
            body: msg,
            type: 'error'
        });
    }



    $scope.getChargeTemplate = function() {
        // $scope.profile.template = [];
        // if ($scope.profile.template == null) {

        // } else {
        //     var chargepromise = commonService.ajaxCall('POST', '/api/grid/chargeCoderule', {
        //         profileBased: $scope.profile.template,
        //         systemId: $routeParams.systemId,
        //         accountId: $scope.selectedAccounts.accountIds[0]
        //     });
        //     chargepromise.then(function(data2) {
        //         if (data2.length > 0) {
        //             for (var i = 0; i < data2.length; i++)
        //                 data2[i].updateField = false;
        //             $scope.charges = data2;
        //         }
        //     }, function() {
        //         flash.pop({
        //             title: 'Alert',
        //             body: data.data,
        //             type: 'error'
        //         });
        //     });
        // }
        $scope.chargeColumns = [{
            value: 'charge.updateField',
            type: 'checkbox',
            title: 'Update',
            width: 50
        }];
        var promise = commonService.ajaxCall('GET', '/api/template/default?type=accountCharge');
        promise.then(function(data) {
            var sc = data.fields.sort(function(a, b) {
                return parseInt(a.displayOrder,10) - parseInt(b.displayOrder,10)
            });
            angular.forEach(sc, function(col, i) {
                if (col.isActive) {
                    switch (col.type) {
                        case 'dropdown':
                        case 'multiselect':
                            $scope.chargeColumns.push({
                                value: 'charge.' + col.key,
                                type: 'autocomplete',
                                title: col.label,
                                src: col.suggestionsSource == 'metadata_chargeCode' ? (col.suggestionsSource + '&systemId=' + $routeParams.systemId) : col.suggestionsSource,
                                width: col.length * 9,
                                length: col.length,
                                readOnly: col.isReadonly,
                                isMandatory: col.isMandatory,
                                key: col.key,
                                regex: col.regex,
                                renderer: commonService.cellRenderer,
                                toolTip: col.toolTip,
                                errorMessage: col.errorMessage,
                                displayOrder: col.displayOrder,
                                suggestionField: col.suggestionField
                            });
                            break;
                        default:
                            if (col.type == 'multiline')
                                col.type = 'text';
                            $scope.chargeColumns.push({
                                value: 'charge.' + col.key,
                                type: col.type,
                                allowInvalid: false,
                                title: col.label,
                                width: col.length * 9,
                                length: col.length,
                                readOnly: col.isReadonly,
                                isMandatory: col.isMandatory,
                                key: col.key,
                                renderer: commonService.cellRenderer,
                                regex: col.regex,
                                toolTip: col.toolTip,
                                errorMessage: col.errorMessage,
                                displayOrder: col.displayOrder,
                                suggestionField: col.suggestionField
                            });
                    }
                }
            });


            // promise = commonService.ajaxCall('GET', 'api/template/profile/' + $routeParams.systemId);
            // promise.then(function(data) {
            //     $scope.profile.template = data;
            var accountNo = ($scope.clone.accountid && $scope.clone.accountid.length == 1 ?
                '&accountId=' + $scope.clone.accountid[0].id : '&accountId=' + $scope.selectedAccounts.accountIds[0]);
            // accountId: $scope.selectedAccounts.accountIds[0]
            var chargepromise = commonService.ajaxCall('POST', '/api/grid/chargeCoderule', {
                profileBased: $scope.profile.template,
                systemId: $routeParams.systemId,
                accountId: accountNo.substr(11)
            });
            chargepromise.then(function(data2) {
                if (data2.length > 0) {
                    for (var i = 0; i < data2.length; i++)
                        data2[i].updateField = false;
                    $scope.charges = data2;
                }
            }, function() {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
            // }, function(data) {
            //     flash.pop({
            //         title: 'Alert',
            //         body: data.data,
            //         type: 'error'
            //     });
            // });
            // setTimeout(function() {
            //     var chargepromise = commonService.ajaxCall('POST', '/api/grid/chargeCoderule', {
            //         profileBased: $scope.profile.template,
            //         systemId: $routeParams.systemId,
            //         accountId: $scope.selectedAccounts.accountIds[0]
            //     });
            //     chargepromise.then(function(data) {
            //         if (data.length > 0) {
            //             for (var i = 0; i < data.length; i++)
            //                 data[i].updateField = false;
            //             $scope.charges = data;
            //         }
            //     }, function() {
            //         flash.pop({
            //             title: 'Alert',
            //             body: data.data,
            //             type: 'error'
            //         });
            //     });

            // }, 4000);


        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });
    }

    function saveAccountShipment() {
        if ($scope.profile.docType === "/Shipmentrules") {
            if ($scope.charges.length < 2) {
                popAlert('No Charge Configured!');
                return;
            }

            var dataTosave = commonService.validateGridData($scope.charges, $scope.chargeColumns, 'default');
            if (dataTosave.validData.data.length == 0 && dataTosave.inValidData.length == 0) {
                //     // $modalInstance.close($scope.profile.docType === "company" || $scope.profile.docType === "system" ? $scope.profile.templateId : $scope.profile);
                flash.pop({
                    title: 'Success',
                    body: 'Template updated successfully',
                    type: 'success'
                });

            }
            commonService.setInvalList(dataTosave.arrInvalidMsg);
            if (dataTosave.inValidData.length > 0) {
                $scope.charges = dataTosave.inValidData;
            }

            if (dataTosave.validData.data.length > 0) {
                commonService.loader(true);
                dataTosave.validData.profileBased = $scope.profile.template;
                dataTosave.validData.systemId = $routeParams.systemId;
                dataTosave.validData.accountId = $scope.profile.accountId;
                var promise = commonService.ajaxCall('PUT', '/api/grid/chargeCoderule', dataTosave.validData);
                promise.then(function(data) {
                        commonService.loader();
                        //                        if (dataTosave.inValidData.length > 0) {
                        //                            flash.pop({
                        //                                title: 'Waring',
                        //                                body: 'Charge Grid contains some Invalid data, which is not saved',
                        //                                type: 'warning'
                        //                            });
                        //                            $scope.charges = dataTosave.inValidData;
                        //                        } else {
                        // $modalInstance.close($scope.profile.docType === "company" || $scope.profile.docType === "system" ? $scope.profile.templateId : $scope.profile);
                        flash.pop({
                            title: 'Success',
                            body: data,
                            type: 'success'
                        });
                        //                        }
                    },
                    function(data) {
                        commonService.loader();
                        if (data.status === 412) {
                            popAlert('Some Invalid Charges not saved, are in grid, Please correct and save again.');
                            var invalidMsgList = [];
                            if ($scope.charges.length > 1) {
                                dataTosave.inValidData.pop();
                                $scope.charges = dataTosave.inValidData.concat(data.data.doc);
                            } else
                                $scope.charges = data.data.doc;
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
                            flash.pop({
                                title: 'Alert',
                                body: data.data,
                                type: 'error'
                            });
                    });
            } else {
                if (dataTosave.inValidData.length > 0) {
                    flash.pop({
                        title: 'Invalid Charges',
                        body: 'Grid contains invalid Charges!',
                        type: 'warning'
                    });
                    $scope.charges = dataTosave.inValidData;
                }
            }
        }
        //else
        // $modalInstance.close($scope.profile.docType === "company" || $scope.profile.docType === "system" ? $scope.profile.templateId : $scope.profile);
    }

    function saveValidFields(dataTosave) {
        // $scope.loader = true;
        $scope.profile.fields = dataTosave;
        var apiUrl = '/api/template/';
        if ($scope.profile.docType === "company" || $scope.profile.docType === "system")
            apiUrl = '/api/template/virtual/';

        $scope.profile.templateId = accountShipmentTemplateId;
        var promise = commonService.ajaxCall('PUT', apiUrl + $scope.profile.templateId + '?type=' + $scope.profile.docType, $scope.profile);
        promise.then(function(msg) {
                $scope.fielsLoader = false;
                saveChange = false;
                // $scope.loader = false;
                saveAccountShipment();
                $scope.profile.templateId = msg.templateId;
                profiledata = $filter('orderBy')(dataTosave, 'displayOrder');
                $scope.gridFilter(querySearchText);
                flash.pop({
                    title: 'Success',
                    body: msg.msg,
                    type: 'success'
                });
            },
            function(msg) {
                $scope.fielsLoader = false;
                popAlert(msg.data);
                // $scope.loader = false;
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

    $scope.updateShipmentTemplate = function() {

        // $scope.loader = true;



        if ($state.current.url == '/Shipmentrules' && !saveChange) {
            saveAccountShipment();
        }
        if ($scope.isKeys) {
            var promise = commonService.ajaxCall('PUT', ' api/grid/metadata', {
                'data': $scope.keys,
                'type': 'globalFields'
            });
            promise.then(function(msg) {
                    $scope.fielsLoader = false;
                    flash.pop({
                        title: 'Success',
                        body: msg,
                        type: 'info'
                    });
                    // $scope.loader = false;
                },
                function(data) {
                    $scope.fielsLoader = false;
                    if (data.status === 412) {
                        var invalidMsgList = [];
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid fields not saved are in grid, Please correct and save again.',
                            type: 'warning'
                        });
                        $scope.keys = data.data.doc;
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
                    // $scope.loader = false;
                }
            );
        } else {
            var hasMasterField = false;
            var invalidRows = '';
            var dataTosave = [];

            var fieldsKey = [];
            var tmpObj = {};
            for (var i = 0; i < $scope.profile.fields.length; i++) {
                if ($scope.profile.fields[i].key != null)
                    fieldsKey.push($scope.profile.fields[i].key);
                else {
                    tmpObj = $scope.profile.fields[i];
                    $scope.profile.fields.pop(i);
                }

            }

            for (var i = 0; i < profiledata.length; i++) {
                if (profiledata[i].key != null)
                    if (fieldsKey.indexOf(profiledata[i].key) < 0)
                        $scope.profile.fields.push(profiledata[i]);
            }
            $scope.profile.fields.push(tmpObj);

            if (allData.length > 0)
                $scope.profile.fields = allData;
            for (var i = 0; i < $scope.profile.fields.length - 1; i++) {
                if ('value' in $scope.profile.fields[i])
                    delete $scope.profile.fields[i].value;
                // if ($scope.profile.fields[i].isMasterField)
                //     hasMasterField = true;
                var duplicateCount = 0;

                if ($scope.profile.fields[i].displayOrder != null)
                    for (var j = 0; j < $scope.profile.fields.length - 1; j++)
                        if ($scope.profile.fields[j].displayOrder == $scope.profile.fields[i].displayOrder) {
                            duplicateCount += 1;
                            if (duplicateCount > 1) {
                                popAlert('Duplicate display order Value at row No.' + (i + 1));
                                // $scope.loader = false;
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
                dataTosave.push($scope.profile.fields[i]);
            }

            if ($scope.profile.fields[0].key === null && $scope.profile.fields.length < 2) {
                popAlert('No valid data to save.');
                // $scope.loader = false;
                return false;
            }

            // if (!hasMasterField) {
            //     popAlert('template should have a master field!');
            //     // $scope.loader = false;
            //     return false;
            // }
            if ($scope.profile.docType == 'systemShipment') {
                if ($scope.isDuplicateKey == true) {
                    // $scope.loader = false;
                    return false;
                }
            }

            if (invalidRows !== '')
                showModel('Some mandatory fields are not filled! at row no.' + invalidRows + ', Press Yes to continue or No to abort.', dataTosave);
            else if ($state.current.url == '/systemShipment')
                showModel('Do you want to apply the changes to linked accounts ?', dataTosave);
            else
                saveValidFields(dataTosave);
        }
    };

    $scope.celChange = function(values) {
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
                //$rootScope.loggedInUser.permissions.pid.indexOf('*') == -1 &&
                if ((values[i][1] == 'key' || values[i][1] == 'isMandatory' || values[i][1] == 'isMasterField' || values[i][1] == 'isUnique' || values[i][1] == 'isActive') && ($scope.profile.fields[values[i][0]] && $scope.profile.fields[values[i][0]].isDefault)) {
                    popAlert('you can not change this value of default field.');
                    $('#fch .handsontable').handsontable('render');
                    return false;
                }

                if (values[i][1] == 'key' || values[i][1] == 'isMasterField' || values[i][1] == 'displayOrder') {
                    for (var j = 0; j < totalFields; j++) {
                        if ($scope.profile.docType != 'systemShipment') {
                            if (values[i][1] == 'key') {

                                if ($scope.profile.fields[j].key == values[i][3]) {
                                    popAlert('You can not fill duplicate value in "Field key".');
                                    return false;
                                }
                                continue;
                            }
                        }

                        if (values[i][1] == 'isMasterField') {
                            if (values[i][3] && $scope.profile.fields[j].isMasterField) {
                                popAlert('Only one "Master Field" is allowed.');
                                $('#fch .handsontable').handsontable('render');
                                return false;
                            }
                            // continue;
                        }

                    }
                }

                if (values[i][1] == 'isMultiple') {

                    if (values[0][3] == true)
                        tmpMsg = 'Do you want to apply multiple field on ' + $scope.profile.fields[values[0][0]].group + ' group ?';
                    else
                        tmpMsg = 'Do you want to remove multiple field from ' + $scope.profile.fields[values[0][0]].group + ' group ?';
                    var modalInstance = $modal.open({
                        templateUrl: 'confirm.html',
                        controller: 'modalInstanceCtrl',
                        resolve: {
                            items: function() {
                                return angular.copy({
                                    msg: tmpMsg
                                });
                            }
                        }
                    });
                    modalInstance.result.then(function(selectedItem) {
                        for (var j = 0; j < totalFields; j++) {
                            if (j != values[0][0]) {
                                if ($scope.profile.fields[values[0][0]].group == $scope.profile.fields[j].group) {
                                    $scope.profile.fields[j].isMultiple = values[0][3];
                                }
                            }
                        }
                    }, function(selectedItem) {
                        if (values[0][3] == true)
                            $scope.profile.fields[values[0][0]].isMultiple = false;
                        else
                            $scope.profile.fields[values[0][0]].isMultiple = true;
                    });


                }

                if (values[i][1] == 'displayOrder' && (values[i][3] < 1 || values[i][3] > totalFields - 1)) {
                    popAlert('Out of range display order!');
                    return false;
                }
                if (values[i][1] == 'regex') {
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
            }
            if (values[i][1] == 'profileBased') {
                var PBType = $scope.profile.fields[values[i][0]].type;
                if (PBType !== 'dropdown' && PBType !== 'multiselect' || !$scope.profile.fields[values[i][0]].suggestionsSource) {
                    popAlert('Applicable only for "dropdown" / "multiselect" type having suggestion source!');
                    $('#fch .handsontable').handsontable('render');
                    return false;
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
                    //values.push([values[i][0], 'displayOrder', 'null',allOrders +1]);
                    else
                        popAlert('Display order is invalid!');
                }
            }



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
    };

    $scope.beforeKeyChange = function(values) {
        var alphanumeric = /^[a-zA-Z0-9]+$/;
        for (var i = 0; i < values.length; i++) {
            if (alphanumeric.test(values[i][3]) == false && values[i][3] != '' && values[i][3] != null) {
                popAlert('Only Alphanumeric values are allowed, Invalid At Row#' + (values[i][0] + 1));
                return false;
            }
            if (values[i][3].length > 100) {
                popAlert('Max Length 100 Characters Exceeded At Row#' + (values[i][0] + 1));
                return false;
            }

        }
        commonService.setInvalList([]);
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
    $scope.$on("accountShipmentAddKeys", function(event, args) {
        $scope.addKeys(args);
    });

    $scope.changeTemplate = function(template) {
        $scope.selectedTemplate = template;
        commonService.setInvalList([]);
        setTimeout("$('div.handsontable:visible').handsontable('render');", 100);
    };


    // $scope.loader = false;

    //filter
    // $scope.$watch("querySearch", function(newVal, oldVal) {
    //     // $scope.profile.fields = $filter('filter')(profiledata, $scope.querySearch);
    //     console.log("querySearch");

    // });

    //Search 
    $scope.gridFilter = function(q) {
        $scope.profile.fields = $filter('filter')(profiledata, q);
        $scope.profile.fields = $filter('orderBy')($scope.profile.fields, 'displayOrder')
        querySearchText = q;
    };

    $scope.setSelected = function() {
        $scope.selectedFields = [];
        for (var i = 0; i < $scope.dependentFields.length; i++) {
            if ($scope.dependentFields[i].fieldKey && $scope.dependentFields[i].fieldKey[0])
                $scope.selectedFields.push($scope.dependentFields[i].fieldKey[0].id)
        }
    };

    $scope.profile.fields = profiledata;

});