'use strict';

angularApp.controller('locationCtrl', function($scope, $http, $location, $timeout, $stateParams, $state, $route, $routeParams, $modal, Restangular, commonService, flash) {

    $scope.location = {};
    $scope.location.systemList = [];
    $scope.templates = [];
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.pageLimit = 100;
    $scope.rowNos = [];
    var invalidMsgList = [];
    $scope.hw = null;

    ///function to ser page after paging change event
    $scope.setPage = function() {
        setTimeout(function() {
            if ($scope.$parent.filterObj.rules == undefined)
                angular.element(".pagination").scope().getLocations(angular.element("ul.pagination li.active.ng-scope").scope().page.number);
            else
                angular.element(".pagination").scope().getFilteredData(angular.element("ul.pagination li.active.ng-scope").scope().page.number);
        }, 300);
    };
    $scope.format = "`CEVA`-a9-`S`9`US`";
    $scope.templateData = {};

    ///this function is used to intialize the grid when page is loaded
    function initialGrid() {
        $scope.locations = [{
            updateField: null,
            id: null
        }];

        $scope.columns = [{
            value: 'location.updateField',
            type: 'checkbox',
            title: 'update',
            width: 50
        }];
    }

    ///handles grid render to set the width and height of grid
    $scope.afterRender = function() {
        renderHT();
    }

    function renderHT() {
        if ($scope.locations != null && $scope.locations.length > 20)
            $scope.hh = $(window).height() - 300;
        else
            $scope.hh = null;
        $scope.hw = $('div.page-content').width() - 35;
    }

    ///handles the cel change event to put some validations on user input
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
                if (values[i][1] !== 'updateField' && (!$scope.locations[values[i][0]] || !$scope.locations[values[i][0]].updateField))
                    values.push([values[i][0], 'updateField', 'null', true]);
            }
        }
        $scope.$parent.validForm = false;
    }

    ///handles row create event to set the row nos
    $scope.onRowCreate = function(rowNo) {
        if ($scope.rowNos.length > 0)
            $scope.rowNos.push($scope.rowNos[$scope.rowNos.length - 1] + 1);
    }

    ///handles the cell render event to show validation/ error message if user save some invalid data.
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

    /// function to read templte to generate grid and load location data
    $scope.getTemplate = function() {
        $scope.templateLoader = true;
        commonService.loader(true);
        initialGrid();

        var templateId = null;
        if (window.location.href.indexOf("system") != -1) {
            templateId = 'systemId/' + ($routeParams.systemId ? $routeParams.systemId : 'Default');
        } else {
            templateId = $routeParams.templateId ? $routeParams.templateId : 'Default';
        }

        var promise = commonService.ajaxCall('GET', '/api/template/' + templateId + '?type=location');
        promise.then(function(data) {
                data.profileName = data.profileName + data.templateId;
                $scope.templateData = data;
                $scope.columns = commonService.createColumns('location', $scope.templateData.fields, cellRenderer);

                $scope.getLocations($scope.currentPage, true);
                $scope.getRuleFields();
                $scope.templateLoader = false;
                $timeout(renderHT, 1000);
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                $scope.templateLoader = false;
            });
    }

    ///function to load locations data
    $scope.getLocations = function(pageNo, isGetCount) {
        invalidMsgList = [];
        commonService.loader(true);
        $scope.templateLoader = true;
        if (isGetCount) {
            var promise1 = commonService.ajaxCall('GET', 'api/getCount?collection=Location&templateId=' + $scope.templateData.templateId);
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
        var promise = commonService.ajaxCall('GET', '/api/location?templateId=' + $scope.templateData.templateId + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo);
        promise.then(function(data) {

                if (data.length) $scope.locations = data;

                $scope.rowNos = [];
                for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * 500, j < data.length; i++, j++) {
                    $scope.locations[j].updateField = false;
                    $scope.rowNos.push(i);
                }
                $scope.templateLoader = false;
                renderHT();
                commonService.loader();
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    }

    /// save the grid data with all validations
    $scope.saveLocations = function() {
        invalidMsgList = [];
        ///call the common service to validate data.
        var dataTosave = commonService.validateGridData($scope.locations, $scope.columns, $scope.templateData.templateId);
        invalidMsgList = dataTosave.arrInvalidMsg;
        if (dataTosave.inValidData.length > 0) {
            $scope.locations = dataTosave.inValidData;
            fillRowNos();
        }
        $scope.templateLoader = true;

        if (dataTosave.validData.data.length > 0) {
            commonService.loader(true);
            var promise = commonService.ajaxCall('PUT', '/api/grid?type=location&templateId=' + $scope.templateData.templateId, dataTosave.validData);
            promise.then(function(data) {
                    if (dataTosave.inValidData.length > 0) {
                        flash.pop({
                            title: 'Waring',
                            body: 'Grid contains some Invalid data, which is not saved',
                            type: 'warning'
                        });
                        $scope.locations = dataTosave.inValidData;
                    } else {
                        $scope.getLocations($scope.currentPage, true);
                        flash.pop({
                            title: 'Success',
                            body: data,
                            type: 'success'
                        });
                        $scope.toggleEvent();
                    }
                    $scope.templateLoader = false;


                },
                function(data) {
                    $scope.templateLoader = false;

                    if (data.status === 412) {

                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records not save are in grid, Please correct and save again.',
                            type: 'error'
                        });
                        if ($scope.locations.length > 1) {
                            dataTosave.inValidData.pop();
                            $scope.locations = dataTosave.inValidData.concat(data.data.doc);
                        } else
                            $scope.locations = data.data.doc;
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
                    commonService.loader();
                });
        } else {
            $scope.templateLoader = false;

            flash.pop({
                title: 'No Data',
                body: 'No data to save or invalid data!',
                type: 'warning'
            });

        }
    }

    ///event to save location data
    $scope.$on("saveLocationEvent", function(event, args) {
        $scope.saveLocations();
    });
    ///event to edit location template
    $scope.$on("editTemplateLocationEvent", function(event, args) {
        $scope.editTemplate();
    });

    function fillRowNos() {
        $scope.rowNos = [];
        for (var i = 1; i <= $scope.locations.length; i++)
            $scope.rowNos.push(i);
    }

    ///function to open dialog to edit template
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
        modalInstance.result.then(function(selectedItem) {
            $scope.templateData = selectedItem;
            $scope.columns = commonService.createColumns('location', $scope.templateData.fields, cellRenderer);
            $scope.getLocations($scope.currentPage, false);
        }, function(d) {
            console.log('Modal dismissed ');
        });
    };

    ///function to go on next step
    $scope.nextStep = function() {
        $scope.redirectTo("/operation/view");
    }

    ///function to go on previous step
    $scope.prevStep = function() {
        $scope.redirectTo("/system/view");
    }

    ///function to go on path defined
    $scope.redirectTo = function(path) {
        $location.path($state.current.name.split('.')[0] + path);
    };

    ///this function toggle the operation to insert or update the data
    $scope.toggleEvent = function() {
        if ($scope.eventAddUpdate == false) {
            $scope.locations = [];
            $scope.rowNos = [];

            for (var i = 0; i < 20; i++) {
                $scope.locations.push({
                    updateField: false,
                    id: null
                });
                $scope.rowNos.push(i + 1);
            }

        } else if ($scope.eventAddUpdate == true) {
            $scope.getLocations($scope.currentPage, true);
        }
    };

    ///handles location toggle event
    $scope.$on("locationToggleEvent", function(event, args) {
        $scope.toggleEvent();
    });


    ///filter start

    ///set the rule fields for filter(done by kamal)
    $scope.getRuleFields = function() {
        $scope.autosuggestSource = "Location";
        angular.forEach($scope.templateData.fields, function(i) {
            if (i.isActive == true) {
                $scope.fields[i.key] = {
                    type: i.type,
                    label: i.label
                };
                $scope.custObj[i.label] = {
                    column: i.key,
                    templateId: $scope.templateData.templateId,
                    columnType: i.type
                }
            }
        });
    }


    ///function to reset location data with paging and filter
    $scope.reset = function() {
        $scope.rule.conditions = {};
        $scope.currentPage = 1;
        $scope.$parent.filterObj = {};
        $scope.getLocations($scope.currentPage, true);
        commonService.hideDropPanel();
    }

    ///handles the filter reset event
    $scope.$on("locationReset", function(event, args) {
        $scope.reset();

    });

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
        $scope.$parent.filterObj = {
            rules: rulesData.ruleDef,
            templateId: $scope.templateData.templateId
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

    ///handles the get filtered data event
    $scope.$on("locationGetData", function(event, args) {
        $scope.getData();

    });

    /// function to get the filter data after filter apply
    $scope.getFilteredData = function(pageNo, isGetCount) {
        commonService.loader(true);
        if (isGetCount) {
            var promise1 = commonService.ajaxCall('PUT', 'api/filter?collection=location&count=1', $scope.$parent.filterObj);
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
        var promise = commonService.ajaxCall('PUT', 'api/filter?collection=location&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo, $scope.$parent.filterObj);
        promise.then(function(data) {
            // $scope.Loader = false;

            if (data.length) {
                $scope.locations = data;
                $scope.rowNos = [];
                for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * 500, j < data.length; i++, j++) {
                    $scope.locations[j].updateField = false;
                    $scope.rowNos.push(i);
                }
            } else {
                flash.pop({
                    title: 'Waring',
                    body: 'No data found with specified search criteria...!!!',
                    type: 'warning'
                });

                $scope.locations = [{
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

    /// function to reset filter


    $scope.resetFilter = function() {
        for (var k in $scope.fields)
            if ($scope.fields.hasOwnProperty(k) && $scope.fields[k].val) {

                // delete $scope.fields[k];
                $scope.fields[k].val = null;
                if ($scope.fields[k].type == "dropdown" || $scope.fields[k].type == "multiselect")
                    $('input[name="' + k + '"]').select2('val', null);
            }
            // $scope.filter = {};
        $scope.$parent.filterObj = {};
        $scope.currentPage = 1;
        $scope.getLocations($scope.currentPage, true);
        commonService.hideDropPanel();
    }
    ///handles to reset filter
    $scope.$on("locationResetFilter", function(event, args) {
        $scope.resetFilter();
    });


    /// function to apply filter
    $scope.applyFilter = function() {
        $scope.$parent.filterObj = {
            rules: {
                condition: 'and',
                fields: []
            },
            templateId: $scope.templateData.templateId
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
                            value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val[i].n,10) : $scope.fields[k].val[i].n
                        });
                } else
                    $scope.$parent.filterObj.rules.fields.push({
                        name: k,
                        operator: 'equalTo',
                        value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val,10) : $scope.fields[k].val
                    });
            }
        }
        $scope.getFilteredData($scope.currentPage = 1, true);
    };

    ///handles apply filter event
    $scope.$on("locationApplyFilter", function(event, args) {
        $scope.applyFilter();

    });

    ///filter ends

});