'use strict';
angularApp.controller('metadataCtrl', function($rootScope, $scope, $location, $timeout, $stateParams, $routeParams, $route, $modal, Restangular, uploadManager, flash, Base64, commonService, $filter) {
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.pageLimit = 500;
    $scope.rowNos = [];
    $scope.paginationSize = 20;
    $scope.hw = null;
    $scope.hw_metadataType = null;
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
    $scope.fieldTypes = ["text", "numeric", "date", "dropdown"];
    $scope.isKeys = false;
    $scope.keys = [];
    $scope.keyColumns = [{
        value: 'key.fieldKey',
        title: 'Field key <span class="red">    (Only Alphanumeric)     </span>',
        renderer: commonService.cellRenderer,
        width: 500
    }];
    var invalidMsgList = [];
    var profiledata = [{
        isMandatory: false,
        isMasterField: false,
        isUniqueField: false,
        isActive: false,
        isReadonly: false
    }];

    //Start Filter Object
    $scope.rule = {};
    $scope.rule.conditions = {};
    $scope.fields = {};
    $scope.filterObj = {};
    $scope.list = [];
    $scope.filter = {};
    $scope.custObj = {};
    $scope.autosuggestSource = "metadata";
    //End Filter Object


    ///set the template column to edit metadata
    $scope.templateColumns = [{
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
        title: 'Length          <span class="red"> &#10038; </span>',
        type: 'numeric',
        allowInvalid: false,
        width: 80
    }, {
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
        value: 'field.displayOrder',
        title: 'Display Order <span class="red"> &#10038; </span>',
        type: 'numeric',
        allowInvalid: false,
        width: 80
    }];

    ///function to set page after paging change event
    $scope.setPage = function() {
        setTimeout(function() {
            angular.element(".pagination").scope().getMetadata(angular.element("li.active.ng-scope").scope().page.number);
        }, 300);
    };

    ///this function is used to intialize the object when page is loaded first time or reset
    $scope.initialMetadataType = function() {
        $scope.isKeys = false;
        $scope.metadataType = {};
        $scope.metadataType.fields = [{
            isMandatory: false,
            isMasterField: false,
            isUniqueField: false,
            isActive: false,
            isReadonly: false,
            addInAccessSet: false
        }];

        profiledata = [{
            isMandatory: false,
            isMasterField: false,
            isUniqueField: false,
            isActive: false,
            isReadonly: false,
            addInAccessSet: false
        }];
        $scope.templateColumns[3].src = 'suggestion';
    };

    ///this function is used to intialize the grid when page is loaded
    function initialGrid() {
        $scope.metadatas = [{
            updateField: null,
            id: null
        }];

        profiledata = [{
            updateField: null,
            id: null
        }];

        $scope.columns = [{
            value: 'metadata.updateField',
            type: 'checkbox',
            title: 'update',
            width: 50
        }];
    }

    ///function to give alert message
    function popAlert(msg) {
        flash.pop({
            title: 'Alert',
            body: msg,
            type: 'error'
        })
    };


    ///handle render events starts
    function renderHT_metadataType() {
        if ($scope.metadataType.fields != null && $scope.metadataType.fields.length > 20)
            $scope.hh_metadataType = $(window).height() - 300;
        else
            $scope.hh_metadataType = null;
        $scope.hw_metadataType = $('div.page-content').width() - 50;
    }

    $scope.afterRender_metadataType = function() {
        renderHT_metadataType();
    }

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
            if (dict.length > 0 && dict[0].isReadonly && $scope.metadatas[values[i][0]] != undefined && $scope.metadatas[values[i][0]].id != null) {
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

    ///handles the cel change event to put some validations on user input for metadata type(template)
    $scope.celChangeMetadataType = function(values) {
        for (var i = 0; i < values.length; i++) {
            if ((values[i][1] == 'key' || values[i][1] == 'label' || values[i][1] == 'type' || values[i][1] == 'length' || values[i][1] == 'displayOrder') && values[i][3] === '') {
                flash.pop({
                    title: 'Alert',
                    body: 'Field is mandatory!',
                    type: 'error'
                });
                return false;
            }
            if (values[i][3] === '')
                values[i][3] = null;
            else if (values[i][3] === 'true' || values[i][3] === 'false')
                values[i][3] = eval(values[i][3]);
            else {
                var totalFields = $scope.metadataType.fields.length;
                if ((values[i][1] == 'key' || values[i][1] == 'isMandatory' || values[i][1] == 'isMasterField' || values[i][1] == 'isUnique' || values[i][1] == 'isActive') && ($scope.metadataType.fields[values[i][0]] && $scope.metadataType.fields[values[i][0]].isDefault)) {
                    flash.pop({
                        title: 'Alert',
                        body: 'you can not change this value of default field.',
                        type: 'error'
                    });
                    $('#fch .handsontable').handsontable('render');
                    return false;
                }
                if (values[i][1] == 'key' || values[i][1] == 'isMasterField') {
                    for (var j = 0; j < totalFields; j++) {
                        if (values[i][1] == 'key') {
                            if ($scope.metadataType.fields[j].key == values[i][3]) {
                                flash.pop({
                                    title: 'Alert',
                                    body: 'You can not fill duplicate value in "Field key".',
                                    type: 'error'
                                });
                                $('#fch .handsontable').handsontable('render');
                                return false;
                            }
                            continue;
                        }
                        if (values[i][1] == 'isMasterField') {
                            if (values[i][3] && $scope.metadataType.fields[j].isMasterField) {
                                flash.pop({
                                    title: 'Alert',
                                    body: 'Only one "Master Field" is allowed.',
                                    type: 'error'
                                });
                                $('#fch .handsontable').handsontable('render');
                                return false;
                            }

                        }
                    }
                } else if (values[i][1] == 'displayOrder' && (values[i][3] < 1 || values[i][3] > totalFields - 1)) {
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
                        flash.pop({
                            title: 'Alert',
                            body: 'Invalid regex',
                            type: 'error'
                        });
                        return false;
                    }
                }
            }
        }
    }

    ///handles after change event to set the display order on newly added row and can put some validations also
    $scope.afterChange = function(values) {
        if (values != null) {
            for (var i = 0; i < values.length; i++) {
                if (values[i][1] != 'displayOrder' && values[i][2] == null && $scope.metadataType.fields[values[i][0]].displayOrder == null) {
                    var maxOrder = 0;
                    for (var j = 0; j < $scope.metadataType.fields.length; j++) {
                        if ($scope.metadataType.fields[j].displayOrder != null && maxOrder < $scope.metadataType.fields[j].displayOrder)
                            maxOrder = $scope.metadataType.fields[j].displayOrder;
                    }
                    if (maxOrder < $scope.metadataType.fields.length - 1)
                        $scope.metadataType.fields[values[i][0]].displayOrder = maxOrder + 1;
                    else
                        popAlert('Display order is invalid!');
                }
            }
        }
    };

    ///handles the cell render event to show validation/ error message if user save some invalid data.
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

    /// function to get metadata list
    $scope.getMetadataList = function(q) {
        $scope.metadataLoader = true;
        commonService.loader(true);
        var promise = commonService.ajaxCall('GET', '/api/metadataType?pageLimit=100&pageNo=1&q=' + q + '');
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

    /// redirecting to edit metadata template page
    $scope.editMetadataType = function(value) {
        $scope.initialMetadataType();
        $location.path("/organizationSetup/metadata/edit/" + value);
    }

    /// redirecting to edit metadata page
    $scope.detailMetadataType = function(value) {
        $location.path("/organizationSetup/metadata/" + value + '/detail');
    }

    ///function to put client side validations
    $scope.validateFields = function() {
        $scope.loader = true;
        if ($scope.isKeys) $scope.saveMetadataType(null);
        else {
            var hasMasterField = false;
            var invalidRows = '';
            var dataTosave = [];

            var fieldsKey = [];
            var tmpObj = {};
            for (var i = 0; i < $scope.metadataType.fields.length; i++) {
                if ($scope.metadataType.fields[i].key != null)
                    fieldsKey.push($scope.metadataType.fields[i].key);
                else {
                    tmpObj = $scope.metadataType.fields[i];
                    $scope.metadataType.fields.pop(i);
                }
            }
            for (var i = 0; i < profiledata.length; i++) {
                if (profiledata[i].key != null)
                    if (fieldsKey.indexOf(profiledata[i].key) < 0)
                        $scope.metadataType.fields.push(profiledata[i]);
            }
            $scope.metadataType.fields.push(tmpObj);

            for (var i = 0; i < $scope.metadataType.fields.length - 1; i++) {
                if ($scope.metadataType.fields[i].isMasterField) hasMasterField = true;
                var duplicateCount = 0;

                if ($scope.metadataType.fields[i].displayOrder != null)
                    for (var j = 0; j < $scope.metadataType.fields.length - 1; j++)
                        if ($scope.metadataType.fields[j].displayOrder == $scope.metadataType.fields[i].displayOrder) {
                            duplicateCount += 1;
                            if (duplicateCount > 1) {
                                popAlert('Duplicate display order Value at row No.' + (i + 1));
                                $scope.loader = false;
                                return false;
                            }
                        }

                if ($scope.metadataType.fields[i].key == null || $scope.metadataType.fields[i].label == null || $scope.metadataType.fields[i].type == null || $scope.metadataType.fields[i].length == null || $scope.metadataType.fields[i].displayOrder == null) {
                    invalidRows += '\t ' + (i + 1);
                    continue;
                }

                if ($scope.metadataType.fields[i].suggestionsSource && $scope.metadataType.fields[i].suggestionsSource.indexOf(',') !== -1) {
                    $scope.metadataType.fields[i].suggestionsSource = $scope.metadataType.fields[i].suggestionsSource.split(',');
                }
                dataTosave.push($scope.metadataType.fields[i]);
            }

            if ($scope.metadataType.fields[0].key === null && $scope.metadataType.fields.length < 2) {
                flash.pop({
                    title: 'Alert',
                    body: 'No valid data to save.',
                    type: 'error'
                });
                $scope.loader = false;
                return false;
            }

            if (!hasMasterField) {
                flash.pop({
                    title: 'Alert',
                    body: 'template should have a master field!',
                    type: 'error'
                });
                $scope.loader = false;
                return false;
            }
            if (invalidRows != '') {
                var modalInstance = $modal.open({
                    templateUrl: 'confirm.html',
                    controller: 'modalInstanceCtrl',
                    resolve: {
                        items: function() {
                            return angular.copy({
                                msg: 'Some mandatory fields are not filled! at row no.' + invalidRows + ', Press Yes to continue or No to abort.'
                            });
                        }
                    }
                });
                modalInstance.result.then(function(selectedItem) {
                    $scope.saveMetadataType(dataTosave);
                }, function(selectedItem) {
                    $scope.loader = false;
                    console.log('Modal dismissed ');
                });
            } else
                $scope.saveMetadataType(dataTosave);
        }
    };


    ///function to save metadata template
    $scope.saveMetadataType = function(fields) {
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
                    $scope.loader = false;
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
                    $scope.loader = false;
                }
            );
        } else {


            $scope.metadataLoader = true;
            commonService.loader(true);

            $scope.metadataType.fields = fields;
            if ($route.current.name === 'organizationSetup.metadata.edit')
                var promise = commonService.ajaxCall('PUT', '/api/metadataType/' + $routeParams.metadataTypeId, $scope.metadataType);
            else
                var promise = commonService.ajaxCall('POST', '/api/metadataType', $scope.metadataType);
            promise.then(function(data) {
                    flash.pop({
                        title: 'Success',
                        body: data.msg,
                        type: 'success'
                    });
                    $scope.metadataLoader = false;
                    commonService.loader();
                    $location.path("/organizationSetup/metadata/view");
                },
                function(data) {
                    $scope.metadataLoader = false;
                    commonService.loader();
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                });
        }
    }

    ///function to get metadatas of metadatatype
    $scope.getMetadata = function(pageNo, isGetCount) {
        $scope.metadataLoader = true;
        invalidMsgList = [];
        commonService.loader(true);
        if (isGetCount) {
            var promise1 = commonService.ajaxCall('GET', 'api/getCount?collection=Metadata&templateId=' + $routeParams.metadataTypeId);
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

        var promise = commonService.ajaxCall('GET', '/api/metadata?metadataTypeId=' + $routeParams.metadataTypeId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo);
        promise.then(function(data) {
                if (data.length) {
                    $scope.metadatas = data;
                    $scope.metadatas[0].updateField = false;
                }
                $scope.rowNos = [];
                for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * $scope.pageLimit, j < data.length; i++, j++)
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

    ///function to get the template of metadata
    $scope.getMetadataType = function(isDataRequired) {

        $scope.initialMetadataType();
        initialGrid();
        var promise = commonService.ajaxCall('GET', 'api/suggestion?q=chargeCode&pageLimit=10&page=1&selected=&suggestionFor=suggestion');
        promise.then(function(data) {
                var chargeCodeMetadataTypeId;
                var dict = _.where(data.msg, {
                    "n": "metadata_chargeCode"
                });
                if (dict.length > 0) {
                    $scope.selectMetadata = dict;
                    if ($scope.selectMetadata != undefined) {
                        chargeCodeMetadataTypeId = $scope.selectMetadata[0].id;
                    }
                }
                $scope.templateColumns = [{
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
                    title: 'Length          <span class="red"> &#10038; </span>',
                    type: 'numeric',
                    allowInvalid: false,
                    width: 80
                }, {
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
                    value: 'field.displayOrder',
                    title: 'Display Order <span class="red"> &#10038; </span>',
                    type: 'numeric',
                    allowInvalid: false,
                    width: 80
                }];
                if ($routeParams.metadataTypeId == chargeCodeMetadataTypeId) {
                    $scope.templateColumns.push({
                        value: 'field.shipmentCharge',
                        type: 'checkbox',
                        title: 'Shipment Charge',
                        width: 50
                    });
                    $scope.templateColumns.push({
                        value: 'field.invoiceCharge',
                        type: 'checkbox',
                        title: 'Invoice Charge',
                        width: 50
                    });

                }
                $scope.metadataLoader = true;
                $scope.isKeys = false;
                $scope.columns = [];
                initialGrid();
                var metadataTypeId = $routeParams.metadataTypeId;
                var promise1 = commonService.ajaxCall('GET', '/api/metadataType/' + metadataTypeId);
                promise1.then(function(data) {
                        $scope.templateColumns[3].src = 'suggestion_' + $routeParams.metadataTypeId;
                        data.fields = $filter('orderBy')(data.fields, 'key');
                        $scope.metadataType = data;
                        profiledata = data.fields;
                        if ($scope.metadataType.fields.length == 0) {
                            $scope.metadataType.fields = [{
                                isMandatory: false,
                                isMasterField: false,
                                isUniqueField: false,
                                isActive: false,
                                isReadonly: false
                            }];
                            profiledata = [{
                                isMandatory: false,
                                isMasterField: false,
                                isUniqueField: false,
                                isActive: false,
                                isReadonly: false
                            }];
                        } else {

                            if (isDataRequired) {
                                $scope.getMetadata($scope.currentPage, true);
                            }
                            $scope.getRuleFields();
                            var sc = $scope.metadataType.fields.sort(function(a, b) {
                                return parseInt(a.displayOrder,10) - parseInt(b.displayOrder,10)
                            });
                            angular.forEach(sc, function(col, i) {
                                if (col.isActive) {
                                    switch (col.type) {
                                        case 'dropdown':
                                        case 'multiselect':
                                            $scope.columns.push({
                                                value: 'metadata.' + col.key,
                                                type: 'autocomplete',
                                                title: col.label,
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
                                                errorMessage: col.errorMessage,
                                                displayOrder: col.displayOrder

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
                                                errorMessage: col.errorMessage,
                                                displayOrder: col.displayOrder
                                            });
                                    }
                                }

                            });
                            $scope.metadataLoader = false;
                        }
                    },
                    function(data) {
                        popAlert(data.data);
                        $scope.metadataLoader = false;
                    }
                );

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

    ///handles the key change event to handle some validations
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
    }

    $scope.addKeys = function(e) {
        if ($(e).text() == 'Add Keys') {
            $scope.isKeys = true;
            $(e).text('Edit Fields')
        } else {
            $scope.isKeys = false;
            $(e).text('Add Keys')
        }

    }

    ///function to save metadata
    $scope.saveMetadatas = function() {
        invalidMsgList = [];
        var dataTosave = commonService.validateGridData($scope.metadatas, $scope.columns, $routeParams.metadataTypeId);
        invalidMsgList = dataTosave.arrInvalidMsg;
        if (dataTosave.inValidData.length > 0) {
            $scope.metadatas = dataTosave.inValidData;
            fillRowNos();
        }
        $scope.metadataLoader = true;
        if (dataTosave.validData.data.length > 0) {
            commonService.loader(true);
            var promise = commonService.ajaxCall('PUT', '/api/grid/metadata?templateId=' + $routeParams.metadataTypeId, dataTosave.validData);
            promise.then(function(data) {
                    commonService.loader();
                    $scope.metadataLoader = false;
                    if (dataTosave.inValidData.length) {
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
                    }
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

    //Search
    $scope.gridFilter = function(q) {
        for (var i = 0; i < profiledata.length; i++) {
            if (profiledata[i].key == null)
                profiledata.pop(i);
        }
        $scope.metadataType.fields = $filter('filter')(profiledata, q);
        $scope.metadataType.fields = $filter('orderBy')($scope.metadataType.fields, 'key')

    }
    $scope.metadataType.fields = profiledata;

    //Start Filter Function
    $scope.getRuleFields = function() {
        if ($scope.metadataType.Name != undefined)
            $scope.autosuggestSource = 'metadata_' + $scope.metadataType.Name;
        angular.forEach($scope.metadataType.fields, function(i) {
            if (i.isActive == true) {
                $scope.fields[i.key] = {
                    type: i.type,
                    label: i.label
                };
                $scope.custObj[i.label] = {
                    column: i.key,
                    columnType: i.type
                }
            }
        });


    }

    $scope.reset = function() {
        $scope.rule.conditions = {};
        $scope.currentPage = 1;
        $scope.getMetadata($scope.currentPage, true);
    }


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
        $scope.filterObj = {
            rules: rulesData.ruleDef,
            metadataId: $routeParams.metadataTypeId
        };

        if ($scope.filterObj.rules && $scope.filterObj.rules.fields.length <= 0) {
            flash.pop({
                title: 'No filter conditions',
                body: 'No conditions to apply filter',
                type: 'info'
            });
        } else
            getFilteredData(1, true);
    }


    /// function to get the filter data after filter apply
    function getFilteredData(pageNo, isGetCount) {

        // $scope.Loader = true;
        commonService.loader(true);
        if (isGetCount) {
            var promise1 = commonService.ajaxCall('PUT', 'api/filter?collection=metadata&count=1', $scope.filterObj);
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
        var promise = commonService.ajaxCall('PUT', 'api/metadata/filter?metadataTypeId=' + $routeParams.metadataTypeId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo, $scope.filterObj);
        promise.then(function(data) {
                if (data.length) {
                    $scope.metadatas = data;
                }
                $scope.rowNos = [];
                for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * $scope.pageLimit, j < data.length; i++, j++) {
                    $scope.metadatas[j].updateField = false;
                    $scope.rowNos.push(i);
                }
                commonService.loader();
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                commonService.loader();
            });

    }
    /// function to reset filter
    $scope.resetFilter = function() {
        $scope.filter = {};
        $scope.currentPage = 1;
        $scope.getMetadata($scope.currentPage, true);
    }

    ///handles apply filter event
    $scope.applyFilter = function() {
        $scope.filterObj = {
            rules: {
                condition: 'and',
                level: 0,
                fields: []
            },
            metadataId: $routeParams.metadataTypeId
        }

        for (var k in $scope.filter) {
            if ($scope.filter.hasOwnProperty(k)) {
                if (angular.isArray($scope.filter[k]))
                    for (var i = 0; i < $scope.filter[k].length; i++)
                        $scope.filterObj.rules.fields.push({
                            name: k,
                            operator: 'equalTo',
                            value: $scope.filter[k][i].n
                        });
                else
                    $scope.filterObj.rules.fields.push({
                        name: k,
                        operator: 'equalTo',
                        value: $scope.filter[k]
                    });
            }
        }
        getFilteredData(1, true);
    }

    //End Filter Function
});