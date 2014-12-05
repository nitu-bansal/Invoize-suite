angularApp.controller('invoiceDeliveryCtrl', function($scope, $window, $state, $routeParams, $route, $location, $modal, commonService, flash, $timeout, sharedService, $rootScope, $upload) {
    // $scope.search = {};
    $scope.deliveryTab = 'edi';
    $scope.deliveryData = [];
    $scope.isRowCollapsed = [];
    $scope.showGrid = false;
    $scope.hw = null;
    $scope.files = [];
    $scope.filePath = "";
    $scope.webTool = false;
    $.getScript("/scripts/vendor/ace.js");
    $scope.global.account = JSON.parse(localStorage.account);
    console.log('global is  ',$scope.global,$scope.$parent)


    if (!$scope.global.account) $scope.global.account = [];

    //This function will set the delivery mode
    $scope.setDefaultDeliveryMode = function() {
        if ($route.current.url == "/webInvoice" || $route.current.url == "/deliveredInvoice") {
            $scope.deliveryTab = 'deliveredInvoice';
        } else {
            $scope.deliveryTab = $route.current.url.substr(1);
        }
        //        console.log($scope.deliveryTab);
    };

    $scope.setDefaultDeliveryMode();
    ///function to redirect on selected path
    $scope.redirectTo = function(path) {
        $scope.deliveryData = [];

        $location.path(path);
        $timeout(function() {
            $scope.getDeliveryData();

        }, 2000);
    };

    //clear all data
    $scope.clearData = function() {
        if ($scope.global.account == undefined)
            $scope.deliveryData = [];
    }

    //this function open email delivery dialog and deliver invoice via email
    $scope.emailDelivery = function() {
        var invoices = [];
        angular.forEach($scope.deliveryData, function(element, i) {
            if (i > 0) {
                if ($scope.deliveryData[i][0]) {
                    invoices.push({
                        "ID": $scope.deliveryData[i][1],
                        "ProfileId": $scope.deliveryData[i][2],
                        "InvoiceNumber": $scope.deliveryData[i][5]
                    });
                }
            }
        });
        if (invoices.length > 0) {
            var promise = commonService.ajaxCall('POST', '/api/emailDeliver', invoices);
            promise.then(function(data) {
                    if (data.status != 2) {
                        var itemToSend = {};
                        itemToSend.details = invoices;
                        itemToSend.template = data.data;
                        if (data.status == 3) {
                            flash.pop({
                                title: 'Alert',
                                body: data.msg,
                                type: 'warning'
                            });
                        }
                        var modalInstance = $modal.open({
                            templateUrl: 'emailInvoice.html',
                            controller: 'emailInvoiceCtrl',
                            resolve: {
                                items: function() {
                                    return angular.copy(itemToSend);
                                }
                            }
                        });
                        modalInstance.result.then(function(selectedItem) {
                            $scope.getTemplate(selectedItem);
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
                    setTimeout(function() {
                        $("iframe").height($(window).height() - 200);
                    }, 30);
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

    ///function to deliver data
    $scope.delivery = function() {
        switch ($scope.deliveryTab) {
            case 'edi':
                break;
            case 'email':
                $scope.emailDelivery();
                break;
        }
    }


    ///handle render events starts
    function renderHT() {
        if ($scope.deliveryData != null && $scope.deliveryData.length > 20) {
            // $scope.hh = $('sidebar.west-back').height() - 50;
            $scope.hh = $(window).height() - 300;
            $("iframe").height($scope.hh);
        } else
            $scope.hh = null;

        $timeout(function() {

            $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
            $("iframe").width(Number($('.west-back.stretch').css("right").slice(0, -2)) - 30);

        }, 300);
    }


    $(".ui-splitbar").mousedown(function() {}).mouseup(function() {

        $timeout(function() {

            $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
            $("iframe").width(Number($('.west-back.stretch').css("right").slice(0, -2)) - 30);

        }, 300);


    })


    $scope.RenderHTW = function(isSplit) {
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
                var splitBar = $('.stretch.ui-splitbar');
                if (splitBar.length) {
                    splitBar.css("left", "100%");
                    $('.west-back.stretch').css("right", "0%");
                    $('.east-back.stretch').css("left", "100%");
                    $scope.hw = Number(splitBar.css("left").slice(0, -2)) - 30;
                    $("iframe").width(Number($('.west-back.stretch').css("right").slice(0, -2)) - 30);
                }
            }, 300);
        }

    }
    ///handle render events ends

    //this function get the invoice data for edi/paper/email and web

    $scope.getDeliveryData = function() {
        $scope.RenderHTW(false);
        $scope.deliveryData = [];
        $scope.setDefaultDeliveryMode();

        //        console.log($scope.deliveryTab);
        commonService.loader(true);
        if ($scope.global.account != undefined) {
            var promise = commonService.ajaxCall('POST', '/api/deliveryDetails?mode=' + $scope.deliveryTab + '&systemId=' + $scope.loggedInUser.userSystem[0].id, $scope.global.account);
            promise.then(function(data) {
                $scope.deliveryData = data;

                $scope.isRowCollapsed = [];
                for (var i = 1; i < data.length; i++) {
                    $scope.isRowCollapsed.push(true);
                }

                if (data.length <= 1) {
                    flash.pop({
                        title: 'Alert',
                        body: "No Data Found",
                        type: 'warning'
                    });
                }
                setTimeout(function() {
                    $("iframe").height($(window).height() - 200);
                }, 30);

            }, function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
        }
        commonService.loader();
    }

    //this function get invoices info by profili for EDI
    $scope.getEDIInvoiceInfo = function(index, id) {
        if (_.isUndefined($scope.deliveryData[index].doc)) {
            $scope.deliveryData[index].dataPresent = true;
            var promise = commonService.ajaxCall('GET', '/api/deliveryDetails?id=' + id);
            promise.then(function(result) {
                $scope.invoices = result;
                $scope.deliveryData[index].doc = result;
                $scope.deliveryData[index].dataPresent = false;
                setTimeout(function() {
                    $("iframe").height($(window).height() - 200);
                }, 30);

            }, function(result) {
                $scope.deliveryData[index].dataPresent = false;
                flash.pop({
                    title: 'Alert',
                    body: "Please try after sometime..!",
                    type: 'error'
                });
            });
        }
    }

    //this function get invoices info by profili for EDI
    $scope.getWebInvoiceHistory = function(index, invoiceNumber) {
        $scope.isRowCollapsed[index] = !$scope.isRowCollapsed[index];

        console.log($scope.isRowCollapsed);
        if (_.isUndefined($scope.deliveryData[index].doc)) {
            $scope.deliveryData[index].dataPresent = true;
            var promise = commonService.ajaxCall('GET', '/api/historyDeliveryDtls?invoiceNumber=' + invoiceNumber + '&accountId=' + $scope.global.account[0].id);
            promise.then(function(result) {
                $scope.deliveryData[index].doc = result;
                $scope.deliveryData[index].dataPresent = false;
                //                console.log($scope.deliveryData);
                setTimeout(function() {
                    $("iframe").height($(window).height() - 200);
                }, 30);

            }, function(result) {
                $scope.deliveryData[index].dataPresent = false;
                flash.pop({
                    title: 'Alert',
                    body: "Please try after sometime..!",
                    type: 'error'
                });
            });
        }
    }

    //this function update invoice status
    $scope.updateStatus = function(status, isMultiple, idx) {
        var updateData = {};
        updateData.doc = [];
        updateData.status = status;
        if (isMultiple) {
            angular.forEach($scope.deliveryData, function(element, i) {
                if (i > 0) {
                    if (element[0]) {
                        updateData.doc.push({
                            "shipmentId": element[1],
                            "invoiceNumber": element[5]
                        });
                    }
                }
            });
        } else {
            updateData.doc.push({
                "shipmentId": $scope.dataList[idx][1],
                "invoiceNumber": $scope.dataList[idx][5]
            });
        }
        if (updateData.doc.length > 0) {
            var promise = commonService.ajaxCall('PUT', '/api/updateInvoiceStatus', updateData);
            promise.then(function(data) {
                    $scope.getDeliveryData();
                    flash.pop({
                        title: 'Success',
                        body: "Updated Successfully",
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
        commonService.hideDropPanel();
    }

    ///handles checkbox check event of checkboxes in grid
    $scope.updateSelection = function($event, accountId, accountNum, arrIndex) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        if (action === 'add') {
            $scope.deliveryData[arrIndex][0] = true;
        } else if (action === 'remove') {
            $scope.deliveryData[arrIndex][0] = false;
        }
    };

    ///function to check all check boxes on checked of checkall checkbox
    $scope.checkAll = function($event) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        if (action === 'add') {
            angular.forEach($scope.deliveryData, function(element, i) {
                if (i > 0) {
                    $scope.deliveryData[i][0] = true;
                    $('[name="chk_' + i + '"]').prop('checked', true);
                }
            });
        } else if (action === 'remove') {
            angular.forEach($scope.deliveryData, function(element, i) {
                if (i > 0) {
                    $scope.deliveryData[i][0] = false;
                    $('[name="chk_' + i + '"]').prop('checked', false);
                }
            });
        }
    }

    ///function to load file in document viewer
    $scope.loadFile = function(fileName) {
        if ($scope.global.account != undefined && $scope.global.account != null && $scope.global.account.length > 0) {
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


    ///function to get all document list to show in document viewer
    $scope.getDocument = function(idx) {
        $scope.showGrid = false;
        if ($scope.deliveryData[idx].files == undefined || $scope.deliveryData[idx].files == null) {
            //            var promise = commonService.ajaxCall('GET', '/api/getRelateFiles?bookingNumber=' + $scope.deliveryData[idx][4] + '&responseType=array' + '&invoiceNumber=' + $scope.deliveryData[idx][5]);
            var promise = commonService.ajaxCall('GET', '/api/getRelateFiles?key=invoiceNumber&bookingNumber=' + $scope.deliveryData[idx][4] + '&invoiceNumber=' + $scope.deliveryData[idx][5]);
            promise.then(function(data) {
                    if (data.msg.length > 0) {
                        $scope.deliveryData[idx].files = data.msg;
                        $scope.files = $scope.deliveryData[idx].files;
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
            $scope.files = $scope.deliveryData[idx].files;
            if ($scope.files.length > 0) {
                $scope.fileName = $scope.files[0];
            }
            var id = $scope.files[0] + "||" + $scope.global.account[0].n + "||" + $rootScope.loggedInUser.organization;
            $scope.filePath = "http://docs.google.com/gview?url=http://" + location.host + "/api/downloadFile?id=" + id + "&size=0&embedded=true";
            console.log($scope.filePath);
            $scope.showGrid = true;
            $('#docFrame').attr('src', $scope.filePath);
            setTimeout(function() {
                $scope.RenderHTW(true);
            }, 800)
        }
        $timeout(renderHT, 1000);
    }


    ///Start adding by Keyur Rathod
    $scope.invoiceDelivery = function(type) {

        var tmpFlag = true;
        var lastDeliveryMode = "";

        if ($route.current.url == "/unDeliveredInvoice") {

            angular.forEach($scope.deliveryData, function(element, i) {

                if (i > 0) {
                    if ($scope.deliveryData[i][0]) {
                        if (lastDeliveryMode == "") {
                            lastDeliveryMode = $scope.deliveryData[i][9];
                        } else {
                            if (lastDeliveryMode != $scope.deliveryData[i][9])
                                tmpFlag = false;
                        }
                    }
                }
            });
        } else if ($route.current.url == "/web") {
            lastDeliveryMode = "Web";
        }

        if (tmpFlag == false) {
            flash.pop({
                title: 'Alert',
                body: "You can not deliver multi type of mode.",
                type: 'warning'
            });
        } else {



            var invoices = [];
            var unlinkedInvoices = [];
            angular.forEach($scope.deliveryData, function(element, i) {
                if (i > 0) {
                    if ($scope.deliveryData[i][0]) {
                        //first check if document is linked with document or not
                        if ($scope.deliveryData[i][11] != 0) {
                            invoices.push({
                                "shipmentId": $scope.deliveryData[i][1],
                                "invoiceNumber": $scope.deliveryData[i][5],
                                "invoiceAmount": $scope.deliveryData[i][6]
                            });
                        } else {
                            unlinkedInvoices.push($scope.deliveryData[i][5]);
                        }
                    }
                }
            });
            if (invoices.length > 0) {

                var deliveryMode = "";

                if (lastDeliveryMode == null) {
                    var itemToSend = {
                        "title": "Delivery Mode",
                        "label": "Please enter delivery mode : ",
                        "type": "dropdown",
                        "regex": "",
                        "isMandatory": true,
                        "length": "5",
                        "value": "d",
                        "toolTip": "",
                        "isReadonly": false,
                        "suggestionsSource": "deliveryMode"
                    };

                    var modalInstance = $modal.open({
                        templateUrl: 'inputDialog.html',
                        controller: 'inputDialogCtrl',
                        resolve: {
                            items: function() {
                                return angular.copy(itemToSend);
                            }
                        }
                    });
                    modalInstance.result.then(function(data) {

                        deliveryMode = data.data;
                        sendDelivery(type, invoices, deliveryMode);


                    }, function(selectedItem) {
                        console.log('Modal dismissed ');

                    });
                } else {
                    sendDelivery(type, invoices, lastDeliveryMode);
                }

            }

            if (unlinkedInvoices.length > 0) {
                flash.pop({
                    title: 'Alert',
                    body: unlinkedInvoices + " Invoices not linked with document, so not delivered. ",
                    type: 'warning'
                });
            }
        }

    }

    function sendDelivery(type, invoices, deliveryMode) {
        if (type == "Delivery") {


            var itemToSend = {
                "title": "Comment",
                "label": "Please enter comments : ",
                "type": "text",
                "regex": "",
                "isMandatory": false,
                "length": "5",
                "value": "deliveryMode",
                "toolTip": "",
                "isReadonly": false,
                "suggestionsSource": ""
            };

            var modalInstance = $modal.open({
                templateUrl: 'inputDialog.html',
                controller: 'inputDialogCtrl',
                resolve: {
                    items: function() {
                        return angular.copy(itemToSend);
                    }
                }
            });
            modalInstance.result.then(function(data) {



                var itemToSave = {
                    "doc": invoices,
                    "status": "Delivered",
                    "isReDelivery": false,
                    "stream": "Delivery",
                    "mode": deliveryMode,
                    "userComment": data.data
                };


                var promise = commonService.ajaxCall('POST', '/api/invoiceDelivery', itemToSave);
                promise.then(function(data) {
                        flash.pop({
                            title: 'Success',
                            body: data,
                            type: 'success'
                        });
                        $scope.getDeliveryData();
                    },
                    function(data) {
                        flash.pop({
                            title: 'Alert',
                            body: data,
                            type: 'error'
                        });
                    });

            }, function(selectedItem) {
                console.log('Modal dismissed ');
            });
        } else if (type == "reDelivery") {



            var itemToSend = {
                "title": "Comment",
                "label": "Please enter comments : ",
                "type": "text",
                "regex": "",
                "isMandatory": true,
                "length": "5",
                "value": "deliveryMode",
                "toolTip": "",
                "isReadonly": false,
                "suggestionsSource": ""
            };

            var modalInstance = $modal.open({
                templateUrl: 'inputDialog.html',
                controller: 'inputDialogCtrl',
                resolve: {
                    items: function() {
                        return angular.copy(itemToSend);
                    }
                }
            });
            modalInstance.result.then(function(data) {



                var itemToSave = {
                    "doc": invoices,
                    "status": "Delivered",
                    "isReDelivery": true,
                    "stream": "Delivery",
                    "mode": deliveryMode,
                    "userComment": data.data
                };

                var promise = commonService.ajaxCall('POST', '/api/invoiceDelivery', itemToSave);
                promise.then(function(data) {
                        flash.pop({
                            title: 'Success',
                            body: data,
                            type: 'success'
                        });
                        $scope.getDeliveryData();
                    },
                    function(data) {
                        flash.pop({
                            title: 'Alert',
                            body: data,
                            type: 'error'
                        });
                    });

            }, function(selectedItem) {
                console.log('Modal dismissed ');
            });
        }
    }
    ///End adding by Keyur Rathod


    //    This function requests for data in Excel format
    //    Function provides selected mode of delivery and invoices selected(if any)
    $scope.pullFile = function() {

        //	var  shipmentId = [];
        var invoices = [];

        angular.forEach($scope.deliveryData, function(element, i) {
            if (i > 0) {
                if (element[0]) {
                    invoices.push(element[5]);
                }
            }
        });


        var filterObj = [];

        if (invoices.length <= 0) {
            filterObj = [{
                c: $scope.global.account[0].c,
                g: $scope.global.account[0].g,
                n: $scope.global.account[0].n,
                v: $scope.global.account[0].v,
                id: $scope.global.account[0].id,
                tc: $scope.global.account[0].tc
            }];
        } else {
            filterObj = [{
                c: $scope.global.account[0].c,
                g: $scope.global.account[0].g,
                n: $scope.global.account[0].n,
                v: $scope.global.account[0].v,
                id: $scope.global.account[0].id,
                tc: $scope.global.account[0].tc,
                //		    shipmentId: shipmentId,
                invoices: invoices
            }];
        }

        if ($route.current.url == "/webInvoice") {
            $.post('/api/invoiceInfotoExcel/exporttoExcel?mode=webdeliveredInvoice' + '&systemId=' + $scope.loggedInUser.userSystem[0].id, JSON.stringify(filterObj), function(retData) {
                $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
            });
        } else {
            $.post('/api/invoiceInfotoExcel/exporttoExcel?mode=' + $scope.deliveryTab + '&systemId=' + $scope.loggedInUser.userSystem[0].id, JSON.stringify(filterObj), function(retData) {
                $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
            });
        }
        commonService.hideDropPanel();
    }

    //    This function requests for Files linked with Invoices in Zip format
    //    Function provides System Id and Account Number, invoices selected(if any)
    $scope.pullInvoicePacket = function() {

        //	var  shipmentId = [];
        var invoices = [];
        var allInvoices = [];

        angular.forEach($scope.deliveryData, function(element, i) {
            if (i > 0) {
                if (element[0]) {
                    invoices.push(element[5]);
                }
                allInvoices.push(element[5]);
            }
        });

        var filterObj = {};

        if (invoices.length <= 0) {
            filterObj = {
                "account": $scope.global.account[0].n,
                "systemId": $scope.loggedInUser.userSystem[0].id,
                "invoice": allInvoices
            };
        } else {
            filterObj = {
                "account": $scope.global.account[0].n,
                "systemId": $scope.loggedInUser.userSystem[0].id,
                //		    shipmentId: shipmentId,
                "invoice": invoices
            };
        }

        if ($route.current.url == "/webInvoice") {
            var promise = commonService.ajaxCall('POST', '/api/invoiceLinking/bulkDownload', filterObj);
            promise.then(function(retData) {
                    $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
                },
                function(data) {
                    //                console.log(data);
                    flash.pop({
                        title: 'Alert',
                        body: data.data.invalidMsgList + ' : ' + data.data.doc,
                        type: 'error'
                    });
                });


            //            $.post('/api/invoiceLinking/bulkDownload', JSON.stringify(filterObj), function (retData) {
            //                $("body").append("<iframe src='/api/tms/download/file?id=" + retData.msg + "&temp=1' style='display: none;' ></iframe>");
            //            });
        }
        commonService.hideDropPanel();
    }



    $scope.RenderHTW = function(isSplit) {
        if (isSplit) {
            $timeout(function() {
                $('.stretch.ui-splitbar').css("left", "50%");
                $('.west-back.stretch').css("right", "50%");
                $('.east-back.stretch').css("left", "50%");
                if ($route.current.url == "/webInvoice") {
                    $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
                    $("iframe").width(Number($('.west-back.stretch').css("right").slice(0, -2)) - 30);
                }
            }, 300);
        } else {
            $timeout(function() {

                $('.stretch.ui-splitbar').css("left", "100%");
                $('.west-back.stretch').css("right", "0%");
                $('.east-back.stretch').css("left", "100%");
                if ($route.current.url == "/webInvoice") {
                    $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
                    ('.stretch.ui-splitbar')
                    $("iframe").width(Number($('.west-back.stretch').css("right").slice(0, -2)) - 30);
                }
            }, 300);
        }

    }

    $scope.viewDocument = function(idx) {
        $scope.showGrid = false;
        if ($scope.deliveryData[idx].files == undefined || $scope.deliveryData[idx].files == null) {
            var promise = commonService.ajaxCall('GET', '/api/getFiles?bookingNumber=' + $scope.deliveryData[idx][4] + '&responseType=array');
            //            var promise = commonService.ajaxCall('GET', '/api/getRelateFiles?key=invoiceNumber&bookingNumber=' + $scope.deliveryData[idx][4]  + '&invoiceNumber=' + $scope.deliveryData[idx][5]);
            promise.then(function(data) {
                    if (data.msg.length > 0) {
                        $scope.deliveryData[idx].files = data.msg;
                        $scope.files = $scope.deliveryData[idx].files;
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
            $scope.files = $scope.deliveryData[idx].files;
            if ($scope.files.length > 0) {
                $scope.fileName = $scope.files[0];
            }
            var id = $scope.files[0] + "||" + $scope.global.account[0].n + "||" + $rootScope.loggedInUser.organization;
            $scope.filePath = "http://docs.google.com/gview?url=http://" + location.host + "/api/downloadFile?id=" + id + "&size=0&embedded=true";
            console.log($scope.filePath);
            $scope.showGrid = true;
            $('#docFrame').attr('src', $scope.filePath);
            setTimeout(function() {
                $scope.RenderHTW(true);
            }, 800)
        }
        $timeout(renderHT, 1000);
    }

    function renderHT() {
        if ($scope.shipments != null && $scope.shipments.length > 20) {
            // $scope.hh = $('sidebar.west-back').height() - 50;
            //            $scope.hh = $(window).height() - 300;
            $scope.hh = $(".west-back.div-west.stretch").height() - 40;
            setTimeout(function() {
                $("iframe").height($(window).height() - 200);
            }, 30);
        } else
            $scope.hh = null;

        $timeout(function() {

            $scope.hw = Number($('.stretch.ui-splitbar').css("left").slice(0, -2)) - 30;
            $("iframe").width(Number($('.west-back.stretch').css("right").slice(0, -2)) - 30);

        }, 300);
    }

    $scope.uploadNewInvoice = function() {

        var itemToSend = {};

        // itemToSend.accountNumber = $scope.global.account;

        var modalInstance = $modal.open({
            templateUrl: 'uploadNewInvoice.html',
            controller: 'uploadNewInvoiceCtrl',
            resolve: {
                items: function() {
                    return angular.copy({

                        fields: itemToSend
                    });
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {


        }, function(selectedItem) {

        });

    }

});