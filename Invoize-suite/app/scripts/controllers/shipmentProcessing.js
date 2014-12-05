angularApp.controller('shipmentProcessCtrl', function($scope, $http, $location, $timeout, $rootScope, $stateParams, $state, $route, $routeParams, $modal, commonService, flash, imsFactory) {
    $scope.global = $scope.$parent.global;
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.pageLimit = 50;
    $scope.paginationSize = 10;
    $scope.rowNos = [];
    var charges = [];
    var invalidMsgList = [];
    $scope.showGrid = false;
    $scope.showDialog = false;
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
    $scope.autosuggestSource = $state.current.url.slice(1, $state.current.url.length);
    $scope.files = [];
    $scope.filePath = "";

    //End Filter Object

    var isFromTariff = false;
    $scope.isActionActive = false;
    $scope.isSaveActive = false;

    //    if (!$scope.global.account) $scope.global.account = null;

    function fillRowNos() {
        $scope.rowNos = [];
        for (var i = 1; i <= $scope.shipments.length; i++)
            $scope.rowNos.push(i);
    }

    $scope.pullFile = function(downloadFlag) {
        var ruleTemplate = angular.copy($scope.rulesProfile.template);


        for (var i = 0; i < ruleTemplate.length; i++) {
            if (ruleTemplate[i].value == undefined || ruleTemplate[i].value.length == 0) {
                delete ruleTemplate[i];
            }
        }

        if (downloadFlag == true) {
            var tmpShipmentId = [];

            if ($scope.isSaveActive == true) {
                for (var i = 0; i < $scope.shipments.length; i++) {
                    if ($scope.shipments[i].updateField == true)
                        tmpShipmentId.push($scope.shipments[i].id)
                }


                if (defaultDownloadTemplate == true) {
                    if (ruleTemplate[0] == undefined) {
                        if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                            filterObj = {
                                systemId: $scope.loggedInUser.userSystem[0].id,
                                accountId: $scope.global.account[0].id,
                                default: true,
                                shipmentId: tmpShipmentId,
                                emailId: $route.params.emailID
                            };
                        } else {
                            filterObj = {
                                systemId: $scope.loggedInUser.userSystem[0].id,
                                accountId: $scope.global.account[0].id,
                                default: true,
                                shipmentId: tmpShipmentId
                            };
                        }



                    } else {
                        if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                            filterObj = {
                                systemId: $scope.loggedInUser.userSystem[0].id,
                                accountId: $scope.global.account[0].id,
                                profileBased: ruleTemplate,
                                default: true,
                                shipmentId: tmpShipmentId,
                                emailId: $route.params.emailID
                            };
                        } else {
                            filterObj = {
                                systemId: $scope.loggedInUser.userSystem[0].id,
                                accountId: $scope.global.account[0].id,
                                profileBased: ruleTemplate,
                                default: true,
                                shipmentId: tmpShipmentId
                            };
                        }


                    }
                } else {
                    if (ruleTemplate[0] == undefined) {
                        if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                            filterObj = {
                                systemId: $scope.loggedInUser.userSystem[0].id,
                                accountId: $scope.global.account[0].id,
                                shipmentId: tmpShipmentId,
                                emailId: $route.params.emailID
                            };
                        } else {
                            filterObj = {
                                systemId: $scope.loggedInUser.userSystem[0].id,
                                accountId: $scope.global.account[0].id,
                                shipmentId: tmpShipmentId
                            };
                        }



                    } else {
                        if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                            filterObj = {
                                systemId: $scope.loggedInUser.userSystem[0].id,
                                accountId: $scope.global.account[0].id,
                                profileBased: ruleTemplate,
                                shipmentId: tmpShipmentId,
                                emailId: $route.params.emailID
                            };
                        } else {
                            filterObj = {
                                systemId: $scope.loggedInUser.userSystem[0].id,
                                accountId: $scope.global.account[0].id,
                                profileBased: ruleTemplate,
                                shipmentId: tmpShipmentId
                            };
                        }

                    }
                }
                $.post('/api/shipmentField/filter?isExcel=true', JSON.stringify(filterObj), function(retData) {
                    $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
                });
            } else {
                flash.pop({
                    title: 'Alert',
                    body: 'Please select at least one row to dowload...',
                    type: 'error'
                });
            }
        } else {
            if (defaultDownloadTemplate == true) {
                if (ruleTemplate[0] == undefined) {
                    if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                        filterObj = {
                            systemId: $scope.loggedInUser.userSystem[0].id,
                            accountId: $scope.global.account[0].id,
                            default: true,
                            emailId: $route.params.emailID
                        };
                    } else {
                        filterObj = {
                            systemId: $scope.loggedInUser.userSystem[0].id,
                            accountId: $scope.global.account[0].id,
                            default: true
                        };
                    }



                } else {
                    if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                        filterObj = {
                            systemId: $scope.loggedInUser.userSystem[0].id,
                            accountId: $scope.global.account[0].id,
                            profileBased: ruleTemplate,
                            default: true,
                            emailId: $route.params.emailID
                        };
                    } else {
                        filterObj = {
                            systemId: $scope.loggedInUser.userSystem[0].id,
                            accountId: $scope.global.account[0].id,
                            profileBased: ruleTemplate,
                            default: true
                        };
                    }


                }
            } else {
                if (ruleTemplate[0] == undefined) {
                    if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                        filterObj = {
                            systemId: $scope.loggedInUser.userSystem[0].id,
                            accountId: $scope.global.account[0].id,
                            emailId: $route.params.emailID
                        };
                    } else {
                        filterObj = {
                            systemId: $scope.loggedInUser.userSystem[0].id,
                            accountId: $scope.global.account[0].id
                        };
                    }



                } else {
                    if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                        filterObj = {
                            systemId: $scope.loggedInUser.userSystem[0].id,
                            accountId: $scope.global.account[0].id,
                            profileBased: ruleTemplate,
                            emailId: $route.params.emailID
                        };
                    } else {
                        filterObj = {
                            systemId: $scope.loggedInUser.userSystem[0].id,
                            accountId: $scope.global.account[0].id,
                            profileBased: ruleTemplate
                        };
                    }


                }
            }
            $.post('/api/shipmentField/filter?isExcel=true', JSON.stringify(filterObj), function(retData) {
                $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
            });
        }
        commonService.hideDropPanel();


    };

    var buttonRenderer = function(instance, td, row, col, prop, value, cellProperties) {
        var escaped = Handsontable.helper.stringify(value);
        var $btn = $('<a class="command" type="submit"> <i class="fa fa-list"></i></a>');
        $btn.on('click', function() {
            openDialog(cellProperties.prop, $scope.shipments[row].id, row);
        });
        $(td).empty().append($btn); //empty is needed because you are rendering to an existing cell
        return td;
        // }
    };

    var buttonInvoiceRenderer = function(instance, td, row, col, prop, value, cellProperties) {
        var escaped = Handsontable.helper.stringify(value);
        var $btn = $('<a permission="shipmentEntry.viewInvoicesShipmentEntry" class="command" type="submit"> <i class="fa fa-list"></i></a>');
        $btn.on('click', function() {
            // isFromTariff = true;

            // $scope.saveShipments($scope.shipments[row].id, row);
            openInvoiceDialog($scope.shipments[row].id, row);
        });
        $(td).empty().append($btn); //empty is needed because you are rendering to an existing cell
        return td;
        // }
    };
    var buttonIssueRenderer = function(instance, td, row, col, prop, value, cellProperties) {

        var escaped = Handsontable.helper.stringify(value);
        var $btn = $('<a permission="shipmentEntry.viewIssuesShipmentEntry" permission="shipmentEntry.viewInvoices"  class="command" type="submit"> <i class="fa fa-list"></i></a>');
        $btn.on('click', function() {
            openIssueDialog(row);
        });
        $(td).empty().append($btn); //empty is needed because you are rendering to an existing cell
        return td;

    };

    var buttonUploadDocumentRenderer = function(instance, td, row, col, prop, value, cellProperties) {

        var escaped = Handsontable.helper.stringify(value);
        var $btn = $('<a permission="shipmentEntry.uploadDocumentsShipmentEntry" class="command" type="submit"> <i class="fa fa-list"></i></a>');
        $btn.on('click', function() {
            openUploadDocumentDialog($scope.shipments[row].bookingNumber, row);
        });
        $(td).empty().append($btn); //empty is needed because you are rendering to an existing cell
        return td;

    };

    var buttonViewDocumentRenderer = function(instance, td, row, col, prop, value, cellProperties) {

        var escaped = Handsontable.helper.stringify(value);
        var $btn = $('<a permission="shipmentEntry.viewDocumentShipmentEntry"  class="command" type="submit" tooltip="View"><i class="fa fa-list"></i></a>');
        $btn.on('click', function() {
            $scope.getDocument(row);
        });
        $(td).empty().append($btn); //empty is needed because you are rendering to an existing cell
        return td;

    };

    $scope.columns = [{
        value: 'shipment.updateField',
        type: 'checkbox',
        title: 'update',
        width: 50,
        visible: true
    }];

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
        $scope.RenderHTW(false);

        $scope.shipmentLoader = true;
        commonService.loader(true);
        $scope.categories = [];
        var promise = commonService.ajaxCall('GET', 'api/suggestion?q=&pageLimit=100&page=1&selected=&suggestionFor=listing_Status&groupCategory=BillRight&statusCategory=In Process,Deleted&associateAt=HBL');
        promise.then(function(data) {
            $scope.categories = data.msg;
            $timeout(renderHT, 100);
            // commonService.loader();
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
            // commonService.loader();
        });

        promise = commonService.ajaxCall('GET', 'api/template/profile/' + $scope.loggedInUser.userSystem[0].id);
        promise.then(function(data) {
            $scope.rulesProfile.template = data;

            if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                if ($route.params.accountID != undefined) {
                    // promise = commonService.ajaxCall('GET', 'api/suggestion?q=&pageLimit=10&page=1&selected=&suggestionFor=account&systemId=' + $scope.loggedInUser.userSystem[0].id + '&_=1399891004483');
                    // promise.then(function(data) {

                    //     for (var i = 0; i < data.msg.length; i++) {

                    //         if (data.msg[i].id == $route.params.accountID) {
                    //             $scope.$parent.account = [];
                    //             $scope.$parent.account.push(data.msg[i]);
                    //             $scope.getTemplate();
                    //             break;
                    //         }
                    //     }

                    // }, function(data) {
                    //     flash.pop({
                    //         title: 'Alert',
                    //         body: data.data,
                    //         type: 'error'
                    //     });
                    // });
                    $rootScope.currentContext = $state.$current.context.product + '.shipmentEntry.viewShipmentData';
                    //                    $scope.global.account = [];
                    $scope.global.account = [{
                        "c": "",
                        "g": "",
                        "n": $route.params.account,
                        "v": $route.params.accountID,
                        "id": $route.params.accountID,
                        "tc": null
                    }];
                    $scope.getTemplate();
                }
            } else {
                //                $scope.global.account = [];
                $scope.shipments = [{
                    updateField: null,
                    id: null
                }];
                fillRowNos();
            }
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });
        commonService.loader(false);


        /////////////////////////// if account is already selected, then automate the search option
        if($scope.global.account) {
            $scope.getTemplate();
        }//if

    };

    $scope.setPage = function() {
        setTimeout(function() {
            if ($scope.filterObj.rules == undefined)
                angular.element(".pagination").scope().getShipments(angular.element("ul.pagination li.active.ng-scope").scope().page.number);
            else
                angular.element(".pagination").scope().getFilteredData(angular.element("ul.pagination li.active.ng-scope").scope().page.number);
        }, 300);
    };

    $scope.closeDialog = function() {
        imsFactory.clearAllItem();
        $scope.showDialog = false;

    };

    function initialGrid() {
        $scope.shipments = [{
            updateField: false,
            id: null
        }];
        $scope.columns = [{
            value: 'shipment.updateField',
            type: 'checkbox',
            title: 'update',
            width: 50,
            visible: true
        }];

        fillRowNos();

    }

    $scope.loadFile = function(fileName) {
        if ($scope.global.account) {
            var id = fileName + "||" + $scope.global.account[0].n + "||" + $rootScope.loggedInUser.organization;
            $scope.filePath = "http://docs.google.com/gview?url=http://" + location.host + "/api/downloadFile?id=" + id + "&size=0&embedded=true";
            $('#docFrame').attr('src', $scope.filePath);
        }

    };

    $scope.getDocument = function(idx) {
        if ($scope.shipments[idx].files == undefined || $scope.shipments[idx].files == null || $scope.shipments[idx].updateField) {
            var promise = commonService.ajaxCall('GET', '/api/getFiles?bookingNumber=' + $scope.shipments[idx].bookingNumber + '&responseType=array');
            promise.then(function(data) {
                    if (data.msg.length > 0) {
                        $scope.shipments[idx].files = data.msg;
                        $scope.files = $scope.shipments[idx].files;
                        if ($scope.files.length > 0) {
                            $scope.fileName = $scope.files[0];
                        }
                        var id = $scope.files[0] + "||" + $scope.global.account[0].n + "||" + $rootScope.loggedInUser.organization;
                        $scope.filePath = "http://docs.google.com/gview?url=" + location.host + "/api/downloadFile?id=" + id + "&size=0&embedded=true";
                        $('#docFrame').attr('src', $scope.filePath);
                        setTimeout(function() {
                            $scope.RenderHTW(true);
                        }, 800)
                    } else {
                        flash.pop({
                            title: 'Alert',
                            body: "No Data Found",
                            type: 'warning'
                        });
                    }
                    commonService.loader();

                },
                function(data) {
                    flash.pop({
                        title: 'Alert',
                        body: data,
                        type: 'error'
                    });
                    commonService.loader();
                });

        } else {
            $scope.files = $scope.shipments[idx].files;
            if ($scope.files.length > 0) {
                $scope.fileName = $scope.files[0];
            }
            var id = $scope.files[0] + "||" + $scope.global.account[0].n + "||" + $rootScope.loggedInUser.organization;
            $scope.filePath = "http://docs.google.com/gview?url=http://" + location.host + "/api/downloadFile?id=" + id + "&size=0&embedded=true";
            console.log($scope.filePath);
            $('#docFrame').attr('src', $scope.filePath);
            setTimeout(function() {
                $scope.RenderHTW(true);
            }, 800)
        }
    };

    $scope.RenderHTW = function(isSplit) {
        if (isSplit) {
            $timeout(function() {
                $('.stretch.ui-splitbar').css("left", "50%");
                $('.west-back.stretch').css("right", "50%");
                $('.east-back.stretch').css("left", "50%");
                $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
            }, 300);
        } else {
            $timeout(function() {

                $('.stretch.ui-splitbar').css("left", "100%");
                $('.west-back.stretch').css("right", "0%");
                $('.east-back.stretch').css("left", "100%");
                $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
            }, 300);
        }

    };

    function renderHT() {
        if ($scope.shipments.length > 20)
            $scope.hh = $(".west-back.div-west.stretch").height() - 40;
        else
            $scope.hh = null;

        $timeout(function() {
            $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
            $("iframe").css({
                'width': '100%',
                'height': '90%'
            });
        }, 300);
    }


    $(".ui-splitbar").mousedown(function() {}).mouseup(function() {
        $timeout(function() {
            $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
        }, 300);
    });


    $scope.celChange = function(values) {
        $scope.isSaveActive = false;
        $scope.isActionActive = false;
        var tmpCnt = 0;

        var cellCount = values.length;
        for (var i = 0; i < cellCount; i++) {
            if (values[i][3] !== values[i][2]) {
                if (values[i][3] === '')
                    values[i][3] = null;
                if (values[i][1] !== 'updateField' && (!$scope.shipments[values[i][0]] || !$scope.shipments[values[i][0]].updateField)) {
                    values.push([values[i][0], 'updateField', 'null', true]);
                    $scope.isSaveActive = true;
                    isFromTariff = false;
                    tmpCnt = tmpCnt + 1;
                }

            }
        }
        $scope.$parent.validForm = false;


        if (values[0][1] == 'updateField') {

            if (values[0][3] == true) {
                $scope.isSaveActive = true;
                tmpCnt = tmpCnt + 1;
            } else {
                tmpCnt = tmpCnt - 1;
                for (var i = 0; i < $scope.shipments.length; i++) {
                    if ($scope.shipments[i].updateField == true && values[0][0] != i) {
                        $scope.isSaveActive = true;
                        break;
                    }

                }
            }

            var tmpFlag = true;

            for (var i = 0; i < $scope.shipments.length; i++) {
                if ($scope.shipments[i].updateField == false) {
                    if (i == values[0][0]) {
                        if (values[0][3] == false) {
                            tmpFlag = false;
                            break;
                        }
                    } else {
                        tmpFlag = false;
                        break;
                    }
                }

            }

            if (values[0][3] == false)
                tmpFlag = false;


            for (var i = 0; i < $scope.shipments.length; i++) {
                if ($scope.shipments[i].updateField == true) {
                    tmpCnt = tmpCnt + 1;
                    if (tmpCnt > 1)
                        break;
                }

            }

            if (tmpCnt == 1)
                $scope.isActionActive = true;
            else
                $scope.isActionActive = false;

            $timeout(function() {
                $('#chkAll').attr('checked', tmpFlag);

            }, 100);

        } else {

            for (var i = 0; i < $scope.shipments.length; i++) {
                if ($scope.shipments[i].updateField == true) {
                    $scope.isSaveActive = true;
                    isFromTariff = false;
                    tmpCnt = tmpCnt + 1;
                    if (tmpCnt > 1)
                        break;
                }

            }

            if (tmpCnt == 1)
                $scope.isActionActive = true;
            else
                $scope.isActionActive = false;
        }


    }

    $scope.onRowCreate = function(rowNo) {
        $scope.rowNos.push($scope.rowNos[$scope.rowNos.length - 1] + 1);
    }


    var cellRenderer = function(instance, td, row, col, prop, value, cellProperties) {
        if (cellProperties.type == 'autocomplete')
            Handsontable.AutocompleteCell.renderer.apply(this, arguments)
        else if (cellProperties.type == 'date')
            Handsontable.DateCell.renderer.apply(this, arguments)
        else
            Handsontable.TextCell.renderer.apply(this, arguments);
        if (row === 0) {
            setTimeout(function() {
                var headers = instance.$table.find('thead th');
                for (var i = 0; i < headers.length; i++)
                    if (cellProperties.columns[col] && headers.eq(i).text() === cellProperties.columns[col].title) {
                        headers[i].title = cellProperties.toolTip || '';
                        break;
                    }
            }, 1000);
        }
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
    }

    var openDialog = function(parentGroup, shipmentId, row) {
        var itemToSend = {};
        itemToSend.shipmentId = shipmentId;
        itemToSend.accountId = $scope.global.account[0].id;
        itemToSend.systemId = $scope.loggedInUser.userSystem[0].id;
        itemToSend.profileBased = $scope.rulesProfile.template;
        itemToSend.templateId = $scope.templateData.templateId;
        itemToSend.parentGroup = parentGroup;
        itemToSend.data = [{}];
        if ($scope.shipments[row][parentGroup])
            itemToSend.data = $scope.shipments[row][parentGroup];
        var modalInstance = $modal.open({
            templateUrl: 'shipment.processing.details.html',
            controller: 'shipmentDetailsCtrl',
            resolve: {
                items: function() {
                    return angular.copy(itemToSend);
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {
            // console.log('1');
            // console.log(selectedItem);
            $scope.shipments[row].updateField = true;
            isFromTariff = false;
            $scope.isSaveActive = true;
            if (selectedItem == "deleteAll") {
                delete $scope.shipments[row][parentGroup];
            } else {
                $scope.shipments[row][parentGroup] = selectedItem;
            }

        }, function(selectedItem) {});

    };

    var openInvoiceDialog = function(shipmentId, row) {
        var itemToSend = {};
        itemToSend.shipmentId = shipmentId;
        itemToSend.accountId = $scope.global.account[0].id;
        itemToSend.systemId = $scope.loggedInUser.userSystem[0].id;
        itemToSend.type = "update";
        var modalInstance = $modal.open({
            templateUrl: 'shipment.processing.invoice.html',
            controller: 'shipmentInvoiceCtrl',
            resolve: {
                items: function() {
                    return angular.copy(itemToSend);
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {
            $scope.shipments[row].updateField = true;
            isFromTariff = false;
            $scope.isSaveActive = true;
            $scope.getShipments($scope.currentPage, true);

        }, function(selectedItem) {});

    };

    var openIssueDialog = function(row) {

        var processID;
        var promise = commonService.ajaxCall('GET', 'api/suggestions?suggestionFor=metadata_processMaster&currentContext=' + $state.$current.context.product + '.ims&systemId=' + $rootScope.loggedInUser.userSystem[0].id);
        promise.then(function(data) {
                // $scope.processes = data.msg;
                // $scope.templateData.process = $scope.processes[0].id;
                for (var i = 0; i < data.msg.length; i++) {
                    if (data.msg[i].n == "IRB")
                        processID = data.msg[i].id;

                }

                var moduleID, moduleIndex;
                var promiseModule = commonService.ajaxCall('GET', 'api/suggestions?suggestionFor=IMSModules&currentContext=' + $state.$current.context.product + '.ims');
                promiseModule.then(function(data) {
                        for (var i = 0; i < data.msg.length; i++) {
                            if (data.msg[i].n == "Shipment Fields") {
                                moduleID = data.msg[i];
                                moduleIndex = i;
                            }
                        }


                        // imsFactory.docType = "IMSRaiseProfile";
                        // imsFactory.module = moduleID;
                        // imsFactory.moduleIndex = moduleIndex;
                        // imsFactory.process = processID;
                        // imsFactory.account = $scope.$parent.account[0].n;
                        // imsFactory.fields = {
                        //     "shipmentNumber": $scope.shipments[row].shipmentNumber,
                        //     "id": $scope.shipments[row].id,
                        //     "bookingNumber": $scope.shipments[row].bookingNumber
                        // };

                        imsFactory.clearAllItem();
                        // imsFactory.addItem({
                        //     "docType": "IMSRaiseProfile",
                        //     "module": moduleID,
                        //     "moduleIndex": moduleIndex,
                        //     "process": processID,
                        //     "fields": {
                        //         "shipmentNumber": $scope.shipments[row].shipmentNumber,
                        //         "accountNumber": $scope.$parent.account[0].n


                        //     }
                        // });

                        var tmp = {
                            "docType": "IMSRaiseProfile",
                            "module": moduleID,
                            "moduleIndex": moduleIndex,
                            "process": processID,
                            "fields": angular.copy($scope.shipments[row])

                        };
                        tmp.fields["accountNumber"] = $scope.global.account[0].n;

                        imsFactory.addItem(tmp);



                        $scope.showDialog = true;
                        $timeout(renderHT, 1000);
                    },
                    function(data) {
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                    });


            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });



    };

    var openUploadDocumentDialog = function(bookingNumber, row) {
        var itemToSend = {};

        itemToSend.accountNumber = {
            "label": "Account Number",
            "key": "accountNumber",
            "type": "multiselect",
            "isActive": "false",

            "value": $scope.global.account[0].n
        };
        itemToSend.fileName = {
            "label": "Booking Number",
            "key": "fileName",
            "type": "multiselect",
            "isActive": "false",
            "value": bookingNumber
        };
        // itemToSend.docType = {
        //     "label": "Doc Type",
        //     "key": "docType",
        //     "type": "dropdown",
        //     "isActive": "false",
        //     "value": "documents"
        // };

        itemToSend.dataEntryStatus = {
            "label": "Data Entry Status",
            "key": "dataEntryStatus",
            "type": "dropdown",
            "isActive": "false",
            "value": "Pending"
        };
        itemToSend.comment = {
            "label": "Comment",
            "key": "comment",
            "type": "text",
            "isActive": "false",
            "value": "Actual Comment"
        };
        itemToSend.sourceType = {
            "label": "Source Type",
            "key": "sourceType",
            "type": "dropdown",
            "isActive": "false",
            "value": "DayBookF"
        };
        itemToSend.uploadMethod = {
            "label": "Upload Method",
            "key": "uploadMethod",
            "type": "text",
            "isActive": "false",
            "value": "Manual"
        };

        var modalInstance = $modal.open({
            templateUrl: 'uploadDocument.html',
            controller: 'uploadDocumentCtrl',
            resolve: {
                items: function() {
                    return angular.copy({
                        isUpload: true,
                        fields: itemToSend
                    });
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {

            $scope.shipments[row].updateField = true;
            isFromTariff = false;
            $scope.isSaveActive = true;

        }, function(selectedItem) {
            $scope.shipments[row].updateField = true;
            isFromTariff = false;
        });

    };

    // var openViewDocument = function(parentGroup, shipmentId, row) {


    // };
    $scope.getShipments = function(pageNo, isGetCount) {
        isFromTariff = false;
        $scope.shipmentLoader = true;
        $scope.isSaveActive = false;
        invalidMsgList = [];
        commonService.loader(true);
        // if (isGetCount) {
        var ruleTemplate = angular.copy($scope.rulesProfile.template);

        for (var i = 0; i < ruleTemplate.length; i++) {
            if (ruleTemplate[i].value == undefined || ruleTemplate[i].value.length == 0) {
                delete ruleTemplate[i];
            }
        }
        var promise1;
        if (ruleTemplate[0] == undefined) {
            if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                promise1 = commonService.ajaxCall('POST', '/api/shipmentField', {
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    count: true,
                    emailId: $route.params.emailID
                });
            } else {
                promise1 = commonService.ajaxCall('POST', '/api/shipmentField', {
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    count: true

                });
            }

        } else {
            if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                promise1 = commonService.ajaxCall('POST', '/api/shipmentField', {
                    profileBased: ruleTemplate,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    count: true,
                    emailId: $route.params.emailID
                });
            } else {
                promise1 = commonService.ajaxCall('POST', '/api/shipmentField', {
                    profileBased: ruleTemplate,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    count: true

                });
            }

        }

        promise1.then(function(data) {
            $scope.totalItems = data;
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });
        // }
        $scope.currentPage = pageNo;
        var promise;
        if (ruleTemplate[0] == undefined) {
            if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                promise = commonService.ajaxCall('POST', '/api/shipmentField', {
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    pageLimit: $scope.pageLimit,
                    pageNo: pageNo,
                    emailId: $route.params.emailID

                });

            } else {
                promise = commonService.ajaxCall('POST', '/api/shipmentField', {
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    pageLimit: $scope.pageLimit,
                    pageNo: pageNo

                });
            }

        } else {
            if ($route.current.url == "/pending/:account/:accountID/:emailID") {
                promise = commonService.ajaxCall('POST', '/api/shipmentField', {
                    profileBased: ruleTemplate,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    pageLimit: $scope.pageLimit,
                    pageNo: pageNo,
                    emailId: $route.params.emailID

                });
            } else {
                promise = commonService.ajaxCall('POST', '/api/shipmentField', {
                    profileBased: ruleTemplate,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    pageLimit: $scope.pageLimit,
                    pageNo: pageNo

                });
            }

        }
        $scope.shipments = [];
        promise.then(function(data) {
                // if (isGetCount) {}
                if (data.length) {
                    $scope.shipments = data;
                    // var pageNo = 1;
                    filterObj = {
                        systemId: $rootScope.loggedInUser.userSystem[0].id,
                        profileBased: $scope.rulesProfile.template,
                        accountId: $scope.global.account[0].id
                        // templateId: $scope.templateData.templateId,

                    };
                    for (var i = 0; i < $scope.shipments.length; i++)
                        $scope.shipments[i].updateField = false;
                }
                $scope.rowNos = [];
                for (var i = pageNo * 50 - 49; i <= pageNo * 50; i++)
                    $scope.rowNos.push(i);
                $scope.shipmentLoader = false;


                hideColumn(1);
                commonService.loader(false);
                $timeout(renderHT, 1000);

            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                commonService.loader(false);
                $scope.shipmentLoader = false;
            });
    };

    $scope.getTemplate = function() {
        if ($scope.global.account) {
            $scope.showGrid = true;
            $scope.templateLoader = true;
            commonService.loader(true);
            initialGrid();
            charges = [];
            $scope.columns = [];

            var promise;
            if (defaultTemplate == true) {
                promise = commonService.ajaxCall('POST', '/api/shipmentField/template', {
                    profileBased: $scope.rulesProfile.template,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    type: 'field',
                    default: defaultTemplate
                });

            } else {
                defaultDownloadTemplate = false;
                promise = commonService.ajaxCall('POST', '/api/shipmentField/template', {
                    profileBased: $scope.rulesProfile.template,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    type: 'field'
                });
            }

            promise.then(function(data) {

                    data.profileName = data.profileName + data.templateId;
                    $scope.templateData = data;

                    if (data.fields.length > 0) {

                        var sc = data.fields.sort(function(a, b) {
                            return parseInt(a.displayOrder) - parseInt(b.displayOrder)
                        });
                        $scope.templateData.fields = sc;
                        var chk = " <input id='chkAll' type='checkbox' class='checker' ";
                        chk += 'onclick="angular.element(\'.handsontable\').scope().handleChkAllClick();"> ';
                        $scope.columns = [{
                            value: 'shipment.updateField',
                            type: 'checkbox',
                            title: chk,
                            width: 50,
                            visible: true
                        }];

                        angular.forEach(sc, function(col, i) {
                            if (col.isActive) {

                                switch (col.type) {
                                    case 'dropdown':
                                    case 'multiselect':
                                        $scope.columns.push({
                                            value: 'shipment.' + col.key,
                                            type: 'autocomplete',
                                            title: col.label,
                                            strict: true,
                                            src: col.suggestionsSource,
                                            width: col.length * 9,
                                            length: col.length,
                                            renderer: cellRenderer,
                                            isMandatory: col.isMandatory,
                                            key: col.key,
                                            readOnly: col.isReadonly,
                                            regex: col.regex,
                                            toolTip: col.toolTip,
                                            errorMessage: col.errorMessage,
                                            displayOrder: col.displayOrder,
                                            suggestionField: col.suggestionField,
                                            visible: true

                                        })
                                        break;
                                    default:
                                        if (col.type == 'multiline')
                                            col.type = 'text';
                                        if (i == 0)
                                            col.renderer = cellRenderer;
                                        else
                                            col.renderer = cellRenderer;

                                        // if (colKey.toString().contains('charges'))
                                        if (col.key.indexOf('charges#') >= 0)
                                            charges.push(col.key);


                                        $scope.columns.push({
                                            value: 'shipment.' + col.key,
                                            type: col.type,
                                            allowInvalid: false,
                                            renderer: col.renderer,
                                            title: col.label,
                                            width: col.length * 9,
                                            length: col.length,
                                            readOnly: col.isReadonly,
                                            isMandatory: col.isMandatory,
                                            key: col.key,
                                            regex: col.regex,
                                            toolTip: col.toolTip,
                                            errorMessage: col.errorMessage,
                                            displayOrder: col.displayOrder,
                                            visible: true,
                                            suggestionField: col.suggestionField
                                        });
                                }
                            }
                        });

                        // $scope.autosuggestSource = "shipmentProcessing";
                        // angular.forEach($scope.columns, function(i) {
                        //     if (i.type != "checkbox") {
                        //         $scope.fields[i.key] = {
                        //             type: i.type,
                        //             label: i.title
                        //         };



                        //     }
                        // });

                        // console.log($scope.fields);
                        angular.forEach($scope.templateData.multipleFields, function(col, i) {
                            if (col == 'invoice') {
                                $scope.columns.push({
                                    value: col,
                                    type: 'text',
                                    title: col,
                                    renderer: buttonInvoiceRenderer,
                                    toolTip: col,
                                    readOnly: true,
                                    visible: true
                                })
                            } else if (col == 'issue') {
                                $scope.columns.push({
                                    value: col,
                                    type: 'text',
                                    title: col,
                                    renderer: buttonIssueRenderer,
                                    toolTip: col,
                                    readOnly: true,
                                    visible: true
                                })
                            } else if (col == 'uploadDocument') {
                                $scope.columns.push({
                                    value: col,
                                    type: 'text',
                                    title: col,
                                    renderer: buttonUploadDocumentRenderer,
                                    toolTip: col,
                                    readOnly: true,
                                    visible: true
                                })
                            } else if (col == 'viewDocument') {
                                $scope.columns.push({
                                    value: col,
                                    type: 'text',
                                    title: col,
                                    renderer: buttonViewDocumentRenderer,
                                    toolTip: col,
                                    readOnly: true,
                                    visible: true
                                })
                            } else {
                                $scope.columns.push({
                                    value: col,
                                    type: 'text',
                                    title: col,
                                    renderer: buttonRenderer,
                                    toolTip: col,
                                    readOnly: true,
                                    visible: true
                                })
                            }

                        });


                        $scope.getRuleFields();
                        $scope.getShipments($scope.currentPage, true);
                    } else {
                        $scope.showGrid = false;
                        initialGrid();
                        flash.pop({
                            title: 'Alert',
                            body: "no template found for this account",
                            type: 'warning'
                        });
                    }
                    commonService.loader(false);
                    $scope.showGrid = true;

                    $scope.templateLoader = false;
                    $timeout(renderHT, 1000);

                },
                function(data) {
                    initialGrid();
                    $scope.showGrid = false;
                    $scope.templateLoader = false;
                    commonService.loader(false);

                    if (data.data == '"Error in Shipment Field list.There is no such shipment field is configure"') {
                        flash.pop({
                            title: 'Warning',
                            body: 'There is no such shipment profile configured for mention criteria, loading default profile...<br> Please contact admin to configure it.',
                            type: 'warning'
                        });
                        //                        showModel('No such shipment template is configured for mention criteria! loading default template.... Please contact admin to configure it.')
                        defaultTemplate = true;
                        defaultDownloadTemplate = true;
                        $scope.getTemplate();
                    } else {
                        flash.pop({
                            title: 'Information',
                            body: data.data,
                            type: 'warning'
                        });
                    }


                });
            // defaultTemplate = false;
        } else
            flash.pop({
                title: 'Select Account',
                body: 'Please select account...!!!',
                type: 'warning'
            });

    };

    //    function showModel(msg) {
    //        var modalInstance = $modal.open({
    //            templateUrl: 'confirm.html',
    //            controller: 'modalInstanceCtrl',
    //            resolve: {
    //                items: function() {
    //                    return angular.copy({
    //                        msg: msg
    //                    });
    //                }
    //            }
    //        });
    //        modalInstance.result.then(function(selectedItem) {
    //            defaultTemplate = true;
    //            defaultDownloadTemplate = true;
    //            $scope.getTemplate();
    //        }, function(selectedItem) {
    //
    //        });
    //    }


    var hideColumn = function(index) {
        $('table thead tr').each(function() {
            // console.log(index);
            $(this).find("td").eq(index).hide();
        });
        $('table tbody tr').each(function() {
            $(this).find("td").eq(index).hide();
        });
    };

    $scope.saveShipments = function(shipmentId, row) {
        invalidMsgList = [];
        var dataTosave = commonService.validateGridData($scope.shipments, $scope.columns, $scope.templateData.templateId);
        invalidMsgList = dataTosave.arrInvalidMsg;
        if (dataTosave.inValidData.length > 0) {
            $scope.shipments = dataTosave.inValidData;
            fillRowNos();
        }
        $scope.shipmentLoader = true;
        if (dataTosave.validData.data.length > 0) {
            commonService.loader(true);
            dataTosave.validData.accountId = $scope.global.account[0].id;
            dataTosave.validData.systemId = $rootScope.loggedInUser.userSystem[0].id;
            dataTosave.validData.multipleFields = $scope.templateData.multipleFields;
            // dataTosave.validData.templateId = $scope.templateData.templateId;
            if (defaultTemplate == false)
                dataTosave.validData.profileBased = $scope.rulesProfile.template;
            var promise = commonService.ajaxCall('PUT', '/api/shipmentField', dataTosave.validData);
            promise.then(function(data) {
                    // commonService.loader();
                    if (dataTosave.inValidData.length > 0) {
                        flash.pop({
                            title: 'Warning',
                            body: 'Grid contains some Invalid data, which is not saved',
                            type: 'warning'
                        });
                        $scope.shipments = dataTosave.inValidData;

                        if ($scope.shipments.length > 0) {
                            for (var i = 0; i < $scope.shipments.length; i++)
                                $scope.shipments[i].updateField = false;
                        }
                    } else {
                        if (isFromTariff == true) {
                            openInvoiceDialog(shipmentId, row);
                        } else {
                            $scope.getShipments($scope.currentPage, true);
                            flash.pop({
                                title: 'Success',
                                body: data,
                                type: 'success'
                            });
                        }
                    }
                    $scope.shipmentLoader = false;
                    commonService.loader(false);
                },
                function(data) {
                    $scope.shipmentLoader = false;
                    // commonService.loader();
                    if (data.status === 412) {
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records not save are in grid, Please correct and save again.',
                            type: 'error'
                        });
                        if ($scope.shipments.length > 1) {
                            dataTosave.inValidData.pop();
                            $scope.shipments = dataTosave.inValidData.concat(data.data.doc);
                        } else
                            $scope.shipments = data.data.doc;
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
                        if ($scope.shipments.length > 0) {
                            for (var i = 0; i < $scope.shipments.length; i++)
                                $scope.shipments[i].updateField = false;
                        }
                        fillRowNos();
                        commonService.loader(false);
                    } else
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                    commonService.loader(false);
                });
        } else {
            if (dataTosave.inValidData.length > 0) {
                flash.pop({
                    title: 'No Data',
                    body: 'Grid contains invalid data!',
                    type: 'warning'
                });
                $scope.shipments = dataTosave.inValidData;
                if ($scope.shipments.length > 0) {
                    for (var i = 0; i < $scope.shipments.length; i++)
                        $scope.shipments[i].updateField = false;
                }
            } else {
                if (isFromTariff == true) {
                    flash.pop({
                        title: 'No Data',
                        body: 'Please select row to calculate tariff... ',
                        type: 'warning'
                    });
                } else {
                    flash.pop({
                        title: 'No Data',
                        body: 'No data to save',
                        type: 'warning'
                    });
                }
            }
            $scope.shipmentLoader = false;
            commonService.loader(false);
        }


    }



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


    }

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



    $scope.handleChkAllClick = function() {
        isFromTariff = false;
        var tmpFlag = $('#chkAll').is(':checked');

        for (var i = 0; i < $scope.shipments.length; i++) {

            $scope.shipments[i].updateField = tmpFlag;

        }
        if (tmpFlag == true)
            $scope.isSaveActive = true;
        else
            $scope.isSaveActive = false;
        $timeout(function() {
            renderHT();
            // Loadind done here - Show message for 3 more seconds.

            $timeout(function() {
                $('#chkAll').attr('checked', tmpFlag);

            }, 100);

        }, 100);



    }

    //Start Filter Function
    $scope.getRuleFields = function() {
        $scope.autosuggestSource = "shipmentProcessing";
        $scope.sortedFields = [];
        angular.forEach($scope.templateData.fields, function(i) {
            if (i.isActive == true) {
                if (i.type != "checkbox") {
                    $scope.fields[i.key] = {
                        type: i.type,
                        label: i.label
                    };
                    $scope.sortedFields.push(i.key);
                    $scope.custObj[i.label] = {
                        column: i.key,
                        templateId: $scope.templateData.templateId,
                        systemId: $scope.loggedInUser.userSystem[0].id,
                        accountId: $scope.global.account[0].id,
                        columnType: i.type
                    }
                }
            }
        });


    }

    $scope.reset = function() {


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
                        if (j == 2)
                            fields.eq(j).val("");
                        else
                            fields.eq(j).select2('val', 0);

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

        $scope.rule.conditions = {};
        $scope.filterObj = {};
        $scope.currentPage = 1;
        $scope.getShipments($scope.currentPage, true);
        commonService.hideDropPanel();
    }

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
                    accountId: $scope.global.account[0].id,
                    default: true
                };



            } else {
                $scope.filterObj = {
                    rules: rulesData.ruleDef,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    profileBased: ruleTemplate,
                    default: true
                };


            }
        } else {
            if (ruleTemplate[0] == undefined) {
                $scope.filterObj = {
                    rules: rulesData.ruleDef,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id
                };

            } else {
                $scope.filterObj = {
                    rules: rulesData.ruleDef,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
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
    }

    $scope.getFilteredData = function(pageNo, isGetCount) {


        commonService.loader(true);
        $scope.currentPage = pageNo;
        $scope.shipments = [];
        var promise = commonService.ajaxCall('PUT', 'api/shipmentField/filter?isExcel=false&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo, $scope.filterObj);
        promise.then(function(data) {
            // $scope.Loader = false;
            $scope.totalItems = data.count;
            if (data.count > 0) {
                $scope.shipments = data.doc;
                $scope.rowNos = [];
                for (var i = 0; i < $scope.shipments.length; i++)
                    $scope.shipments[i].updateField = false;
                // for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * 500, j < data.length; i++, j++) {

                //     $scope.rowNos.push(i);
                // }
                for (var i = pageNo * 50 - 49; i <= pageNo * 50; i++)
                    $scope.rowNos.push(i);
            } else {
                // $scope.shipments = [{
                //     updateField: false,
                //     id: null
                // }];
                fillRowNos();

                flash.pop({
                    title: 'Alert',
                    body: "No data found for selected filter...",
                    type: 'warning'
                });
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
        $scope.filter = {};
        $scope.filterObj = {};
        $scope.currentPage = 1;
        $scope.getShipments($scope.currentPage, true);
        commonService.hideDropPanel();
    }


    $scope.applyFilter = function() {

        var tmpFilterObj = {
            rules: {
                condition: 'and',
                fields: []
            }
        };
        // $scope.filterObj = {
        //     rules: {
        //         condition: 'and',
        //         fields: []
        //     }
        // };

        // for (var k in $scope.fields) {
        //     if ($scope.fields[k].val != null) {
        //         if (angular.isArray($scope.fields[k].val)) {
        //             var obj = $scope.filterObj.rules;
        //             if ($scope.fields[k].val.length > 1) {
        //                 obj = {
        //                     condition: 'or',
        //                     fields: []
        //                 };
        //                 $scope.filterObj.rules.fields.push(obj);
        //             }
        //             for (var i = 0; i < $scope.fields[k].val.length; i++)
        //                 obj.fields.push({
        //                     name: k,
        //                     operator: 'equalTo',
        //                     value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val[i].n) : $scope.fields[k].val[i].n
        //                 });
        //         } else
        //             $scope.filterObj.rules.fields.push({
        //                 name: k,
        //                 operator: 'equalTo',
        //                 value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val) : $scope.fields[k].val
        //             });
        //     }
        // }

        for (var k in $scope.fields) {
            if ($scope.fields[k].val != null) {
                if (angular.isArray($scope.fields[k].val)) {
                    var obj = tmpFilterObj.rules;
                    if ($scope.fields[k].val.length > 1) {
                        obj = {
                            condition: 'or',
                            fields: []
                        };
                        tmpFilterObj.rules.fields.push(obj);
                    }
                    for (var i = 0; i < $scope.fields[k].val.length; i++)
                        obj.fields.push({
                            name: k,
                            operator: 'equalTo',
                            value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val[i].n, 10) : $scope.fields[k].val[i].n
                        });
                } else
                    tmpFilterObj.rules.fields.push({
                        name: k,
                        operator: 'equalTo',
                        value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val, 10) : $scope.fields[k].val
                    });
            }
        }

        var ruleTemplate = angular.copy($scope.rulesProfile.template);
        for (var i = 0; i < ruleTemplate.length; i++) {
            if (ruleTemplate[i].value == undefined || ruleTemplate[i].value.length == 0) {
                delete ruleTemplate[i];
            }
        }

        if (defaultDownloadTemplate == true) {
            if (ruleTemplate[0] == undefined) {
                $scope.filterObj = {
                    rules: tmpFilterObj.rules,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    default: true
                };



            } else {
                $scope.filterObj = {
                    rules: tmpFilterObj.rules,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    profileBased: ruleTemplate,
                    default: true
                };


            }
        } else {
            if (ruleTemplate[0] == undefined) {
                $scope.filterObj = {
                    rules: tmpFilterObj.rules,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id
                };

            } else {
                $scope.filterObj = {
                    rules: tmpFilterObj.rules,
                    systemId: $scope.loggedInUser.userSystem[0].id,
                    accountId: $scope.global.account[0].id,
                    profileBased: ruleTemplate
                };
            }
        }

        $scope.getFilteredData($scope.currentPage = 1, true);
    };

    //End Filter Function

    $scope.takeAction = function(actionName) {
        if (actionName == 'invoice') {
            isFromTariff = true;
            $scope.saveShipments($scope.shipments[row].id, row);
        } else if (actionName == 'issue') {
            openIssueDialog(row);
        } else if (actionName == 'uploadDocument') {
            openUploadDocumentDialog($scope.shipments[row].bookingNumber, row);
        } else if (actionName == 'viewDocument') {
            $scope.getDocument(row);
        } else {
            openDialog(parentGroup, $scope.shipments[row].id, row);
        }


    }

});