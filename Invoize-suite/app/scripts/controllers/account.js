'use strict';

angularApp.controller('accountCtrl', function($scope, $http, $location, $state, $timeout, $route, $routeParams, $modal, commonService, sharedService, flash) {

    $scope.templates = [];
    $scope.account = {};
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.paginationSize = 20;
    $scope.pageLimit = 100;
    $scope.rowNos = [];
    $scope.hw = null;
    $scope.accountNumber = [];
    var invalidMsgList = [];
    $scope.showConfigurationDD = true;
    $scope.showBackBtn = false;
    $scope.templateData = {};

    $scope.setPage = function() {
        setTimeout(function() {
            if ($scope.$parent.filterObj.rules == undefined)
                angular.element(".pagination").scope().getAccounts(angular.element("li.active.ng-scope").scope().page.number);
            else
                angular.element(".pagination").scope().getFilteredData(angular.element("li.active.ng-scope").scope().page.number, true);
        }, 300);
    };

    $scope.afterRender = function() {
        renderHT();
    };

    function renderHT() {
        if ($scope.accounts != null && $scope.accounts.length > 20)
            $scope.hh = $(window).height() - 300;
        else
            $scope.hh = null;
        $scope.hw = $('div.page-content').width() - 35;
    }

    function initialGrid() {
        $scope.accounts = [{
            updateField: null,
            id: null
        }];

        $scope.columns = [{
            value: 'account.updateField',
            type: 'checkbox',
            title: 'Update',
            width: 50
        }];
    }

    $scope.celChange = function(values) {
        if (values.length > 50000) {
            flash.pop({
                title: 'Max limit reached',
                body: 'Max data cells paste limit is 50000 only!',
                type: 'warning'
            });
            return false;
        }
        var cellCount = values.length;
        for (var i = 0; i < cellCount; i++) {
            if (values[i][3] !== values[i][2]) {
                if (values[i][3] === '')
                    values[i][3] = null;
                else if (values[i][3] === 'true' || values[i][3] === 'false')
                    values[i][3] = eval(values[i][3]);
                if (values[i][1] !== 'updateField' && (!$scope.accounts[values[i][0]] || !$scope.accounts[values[i][0]].updateField))
                    values.push([values[i][0], 'updateField', 'null', true]);
            }
        }
        $scope.$parent.validForm = false;
    };

    $scope.onRowCreate = function(rowNo) {
        if ($scope.rowNos.length > 0)
            $scope.rowNos.push($scope.rowNos[$scope.rowNos.length - 1] + 1);
    };

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
        initialGrid();

        var templateId = null;
        if (window.location.href.indexOf("system") !== -1) {
            templateId = 'systemId/' + ($routeParams.systemId ? $routeParams.systemId : 'Default');
        } else {
            templateId = $scope.templateData.templateId ? $scope.templateData.templateId : 'Default';
        }

        var promise = commonService.ajaxCall('GET', '/api/template/' + templateId + '?type=account');
        promise.then(function(data) {
                $scope.templateData = data;
                //                initialGrid();
                data.profileName = data.profileName + data.templateId;
                $scope.columns = commonService.createColumns('account', $scope.templateData.fields, cellRenderer, $routeParams.systemId);
                $scope.getAccounts($scope.currentPage, true);

                $scope.getRuleFields();
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    }

    $scope.editViewTemplete = function(template) {
        $scope.redirectTo("/accounts/edit/" + $scope.templateData.templateId);
    }


    $scope.getAccounts = function(pageNo, isGetCount) {
        $scope.setDefaultConfig();
        invalidMsgList = [];
        commonService.loader(true);
        if (isGetCount) {
            var promise1 = commonService.ajaxCall('GET', 'api/getCount?collection=Account&templateId=' + $scope.templateData.templateId);
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

        var promise = commonService.ajaxCall('GET', '/api/account?templateId=' + $scope.templateData.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo);
        promise.then(function(data) {
                if (data.length) $scope.accounts = data;
                $scope.rowNos = [];
                for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * $scope.pageLimit, j < data.length; i++, j++) {
                    $scope.accounts[j].updateField = false;
                    $scope.rowNos.push(i);
                }
                commonService.loader(false);
            },
            function(data) {
                commonService.loader(false);
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    };

    $scope.saveAccounts = function() {
        invalidMsgList = [];
        var dataTosave = commonService.validateGridData($scope.accounts, $scope.columns, $scope.templateData.templateId);
        invalidMsgList = dataTosave.arrInvalidMsg;
        if (dataTosave.inValidData.length > 0) {
            $scope.accounts = dataTosave.inValidData;
            fillRowNos();
        }
        if (dataTosave.validData.data.length > 0) {
            commonService.loader(true);
            var promise = commonService.ajaxCall('PUT', '/api/grid?type=account&templateId=' + $scope.templateData.templateId, dataTosave.validData);
            promise.then(function(data) {
                    commonService.loader();
                    if (dataTosave.inValidData.length > 0) {
                        flash.pop({
                            title: 'Waring',
                            body: 'Grid contains some Invalid data, which is not saved',
                            type: 'warning'
                        });
                        $scope.accounts = dataTosave.inValidData;
                    } else {
                        $scope.getAccounts($scope.currentPage, true);
                        flash.pop({
                            title: 'Success',
                            body: data,
                            type: 'success'
                        });
                    }
                },
                function(data) {
                    commonService.loader();
                    if (data.status === 412) {
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records not save are in grid, Please correct and save again.',
                            type: 'error'
                        });
                        if ($scope.accounts.length > 1) {
                            dataTosave.inValidData.pop();
                            $scope.accounts = dataTosave.inValidData.concat(data.data.doc);
                        } else
                            $scope.accounts = data.data.doc;
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
                $scope.accounts = dataTosave.inValidData;
            } else
                flash.pop({
                    title: 'No Data',
                    body: 'No data to save',
                    type: 'warning'
                });
        }
    }


    $scope.editTemplate = function() {
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
            $scope.columns = commonService.createColumns('account', $scope.templateData.fields, cellRenderer, $routeParams.systemId);
        }, function(d) {
            console.log('Modal dismissed ');
        });
    };

    $scope.$on("editTemplateAccountEvent", function(event, args) {
        $scope.editTemplate();
    });

    $scope.$on("saveAccountEvent", function(event, args) {
        $scope.saveAccounts();
    });

    function fillRowNos() {
        $scope.rowNos = [];
        for (var i = 1; i <= $scope.accounts.length; i++)
            $scope.rowNos.push(i);
    }

    $scope.redirectTo = function(path) {
        //redirect based on wizard / organizationsetup


        $scope.$parent.autosuggestSource = path.slice(path.lastIndexOf('/') + 1, path.length);
        if ($location.$$url.toString().indexOf("invoiceDeliveryRuleNew") != -1 || $location.$$url.toString().indexOf("invoiceDeliveryRuleDetails") != -1) {
            path = path + '/InvoiceDeliveryrules';
        }
        $location.path($state.current.name.split('.')[0] + path);

    };

    $scope.getMetadataType = function(t) {
        $scope.$broadcast("getMetadataTypeEvent", {
            "metadataName": t
        });
    };
    $scope.setDefaultConfig = function() {
        $("button.btn-sm.btn-ico.btn-custom.dropdown-toggle.arrow-right").first().html('Configuration &nbsp;<i class="fa fa-angle-down"></i>');
    }

    $scope.EditRules = function(args) {

        var e = args.tabName;
        var selectedAccounts = [];
        var accountNos = [];
        for (var i = 0; i < $scope.accounts.length; i++) {
            if ($scope.accounts[i].updateField == true && $scope.accounts[i].id != null) {
                selectedAccounts.push($scope.accounts[i].id)
                accountNos.push($scope.accounts[i].accountNumber)
            }
        }
        if (selectedAccounts.length > 0) {
            if ($state.current.url !== "/accountCharge" && selectedAccounts.length !== 1 && args.tabName !== "InvoiceDeliveryEDI" && args.tabName !== "InvoiceDeliveryEmail" && args.tabName !== "InvoiceDeliveryWeb"  && args.tabName !== "InvoiceDeliveryDocProfile") {
                $scope.setDefaultConfig();
                flash.pop({
                    title: 'Information',
                    body: "Please select single account!",
                    type: 'warning'
                });
                $state.current.url = "/account";
                return;
            }
            $scope.selectedAccounts = {
                'accountNos': accountNos,
                'accountIds': selectedAccounts,
                'rulesFor': e
            };

            if (e == "InvoiceDeliveryEmail" || e == "InvoiceDeliveryWeb" || e == "InvoiceDeliveryEDI"  || e == "InvoiceDeliveryDocProfile")
                $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/' + e + 'rules/view');
            else
                $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/' + e + 'rules');
        } else {
            $scope.setDefaultConfig();
            flash.pop({
                title: 'Information',
                body: "No account selected!",
                type: 'warning'
            });
        }
    };



    $scope.openDialogUploadDoc = function() {
        var selectedAccounts = [];
        var accountNos = [];
        for (var i = 0; i < $scope.accounts.length; i++) {
            if ($scope.accounts[i].updateField == true && $scope.accounts[i].id != null) {
                selectedAccounts.push($scope.accounts[i].id)
                accountNos.push($scope.accounts[i].accountNumber)
            }
        }
        if (selectedAccounts.length > 0) {
            var modalInstance = $modal.open({
                templateUrl: 'account.profile.html',
                controller: 'accountProfileCtrl',
                resolve: {
                    items: function() {
                        return angular.copy("");
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {
                //here read company not template when we are updating an existing saved company template

                console.log(selectedItem);
            }, function(selectedItem) {
                console.log('Modal dismissed ');
            });

        } else
            flash.pop({
                title: 'Information',
                body: "No account selected!.",
                type: 'warning'
            });


    };


    $scope.OpenUploadDoc = function() {
        var selectedAccounts = [];
        var accountNos = [];
        $scope.accountNumber = [];
        for (var i = 0; i < $scope.accounts.length; i++) {
            if ($scope.accounts[i].updateField == true && $scope.accounts[i].id != null && $scope.accounts[i].accountNumber != null) {
                selectedAccounts.push($scope.accounts[i].id);
                accountNos.push($scope.accounts[i].accountNumber);
                $scope.accountNumber.push({
                    "id": $scope.accounts[i].id,
                    "v": $scope.accounts[i].id,
                    "n": $scope.accounts[i].accountNumber
                });
            }
        }
        if (selectedAccounts.length > 0) {
            if (selectedAccounts.length == 1) {
                //send account number and get all data and display check if already any data available for that account then display this 
                //otherwise display Upload  (new) form
                var promise = commonService.ajaxCall('GET', '/api/tms?&accountId=' + selectedAccounts[0]);
                promise.then(function(result) {
                    //$scope.historyLoader = false;
                    if (result.fields.length > 0)
                        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/edit');

                    else
                        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/Upload');


                }, function(result) {
                    //$scope.historyLoader = false;
                    flash.pop({
                        title: 'Alert',
                        body: "Please try after sometime..!",
                        type: 'error'
                    });
                });
                $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/edit');

            } else {
                $scope.selectedAccounts = {
                    'accountNos': accountNos,
                    'accountIds': selectedAccounts,
                    'rulesFor': 'Upload'
                };
                $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/Upload');
            }
        } else {
            flash.pop({
                title: 'Information',
                body: "No account selected!.",
                type: 'warning'
            });
        }

    };

    $scope.$on("EditRulesEvent", function(event, args) {
        if (args.tabName === "tms") {
            $scope.OpenUploadDoc();
        } else
            $scope.EditRules(args);
    });

    $scope.checkboxSelection = '1';


    $scope.isCheckboxSelected = function(index) {
        return index === $scope.checkboxSelection;
    };

    $scope.toggleEvent = function() {

        if ($scope.eventAddUpdate == false) {
            //-Add
            $scope.accounts = [];
            $scope.rowNos = [];
            for (var i = 0; i < 20; i++) {
                $scope.accounts.push({
                    updateField: false,
                    id: null
                });
                $scope.rowNos.push(i + 1);
            }

        } else if ($scope.eventAddUpdate == true) {
            //-Update
            $scope.getAccounts($scope.currentPage, true);
        }
    };

    $scope.$on("accountToggleEvent", function(event, args) {

        $scope.toggleEvent();
    });

    //Start Filter Function
    $scope.getRuleFields = function() {

        angular.forEach($scope.templateData.fields, function(i) {
            if (i.isActive == true) {
                $scope.fields[i.key] = {
                    type: i.type,
                    label: i.label
                };
                $scope.sortedFields.push(i.key);
                $scope.custObj[i.label] = {
                    column: i.key,
                    systemId: $routeParams.systemId,
                    columnType: i.type
                }
            }
        });

        $scope.$parent.childFields = angular.copy($scope.fields);
        $scope.$parent.childSortedFields = angular.copy($scope.sortedFields);
        $scope.$parent.childCustObj = angular.copy($scope.custObj);
    }

    $scope.reset = function() {
        $scope.rule.conditions = {};
        $scope.currentPage = 1;
        $scope.$parent.filterObj = {};
        $scope.getAccounts($scope.currentPage, true);
        commonService.hideDropPanel();
    }
    $scope.$on("accountReset", function(event, args) {
        $scope.reset();

    });
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
                    rule.type = fields.eq(fields.length - 1).attr('ftype');
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
        $scope.$parent.filterObj = {
            rules: rulesData.ruleDef,
            systemId: $routeParams.systemId
            //          accounts: ["52aec82c1c80a813874f8529",
            //              "52aec7ae1c80a8130567ac63"
            //          ]
        };

        if ($scope.$parent.filterObj.rules.fields.length <= 0) {
            flash.pop({
                title: 'No filter conditions',
                body: 'No conditions to apply filter',
                type: 'info'
            });
        } else
            $scope.getFilteredData(1, true);
    }
    $scope.$on("accountGetData", function(event, args) {
        $scope.getData();

    });

    // function getFilteredData(pageNo, isGetCount) {
    //     commonService.loader(true);
    //     if (isGetCount) {
    //         var promise1 = commonService.ajaxCall('PUT', 'api/filter?collection=account&count=1', $scope.$parent.filterObj);
    //         promise1.then(function(data) {
    //             $scope.totalItems = data.count;
    //         }, function(data) {
    //             flash.pop({
    //                 title: 'Alert',
    //                 body: data.data,
    //                 type: 'error'
    //             });
    //         });
    //     }
    //     $scope.currentPage = pageNo;
    //     var promise = commonService.ajaxCall('PUT', 'api/filter?collection=account&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo, $scope.$parent.filterObj);
    //     promise.then(function(data) {
    //         // $scope.Loader = false;
    //         if (data.length) $scope.accounts = data;
    //         $scope.rowNos = [];
    //         for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * 500, j < data.length; i++, j++) {
    //             $scope.accounts[j].updateField = false;
    //             $scope.rowNos.push(i);
    //         }
    //         // $timeout(renderHT, 1000);
    //         commonService.loader(false);
    //     }, function(data) {
    //         flash.pop({
    //             title: 'Alert',
    //             body: data.data,
    //             type: 'error'
    //         });
    //         commonService.loader(false);
    //     });

    // }
    $scope.getFilteredData = function(pageNo, isGetCount) {
        commonService.loader(true);
        if (isGetCount) {
            var promise1 = commonService.ajaxCall('PUT', 'api/filter?collection=account&count=1', $scope.$parent.filterObj);
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
        var promise = commonService.ajaxCall('PUT', 'api/filter?collection=account&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo, $scope.$parent.filterObj);
        promise.then(function(data) {
            // $scope.Loader = false;

            if (data.length) {
                $scope.accounts = data;
                $scope.rowNos = [];
                for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * 500, j < data.length; i++, j++) {
                    $scope.accounts[j].updateField = false;
                    $scope.rowNos.push(i);
                }
            } else {
                flash.pop({
                    title: 'No Data',
                    body: 'No data found with specified search criteria...!!!',
                    type: 'waning'
                });

                $scope.accounts = [{
                    updateField: null,
                    id: null
                }];



            }
            commonService.hideDropPanel();
            commonService.loader(false);
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
            commonService.loader(false);
        });

    }

    $scope.resetFilter = function() {
        for (var k in $scope.fields)
            if ($scope.fields.hasOwnProperty(k) && $scope.fields[k].val) {
                $scope.fields[k].val = null;
                if ($scope.fields[k].type == "dropdown" || $scope.fields[k].type == "multiselect")
                    $('input[name="' + k + '"]').select2('val', null);
                // delete $scope.fields[k];
            }
            // $scope.filter = {};
        $scope.$parent.filterObj = {};
        $scope.currentPage = 1;
        $scope.getAccounts($scope.currentPage, true);
        commonService.hideDropPanel();
    }
    $scope.$on("accountResetFilter", function(event, args) {
        $scope.resetFilter();

    });

    $scope.$on("accountApplyFilter", function(event, args) {
        $scope.applyFilter();

    });

    $scope.applyFilter = function() {
        $scope.$parent.filterObj = {
            rules: {
                condition: 'and',
                fields: []
            },
            systemId: $routeParams.systemId
        };

        for (var k in $scope.fields) {
            if ($scope.fields[k].val != null) {
                if (angular.isArray($scope.fields[k].val)) {
                    var obj = $scope.$parent.filterObj.rules;
                    if ($scope.fields[k].val.length > 1) {
                        obj = {
                            condition: 'or',
                            fields: []
                        };
                        $scope.$parent.filterObj.rules.fields.push(obj);
                    }
                    for (var i = 0; i < $scope.fields[k].val.length; i++)
                        obj.fields.push({
                            name: k,
                            operator: 'equalTo',
                            value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val[i].n, 10) : $scope.fields[k].val[i].n
                        });
                } else
                    $scope.$parent.filterObj.rules.fields.push({
                        name: k,
                        operator: 'equalTo',
                        value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val, 10) : $scope.fields[k].val
                    });
            }
        }
        $scope.getFilteredData($scope.currentPage = 1, true);
    };
    //End Filter Function

});