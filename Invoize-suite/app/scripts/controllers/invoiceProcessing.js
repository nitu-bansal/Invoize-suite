angularApp.controller('invoiceProcessCtrl', function($scope, $http, $location, $timeout, $rootScope, $stateParams, $state, $route, $routeParams, $modal, commonService, flash, imsFactory) {
    $scope.currentPage = 1;
    $scope.pageLimit = 25;
    $scope.rowNos = [];
    $scope.totalItems = 0;
    $scope.dataList = [];
    $scope.data = {};
    $scope.selectedTab = "pendingInvoicing";
    $scope.invoiceTypes = [];
    var idxShipmentNumber, idxInvoiceNumber, idxAccountId, idxShipmentId, idxInvoiceType, idxBookingNumber;
    $scope.idxInvoiceRemarks = -1;
    $scope.hw = null;
    $scope.files = [];
    $scope.filePath = "";
    $scope.isViewDoc = false;
    $scope.showGrid = false;
    $scope.global = $scope.$parent.global;
    $scope.invoiceRemarks = [];

    if (!$scope.global.account) $scope.global.account = null;



    ///function to ser page after paging change event
    $scope.setPage = function() {
        setTimeout(function() {
            angular.element(".pagination").scope().getData(angular.element("ul.pagination li.active.ng-scope").scope().page.number);
        }, 300);
    };

    ///function to get peniding or approve invoices list
    $scope.getData = function(pageNo, isGetCount, tabName) {
        $scope.dataList = [];
        $scope.RenderHTW(false);
        $scope.selectedTab = tabName;

        $scope.currentPage = pageNo;

        if ($scope.global.account) {
            commonService.loader(true);
            var promise = commonService.ajaxCall('GET', '/api/invoice/charge/getType?systemId=' + $rootScope.loggedInUser.userSystem[0].id + '&accountId=' + $scope.global.account[0].id);
            promise.then(function(data) {
                $scope.invoiceTypes = data;

                if (isGetCount) {
                    var promise1 = commonService.ajaxCall('GET', '/api/invoiceProcessing?for=' + tabName + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id + '&count=true' + ($scope.global.account ? '&accountNumber=' + $scope.global.account[0].n : ''));
                    promise1.then(function(data1) {
                        $scope.totalItems = data1;
                    }, function(data1) {
                        flash.pop({
                            title: 'Alert',
                            body: data1.data,
                            type: 'error'
                        });
                    });
                }

                var promise2 = commonService.ajaxCall('GET', '/api/invoiceProcessing?for=' + tabName + '&systemId=' + $rootScope.loggedInUser.userSystem[0].id + '&pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo + ($scope.global.account ? '&accountNumber=' + $scope.global.account[0].n : ''));
                promise2.then(function(data2) {
                        if (data2.length > 0) {
                            $scope.dataList = data2;

                            idxInvoiceNumber = 0;
                            idxShipmentNumber = 0;
                            idxBookingNumber = 0;
                            idxAccountId = 0;
                            for (var i = 0; i < $scope.dataList[0].length; i++) {
                                if ($scope.dataList[0][i] == "Invoice Number") {
                                    idxInvoiceNumber = i;
                                } else if ($scope.dataList[0][i] == "Hawb") {
                                    idxShipmentNumber = i;
                                } else if ($scope.dataList[0][i] == "Account Id") {
                                    idxAccountId = i;
                                } else if ($scope.dataList[0][i] == "Id") {
                                    idxShipmentId = i;
                                } else if ($scope.dataList[0][i] == "Invoice Type") {
                                    idxInvoiceType = i;
                                } else if ($scope.dataList[0][i] == "Booking#") {
                                    idxBookingNumber = i;
                                } else if ($scope.dataList[0][i] == "Invoice Remarks") {
                                    $scope.idxInvoiceRemarks = i;
                                }

                            }
                            $scope.invoiceRemarks[0] = '';
                            for (var i = 1; i < $scope.dataList.length; i++) {
                                $scope.invoiceRemarks[i] = $scope.dataList[i][$scope.idxInvoiceRemarks];
                            }

                        } else
                            flash.pop({
                                title: 'Alert',
                                body: "No Pending Invoices left now",
                                type: 'warning'
                            });
                        commonService.loader(false);

                    },
                    function(data2) {
                        flash.pop({
                            title: 'Alert',
                            body: data2,
                            type: 'error'
                        });
                        commonService.loader(false);
                    });

            }, function(data) {
                commonService.loader(false);
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });

        }

    }

    ///function to check all check boxes on checked of checkall checkbox
    $scope.checkAll = function($event) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        if (action === 'add') {
            angular.forEach($scope.dataList, function(element, i) {
                if (i > 0) {
                    $scope.dataList[i][0] = true;
                    $('[name="chk_' + i + '"]').prop('checked', true);
                }
            });
        } else if (action === 'remove') {
            angular.forEach($scope.dataList, function(element, i) {
                if (i > 0) {
                    $scope.dataList[i][0] = false;
                    $('[name="chk_' + i + '"]').prop('checked', false);
                }
            });
        }
    }


    ///handles checkbox check event of checkboxes in grid
    $scope.updateSelection = function($event, arrIndex) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        if (action === 'add') {
            $scope.dataList[arrIndex][0] = true;
        } else if (action === 'remove') {
            $scope.dataList[arrIndex][0] = false;
        }
    };

    //this function open email delivery dialog and deliver invoice via email
    $scope.updateStatus = function(status, isMultiple, idx) {
        var updateData = {};
        updateData.doc = [];
        updateData.status = status;
        updateData.stream = "Invoice";
        if (isMultiple) {
            angular.forEach($scope.dataList, function(element, i) {
                if (i > 0) {
                    if (element[0]) {
                        updateData.doc.push({
                            "shipmentId": element[1],
                            "invoiceNumber": element[2]
                        });
                    }
                }

            });
        } else {
            updateData.doc.push({
                "shipmentId": $scope.dataList[idx][idxShipmentId],
                "invoiceNumber": $scope.dataList[idx][idxInvoiceNumber]
            });
        }
        if (updateData.doc.length > 0) {
            var promise = commonService.ajaxCall('PUT', '/api/invoiceProcessing', updateData);
            promise.then(function(data) {
                    $scope.getData(1, true, $scope.selectedTab);

                    flash.pop({
                        title: 'Success',
                        body: status + "Successfully",
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
        } else {
            flash.pop({
                title: 'Alert',
                body: "please select at least one item",
                type: 'warning'
            });
        }

    }

    ///function to raise isssue (done by keyur)
    $scope.openRaiseIssueDialog = function() {
        var itemToSend = {};
        var modalInstance = $modal.open({
            templateUrl: 'ims.html',
            controller: 'imsCtrl',
            resolve: {
                items: function() {
                    return angular.copy(itemToSend);
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {}, function(selectedItem) {});
    }

    ///function to capture invoice which are pending for invoicing
    $scope.openInvoiceCaptureDialog = function(isMultiple, idx) {
        var invoiceData = {};
        invoiceData.systemId = $rootScope.loggedInUser.userSystem[0].id;
        invoiceData.doc = [];
        if (isMultiple) {
            angular.forEach($scope.dataList, function(element, i) {
                if (i > 0) {
                    if (element[0]) {
                        invoiceData.doc.push({
                            "shipmentId": element[1],
                            "invoiceNumber": element[2]
                        });
                    }
                }

            });
        } else {
            invoiceData.doc.push({
                "shipmentId": $scope.dataList[idx][idxShipmentId],
                "invoiceNumber": $scope.dataList[idx][idxInvoiceNumber]
            });
        }
        if (invoiceData.doc.length > 0) {
            var promise = commonService.ajaxCall('POST', '/api/invoiceCapture', invoiceData);
            promise.then(function(data) {
                    if (data.status != 2) {
                        var itemToSend = data;
                        if (data.status == 3) {
                            flash.pop({
                                title: 'Alert',
                                body: data.msg,
                                type: 'warning'
                            });
                        }
                        var modalInstance = $modal.open({
                            templateUrl: 'm.invoice.capture.html',
                            controller: 'invoiceCaptureCtrl',
                            resolve: {
                                items: function() {
                                    return angular.copy(itemToSend);
                                }
                            }
                        });
                        modalInstance.result.then(function(selectedItem) {
                            $scope.getData(1, true, $scope.selectedTab);
                        }, function(selectedItem) {
                            console.log('Modal dismissed ');
                        });
                        $scope.metadataLoader = false;
                    } else {
                        flash.pop({
                            title: 'Alert',
                            body: data.msg,
                            type: 'warning'
                        });
                    }
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
            flash.pop({
                title: 'Alert',
                body: "please select atleast one item",
                type: 'warning'
            });
        }
    }


    ///function to link document(done by keyur)
    $scope.openLinkDocumentDialog = function(idx) {
        var modalInstance = $modal.open({
            templateUrl: 'uploadDocument.html',
            controller: 'uploadDocumentCtrl',
            resolve: {
                items: function() {
                    return angular.copy({
                        isUpload: false,
                        fields: {
                            bookingNumber: {
                                "label": "Booking Number",
                                "key": "bookingNumber",
                                "type": "text",
                                "isActive": true,
                                "readOnly": true,
                                "value": $scope.dataList[idx][idxBookingNumber]
                            }
                        },
                        "isLinking": true,
                        "relate": {
                            "label": "invoice Number",
                            "key": "relateWith.invoiceNumber",
                            "type": "dropdown",
                            "isActive": true,
                            "readOnly": false,
                            "src": "invoiceNumber",
                            "srcData": '{"bookingNumber":"' + $scope.dataList[idx][idxBookingNumber] + '"}',
                            "value": $scope.dataList[idx][2]
                        }

                    });
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {

            $scope.shipments[row].updateField = true;
            $scope.isCalculateTariffActive = true;

        }, function(selectedItem) {

        });
    }

    //Added by keyur
    $scope.updateInvoice = function(status, invoiceType, isMultiple, idx) {
        var updateData = {};
        updateData.doc = [];
        updateData.status = status;
        updateData.stream = "Invoice";
        if (status == "new") {
            var itemToSend = {};
            itemToSend.shipmentId = $scope.dataList[idx][idxShipmentId];
            itemToSend.accountId = $scope.dataList[idx][idxAccountId];
            itemToSend.systemId = $rootScope.loggedInUser.userSystem[0].id;
            itemToSend.type = status;
            itemToSend.invoiceType = invoiceType;
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
                $scope.getData(1, true, $scope.selectedTab);
            }, function(selectedItem) {});
        } else if (status == "correct") {
            var itemToSend = {};
            itemToSend.correctInvoice = $scope.dataList[idx][idxInvoiceNumber];
            itemToSend.shipmentId = $scope.dataList[idx][idxShipmentId];
            itemToSend.accountId = $scope.dataList[idx][idxAccountId];
            itemToSend.systemId = $rootScope.loggedInUser.userSystem[0].id;
            itemToSend.type = status;
            itemToSend.invoiceType = $scope.dataList[idx][idxInvoiceType];
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
                $scope.getData(1, true, $scope.selectedTab);
            }, function(selectedItem) {});
        }
    }

    ///function to close dialog
    $scope.closeDialog = function() {
        imsFactory.clearAllItem();
        $scope.showDialog = false;
    };

    $scope.openIssueDialog = function(idx) {

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
                        if (data.msg[i].n == "Invoice") {
                            moduleID = data.msg[i];
                            moduleIndex = i;
                        }
                    }

                    imsFactory.clearAllItem();

                    imsFactory.addItem({
                        "docType": "IMSRaiseProfile",
                        "module": moduleID,
                        "moduleIndex": moduleIndex,
                        "process": processID,

                        "fields": {
                            "shipmentNumber": $scope.dataList[idx][idxShipmentNumber],
                            "accountNumber": $scope.global.account[0].n,
                            "invoiceNumber": $scope.dataList[idx][idxInvoiceNumber]
                        }
                    });

                    $scope.showDialog = true;
                },
                function(data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                });


        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });

    };
    //End by keyur

    $scope.RenderHTW = function(isSplit) {
        console.log(isSplit);
        if (isSplit) {
            $timeout(function() {
                $('.stretch.ui-splitbar').css("left", "50%");
                $('.west-back.stretch').css("right", "50%");
                $('.east-back.stretch').css("left", "50%");
                $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
                $("iframe").width(Number($('.west-back.stretch').css("right").slice(0, -2)) - 30);

            }, 300);
        } else {
            $timeout(function() {

                $('.stretch.ui-splitbar').css("left", "100%");
                $('.west-back.stretch').css("right", "0%");
                $('.east-back.stretch').css("left", "100%");
                $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
                $("iframe").width(Number($('.west-back.stretch').css("right").slice(0, -2)) - 30);
            }, 300);
        }

    }

    $scope.getDocument = function(idx) {
        $scope.showGrid = false;
        $scope.isViewDoc = true;
        if ($scope.dataList[idx] != undefined) {
            if ($scope.dataList[idx].files == undefined || $scope.dataList[idx].files == null) {
                var promise = commonService.ajaxCall('GET', '/api/getFiles?bookingNumber=' + $scope.dataList[idx][idxBookingNumber] + '&responseType=array');
                //            var promise = commonService.ajaxCall('GET', '/api/getRelateFiles?key=invoiceNumber&bookingNumber=' + $scope.deliveryData[idx][4]  + '&invoiceNumber=' + $scope.deliveryData[idx][idxBookingNumber]);
                promise.then(function(data) {
                        if (data.msg.length > 0) {
                            $scope.dataList[idx].files = data.msg;
                            $scope.files = $scope.dataList[idx].files;
                            if ($scope.files.length > 0) {
                                $scope.fileName = $scope.files[0];
                            }
                            var id = $scope.files[0] + "||" + $scope.global.account[0].n + "||" + $rootScope.loggedInUser.organization;
                            // var Dom = "";
                            // if (location.host.indexOf("invoizet.com") == -1)
                            //     Dom = location.host;
                            // else
                            //     Dom = "searce2.dev.invoize.info";
                            $scope.filePath = "http://docs.google.com/gview?url=http://" + location.host + "/api/downloadFile?id=" + id + "&size=0&embedded=true";
                            $('#docFrame').attr('src', $scope.filePath);
                            $scope.showGrid = true;
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
                $scope.files = $scope.dataList[idx].files;
                if ($scope.files.length > 0) {
                    $scope.fileName = $scope.files[0];
                }
                var id = $scope.files[0] + "||" + $scope.global.account[0].n + "||" + $rootScope.loggedInUser.organization;
                // $scope.filePath = "http://docs.google.com/gview?url=http://searce2.dev.invoize.info/api/downloadFile?id=" + id + "&size=0&embedded=true";
                $scope.filePath = "http://docs.google.com/gview?url=http://" + location.host + "/api/downloadFile?id=" + id + "&size=0&embedded=true";
                console.log($scope.filePath);
                $scope.showGrid = true;
                $('#docFrame').attr('src', $scope.filePath);
                setTimeout(function() {
                    $scope.RenderHTW(true);
                }, 800)
            }
        }
        $timeout(renderHT, 1000);
    }

    function renderHT() {
        if ($scope.totalItems != null && $scope.totalItems.length > 20) {
            // $scope.hh = $('sidebar.west-back').height() - 50;
            //            $scope.hh = $(window).height() - 300;
            $scope.hh = $(".west-back.div-west.stretch").height() - 40;
            $("iframe").height($scope.hh);
        } else
            $scope.hh = null;

        $timeout(function() {

            $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
            $("iframe").width(Number($('.west-back.stretch').css("right").slice(0, -2)) - 30);

        }, 300);
    }

    ///function to load file in document viewer
    $scope.loadFile = function(fileName) {
        if ($scope.global.account != undefined && $scope.global.account != null && $scope.global.account) {
            var id = fileName + "||" + $scope.global.account[0].n + "||" + $rootScope.loggedInUser.organization;
            // var Dom = "";
            // if (location.host.indexOf("invoizet.com") == -1)
            //     Dom = location.host;
            // else
            //     Dom = "searce2.dev.invoize.info";
            $scope.filePath = "http://docs.google.com/gview?url=http://" + location.host + "/api/downloadFile?id=" + id + "&size=0&embedded=true";
            $('#docFrame').attr('src', $scope.filePath);
        }

    }

    $scope.saveInvoiceRemarks = function(isMultiple, idx) {
        var updateData = {};
        updateData.doc = [];
        updateData.status = 'Save Invoice Remark';
        updateData.stream = "Invoice";
        var tmpIndex = 0;
        if (isMultiple) {
            angular.forEach($scope.dataList, function(element, i) {
                if (i > 0) {
                    if (element[0]) {

                        updateData.doc.push({
                            "shipmentId": element[idxShipmentId],
                            "invoiceNumber": element[idxInvoiceNumber],
                            "invoiceRemark": $scope.invoiceRemarks[tmpIndex]
                        });
                    }
                }
                tmpIndex = tmpIndex + 1;
            });
        } else {
            updateData.doc.push({
                "shipmentId": $scope.dataList[idx][idxShipmentId],
                "invoiceNumber": $scope.dataList[idx][idxInvoiceNumber],
                "invoiceRemark": $scope.invoiceRemarks[idx]
            });
        }
        if (updateData.doc.length > 0) {
            var promise = commonService.ajaxCall('PUT', '/api/invoiceProcessing', updateData);
            promise.then(function(data) {
                    $scope.getData(1, true, $scope.selectedTab);
                    flash.pop({
                        title: 'Success',
                        body: "Remarks Updated",
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
        } else {
            flash.pop({
                title: 'Alert',
                body: "please select at least one item",
                type: 'warning'
            });
        }
    };

    $scope.RenderHTW(false);
});