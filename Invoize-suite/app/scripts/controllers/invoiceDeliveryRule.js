/**
 * Created on 13/12/13.
 */
angularApp.controller('invoiceDeliveryRuleCtrl', function($scope, $state, $routeParams, $location, $modal, commonService, flash) {


    $scope.data = {};
    $scope.redirectTo = function(path) {
        $location.path($state.current.name.split('.')[0] + path);
    };

    $scope.deliveryMode = 'EDI';


    $scope.isCheckboxSelected = function(index) {
        return index === $scope.deliveryMode;
    };

    $scope.initializeEmail = function() {
        var promise = commonService.ajaxCall('GET', '/api/template/default?type=emailDeliveryMode');
        promise.then(function(data) {

                $scope.invoiceDeliveryRuleData = {};

                function createSubGroup(a, i) {
                    var g = data.fields[i].group;
                    var hasKey = false;
                    for (var j = 0; j < a.length; j++)
                        if (g in a[j]) {
                            a[j][g].push(data.fields[i]);
                            hasKey = true
                            break;
                        }
                    if (!hasKey) {
                        var sb = {};
                        sb[g] = [];
                        sb[g].push(data.fields[i]);
                        a.push(sb);
                    }
                }
                for (var i = 0; i < data.fields.length; i++) {
                    if (data.fields[i].isActive) {
                        var g = data.fields[i].parentGroup;
                        if (g == null) {
                            g = data.fields[i].group;
                            if ((g in $scope.invoiceDeliveryRuleData) == false) {
                                $scope.invoiceDeliveryRuleData[data.fields[i].group] = [];
                                $scope.invoiceDeliveryRuleData[data.fields[i].group].push(data.fields[i]);
                            } else
                                $scope.invoiceDeliveryRuleData[data.fields[i].group].push(data.fields[i]);
                        } else {
                            if ((g in $scope.invoiceDeliveryRuleData) == false) {
                                var a = $scope.invoiceDeliveryRuleData[data.fields[i].parentGroup] = [];
                                createSubGroup(a, i);
                            } else {
                                var a = $scope.invoiceDeliveryRuleData[data.fields[i].parentGroup];
                                createSubGroup(a, i);
                            }
                        }
                    }
                }

                $scope.invoiceDeliveryRule = data;

            },
            function(result) {

                flash.pop({
                    title: 'Alert',
                    body: "Please try after sometime..!",
                    type: 'error'
                });

            }
        );

    };


    $scope.saveData = function() {

        if ($scope.invoiceDeliveryRule.id == undefined) {
            if ($scope.deliveryMode == 'Email') {
                $scope.invoiceDeliveryRule.mode = $scope.deliveryMode;
                $scope.invoiceDeliveryRule.accountID = $scope.selectedAccounts.accountIds.toString();
                $scope.invoiceDeliveryRule.systemID = $scope.$routeParams.systemId.toString();


                var promise = commonService.ajaxCall('POST', '/api/invoicedeliverymode', $scope.invoiceDeliveryRule);
                promise.then(function(data) {
                        commonService.loader();
                        flash.pop({
                            title: 'Success',
                            body: data,
                            type: 'success'
                        });
                        $scope.rulesData = null;
                        $scope.templateLoader = false;
                        $scope.redirectTo("/system/profile/" + $routeParams.systemName + "/" + $routeParams.systemId + "/account/InvoiceDeliveryrules");
                    },
                    function(data) {
                        $scope.templateLoader = false;
                        commonService.loader();
                        if (data.status === 412) {
                            flash.pop({
                                title: 'Alert',
                                body: 'Some Invalid records are not saved , Please correct and save again.',
                                type: 'error'
                            });

                        } else
                            flash.pop({
                                title: 'Alert',
                                body: data.data,
                                type: 'error'
                            });
                    });
            }
        } else {
            $scope.invoiceDeliveryRule.mode = $scope.invoiceDeliveryRule.mode;
            $scope.invoiceDeliveryRule.accountID = $scope.selectedAccounts.accountIds.toString();
            $scope.invoiceDeliveryRule.systemID = $scope.$routeParams.systemId.toString();


            var promise = commonService.ajaxCall('PUT', '/api/invoicedeliverymode', $scope.invoiceDeliveryRule);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.rulesData = null;
                    $scope.templateLoader = false;
                    $scope.redirectTo("/system/profile/" + $routeParams.systemName + "/" + $routeParams.systemId + "/account/InvoiceDeliveryrules");
                },
                function(data) {
                    $scope.templateLoader = false;
                    commonService.loader();
                    if (data.status === 412) {
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records are not saved , Please correct and save again.',
                            type: 'error'
                        });

                    } else
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                });

        }
    }

    $scope.$on("saveDataEvent", function(event, args) {
        $scope.saveData();
    });

    $scope.invoiceDeliveryModeView = function(value) {

        var promise = commonService.ajaxCall('GET', '/api/invoicedeliverymode/' + value);
        promise.then(function(data) {

            $scope.invoiceDeliveryRuleData = {};

            function createSubGroup(a, i) {
                var g = data.fields[i].group;
                var hasKey = false;
                for (var j = 0; j < a.length; j++)
                    if (g in a[j]) {
                        a[j][g].push(data.fields[i]);
                        hasKey = true
                        break;
                    }
                if (!hasKey) {
                    var sb = {};
                    sb[g] = [];
                    sb[g].push(data.fields[i]);
                    a.push(sb);
                }
            }
            for (var i = 0; i < data.fields.length; i++) {
                if (data.fields[i].isActive) {
                    var g = data.fields[i].parentGroup;
                    if (g == null) {
                        g = data.fields[i].group;
                        if ((g in $scope.invoiceDeliveryRuleData) == false) {
                            $scope.invoiceDeliveryRuleData[data.fields[i].group] = [];
                            $scope.invoiceDeliveryRuleData[data.fields[i].group].push(data.fields[i]);
                        } else
                            $scope.invoiceDeliveryRuleData[data.fields[i].group].push(data.fields[i]);
                    } else {
                        if ((g in $scope.invoiceDeliveryRuleData) == false) {
                            var a = $scope.invoiceDeliveryRuleData[data.fields[i].parentGroup] = [];
                            createSubGroup(a, i);
                        } else {
                            var a = $scope.invoiceDeliveryRuleData[data.fields[i].parentGroup];
                            createSubGroup(a, i);
                        }
                    }
                }
            }

            $scope.invoiceDeliveryRule = data;


            setTimeout(function() {
                var tmpHtml = $scope.invoiceDeliveryRuleData["EMAIL Content"][0].value;
                var a = $scope.invoiceDeliveryRuleData["EMAIL Content"][0].key;

                $('#' + a).code(tmpHtml);
                $('.note-editable').attr('contenteditable', false);

                a = $scope.invoiceDeliveryRuleData["Profile Details"][1].key;
                $('#' + a).text($scope.invoiceDeliveryRuleData["Profile Details"][1].value[0].n);

                a = $scope.invoiceDeliveryRuleData["Profile Details"][6].key;
                $('#' + a).text($scope.invoiceDeliveryRuleData["Profile Details"][6].value[0].n);

            }, 1500);
        }, function(result) {
            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });
    }

    $scope.invoiceDeliveryModeEdit = function(value) {

        var promise = commonService.ajaxCall('GET', '/api/invoicedeliverymode/' + value);
        promise.then(function(data) {

            $scope.invoiceDeliveryRuleData = {};

            function createSubGroup(a, i) {
                var g = data.fields[i].group;
                var hasKey = false;
                for (var j = 0; j < a.length; j++)
                    if (g in a[j]) {
                        a[j][g].push(data.fields[i]);
                        hasKey = true
                        break;
                    }
                if (!hasKey) {
                    var sb = {};
                    sb[g] = [];
                    sb[g].push(data.fields[i]);
                    a.push(sb);
                }
            }
            for (var i = 0; i < data.fields.length; i++) {
                if (data.fields[i].isActive) {
                    var g = data.fields[i].parentGroup;
                    if (g == null) {
                        g = data.fields[i].group;
                        if ((g in $scope.invoiceDeliveryRuleData) == false) {
                            $scope.invoiceDeliveryRuleData[data.fields[i].group] = [];
                            $scope.invoiceDeliveryRuleData[data.fields[i].group].push(data.fields[i]);
                        } else
                            $scope.invoiceDeliveryRuleData[data.fields[i].group].push(data.fields[i]);
                    } else {
                        if ((g in $scope.invoiceDeliveryRuleData) == false) {
                            var a = $scope.invoiceDeliveryRuleData[data.fields[i].parentGroup] = [];
                            createSubGroup(a, i);
                        } else {
                            var a = $scope.invoiceDeliveryRuleData[data.fields[i].parentGroup];
                            createSubGroup(a, i);
                        }
                    }
                }
            }

            $scope.invoiceDeliveryRule = data;


            setTimeout(function() {
                var tmpHtml = $scope.invoiceDeliveryRuleData["EMAIL Content"][0].value;
                var a = $scope.invoiceDeliveryRuleData["EMAIL Content"][0].key;

                $('#' + a).code(tmpHtml);
                $('.note-editable').attr('contenteditable', false);

                a = $scope.invoiceDeliveryRuleData["Profile Details"][6].key;
                $('#' + a).text($scope.invoiceDeliveryRuleData["Profile Details"][6].value);
                a = $('#' + a).text();
            }, 1500);
        }, function(result) {
            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });
    }

    $scope.setData = function(name, value) {

        if (name == "Attachment Type") {
            var promise = commonService.ajaxCall('GET', '/api/suggestion?q=&selected=&suggestionFor=listing_body' + value[0].n);
            promise.then(function(data) {
                var tmpHtml = data.msg[0].n;
                var a = $scope.invoiceDeliveryRuleData["EMAIL Content"][0].key;
                $scope.invoiceDeliveryRuleData["EMAIL Content"][0].value = data.msg[0].id;
                $('#' + a).code(tmpHtml);
                $('.note-editable').attr('contenteditable', false);

            }, function(result) {

                flash.pop({
                    title: 'Alert',
                    body: "Please try after sometime..!",
                    type: 'error'
                });
            });
        }
    };


});