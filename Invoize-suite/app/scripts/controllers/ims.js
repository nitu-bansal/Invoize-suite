/**
 * Created by kamalsingh.saini on 11/3/14.
 */
angularApp.controller('imsCtrl',["$scope","$routeParams", "$state", "$timeout", "$modal", "$rootScope", "commonService", "flash", "imsFactory",
    function($scope,$routeParams, $state, $timeout, $modal, $rootScope, commonService,flash, imsFactory){

    $scope.totalItems = 0;
    $scope.spareRow = 0;
    $scope.currentPage = 1;
    $scope.pageLimit = 100;
    $scope.rowNos = [];
    $scope.processes = [];
    $scope.templateData = {};
    $scope.fields = {};
    var invalidMsgList = [];
    var tempIssues = [];
    $scope.hw = null;
    $scope.dhw = null;
    var selectedIssue = null;
    var item = imsFactory.items();

    $scope.setPage = function() {
        setTimeout(function() {
            angular.element(".pagination").scope().getIssues(angular.element("ul.pagination li.active.ng-scope").scope().page.number);
        }, 300);
    };

    function renderHT() {
        if ($scope.issues != null && $scope.issues.length > 20)
            $scope.hh = $(window).height() - 300;
        else
            $scope.hh = null;
        $scope.hw = $('div.page-content').width() - 35;
        $scope.dhw = $('div.page-content').width() - 200;
    }

    $scope.issues = [];

    $scope.afterRender = function() {
        if ($('div.handsontable:visible').length)
            renderHT();
    };

    $scope.celChange = function(values) {
        var cellCount = values.length;
        for (var i = 0; i < cellCount; i++) {
            if (values[i][3] !== values[i][2]) {
                if (values[i][3] === '')
                    values[i][3] = null;
                if (values[i][1] !== 'updateField' && (!$scope.issues[values[i][0]] || !$scope.issues[values[i][0]].updateField))
                    values.push([values[i][0], 'updateField', 'null', true]);
            }
        }
    };

    $scope.onRowCreate = function(rowNo) {
        if ($scope.rowNos.length)
            $scope.rowNos.push($scope.rowNos[$scope.rowNos.length - 1] + 1);
    };

    var cellRenderer = function(instance, td, row, col, prop, value, cellProperties) {
        if (cellProperties.type == 'autocomplete')
            Handsontable.AutocompleteCell.renderer.apply(this, arguments);
        else if (cellProperties.type == 'date')
            Handsontable.DateCell.renderer.apply(this, arguments);
        else {
            Handsontable.TextCell.renderer.apply(this, arguments);
            if (prop == "summary") {
                td.title = cellProperties.title;
                $(td).html('<i id="s_' + row + '" class="icon-file fa-2x" onclick="angular.element(this).scope().showDialog(this.id,\'summary\')" permission="ims.viewSummaryIMS" style="cursor:pointer"></i>');
            } else if (prop == "IMSfiles") {
                td.title = cellProperties.title;
                $(td).html('<i id="f_' + row + '" class="icon-file fa-2x" onclick="angular.element(this).scope().showDialog(this.id,\'attachment\')" style="cursor:pointer"></i>');
            }
        }

        if(row===0){
            setTimeout(function(){
                var headers = instance.$table.find('thead th');
                for(var i=0;i<headers.length;i++)
                    if(cellProperties.columns[col] && headers.eq(i).text() === cellProperties.columns[col].title){
                        headers[i].title=cellProperties.toolTip||'';
                        break;
                    }
            },1000);
        }

        if (cellProperties.defaultValue && !value)
            value = cellProperties.defaultValue;

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
    };

    function createColumns(fields) {
        $scope.columns = commonService.createColumns('issue', fields, cellRenderer, $scope.templateData.system);

        //        var sc = fields.sort(function(a, b) {
        //            return parseInt(a.displayOrder) - parseInt(b.displayOrder)
        //        });
        //
        //        $scope.columns = [{
        //            value: 'issue.updateField',
        //            type: 'checkbox',
        //            title: 'update',
        //            width: 50
        //        }];
        //
        //        angular.forEach(sc, function(col) {
        //            if (col.isActive) {
        //                switch (col.type) {
        //                case 'dropdown':
        //                case 'multiselect':
        //                    $scope.columns.push({
        //                        value: 'issue.'+ col.key,
        //                        type: 'autocomplete',
        //                        title: col.label,
        //                        src: col.suggestionsSource+'&systemId='+$scope.templateData.system,
        //                        width: col.length * 9,
        //                        length: col.length,
        //                        renderer: cellRenderer,
        //                        isMandatory: col.isMandatory,
        //                        key: col.key,
        //                        readOnly: col.isReadonly,
        //                        regex: col.regex,
        //                        toolTip: col.toolTip,
        //                        errorMessage: col.errorMessage,
        //                        isDependent: col.isDependent,
        //                        suggestionField: col.suggestionField,
        //                        displayOrder: col.displayOrder
        //                    });
        //                    break;
        //                default:
        //                    if (col.type == 'multiline')
        //                        col.type = 'text';
        //                    $scope.columns.push({
        //                        value:'issue.' + col.key,
        //                        type: col.type,
        //                        allowInvalid: false,
        //                        renderer: cellRenderer,
        //                        title: col.label,
        //                        width: col.length * 9,
        //                        length: col.length,
        //                        readOnly: col.isReadonly,
        //                        isMandatory: col.isMandatory,
        //                        key: col.key,
        //                        regex: col.regex,
        //                        toolTip: col.toolTip,
        //                        errorMessage: col.errorMessage,
        //                        isDependent: col.isDependent,
        //                        suggestionField: col.suggestionField,
        //                        displayOrder: col.displayOrder
        //                    });
        //                }
        //            }
        //        });
        $scope.columns.push({
            value: 'issue.summary',
            readOnly: true,
            title: 'Summary',
            renderer: cellRenderer,
            width: 50
        });
        $scope.columns.push({
            value: 'issue.IMSfiles',
            readOnly: true,
            title: 'Files',
            renderer: cellRenderer,
            addInSummary: true,
            width: 50
        });
    }

    function setFieldVals(val) {
        for (var i = 0; i < $scope.columns.length - 3; i++) {
             $scope.columns[i + 1].width = ($scope.templateData.fields[i].isReadonly && !val)?1: $scope.templateData.fields[i].length;
             $scope.columns[i + 1].readOnly = ($scope.templateData.fields[i].isReadOnlyAfterRaise && val)? true:false;
        }
    }

    var promise = commonService.ajaxCall('GET', 'api/suggestions?suggestionFor=metadata_processMaster&currentContext=' + $state.$current.context.product + '.ims&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
    promise.then(function(data) {
        $scope.processes = data.msg;
        $scope.templateData.process = $scope.processes[0].id;
    }, function(data) {
        flash.pop({
            title: 'Alert',
            body: data.data,
            type: 'error'
        });
    });

    var promiseModule = commonService.ajaxCall('GET', 'api/suggestions?suggestionFor=IMSModules&currentContext=' + $state.$current.context.product + '.ims');
    promiseModule.then(function(data) {
            $scope.modules = data.msg;
            if (item.module != undefined) {
                $timeout(function() {
                    $scope.templateData.module = item.module;
                    $scope.templateData.process = item.process;
                    $scope.templateData.docType = item.docType;

                   setTimeout(function(){ $('select[name="Module"]').select2('val', item.moduleIndex);},100);

                    $scope.getTemplate();

                }, 500);
            }
        },
        function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });

    $scope.getTemplate = function() {
        if ($scope.templateData.module && $scope.templateData.process && $scope.templateData.docType) {
            $scope.templateData.company = $rootScope.loggedInUser.userCompany[0].id;
            $scope.templateData.system = $rootScope.loggedInUser.userSystem[0].id;
            $scope.templateLoader = true;


            var promise = commonService.ajaxCall('GET', '/api/IMS/template?process=' + $scope.templateData.process + '&system=' + $scope.templateData.system + '&docType=' + $scope.templateData.docType + '&module=' + $scope.templateData.module.id + '&company=' + $scope.templateData.company);
            promise.then(function(data) {
                    if (data) {
                        data.module = $scope.templateData.module;
                        data.fields = data.fields.sort(function(a, b) {
                            return parseInt(a.displayOrder,10) - parseInt(b.displayOrder,10)
                        });
                        $scope.fields = {};
                        $scope.templateData = data;
                        createColumns(data.fields);

                        if(item.fields) {
                            item.passedData = {
                                updateField: false,
                                id: null
                            };
                        }
                        angular.forEach(data.fields, function(i,j) {
                            if(i.activeForFilter){
                                $scope.fields[i.key] = {
                                    type: i.type,
                                    label: i.label,
                                    val:(item.fields && item.fields[i.key]) ?[{id: item.fields[i.key],n:item.fields[i.key]}] : null
                                };
                            }
                            if (i.isReadOnlyAfterRaise) $scope.columns[j].isReadonly = true;
                            if(item.passedData && item.fields[i.key]) item.passedData[i.key]=item.fields[i.key];
                        });

                        $scope.fields['status'] = {label:'Status',type:'dropdown'};
                        $scope.applyFilter();
                        if($scope.templateData.docType === 'IMSRaiseProfile') setFieldVals(true);
                        $scope.templateLoader = false;
                        commonService.hideDropPanel();
                    }
                    $timeout(renderHT, 1000);
                },
                function(data) {
                    if (data.status == 404)
                        flash.pop({
                            title: 'Template not found',
                            body: 'Template not available for selected criteria! Please contact support team.',
                            type: 'info'
                        });
                    else
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                    $scope.templateData.fields = null;
                    $scope.templateLoader = false;
                });
        }
    };

    $scope.getIssues = function(pageNo, isGetCount,requestData) {
        invalidMsgList = [];
        $scope.issues = [];
        $scope.spareRow = 0;
        commonService.loader(true);
        $scope.templateLoader = true;
        if (isGetCount) {
            var promise1 = commonService.ajaxCall('POST', '/api/IMS/filter?count=true&templateId=' + $scope.templateData.templateId,requestData);
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
        var promise = commonService.ajaxCall('POST', '/api/IMS/filter?templateId=' + $scope.templateData.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo,requestData);
        promise.then(function(data) {

                if (data.length) $scope.issues = data;
                $scope.rowNos = [];
                for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * 500, j < data.length; i++, j++) {
                    $scope.issues[j].updateField = false;
                    $scope.rowNos.push(i);
                }
                $scope.templateLoader = false;
                $timeout(function() {
                    renderHT();
                }, 30);
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
    };

    $scope.saveIssues = function() {
        invalidMsgList = [];
        var dataTosave = commonService.validateGridData($scope.issues, $scope.columns, $scope.templateData.templateId);
        invalidMsgList = dataTosave.arrInvalidMsg;
        if (dataTosave.inValidData.length) {
            $scope.issues = dataTosave.inValidData;
            fillRowNos();
        }
        $scope.templateLoader = true;

        if (dataTosave.validData.data.length) {
            commonService.loader(true);
            var promise = commonService.ajaxCall('PUT', '/api/IMS?templateId=' + $scope.templateData.templateId, dataTosave.validData);
            promise.then(function(data) {
                    if (dataTosave.inValidData.length) {
                        flash.pop({
                            title: 'Waring',
                            body: 'Grid contains some Invalid data, which is not saved',
                            type: 'warning'
                        });
                        $scope.issues = dataTosave.inValidData;
                    } else {
                        $scope.applyFilter();
                        var mode = $('input[name="switch-field-1"]')[0];
                        if (mode && mode.checked) mode.checked = false;
                        flash.pop({
                            title: 'Success',
                            body: data,
                            type: 'success'
                        });
                    }
                    $scope.templateLoader = false;
                },
                function(data) {
                    $scope.templateLoader = false;
                    commonService.loader();
                    if (data.status === 412) {
                        if ($scope.issues.length > 1) {
                            dataTosave.inValidData.pop();

                            if (data.data.duplicateList != undefined)
                                $scope.issues = dataTosave.inValidData.concat(data.data.duplicateList);
                            else
                                $scope.issues = dataTosave.inValidData.concat(data.data.doc);
                        } else {
                            if (data.data.duplicateList != undefined)
                                $scope.issues = dataTosave.inValidData.concat(data.data.duplicateList);
                            else
                                $scope.issues = data.data.doc;
                        }
                        if (data.data.duplicateList != undefined) {
                            var tmpShipmentNumber = [];

                            for (var i = 0; i < data.data.duplicateList.length; i++)
                                tmpShipmentNumber.push(data.data.duplicateList[i].shipmentNumber);

                            flash.pop({
                                title: 'Alert',
                                body: 'Issue is already exist for shipment number ' + tmpShipmentNumber + '.Please correct and save again.',
                                type: 'error'
                            });
                        } else {
                            flash.pop({
                                title: 'Alert',
                                body: 'Invalid records in grid are not saved, Please correct and save again.',
                                type: 'error'
                            });
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
            $scope.templateLoader = false;
            flash.pop({
                title: 'No Data',
                body: 'No data to save or invalid data!',
                type: 'warning'
            });

        }
    };

    function fillRowNos() {
        $scope.rowNos = [];
        for (var i = 1; i <= $scope.issues.length; i++)
            $scope.rowNos.push(i);
    }

    function showModal(getIssues) {
        var itemToSend = $scope.templateData;
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
            $scope.templateData = data;
            $scope.fields = {};
            angular.forEach(data.fields,function(i){
                if(i.activeForFilter){
                    $scope.fields[i.key] = {
                        type: i.type,
                        label: i.label
                    };
                }
            });
            $scope.fields['status'] = {label:'Status',type:'dropdown'};

            createColumns(data.fields);
            var mode = $('input[name="switch-field-1"]')[0];
            if (mode && mode.checked) setFieldVals(false);
            else setFieldVals(true);

            setTimeout(function() {
                var ht = $('div.handsontable:visible');
                if (ht.length) ht.handsontable('render');
            }, 500);

            if (getIssues) $scope.getIssues($scope.currentPage = 1, true);
        }, function(data) {
            if ($scope.templateData.profileName === 'default')
                $scope.templateData.fields = null;
        });
    }

    $scope.editTemplate = function() {
        if (!$scope.templateData.fields) {
            var promise = commonService.ajaxCall('GET', '/api/template/default?type=' + $scope.templateData.docType);
            promise.then(function    (data) {
            $scope.templateData.profileName = 'default';
            $scope.templateData.fields = data.fields;
            $scope.templateData.templateId = data._id;
            showModal(true);
        },
        function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });
    } else showModal();
};

    $scope.switchMode = function(e) {
        invalidMsgList = [];
        if (e.target.checked) {
            tempIssues = $scope.issues;
            $scope.issues = [];
            $scope.rowNos = [];
            setFieldVals(false);
            if(item.passedData) $scope.issues.push(item.passedData);
            for (var i = 0; i < 20; i++) {
                $scope.issues.push({
                    updateField: false,
                    id: null
                });
                $scope.rowNos.push(i + 1);
            }
            $scope.spareRow = 1;
        } else {
            $scope.spareRow = 0;
            $timeout(function() {
                setFieldVals(true);
            if (tempIssues.length)
                $scope.issues = tempIssues;
            else $scope.applyFilter();
            },10);
        }
        $timeout(function() {
            renderHT();
        }, 50);
    };

    $scope.showDialog = function(id, type) {
        selectedIssue = $scope.issues[id.split('_')[1]];
        $scope.modelType = type;
        $scope.summaryData = [];

        if (type == 'summary') {
            if (!selectedIssue.id) {
                flash.pop({
                    title: 'Warring',
                    body: 'Issue Not found!',
                    type: 'info'
                });
                return;
            }
            $scope.loader = true;
            var promise = commonService.ajaxCall('GET', 'api/IMSHistory?issueId=' + selectedIssue.id + '&templateId=' + $scope.templateData.templateId);
            promise.then(function(data) {
                $scope.summaryData = data;
                $scope.loader = false;
            }, function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                $scope.dialog = false;
                $scope.loader = false;
            });
        } else {
            if (selectedIssue.IMSfiles == null)
                selectedIssue.IMSfiles = [];
            $rootScope.$broadcast('fillDoc', selectedIssue.IMSfiles);
        }
        $scope.dialog = true;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    $scope.$on('docExists', function(e, docId) {
        if ($scope.dialog) {
            if (docId.length && 'type' in docId[0])
                docId.shift(); // removes unwanted object
            selectedIssue.IMSfiles = docId;
            selectedIssue.updateField = true;
        }
    });

    $scope.close = function() {
        $scope.dialog = false;
        $rootScope.$broadcast('clearDoc', null);
    };

    $scope.$on('fileuploadsubmit', function(e) {
        commonService.loader(true);
    });

    $scope.$on('fileuploaddone', function(e,data) {
        flash.pop({
            title: 'Success',
            body: data.files[data.files.length-1].name+ ' file uploaded successfully.',
            type: 'info'
        });
        commonService.loader();
    });

    $scope.$on('fileuploadalways', function(e) {
        commonService.loader();
    });

    $scope.applyFilter = function() {
        var filterObj = {
            rules: {
                condition: 'and',
                fields: []
            }
        };

        for (var k in $scope.fields) {
            if ($scope.fields[k].val!=null) {
                if (angular.isArray($scope.fields[k].val)){
                    var obj = filterObj.rules;
                    if($scope.fields[k].val.length>1){
                        obj = { condition: 'or',fields: []};
                        filterObj.rules.fields.push(obj);
                    }
                    for (var i = 0; i < $scope.fields[k].val.length; i++)
                        obj.fields.push({
                            name: k,
                            operator: 'equalTo',
                            value: $scope.fields[k].type === 'numeric'? parseInt($scope.fields[k].val[i].n,10):$scope.fields[k].val[i].n
                        });
                }
                else
                    filterObj.rules.fields.push({
                        name: k,
                        operator: 'equalTo',
                        value:$scope.fields[k].type === 'numeric'? parseInt($scope.fields[k].val,10):$scope.fields[k].val
                    });
            }
        }
        $scope.getIssues($scope.currentPage = 1, true,filterObj);
        commonService.hideDropPanel();
    };

    $scope.resetFilter = function() {
        for (var k in $scope.fields)
            if ($scope.fields[k].val != null) {
                $scope.fields[k].val = null;
                $('input[name="' + k + '"]').select2('val', null);
            }

        if(!$('input[name="switch-field-1"]')[0].checked)
        $scope.getIssues($scope.currentPage = 1, true);
    };

}]);