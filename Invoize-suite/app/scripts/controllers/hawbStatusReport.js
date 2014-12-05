angularApp.controller('hawbStatusReportCtrl', function($scope, $http, $location, $timeout, $rootScope, $stateParams, $state, $route, $routeParams, $modal, commonService, flash, $filter) {
    console.log('hawbStatusReportCtrl insantiated');
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.pageLimit = 50;
    $scope.search = {};
    $scope.paginationSize = 10;
    // $scope.rowNos = [];

    var invalidMsgList = [];
    $scope.showGrid = false;
    $scope.hw = null;
    $scope.categories = [];
    $scope.shipments = [{
        updateField: null,
        id: null
    }];
    $scope.reportIndex = 0;
    $scope.fields = {};
    $scope.sortedFields = [];

    $scope.oprators = ['equalTo', 'Not equal to', 'Contains', 'doesNotContain', 'Between inclusive', 'Between exclusive', 'In list', 'Not in list', 'Less than', 'Greater than', 'Less than or equal to', 'Greater than or equal to', 'Begins with', 'Does not begin with', 'Ends with', 'Does not end with', 'Match Field Values'];

    $scope.isRowCollapsed = true;

    $scope.rulesProfile = {};
    var defaultTemplate = false;
    var defaultDownloadTemplate = false;
    $scope.templateData = {};

    //Start Filter Object
    $scope.rule = {};
    $scope.rule.conditions = {};
    // $scope.fieldsFilter = {};
    $scope.filterObj = {};
    $scope.list = [];
    $scope.filter = {};
    $scope.custObj = {};
    $scope.autosuggestSource = "hawbStatusReport";
    var finalJson = {};
    $scope.chkAllItems = false;
    //End Filter Object
    // $scope.myData = [];
    var isDirectSearch = false;

    var enableSplitView = false;
    $scope.searcbyByOption = [];
    $scope.searchBy = {};

    $scope.gridHeaders = [];

    var windowHeight = $(window).height();
    $scope.GH = $('.gridStyle').css({
        'height': windowHeight - 200
    });

    $scope.gridOptions = {
        data: 'items',
        columnDefs: 'gridHeaders',
        enablePinning: true,
        showSelectionCheckbox: true,
        checkboxCellTemplate: '<div class="ngSelectionCell"><input tabindex="-1" class="ngSelectionCheckbox" ng-click="handleChkAllClick()" ng-model="chkAllItems" type="checkbox" id="chkAll" ng-checked="row.selected" /> </div>'
    };


    // function fillRowNos() {
    //     $scope.rowNos = [];
    //     for (var i = 1; i <= $scope.shipments.length; i++)
    //         $scope.rowNos.push(i);
    // }

    $scope.pullFile = function(downloadFlag) {
        var checkedItems = [];
        // angular.forEach($scope.myAppObjects, function(appObj, arrayIndex) {
        //     angular.forEach(appObj, function(cb, key) {
        //         if (key.substring(0, 2) == "cb" && cb) {
        //             checkedItems.push(appObj.id + '-' + key)
        //         }
        //     })
        // })

        var dataForExport = angular.copy(finalJson);

        if (downloadFlag == true) {
            for (var i = 0; i < $scope.items.length; i++) {

                if ($scope.items[i].updateField == true)
                    checkedItems.push($scope.items[i].id);
            }

            if (checkedItems.length > 0) {
                dataForExport.Id = checkedItems;
                $.post('/api/HWBStatusReport/filter?exportXls=true', JSON.stringify(dataForExport), function(retData) {
                    $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
                });
            } else {
                flash.pop({
                    title: 'Alert',
                    body: 'Please select at least one row to download...',
                    type: 'error'
                });
            }

        } else {
            $.post('/api/HWBStatusReport/filter?exportXls=true', JSON.stringify(dataForExport), function(retData) {
                $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
            });
        }

        commonService.hideDropPanel();

    }


    $scope.columns = [];

    $scope.isProfileFilterActive = false;
    $scope.setProfileFilterStatus = function() {
        var profileFilter = $scope.rulesProfile.template;

        for (var i = 0; i < $scope.rulesProfile.template.length; i++) {
            if ($scope.rulesProfile.template[i].value != undefined) {
                if ($scope.rulesProfile.template[i].value[0] != undefined) {
                    if ($scope.rulesProfile.template[i].value[0].n != undefined) {
                        if ($scope.rulesProfile.template[i].value[0].n != "") {
                            $scope.isProfileFilterActive = true;
                            return;
                        } else
                            $scope.isProfileFilterActive = false;
                    } else
                        $scope.isProfileFilterActive = false;
                } else
                    $scope.isProfileFilterActive = false;

            } else
                $scope.isProfileFilterActive = false;


        }

    }

    $scope.getCategory = function() {


        $scope.shipmentLoader = true;
        commonService.loader(true);
        $scope.categories = [];
        var promise = commonService.ajaxCall('GET', 'api/suggestion?q=&pageLimit=100&page=1&selected=&suggestionFor=listing_Status&groupCategory=BillRight&statusCategory=In Process,Deleted');
        promise.then(function(data) {
            $scope.categories = data.msg;
            // $timeout(renderHT, 100);
            commonService.loader();
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
            commonService.loader();
        });

        // promise = commonService.ajaxCall('GET', 'api/template/profile/' + $scope.loggedInUser.userSystem[0].id);
        // promise.then(function(data) {
        //     $scope.rulesProfile.template = data;
        // }, function(data) {
        //     flash.pop({
        //         title: 'Alert',
        //         body: data.data,
        //         type: 'error'
        //     });
        // });


        $scope.getTemplate();

    };

    $scope.setPage = function() {
        setTimeout(function() {
            angular.element(".pagination").scope().getShipments(angular.element("ul.pagination li.active.ng-scope").scope().page.number);
        }, 300);
    };

    function initialGrid() {
        $scope.shipments = [{

            id: null
        }];
        $scope.columns = [];


    }


    $scope.getTemplate = function() {


        $scope.showGrid = true;
        $scope.templateLoader = true;
        commonService.loader(true);
        initialGrid();
        charges = [];
        $scope.columns = [];


        var promise = commonService.ajaxCall('GET', '/api/HWBStatusReport/template?systemId=' + $scope.loggedInUser.userSystem[0].id);


        promise.then(function(data) {
                var headers = [];

                var displayNames = data.msg.displayName;
                $scope.projection = data.msg.projection;

                $scope.searcbyByOption = data.msg.searchBy;

                var d = [];

                for (var i = 0; i <= displayNames.length - 1; i++) {
                    d.push({
                        label: displayNames[i],
                        type: 'text',
                        key: $scope.projection[i]

                    })
                }

                data.fields = angular.copy(d);

                $scope.templateData = data;

                if (data.fields.length > 0) {

                    // var sc = data.fields.sort(function(a, b) {
                    //     return parseInt(a.displayOrder) - parseInt(b.displayOrder)
                    // });
                    var sc = data.fields;
                    // $scope.templateData.fields = sc;

                    $scope.columns = [];

                    angular.forEach(sc, function(col, i) {

                        $scope.columns.push({
                            value: col.key,
                            type: col.type,
                            title: col.label,
                            width: col.label.length * 10,
                            length: col.label.length,
                            key: col.key,
                            visible: true

                        });

                        headers.push({
                            field: col.key.replace('.', '_'),
                            displayName: col.label,
                            width: col.label.length * 15
                        });


                    });

                    $scope.gridHeaders = headers;
                    $scope.getRuleFields();



                } else {
                    $scope.showGrid = false;
                    initialGrid();
                    flash.pop({
                        title: 'Alert',
                        body: "no template found for this account",
                        type: 'warning'
                    });
                }
                // commonService.loader(false);
                $scope.showGrid = true;
                $scope.templateLoader = false;
                // $scope.search();
                // $timeout(renderHT, 1000);

            },
            function(data) {
                initialGrid();
                $scope.showGrid = false;
                $scope.templateLoader = false;
                // commonService.loader(false);

                if (data.data == '"Error in Shipment Field list.There is no such shipment field is configure"') {
                    showModel('There is no such shipment field is configured for mention criteria. Click on Yes to load default shipment field or please contact admin to configure it.')
                } else {
                    flash.pop({
                        title: 'Information',
                        body: data.data,
                        type: 'warning'
                    });
                }


            });

    }

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
            defaultTemplate = true;
            defaultDownloadTemplate = true;
            $scope.getTemplate();
        }, function(selectedItem) {

        });
    }


    var hideColumn = function(index) {
        $('table thead tr').each(function() {
            // console.log(index);
            $(this).find("td").eq(index).hide();
        });
        $('table tbody tr').each(function() {
            $(this).find("td").eq(index).hide();
        });
    };


    $scope.setWidth = function(index) {
        if ($scope.columns[index].visible == false) {
            if ($scope.columns[index].isMandatory) {
                $scope.columns[index].visible = true;
                flash.pop({
                    title: 'Mandatory',
                    body: 'Mandatory fields can not be hide.',
                    type: 'warning'
                });

            } else {
                $scope.columns[index].visible = false;
                $scope.columns[index].width = 1
            }
        } else {
            $scope.columns[index].visible = true;
            $scope.columns[index].width = $scope.columns.length * 9;
        }


    };

    $scope.EditStatus = function(e) {
        var selectedShipments = [];
        for (var i = 0; i < $scope.shipments.length; i++) {
            if ($scope.shipments[i].updateField == true && $scope.shipments[i].id != null) {
                selectedShipments.push($scope.shipments[i].id)
            }
        }
        var dataToSave = {};
        dataToSave.shipmentId = selectedShipments;
        dataToSave.status = e
        if (selectedShipments.length > 0) {
            commonService.loader(true);
            var promise = commonService.ajaxCall('PUT', '/api/shipmentFieldStatus', dataToSave);
            promise.then(function(data) {
                    $scope.getShipments($scope.currentPage, true);
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: "status updated successfully",
                        type: 'success'
                    });
                },
                function(data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                    commonService.loader();
                });
        } else
            flash.pop({
                title: 'Information',
                body: "No shipment selected!",
                type: 'warning'
            });
        commonService.loader();
    }


    //Start Filter Function
    $scope.getRuleFields = function() {
        $scope.autosuggestSource = "hawbStatusReport";
        $scope.sortedFields = [];
        angular.forEach($scope.templateData.fields, function(i) {
            if (i.label.toLowerCase().indexOf("date") <= 0) {
                $scope.fields[i.key] = {
                    type: 'text',
                    label: i.label
                };
                $scope.sortedFields.push(i.key);
                $scope.custObj[i.label] = {
                    column: i.key,
                    systemId: $scope.loggedInUser.userSystem[0].id
                }
            }
        });
    };

    $scope.reset = function() {
        $scope.rule.conditions = {};
        $scope.currentPage = 1;
        $scope.shipments = [{
            updateField: null,
            id: null
        }];
        $scope.items = [];
        commonService.hideDropPanel();
        // $scope.getShipments($scope.currentPage, true);

    };

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

        var ruleTemplate = angular.copy($scope.rulesProfile.template);
        for (var i = 0; i < ruleTemplate.length; i++) {
            if (ruleTemplate[i].value == undefined || ruleTemplate[i].value.length == 0) {
                delete ruleTemplate[i];
            }
        }

        if (defaultDownloadTemplate == true) {
            if (ruleTemplate[0] == undefined) {
                $scope.filterObj = {
                    rules: rulesData.ruleDef,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.search.account[0].id,
                    default: true
                };



            } else {
                $scope.filterObj = {
                    rules: rulesData.ruleDef,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.search.account[0].id,
                    profileBased: ruleTemplate,
                    default: true
                };


            }
        } else {
            if (ruleTemplate[0] == undefined) {
                $scope.filterObj = {
                    rules: rulesData.ruleDef,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.search.account[0].id
                };

            } else {
                $scope.filterObj = {
                    rules: rulesData.ruleDef,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.search.account[0].id,
                    profileBased: ruleTemplate
                };
            }
        }

        if ($scope.filterObj.rules.fields.length <= 0) {
            flash.pop({
                title: 'No filter conditions',
                body: 'No conditions to apply filter',
                type: 'info'
            });
        } else
            $scope.getFilteredData(1, true);
    };

    $scope.getFilteredData = function(pageNo,isCount) {

        // $scope.Loader = true;
        commonService.loader(true);
        isDirectSearch = false;
        $scope.currentPage = pageNo;
        var promise = commonService.ajaxCall('POST', 'api/HWBStatusReport?pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo+(isCount?'&count=1':''), finalJson);
        promise.then(function(data) {
            $scope.items = data.msg;
            if(data.count)
            $scope.totalItems = data.count;


            // $scope.search();
            commonService.hideDropPanel();
            commonService.loader(false);
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
            // $scope.Loader = false;
            commonService.loader(false);
        });

    };

    $scope.resetFilter = function() {
        $scope.showDataFor = "";
        $scope.filter = {};
        $scope.currentPage = 1;
        finalJson = [];
        $scope.shipments = [{
            updateField: null,
            id: null
        }];
        $scope.items = [];
        commonService.hideDropPanel();
    }


    $scope.applyFilter = function() {
        $scope.filterObj = {
            rules: {
                condition: 'and',
                level: 0,
                fields: []
            },
            templateId: $scope.templateData.templateId
        };

        // for (var k in $scope.filter) {
        //     if ($scope.filter.hasOwnProperty(k)) {
        //         if (angular.isArray($scope.filter[k]))
        //             for (var i = 0; i < $scope.filter[k].length; i++)
        //                 $scope.filterObj.rules.fields.push({
        //                     name: k,
        //                     operator: 'equalTo',
        //                     value: $scope.filter[k][i].n
        //                 });
        //         else
        //             $scope.filterObj.rules.fields.push({
        //                 name: k,
        //                 operator: 'equalTo',
        //                 value: $scope.filter[k]
        //             });
        //     }
        // }
        finalJson = {};
        var tmpFinalJson = [];

        for (var k in $scope.filter) {
            if ($scope.filter.hasOwnProperty(k)) {
                if (tmpFinalJson.length == 0) {
                    var tmpJson = [];

                    for (var i = 0; i < $scope.filter[k].length; i++) {
                        var obj = {};
                        if (k == "account")
                            obj[k] = $scope.filter[k][i].id;
                        else
                            obj[k] = $scope.fields[k].type === 'numeric' ? parseInt($scope.filter[k][i].n, 10) : $scope.filter[k][i].n;
                        tmpJson.push(obj);
                    }
                    tmpFinalJson = tmpJson;
                } else {
                    var tmpJson = [];
                    for (var i = 0; i < tmpFinalJson.length; i++) {
                        for (var j = 0; j < $scope.filter[k].length; j++) {
                            var obj = {};
                            for (var kk in tmpFinalJson[i]) {
                                obj[kk] = tmpFinalJson[i][kk];
                            }
                            if (k == "account")
                                obj[k] = $scope.filter[k][j].id;
                            else
                                obj[k] = $scope.fields[k].type === 'numeric' ? parseInt($scope.filter[k][i].n, 10) : $scope.filter[k][i].n;
                            tmpJson.push(obj);
                        }
                    }
                    tmpFinalJson = tmpJson;
                }
            }
        }
        var tmpJson = [];
        if (tmpFinalJson.length > 0) {

            for (var i = 0; i < tmpFinalJson.length; i++) {
                var obj = {};


                for (var kk in tmpFinalJson[i]) {
                    obj[kk] = tmpFinalJson[i][kk];
                }
                obj["systemId"] = $scope.loggedInUser.userSystem[0].id;
                if ($scope.showDataFor != undefined) {
                    if ($scope.fromDate != undefined && $scope.fromDate != undefined) {
                        obj["searchDateFor"] = $scope.showDataFor;
                        obj["fromDate"] = dateConvert($scope.fromDate, "dd-MM-yyyy");
                        obj["toDate"] = dateConvert($scope.toDate, "dd-MM-yyyy");
                    }
                }

                tmpJson.push(obj);
            }
            tmpFinalJson = tmpJson;
            finalJson = {
                "formatedData": tmpFinalJson,

                "rowData": $scope.filter
            };
        } else {
            if ($scope.showDataFor != undefined) {
                if ($scope.fromDate != undefined && $scope.fromDate != undefined) {
                    var obj = {};
                    obj["systemId"] = $scope.loggedInUser.userSystem[0].id;
                    obj["searchDateFor"] = $scope.showDataFor;
                    obj["fromDate"] = dateConvert($scope.fromDate, "dd-MM-yyyy");
                    obj["toDate"] = dateConvert($scope.toDate, "dd-MM-yyyy");
                    tmpJson.push(obj);
                    tmpFinalJson = tmpJson;
                    finalJson = {
                        "formatedData": tmpFinalJson,

                        "rowData": {}

                    };
                }

            }

        }



        $scope.getFilteredData(1, true);
    };


    //End Filter Function

    function dateConvert(dateobj1, format) {
        var dateobj = new Date(dateobj1);
        var year = dateobj.getFullYear();
        var month = ("0" + (dateobj.getMonth() + 1)).slice(-2);
        var date = ("0" + dateobj.getDate()).slice(-2);
        var hours = ("0" + dateobj.getHours()).slice(-2);
        var minutes = ("0" + dateobj.getMinutes()).slice(-2);
        var seconds = ("0" + dateobj.getSeconds()).slice(-2);
        var day = dateobj.getDay();
        var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        var dates = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        var converted_date = "";

        switch (format) {
            case "YYYY-MMM-DD DDD":
                converted_date = year + " - " + months[parseInt(month, 10) - 1] + " - " + date + "" + dates[parseInt(day, 10)];
                break;
            case "YYYY - MM - DD ":
                converted_date = year + " - " + month + " - " + date;
                break;
            case "dd-MMM-yyyy":
                converted_date = date + " - " + months[parseInt(month, 10) - 1] + " - " + year;
                break;
            case "dd-MM-yyyy":
                converted_date = date + "-" + month + "-" + year;
                break;
        }

        return converted_date;
    }

    $scope.sortingOrder = 'shipmentFields.bookingNumber';
    $scope.reverse = false;
    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.itemsPerPage = 50;
    $scope.pagedItems = [];
    $scope.currentPage = 0;
    $scope.items = [];

    var searchMatch = function(haystack, needle) {
        if (!needle) {
            return true;
        }
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

    // init the filtered items

    $scope.search = function() {
        $scope.filteredItems = $filter('filter')($scope.items, function(item) {
            for (var attr in item) {
                if (item[attr] != null) {
                    if (attr != "updateField")
                        if (searchMatch(item[attr], $scope.query))
                            return true;
                }
            }
            return false;
        });
        // take care of the sorting order
        if ($scope.sortingOrder !== '') {
            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortingOrder, $scope.reverse);
        }
        if ($scope.filteredItems == "") {
            flash.pop({
                title: 'Alert',
                body: "No data found for search criteria...",
                type: 'warning'
            });
        }
        //$scope.currentPage = 0;
        // now group by pages
        $scope.groupToPages();
    };

    // calculate page in place
    $scope.groupToPages = function() {
        $scope.pagedItems = [];

        for (var i = 0; i < $scope.filteredItems.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [$scope.filteredItems[i]];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
            }
        }
    };

    $scope.range = function(start, end) {
        var ret = [];
        if (!end) {
            end = start;
            start = 0;
        }
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        return ret;
    };

    // $scope.prevPage = function() {
    //     if ($scope.currentPage > 0) {
    //         $scope.currentPage--;
    //     }
    // };

    // $scope.nextPage = function() {
    //     if ($scope.currentPage < $scope.pagedItems.length - 1) {
    //         $scope.currentPage++;
    //     }
    // };

    $scope.setPage = function(currentPage) {
        // $scope.currentPage = this.n;

        setTimeout(function() {
            if (isDirectSearch == true)
                angular.element(".pagination").scope().directSearch(angular.element("ul.pagination li.active.ng-scope").scope().page.number);
            else
                angular.element(".pagination").scope().getFilteredData(angular.element("ul.pagination li.active.ng-scope").scope().page.number);
        }, 300)
    };

    // functions have been describe process the data for display


    // change sorting order
    $scope.sort_by = function(newSortingOrder) {
        if ($scope.sortingOrder == newSortingOrder)
            $scope.reverse = !$scope.reverse;

        $scope.sortingOrder = newSortingOrder;

        // icon setup
        $('th i').each(function() {
            // icon reset
            $(this).removeClass().addClass('icon-sort');
        });
        if ($scope.reverse)
            $('th.' + new_sorting_order + ' i').removeClass().addClass('icon-chevron-up');
        else
            $('th.' + new_sorting_order + ' i').removeClass().addClass('icon-chevron-down');
    };

    $scope.handleChkAllClick = function() {
        var tmpFlag = $('#chkAll').is(':checked');

        for (var i = 0; i < $scope.items.length; i++) {

            $scope.items[i].updateField = tmpFlag;
            $('[name="chk_' + i + '"]').prop('checked', tmpFlag);
        }
        $('#chkAll').prop('checked', tmpFlag);
    };
    $scope.updateSelection = function($event, arrIndex) {
        var checkbox = $event.target;
        var tmpFlag = checkbox.checked;
        $scope.items[arrIndex].updateField = tmpFlag;

        var tmpFlag = true;


        for (var i = 0; i < $scope.items.length; i++) {

            if ($scope.items[i].updateField == false) {
                tmpFlag = false;
                break;
            }
        }

        $('#chkAll').prop('checked', tmpFlag);
    };

    $scope.directSearch = function(pageNo, isGetCount) {

        // $scope.Loader = true;


        var isValid = true;

        if ($scope.searchBy.option == undefined && $scope.searchBy.list == undefined) {
            isValid = false;
            flash.pop({
                title: 'Alert',
                body: "Please select any one option to search and provide list...",
                type: 'warning'
            });
        } else if ($scope.searchBy.option == undefined) {
            isValid = false;
            flash.pop({
                title: 'Alert',
                body: "Please select any one option to search...",
                type: 'warning'
            });
        } else if ($scope.searchBy.list == undefined) {
            isValid = false;
            flash.pop({
                title: 'Alert',
                body: "Please provide list to search...",
                type: 'warning'
            });
        }

        if (isValid == true) {
            commonService.loader(true);
            isDirectSearch = true;

            $scope.searchBy.systemId = $scope.loggedInUser.userSystem[0].id;
            finalJson = angular.copy($scope.searchBy);

            $scope.currentPage = pageNo;

            $scope.searchBy.systemId = $scope.loggedInUser.userSystem[0].id;

            var promise = commonService.ajaxCall('POST', 'api/HWBStatusReport?directSearch=1&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo+(isGetCount?'&count=1':''), finalJson);
            promise.then(function(data) {
                $scope.items = data.msg;
                if(data.count)
                $scope.totalItems = data.count;

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
    };
    $scope.resetDirectSearch = function() {
        $scope.searchBy.list = "";
        isDirectSearch = false;
        $scope.shipments = [{
            updateField: null,
            id: null
        }];

        commonService.hideDropPanel();
    }

});