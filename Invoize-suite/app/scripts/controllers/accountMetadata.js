'use strict';
angularApp.controller('accountMetadataCtrl', function($rootScope, $scope, $location, $timeout, $stateParams, $routeParams, $route, $modal, Restangular, uploadManager, flash, Base64, commonService) {
    $scope.showGrid = false;
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.pageLimit = 500;
    $scope.paginationSize = 20;
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

    ///function to ser page after paging change event
    $scope.setPage = function() {
        setTimeout(function() {
            angular.element("div#chargePaginations").scope().getAccountMetadata(angular.element("div#chargePaginations li.active.ng-scope").scope().page.number);
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
        $scope.hw = $('div.page-content').width()-50;
    }

    $scope.afterRender= function(){
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
            if (dict.length > 0 && dict[0].isReadonly && $scope.metadatas[values[i][0]].id != null)
            {
                flash.pop({
                    title: 'Alert',
                    body: values[i][1]+" is readonly",
                    type: 'error'
                });
                return false;
            }
            else {
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

    /// function to get account metadata list
    $scope.getAccountMetadataList = function(q) {
        $scope.metadataLoader = true;
        commonService.loader(true);
        var promise = commonService.ajaxCall('GET', '/api/metadata?systemId='+$routeParams.systemId+'&accountId='+ $scope.selectedAccounts.accountIds+'&type=accountMetadata&pageLimit=20&pageNo=1&q=' + q + '');
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
    $scope.getAccountMetadata = function(pageNo) {
        if ($scope.selectMetadata != undefined) {
            $scope.metadataLoader = true;
            invalidMsgList = [];
            commonService.loader(true);
            $scope.currentPage = pageNo;
            var promise = commonService.ajaxCall('GET', 'api/metadataAccount?metadataTypeId=' + $scope.selectMetadata[0].id + "&systemId=" + $routeParams.systemId + '&account=' + $scope.selectedAccounts.accountIds + '&pageLimit='+$scope.pageLimit+'&pageNo=' + pageNo);
            promise.then(function(data) {
                    if (data.doc.length) {
                        $scope.totalItems = data.count;
                        $scope.metadatas = data.doc;
                    }
                    else
                    {
                        flash.pop({
                            title: 'No data found',
                            body: "There is no metadata associated with this account system, first need to associate metadata with system",
                            type: 'warning'
                        });
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

    $scope.setMetadataType = function(ListItem) {
        var t=[];
        t.push(ListItem);
        $scope.getMetadataType(t);
    }

    ///function to get the template of metadata
    $scope.getMetadataType = function(t) {
        console.log(t);
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
                        angular.forEach($scope.metadataType.fields, function(col, i) {
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

                        $scope.getAccountMetadata($scope.currentPage, true);
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
                dataTosave.validData.accountId = $scope.selectedAccounts.accountIds;
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
                            $scope.getAccountMetadata($scope.currentPage, true);
                            $scope.getAccountMetadataList('');
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

    ///handles save metadata event
    $scope.$on("saveMetadataEvent", function(event, args) {
        $scope.saveMetadatas();
    });
    $scope.$on("saveMetadataEvent", function(event, args) {
        $scope.saveMetadatas();
    });
    $scope.$on("getMetadataTypeEvent", function(event, args) {
        console.log(args);
        $scope.getMetadataType(args.metadataName);
    });

});