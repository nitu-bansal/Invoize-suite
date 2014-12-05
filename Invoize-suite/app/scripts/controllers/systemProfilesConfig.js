angularApp.controller('profilesConfigCtrl', function($scope, $rootScope, $timeout, $http, $location, $stateParams, $state, $route, $routeParams, $modal, commonService, flash, $filter) {

    //    $scope.currentTab = 'systemInvoice';
    $scope.profile = {};
    $scope.cloneSystem = {};
    $scope.dependentFields = [];
    $scope.selectedFields = [];
    $scope.selectedField = null;
    var querySearchText = "";
    var profiledata = {};

    //Start Filter Object
    $scope.rule = {};
    $scope.rule.conditions = {};
    $scope.fields = {};
    $scope.sortedFields = [];
    $scope.filterObj = {};
    $scope.list = [];
    $scope.filter = {};
    $scope.custObj = {};
    $scope.autosuggestSource = $state.current.url.slice(1, $state.current.url.length);
    $scope.isMetadataEdit = false;
    //End Filter Object

    $scope.childFields = {};
    $scope.childSortedFields = [];
    $scope.childCustObj = {};

    $scope.redirectTo = function(path) {
        //Start Filter Object
        $scope.rule = {};
        $scope.rule.conditions = {};
        $scope.fields = {};
        $scope.sortedFields = [];
        $scope.filterObj = {};
        $scope.list = [];
        $scope.filter = {};
        $scope.custObj = {};
        //        $scope.autosuggestSource = $scope.currentTab;

        $scope.autosuggestSource = path.slice(path.lastIndexOf('/') + 1, path.length);
        //End Filter Object

        if ($scope.autosuggestSource == "account") {

            $scope.fields = angular.copy($scope.childFields);
            $scope.sortedFields = angular.copy($scope.childSortedFields);
            $scope.custObj = angular.copy($scope.childCustObj);


        }

        $location.path($state.current.name.split('.')[0] + path);
        //        if ($scope.currentTab.indexOf('system') != -1) {
        //            $scope.cloneSystem.id = [];
        //            $('[name="cloneSystem"]').select2('val', null);
        ////            if ($scope.currentTab != 'systemShipment') {
        ////                $scope.getTemplateSystemRules();
        ////            }
        //        }
    };

    //    function generateForms(data) {
    //        $scope.rulesData = {};
    //        var fieldCount = data.fields.length;
    //
    //        function createSubGroup(a, i) {
    //            var g = data.fields[i].group;
    //            var hasKey = false;
    //            for (var j = 0; j < a.length; j++)
    //                if (g in a[j]) {
    //                    a[j][g].push(data.fields[i]);
    //                    hasKey = true;
    //                    break;
    //                }
    //            if (!hasKey) {
    //                var sb = {};
    //                sb[g] = [];
    //                sb[g].push(data.fields[i]);
    //                a.push(sb);
    //            }
    //        }
    //        for (var i = 0; i < fieldCount; i++) {
    //            if (data.fields[i].isActive) {
    //                var g = data.fields[i].parentGroup;
    //                if (g == null) {
    //                    g = data.fields[i].group;
    //                    if ((g in $scope.rulesData) == false) {
    //                        $scope.rulesData[data.fields[i].group] = [];
    //                        $scope.rulesData[data.fields[i].group].push(data.fields[i]);
    //                    } else
    //                        $scope.rulesData[data.fields[i].group].push(data.fields[i]);
    //                } else {
    //                    if ((g in $scope.rulesData) == false) {
    //                        var a = $scope.rulesData[data.fields[i].parentGroup] = [];
    //                        createSubGroup(a, i);
    //                    } else {
    //                        var a = $scope.rulesData[data.fields[i].parentGroup];
    //                        createSubGroup(a, i);
    //                    }
    //                }
    //            }
    //        }
    //    }

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

    $scope.getTemplateSystemRules = function(tab) {
        $scope.loader = true;
        $scope.profile = {};
        $scope.profile.fields = [];
        var sysId = $routeParams.systemId;
        if ($scope.cloneSystem.id && $scope.cloneSystem.id.length == 1) {
            sysId = $scope.cloneSystem.id[0].id;
        }

        if (!tab) tab = $state.current.url;
        else {
            $scope.cloneSystem.id = [];
            $('[name="cloneSystem"]').select2('val', null);
        }

        var promise = commonService.ajaxCall('GET', '/api/template/' + (tab == '/profile/:systemName/:systemId' ? 'default?systemId=' + sysId + '&type=systemInvoice' : 'systemId/' + sysId + '?type=systemShipment'));
        promise.then(function(data) {
                //                $scope.systemRules = data;
                $scope.profile = data;
                profiledata = angular.copy($scope.profile.fields);
                $scope.loader = false;
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                $scope.loader = false;
            }
        );
    };

    $scope.editTemplate = function() {
        switch ($state.current.url) {
            case '/profile/:systemName/:systemId':
                if (commonService.applyPermission('editTemplateProfileInvoiceSystem'))
                    editSystemRulesTemplate();
                break;
            case '/shipmentRules':
                if (commonService.applyPermission('editTemplateProfileShipmentSystem')) {
                    editSystemRulesTemplate();
                }
                break;
            case '/location':
                $scope.$broadcast("editTemplateLocationEvent", {});
                break;
            case '/account':
                // if (commonService.applyPermission('editTemplateProfileAccount'))
                $scope.$broadcast("editTemplateAccountEvent", {});
                break;
            case '/Invoicerules':
                if (commonService.applyPermission('editTemplateInvoiceRulesAccount'))
                    $scope.$broadcast("editTemplateAccountRules", {});
                break;
            case '/Shipmentrules':
                if (commonService.applyPermission('editTemplateShipmentRulesAccount'))
                    $scope.$broadcast("editTemplateAccountRules", {});
                break;
            case '/accountTms':
                $scope.$broadcast("editTemplateAccountTms", {});
        }
    };

    $scope.$watch('form.$valid', function(newValue, oldValue) {
        $scope.validForm = !newValue;
    });

    $scope.copyInvoiceProfile = function() {
        angular.copy($scope.systemRulesFrom, $scope.profile);
    };

    $scope.Back = function() {
        if ($state.current.name.indexOf('.InvoiceDeliveryEmailrules.') != -1)
            $scope.$broadcast("backInvoiceDeliveryEmail", {});
        else if ($state.current.name.indexOf('.InvoiceDeliveryWebrules.') != -1)
            $scope.$broadcast("backInvoiceDeliveryWeb", {});
        else if ($state.current.name.indexOf('.metadatarules') != -1)
            $scope.$broadcast("backMetadataEvent", {});
        else if ($state.current.name.indexOf('.system.profile.metadata') != -1)
            $scope.$broadcast("backMetadataEvent", {});
    };


    $scope.redirectRule = function(tabName) {
        //Start Filter Object
        $scope.rule = {};
        $scope.rule.conditions = {};
        $scope.fields = {};
        $scope.sortedFields = [];
        $scope.filterObj = {};
        $scope.list = [];
        $scope.filter = {};
        $scope.custObj = {};
        //End Filter Object

        $scope.$broadcast("EditRulesEvent", {
            "tabName": tabName
        });
    };
    $scope.setDefaultText = function(text) {
        $('button.dropdown-toggle').html(text + ' <i class="fa fa-angle-down"></i>');
        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account');
    };


    $scope.saveData = function() {
        switch ($state.current.name.substr($state.current.name.indexOf('.'))) {
            case '.system.profile':
                if ($scope.form.$valid) {
                    $scope.profile.systemId = $routeParams.systemId;
                    //                    $scope.systemRules.docType = $scope.currentTab;
                    var promise = commonService.ajaxCall('PUT', 'api/rulesProfile', $scope.profile);
                    promise.then(function(data) {
                            flash.pop({
                                title: 'Success',
                                body: data, //"Invoice Profile updated successfully",
                                type: 'success'
                            });
                        },
                        function(data) {
                            flash.pop({
                                title: 'Alert',
                                body: data.data,
                                type: 'error'
                            });
                        });
                } else flash.pop({
                    title: 'Alert',
                    body: "form contains some invalid data!",
                    type: 'error'
                });
                break;
            case '.system.profile.shipmentrules':
                $scope.updateShipmentTemplate();
                break;
            case '.system.profile.metadata':
                $scope.$broadcast("saveMetadataEvent", {});
                break;
            case '.system.profile.location':
                $scope.eventAddUpdate = false;
                $scope.$broadcast("saveLocationEvent", {});
                break;
            case '.system.profile.account':
                // if (commonService.applyPermission('editAccounts')) {
                $scope.eventAddUpdate = false;
                $scope.$broadcast("saveAccountEvent", {});
                // }
                break;
            case '.system.profile.account.invoicerules':
                if (commonService.applyPermission('editInvoiceRulesAccount'))
                    $scope.$broadcast("saveAccountRules", {});
                break;
            case '.system.profile.account.shipmentrules':
                if (commonService.applyPermission('editShipmentRulesAccount'))
                    $scope.$broadcast("saveAccountRules", {});
                break;
            case '.system.profile.account.chargerules':
                $scope.$broadcast("saveAccountChargeEvent", {});
                break;
            case '.system.profile.account.InvoiceDeliveryEmailrules.new':
            case '.system.profile.account.InvoiceDeliveryEmailrules.edit':
                $scope.$broadcast("saveInvoiceDeliveryEmail", {});
                break;
            case '.system.profile.account.InvoiceDeliveryWebrules.new':
            case '.system.profile.account.InvoiceDeliveryWebrules.edit':
                $scope.$broadcast("saveInvoiceDeliveryWeb", {});
                break;
            case '.system.profile.account.edit':
            case '.system.profile.account.Upload':
                $scope.$broadcast("saveDataAccountTms", {});
                break;
            case '.system.profile.dataSource':
                $scope.$broadcast("saveRules", {});
                break;
            case '.system.profile.account.metadatarules':
            case '.system.profile.account.InvoicedeliveryEdirules.edit':
                $scope.$broadcast("saveMetadataEvent", {});
                break;
            case '.system.profile.account.InvoiceDeliveryDocProfilerules.new':
            case '.system.profile.account.InvoiceDeliveryDocProfilerules.edit':
                $scope.$broadcast("savedocProfile", {});
                break;


        }
    };
    $scope.eventAddUpdate = false;
    $scope.toggleEvent = function() {
        switch ($state.current.url) {
            case '/location':
                $scope.$broadcast("locationToggleEvent", {});
                break;
            case '/account':
                $scope.$broadcast("accountToggleEvent", {});
                break;
        }
    };

    function editSystemRulesTemplate() {
        //  var itemToSend = tempalteType=='systemInvoice'? $scope.systemRules : $scope.shipmentProfileData;
        var modalInstance = $modal.open({
            templateUrl: 'fieldsConfig.html',
            controller: 'fieldsConfigCtrl',
            resolve: {
                items: function() {
                    return angular.copy($scope.profile);
                }
            }
        });
        modalInstance.result.then(function(data) {
            if ($state.current.url == '/shipmentRules') {
                $scope.profile = data;
            } else
                $scope.getTemplateSystemRules();
        }, function(selectedItem) {
            console.log('Modal dismissed ');
        });
    }

    //    if ($state.current.url != '/profile/:systemName/:systemId'){
    //        $timeout(function(){ var tabs = $('#systemTabs');
    //            tabs.find('li').eq(0).removeClass('active');
    //            tabs.find('li#'+$state.current.url.substr(1)).addClass('active');
    //        },100);
    //    }

    //    setTimeout("$('li#systemInvoice').click();", 300);


    //Shipment Field Grid

    var systemShipmentTemplateId = "";

    $scope.isRuleProfile = false;
    $scope.selectedTemplate = 'Shipment';
    //    $scope.profile = {};
    //    $scope.profile.fields = [{
    //        "isUniqueField": false,
    //        "isReadonly": false,
    //        "isMandatory": false,
    //        "tariffIdentifier": false,
    ////        "isMasterField": false,
    //        "isDefault": false,
    //        "validationActive": false,
    //        "addInAccessSet": false,
    //        "isActive": false,
    //        "customFlag": false,
    //        "isMultiple": false
    //    }];
    profiledata = [{
        "isUniqueField": false,
        "isReadonly": false,
        "isMandatory": false,
        "tariffIdentifier": false,
        //        "isMasterField": false,
        "isDefault": false,
        "validationActive": false,
        "addInAccessSet": false,
        "isActive": false,
        "customFlag": false,
        "isMultiple": false
    }];
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
            title: 'Active',
            width: 50
        }, {
            value: 'field.isReadonly',
            type: 'checkbox',
            title: 'Read Only',
            width: 50
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
            value: 'field.profileBased',
            title: 'Profile Based',
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
    var removedKeys = [];
    var newKeys = {};

    function initKeys() {
        removedKeys = [];
        newKeys = {};
    };

    function popAlert(msg) {
        flash.pop({
            title: 'Alert',
            body: msg,
            type: 'error'
        });
    }

    $scope.getShipmentFieldTemplate = function() {
        // $scope.loader = true;
        commonService.loader(true);

        var sysId = $routeParams.systemId;
        if ($scope.cloneSystem.id && $scope.cloneSystem.id.length == 1) {
            sysId = $scope.cloneSystem.id[0].id;
        }
        var promise = commonService.ajaxCall('GET', '/api/template/systemId/' + sysId + '?' + 'type=systemShipment');
        promise.then(function(data) {
                data.fields = $filter('orderBy')(data.fields, 'displayOrder');
                $scope.profile = data;
                initKeys();

                profiledata = $scope.profile.fields;
                systemShipmentTemplateId = $scope.profile.templateId;
                // $scope.loader = false;
                commonService.loader(false);
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                // $scope.loader = false;
                commonService.loader(false);
            }
        );

    };

    //    function fillOldKeys() {
    //        oldKeys = {};
    //        newKeys = {};
    //        for (var i = 0; i < $scope.profile.fields.length; i++)
    //            if ($scope.profile.fields[i].profileBased)
    //                oldKeys[$scope.profile.fields[i].key] = $scope.profile.fields[i];
    //    }

    function saveValidFields(dataTosave) {
        commonService.loader(true);
        $scope.profile.fields = dataTosave;

        //        if ($.isEmptyObject(newKeys))
        //            delete $scope.profile.profileBasedUpdate;
        //        else
        $scope.profile.profileBasedUpdate = {
            removedKeys: removedKeys,
            newProfileBased: newKeys,
            systemId: $routeParams.systemId
        };

        console.log($scope.profile.profileBasedUpdate);


        $scope.profile.templateId = systemShipmentTemplateId;
        var promise = commonService.ajaxCall('PUT', '/api/template/' + $scope.profile.templateId + '?type=' + $scope.profile.docType, $scope.profile);
        promise.then(function(msg) {
                $scope.fielsLoader = false;
                saveChange = false;
                initKeys();
                $scope.profile.templateId = msg.templateId;
                profiledata = $filter('orderBy')(dataTosave, 'displayOrder');
                $scope.gridFilter(querySearchText);
                commonService.loader(false);
                flash.pop({
                    title: 'Success',
                    body: msg.msg,
                    type: 'info'
                });
            },
            function(msg) {
                $scope.fielsLoader = false;
                popAlert(msg.data);
                // $scope.loader = false;
                commonService.loader(false);
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
            //            if ($scope.profile.docType == 'systemShipment') {
            //                $scope.profile.affectAccounts = 'True';
            //                saveValidFields(dataTosave);
            //            } else
            saveValidFields(dataTosave);
        }, function(selectedItem) {
            //            if ($scope.profile.docType == 'systemShipment') {
            //                $scope.profile.affectAccounts = 'False';
            //                saveValidFields(dataTosave);
            //            }
        });
    }

    $scope.updateShipmentTemplate = function() {
        if ($scope.isKeys) {
            commonService.loader(true);
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
                    commonService.loader(false);
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
                    commonService.loader(false);
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
                    $scope.profile.fields.pop();
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
                return false;
            }

            if (invalidRows !== '')
                showModel('Some mandatory fields are not filled! at row no.' + invalidRows + ', Press Yes to continue or No to abort.', dataTosave);
            //            else if ($scope.profile.docType == 'systemShipment')
            //                showModel('Do you want to apply the changes to linked accounts ?', dataTosave);
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
                if ((values[i][1] == 'key' || values[i][1] == 'isMandatory' || values[i][1] == 'isUnique' || values[i][1] == 'isActive') && (field && field.isDefault)) {
                    popAlert('you can not change this value of default field.');
                    $('#fch .handsontable').handsontable('render');
                    return false;
                }

                if (values[i][1] == 'key' || values[i][1] == 'group') {
                    for (var j = 0; j < totalFields; j++) {
                        if (values[i][1] == 'key') {
                            if (field.profileBased) {
                                popAlert('Can\'t change key of profile based field');
                                return false;
                            }

                            if (j != values[0][0] && ($scope.profile.fields[j].key + '~' + $scope.profile.fields[j].group) == (values[0][3] + '~' + $scope.profile.fields[values[0][0]].group)) {
                                popAlert('Duplicate value in "Field key". Please verify key in row ' + (j + 1) + ' and ' + (values[0][0] + 1) + '.');
                                return false;
                            }

                        }

                        //                        else if (values[i][1] == 'isMasterField') {
                        //                            if (values[i][3] && $scope.profile.fields[j].isMasterField) {
                        //                                popAlert('Only one "Master Field" is allowed.');
                        //                                $('#fch .handsontable').handsontable('render');
                        //                                return false;
                        //                            }
                        //                        }
                        else if (values[i][1] == 'group') {
                            for (var j = 0; j < totalFields; j++) {
                                if (j != values[0][0] && values[0][3] && ($scope.profile.fields[j].key + '~' + $scope.profile.fields[j].group) == ($scope.profile.fields[values[0][0]].key + '~' + values[0][3])) {
                                    popAlert('Duplicate value for "Field key" and "group" combination. Please verify and correct at row ' + (j + 1) + ' and ' + (values[0][0] + 1) + '.');
                                    return false;
                                }
                            }
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
                } else if (values[i][1] == 'profileBased') {

                    if (field.type !== 'dropdown' && field.type !== 'multiselect' || !field.suggestionsSource) {
                        popAlert('Applicable only for "dropdown" / "multiselect" type having suggestion source!');
                        $('#fch .handsontable').handsontable('render');
                        return false;
                    }
                    if (!values[i][3]) {
                        if (removedKeys.indexOf(field.key) === -1) removedKeys.push(field.key);
                        if (newKeys[field.key])
                            delete newKeys[field.key];
                        else {
                            var promise = commonService.ajaxCall('GET', 'api/template/checkProfileBased?systemId=' + $routeParams.systemId + '&key=' + field.key);
                            promise.then(function(data) {
                                if (data == "true") {
                                    popAlert(field.key + " key is used in shipment profile, field can't be deselected!");
                                    field.profileBased = true;
                                    setTimeout(function() {
                                        $('div#fch div.handsontable').handsontable('render');
                                    }, 10);
                                }
                            }, function(data) {
                                popAlert(data.data);
                            });
                        }
                    } else
                        newKeys[field.key] = field;
                }
            }
        }
    };

    $scope.afterChange = function(values) {
        if (values != null) {
            for (var i = 0; i < values.length; i++) {
                if (values[i][1] != 'displayOrder' && values[i][2] == null && $scope.profile.fields[values[i][0]].displayOrder == null) {
                    var maxOrder = 0;
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
        if ($state.current.url == 'Shipmentrules') {
            $scope.$broadcast("accountShipmentAddKeys", e);
        } else {
            if ($(e).text() == 'Add Keys') {
                $scope.isKeys = true;
                $(e).text('Edit Fields')
            } else {
                $scope.isKeys = false;
                $(e).text('Add Keys')
            }
        }
    };

    $scope.changeTemplate = function(template) {
        $scope.selectedTemplate = template;
        commonService.setInvalList([]);
        setTimeout("$('div.handsontable:visible').handsontable('render');", 100);
    };

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
    // $scope.loader = false;
    //Search
    $scope.gridFilter = function(q) {
        $scope.profile.fields = $filter('filter')(profiledata, q);
        $scope.profile.fields = $filter('orderBy')($scope.profile.fields, 'displayOrder');
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

    //Filter start

    $scope.reset = function() {
        console.log($state.current.url);
        switch ($state.current.url) {

            case '/location':
                $scope.$broadcast("locationReset", {});
                break;
            case '/account':
                $scope.$broadcast("accountReset", {});
                break;
            case '/metadata':
                $scope.$broadcast("metadataReset", {});
                break;
            case '/Chargerules':
                $scope.$broadcast("accountChargerulesReset", {});
                break;
        }
    };

    $scope.getData = function() {
        switch ($state.current.url) {

            case '/location':
                $scope.$broadcast("locationGetData", {});
                break;
            case '/account':
                $scope.$broadcast("accountGetData", {});
                break;
            case '/metadata':
                $scope.$broadcast("metadataGetData", {});
                break;
            case '/Chargerules':
                $scope.$broadcast("accountChargerulesGetData", {});
                break;
        }
    };

    $scope.resetFilter = function() {
        switch ($state.current.url) {

            case '/location':
                $scope.$broadcast("locationResetFilter", {});
                break;
            case '/account':
                $scope.$broadcast("accountResetFilter", {});
                break;
            case '/metadata':
                $scope.$broadcast("metadataResetFilter", {});
                break;
            case '/Chargerules':
                $scope.$broadcast("accountChargerulesResetFilter", {});
                break;
        }
    };

    $scope.applyFilter = function() {
        switch ($state.current.url) {

            case '/location':
                $scope.$broadcast("locationApplyFilter", {});
                break;
            case '/account':
                $scope.$broadcast("accountApplyFilter", {});
                break;
            case '/metadata':
                $scope.$broadcast("metadataApplyFilter", {});
                break;
            case '/Chargerules':
                $scope.$broadcast("accountChargerulesApplyFilter", {});
                break;
        }
    };
    //Filter end

    $scope.getTemplateSystemRules();
    $scope.setDefaultConfig = function() {
        $("button.btn-sm.btn-ico.btn-custom.dropdown-toggle.arrow-right").first().html('Configuration &nbsp;<i class="fa fa-angle-down"></i>');
    }

});