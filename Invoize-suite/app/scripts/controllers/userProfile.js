angularApp.controller('userProfileCtrl', function($scope, $rootScope, $http, $timeout, $location, CryptionService, $stateParams, commonService, $route, $routeParams, $modal, flash, Restangular, $state) {

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.pageLimit = 100;
    $scope.rowNos = [];
    $scope.hw = null;
    var counter = 2;
    var invalidMsgList = [];
    $scope.selectedUsers = [];
    $scope.showLoadmore = false;
    $scope.disableLoadmore = false;

    $scope.setPage = function() {
        setTimeout(function() {
            if ($scope.filterObj.rules == undefined)
                angular.element(".pagination").scope().getUsers(angular.element("li.active.ng-scope").scope().page.number);
            else
                angular.element(".pagination").scope().getFilteredData(angular.element("li.active.ng-scope").scope().page.number);
        }, 300);
    };
    $scope.columnsBR = [];
    $scope.columnsSI = [];
    $scope.columns = [];
    $scope.users = [];
    $scope.AddModify = false;
    $scope.invite = true;
    $scope.register = false;
    //	var multiSelectCols = [];

    $scope.userProfileData = {};
    $scope.historyDataArr = [];
    $scope.historyData = {};


    $scope.historyTemp = [];

    //Start Filter Object
    $scope.rule = {};
    $scope.rule.conditions = {};
    $scope.fields = {};
    $scope.sortedFields = [];
    $scope.filterObj = {};
    $scope.list = [];
    $scope.custObj = {};
    // $scope.filter = {};

    //End Filter Object

    $scope.afterRender = function() {
        $scope.hw = $('div.page-content').width() - 35;
    };

    function renderHT() {
        if ($scope.users != null && $scope.users.length > 20)
            $scope.hh = $(window).height() - 300;
        else
            $scope.hh = null;
    }

    $scope.userTemplateDataSI = {
        "fields": [{
            "regex": /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            "value": "",
            "isUniqueField": false,
            "description": "",
            "isReadonly": false,
            "suggestionsSource": "",
            "errorMessage": "Invalid Email",
            "isMandatory": true,
            "label": "Email",
            "length": 50,
            "isMasterField": false,
            "isActive": true,
            "toolTip": "Email",
            "key": "email",
            "isDefault": true,
            "type": "text",
            "customFlag": false,
            "displayOrder": 2,
            "validationActive": true
        }, {
            "regex": "",
            "value": "",
            "isUniqueField": false,
            "description": "",
            "isReadonly": false,
            "suggestionsSource": "",
            "errorMessage": "",
            "isMandatory": false,
            "label": "Status",
            "length": 500,
            "isMasterField": false,
            "isActive": true,
            "toolTip": "",
            "key": "status",
            "isDefault": true,
            "type": "text",
            "customFlag": false,
            "displayOrder": 3,
            "validationActive": true
        }]

    };
    $scope.usersSI = [{
        updateField: null,
        email: null,
        status: null
    }];
    $scope.columnsSI = [{
        value: 'userSI.updateField',
        type: 'checkbox',
        title: 'Select',
        width: 50
    }];
    $scope.getTemplateSendInvitation = function() {
        $scope.columnsSI = [{
            value: 'userSI.updateField',
            type: 'checkbox',
            title: 'Select',
            width: 50
        }];
        angular.forEach($scope.userTemplateDataSI.fields, function(col, i) {
            if (col.isActive) {
                switch (col.type) {
                    case 'dropdown':
                    case 'multiselect':
                        $scope.columnsSI.push({
                            value: 'userSI.' + col.key,
                            type: 'autocomplete',
                            title: col.label,
                            //							strict: true,
                            src: col.suggestionsSource,
                            width: col.length * 9,
                            length: col.length,
                            renderer: cellRenderer,
                            isMandatory: col.isMandatory,
                            key: col.key,
                            regex: col.regex,
                            toolTip: col.toolTip,
                            errorMessage: col.errorMessage,
                            displayOrder: col.displayOrder
                        });
                        break;

                    default:
                        if (col.type == 'multiline')
                            col.type = 'text';
                        $scope.columnsSI.push({
                            value: 'userSI.' + col.key,
                            type: col.type,
                            allowInvalid: false,
                            renderer: cellRenderer,
                            title: col.label,
                            width: col.length * 9,
                            length: col.length,
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
        $scope.profileInviteLoader = false;

    };

    $scope.SendInvite = function(Invitedusers) {
        $scope.inviteLoader = true;
        invalidMsgList = [];
        var dataTosave = commonService.validateGridData(Invitedusers, $scope.columnsSI, 'default');
        invalidMsgList = dataTosave.arrInvalidMsg;

        if (dataTosave.validData.data.length > 0) {
            var out = createArrayOfInvitedUser(dataTosave.validData.data);
            var promise = commonService.ajaxCall('POST', '/api/user/notify', out);
            promise.then(function(data) {
                    if (dataTosave.inValidData.length > 0) {
                        //when some data saved and som contains invalid data (no server side error)
                        flash.pop({
                            title: 'Warning',
                            body: 'Grid contains some invalid emails, which were not processed',
                            type: 'info'
                        });
                        $scope.usersSI = dataTosave.inValidData;
                    } else { //every thing saved
                        $scope.usersSI = [{
                            updateField: null,
                            email: null,
                            status: null
                        }];
                        flash.pop({
                            title: data,
                            body: data.msg,
                            type: 'success'
                        });
                        $scope.inviteLoader = false;
                    }

                },
                function(data) {
                    if (dataTosave.inValidData.length > 0) {
                        //when some data saved and som contains invalid data (server side error & client side validation error)

                        //dataTosave.arrInvalidMsg = [];
                        //dataTosave.inValidData = [];
                        invalidMsgList = [];
                        $scope.usersSI = data.data;
                        flash.pop({
                            title: 'Information',
                            body: 'Server has rejected duplicate emails, but valid emails (if present) will be processed.',
                            type: 'info'
                        });
                    } else {
                        //when some data saved and server side error)
                        $scope.usersSI = data.data;
                        flash.pop({
                            title: 'Information',
                            body: 'System has flushed incorrect emails, but valid emails (if present) will be processed.',
                            type: 'info'
                        });
                    }

                    $scope.inviteLoader = false;
                });

        } else {
            $scope.inviteLoader = false;
            if (dataTosave.inValidData.length > 0) {
                angular.element('.handsontable').handsontable('render');
                flash.pop({
                    title: 'No Data',
                    body: 'Grid contains invalid emails!',
                    type: 'warning'
                });
                $scope.usersSI = dataTosave.inValidData;

            } else {
                flash.pop({
                    title: 'No Data',
                    body: 'No emails to invite',
                    type: 'warning'
                });
            }
        }

    };

    function createArrayOfInvitedUser(result) {
        var out = {
            "data": []
        };
        for (var key in result) {
            out.data.push(result[key].email);
        }
        return out;
    }

    $scope.editTemplate = function(isBulkRegister) {
        var itemToSend = $scope.userProfileData;
        itemToSend.templateId = "default";
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
            $scope.getTemplate(isBulkRegister);
        }, function(selectedItem) {

        });
    };

    $scope.getTemplate = function(isBulkRegister) {
        $scope.loader = true;
        invalidMsgList = [];
        $scope.columns = [{
            value: 'user.updateField',
            type: 'checkbox',
            title: 'Select',
            width: 50
        }];
        var promise = commonService.ajaxCall('GET', '/api/template/default?type=user');
        promise.then(function(data) {
                $scope.userProfileData = data;
                var sc = data.fields.sort(function(a, b) {
                    return parseInt(a.displayOrder) - parseInt(b.displayOrder)
                });
                $scope.userProfileData.fields = sc;
                $scope.getRuleFields();
                angular.forEach(sc, function(col, i) {
                    if (col.isActive) {
                        if (!isBulkRegister && col.key == 'email')
                            col.isReadonly = true;
                        switch (col.type) {
                            case 'dropdown':
                            case 'multiselect':
                                //								if (col.type == 'multiselect')
                                //									multiSelectCols.push(col.key);
                                $scope.columns.push({
                                    value: 'user.' + col.key,
                                    type: 'autocomplete',
                                    title: col.label,
                                    src: col.suggestionsSource,
                                    width: col.length * 9,
                                    length: col.length,
                                    readOnly: col.isReadonly,
                                    renderer: cellRenderer,
                                    isMandatory: col.isMandatory,
                                    key: col.key,
                                    regex: col.regex,
                                    toolTip: col.toolTip,
                                    errorMessage: col.errorMessage,
                                    displayOrder: col.displayOrder,
                                    isDependent: col.isDependent
                                });
                                break;
                            default:
                                if (col.type == 'multiline')
                                    col.type = 'text';
                                $scope.columns.push({
                                    value: 'user.' + col.key,
                                    type: col.type,
                                    allowInvalid: false,
                                    renderer: cellRenderer,
                                    readOnly: col.isReadonly,
                                    title: col.label,
                                    width: col.length * 9,
                                    length: col.length,
                                    isMandatory: col.isMandatory,
                                    key: col.key,
                                    regex: col.regex,
                                    toolTip: col.toolTip,
                                    errorMessage: col.errorMessage,
                                    isDependent: col.isDependent,
                                    displayOrder: col.displayOrder
                                });
                        }
                    }
                });
                if (!isBulkRegister) {
                    $scope.columns.push({
                        value: 'user.status',
                        title: 'status',
                        readOnly: true,
                        width: 100
                    });
                    if (localStorage.a && CryptionService.decrypt(JSON.parse(localStorage.a))[0] == 1)
                        $scope.columns.push({
                            value: 'user.isAdmin',
                            title: 'Admin',
                            type: 'numeric',
                            width: 100
                        });
                    $scope.getUsers($scope.currentPage, true);
                } else {
                    $scope.users = [{
                        updateField: false
                    }];
                }
                $scope.loader = false;
            },
            function(data) {
                $scope.loader = false;
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    };

    $scope.getUsers = function(pageNo, isGetCount) {
        invalidMsgList = [];
        commonService.loader(true);
        if (isGetCount) {
            var promise1 = commonService.ajaxCall('GET', 'api/getCount?collection=Users&templateId=default');
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
        $scope.loader = true;
        var promise = commonService.ajaxCall('GET', '/api/users?pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo);
        promise.then(function(data) {
                $scope.users = data;
                $scope.rowNos = [];
                var totalPages = pageNo * $scope.pageLimit;
                for (var i = totalPages - ($scope.pageLimit - 1), j = 0; i <= totalPages, j < data.length; i++, j++) {

                    $scope.users[j].updateField = false;
                    $scope.rowNos.push(i);
                }
                $scope.templateLoader = false;
                renderHT();
                commonService.loader();
                $scope.loader = false;
            },
            function(data) {
                $scope.loader = false;
                commonService.loader();
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });

    };
    $scope.aftercellchange = function(values) {
        $scope.selectedUsers = [];
        for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].updateField === true || $scope.users[i].updateField === "true") {
                $scope.selectedUsers.push({
                    id: $scope.users[i].id,
                    name: $scope.users[i].email,
                    update: true,
                    index: i
                });
            }
        }
        if ($scope.selectedUsers.length == 1) {
            counter = 2;
            $scope.getHistoryTemplate($scope.users[$scope.selectedUsers[0]["index"]]["id"]);
            $scope.showLoadmore = true;
            $scope.disableLoadmore = false;
        } else
            $scope.showLoadmore = false;
    };

    $scope.celChange = function(values) {
        $scope.historyTemp = [];
        var cellCount = values.length;
        for (var i = 0; i < cellCount; i++) {
            if (values[i][3] !== values[i][2]) {
                if (values[i][3] === '')
                    values[i][3] = null;
                else if (values[i][3] === 'true' || values[i][3] === 'false')
                    values[i][3] = eval(values[i][3]);
                if (values[i][1] !== 'updateField' && (!$scope.users[values[i][0]] || !$scope.users[values[i][0]].updateField))
                    values.push([values[i][0], 'updateField', 'null', true]);
            }
        }
    };

    $scope.selectFormat = function(arr) {
        if (_.isArray(arr)) {
            if (arr.length < 1)
                return "N/A";
            var str = [];
            _.each(arr, function(val) {

                var temp = val['n'].toString().replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
                if (!_.isUndefined(str))
                    temp = temp.replace(/\w\S*/g, function(txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    });

                str.push(temp);
            });
            return str.join(", ");
        } else {
            if (_.isEmpty(arr))
                return "N/A";
            else
                return arr;
        }


    };

    $scope.rendorHtml = function(id) {
        var strHTML = "";
        angular.forEach($scope.historyData.fields, function(i, j) {
            strHTML = strHTML + "<div class='line'><div class='caption ng-binding'>" + i.permission.company.n + " </div> <div class='data ng-scope ng-binding'>" + $scope.selectFormat(i.value) + "</div></div> ";
        });
        $("#" + id).html($compile(strHTML)($scope));
    };

    $scope.setFlag = function(id, data) {
        if ($scope.historyTemp.history[id].firstFlag == false) {
            $scope.historyTemp.history[id].firstFlag = true;
            $scope.getHistoryData(id, data);
        }
    };
    $scope.getHistoryData = function(id, data) {
        if ($scope.historyTemp.history[id].firstFlag == false) {
            var promise = commonService.ajaxCall('GET', '/api/history/' + data.id + '');
            promise.then(function(result) {
                $scope.historyData = result;
                $scope.historyTemp.history[id].historyData = result;
                $scope.historyTemp.history[id].firstFlag = true;
            }, function(result) {
                flash.pop({
                    title: 'Alert',
                    body: "Please try after sometime..!",
                    type: 'error'
                });
            });
        }
    };
    $scope.getHistoryTemplate = function(userID) {
        $scope.historyLoader = true;
        var promise = commonService.ajaxCall('GET', '/api/history?&q=' + userID + '&pageLimit=5&pageNo=1');
        promise.then(function(result) {
            $scope.historyLoader = false;
            $scope.historyTemp = result;
            for (var j = 0; j <= $scope.historyTemp.history.length - 1; j++)
                $scope.historyTemp.history[j].firstFlag = false;

            if ($scope.historyTemp.history.length == $scope.historyTemp.count) {
                $scope.disableLoadmore = true;
            } else {
                $scope.disableLoadmore = false;
            }
        }, function(result) {
            $scope.historyLoader = false;
            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });

    };
    $scope.updateUsers = function(isBulkRegister) {
        invalidMsgList = [];
        var dataTosave = commonService.validateGridData($scope.users, $scope.columns, 'default');
        invalidMsgList = dataTosave.arrInvalidMsg;
        if (dataTosave.inValidData.length > 0) {
            $scope.users = dataTosave.inValidData;
        }

        if (dataTosave.validData.data.length > 0) {
            commonService.loader(true);
            var promise = commonService.ajaxCall('PUT', '/api/grid/User', dataTosave.validData);
            promise.then(function(data) {
                    if (dataTosave.inValidData.length > 0) {
                        flash.pop({
                            title: 'Waring',
                            body: 'Grid contains some Invalid data, which is not saved',
                            type: 'warning'
                        });
                        //						$scope.users = dataTosave.inValidData;
                    } else {

                        if (!isBulkRegister) {
                            $scope.getUsers($scope.currentPage, true);
                        } else {
                            $scope.users = [{
                                updateField: false
                            }];
                        }

                        flash.pop({
                            title: 'Success',
                            body: data,
                            type: 'success'
                        });
                    }
                    commonService.loader();
                    angular.element('.handsontable').eq(0).handsontable('render');
                },
                function(data) {
                    $scope.loader = false;
                    commonService.loader();
                    if (data.status === 412) {
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records not save are in grid, Please correct and save again.',
                            type: 'error'
                        });
                        if ($scope.users.length > 1) {
                            dataTosave.inValidData.pop();
                            $scope.users = dataTosave.inValidData.concat(data.data.doc);
                        } else
                            $scope.users = data.data.doc;
                        for (var i = 0; i < data.data.invalidMsgList.length; i++) {
                            for (var j = 0; j < $scope.columns.length; j++)
                                if ($scope.columns[j].key in data.data.invalidMsgList[i]) {
                                    invalidMsgList.push({
                                        'regex': [$scope.columns[j].key],
                                        mandatory: [],
                                        length: []
                                    });
                                    $scope.columns[j].errorMessage = (data.data.invalidMsgList[i][$scope.columns[j].key]).toString();
                                    //break;
                                }
                        }
                    }
                });
        } else {

            if (dataTosave.inValidData.length > 0) {
                flash.pop({
                    title: 'No Data',
                    body: 'Grid contains invalid data!',
                    type: 'warning'
                });
                $scope.users = dataTosave.inValidData;
            } else {
                if (isBulkRegister) {

                    $scope.users = [{
                        updateField: false
                    }];
                }
                flash.pop({
                    title: 'No Data',
                    body: 'No data to save',
                    type: 'warning'
                });
            }

            angular.element('.handsontable').eq(0).handsontable('render');
        }
    };

    $scope.invitePeople = function(profile) {
        $scope.redirectTo("/users/invite/" + profile.id);

    };

    $scope.prevStep = function() {
        $scope.redirectTo("/system/view");
    };
    $scope.updateUserData = function(userData) {
        $scope.userLoader = true;
        var apiUrl = "";
        if ($route.current.name == "main.invited") {
            apiUrl = "/api/users/" + $routeParams.id + "?isInvite=1";
            userData.isActive = true;
        } else {
            apiUrl = "/api/users/" + $rootScope.loggedInUser.userId + "?isInvite=0";
        }
        var promise = commonService.ajaxCall('PUT', apiUrl, userData);
        promise.then(function(data) {
                if ($route.current.name == "main.invited") {
                    flash.pop({
                        title: 'Registered successfully',
                        body: "user Registered successfully",
                        type: 'success'
                    });
                    $location.path("/main/landing");
                } else {
                    flash.pop({
                        title: 'Profile Updated',
                        body: "profile updated successfully",
                        type: 'success'
                    });
                }
                $scope.userLoader = false;
            },
            function(data) {
                $scope.userLoader = false;
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    };

    $scope.getUserData = function() {
        $scope.userLoader = true;
        var apiUrl = "";
        if ($route.current.name == "main.invited") {
            apiUrl = "/api/users/" + $routeParams.id + "?isInvite=1";
        } else {
            apiUrl = "/api/users/" + $rootScope.loggedInUser.userId + "?isInvite=0";
        }
        var promise = commonService.ajaxCall('GET', apiUrl);
        promise.then(function(data) {
                $scope.userData = data;
                $scope.userLoader = false;
                if ($scope.userData.isActive && $route.current.name == "main.invited") {
                    $location.path("/main/landing");
                }
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
                $scope.userLoader = false;
            });
    };

    $scope.editPermissions = function() {
        var users = [];
        for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].updateField === true || $scope.users[i].updateField === "true") {
                users.push({
                    id: $scope.users[i].id,
                    name: $scope.users[i].email,
                    update: true
                });

                if ($scope.users[i].isAdmin == 1) {
                    flash.pop({
                        title: 'Can\'t assign permissions to admin!',
                        body: 'One of the user you have selected is admin.',
                        type: 'info'
                    });
                    return;
                }
            }
        }
        if (users.length > 0) {
            var modalInstance = $modal.open({
                templateUrl: 'permission.html',
                controller: 'permissionCtrl',
                resolve: {
                    items: function() {
                        return angular.copy(users);
                    }
                }
            });
            modalInstance.result.then(function(Items) {}, function(Items) {});
        } else
            flash.pop({
                title: 'Info',
                body: 'Please select user(s) to assign permissions!',
                type: 'info'
            });
    };

    var cellRenderer = function(instance, td, row, col, prop, value, cellProperties) {
        if (cellProperties.type == 'autocomplete')
            Handsontable.AutocompleteCell.renderer.apply(this, arguments);
        else if (cellProperties.type == 'date')
            Handsontable.DateCell.renderer.apply(this, arguments);
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
                td.title += cellProperties.errorMessage;
                td.style.backgroundColor = 'pink';
            }
        }

        td.innerHtml = value;
        return td;
    };

    $scope.redirectTo = function(path) {
        //redirect based on wizard / organizationsetup
        $location.path($state.current.name.split('.')[0] + path);

    };
    $scope.loadMore = function() {
        $scope.historyLoader = true;
        var promise = commonService.ajaxCall('GET', '/api/history?&q=' + $scope.users[$scope.selectedUsers[0]["index"]]["id"] + '&pageLimit=5&pageNo=' + counter);
        promise.then(function(result) {
            $scope.historyLoader = false;
            counter += 1;
            $scope.historyTemp.history = $scope.historyTemp.history.concat(result.history);
            if ($scope.historyTemp.history.length == $scope.historyTemp.count) {
                $scope.disableLoadmore = true;
            } else {
                $scope.disableLoadmore = false;
            }

        }, function(result) {
            $scope.historyLoader = false;
            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
        });
    };

    $scope.finishSetup = function() {
        //redirect based on wizard / organizationsetup
        var promise = commonService.ajaxCall('GET', 'api/finishSetup');
        promise.then(function(data) {
                $location.path("/home");
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: "Work in Progress",
                    type: 'error'
                });
            });
    };

    //Start Filter Function
    $scope.getRuleFields = function() {
        $scope.sortedFields = [];
        angular.forEach($scope.userProfileData.fields, function(i) {
            if (i.isActive == true) {
                $scope.fields[i.key] = {
                    type: i.type,
                    label: i.label
                };
                $scope.sortedFields.push(i.key);
                $scope.custObj[i.label] = {
                    column: i.key,
                    columnType: i.type
                }
            }
        });


    };

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
        $scope.currentPage = 1;
        $scope.filterObj = {};
        $scope.getUsers($scope.currentPage, true);
        commonService.hideDropPanel();
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
        };

        rulesData.generateJson($('div[ng-form="rulesForm"] > div > div.row > div.sub-condition'), rulesData.ruleDef);
        $scope.filterObj = {
            rules: rulesData.ruleDef

            //          accounts: ["52aec82c1c80a813874f8529",
            //              "52aec7ae1c80a8130567ac63"
            //          ]
        };

        if ($scope.filterObj.rules.fields.length <= 0) {
            flash.pop({
                title: 'No filter conditions',
                body: 'No conditions to apply filter',
                type: 'info'
            });
        } else
            $scope.getFilteredData(1, true);
    };

    $scope.getFilteredData = function(pageNo, isGetCount) {

        // $scope.Loader = true;
        commonService.loader(true);
        if (isGetCount) {
            var promise1 = commonService.ajaxCall('PUT', 'api/users?count=1', $scope.filterObj);
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
        var promise = commonService.ajaxCall('PUT', 'api/users?pageLimit=' + $scope.pageLimit + '&pageNo=' + pageNo, $scope.filterObj);
        promise.then(function(data) {
            // $scope.Loader = false;
            if (data.length) {
                $scope.users = data;
                $scope.rowNos = [];
                for (var i = pageNo * $scope.pageLimit - ($scope.pageLimit - 1), j = 0; i <= pageNo * 500, j < data.length; i++, j++) {
                    $scope.users[j].updateField = false;
                    $scope.rowNos.push(i);
                }
            } else {
                flash.pop({
                    title: 'Waring',
                    body: 'No data found with specified search criteria...!!!',
                    type: 'warning'
                });

                $scope.users = [{
                    updateField: false
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
            // $scope.Loader = false;
            commonService.loader(false);
        });

    }

    $scope.resetFilter = function() {
        for (var k in $scope.fields)
            if ($scope.fields.hasOwnProperty(k) && $scope.fields[k].val) {
                $scope.fields[k].val = null;
                if ($scope.fields[k].type == "dropdown" || $scope.fields[k].type == "multiselect")
                    $('input[name="' + k + '"]').select2('val', null);
            }
        $scope.filterObj = {};
        // $scope.filter = {};
        $scope.currentPage = 1;
        $scope.getUsers($scope.currentPage, true);
        commonService.hideDropPanel();
    };

    $scope.applyFilter = function() {
        $scope.filterObj = {
            rules: {
                condition: 'and',
                fields: []
            }
        };

        for (var k in $scope.fields) {
            if ($scope.fields[k].val != null) {
                if (angular.isArray($scope.fields[k].val)) {
                    var obj = $scope.filterObj.rules;
                    if ($scope.fields[k].val.length > 1) {
                        obj = {
                            condition: 'or',
                            fields: []
                        };
                        $scope.filterObj.rules.fields.push(obj);
                    }
                    for (var i = 0; i < $scope.fields[k].val.length; i++)
                        obj.fields.push({
                            name: k,
                            operator: 'equalTo',
                            value: $scope.fields[k].type === 'numeric' ? parseInt($scope.fields[k].val[i].n, 10) : $scope.fields[k].val[i].n
                        });
                } else
                    $scope.filterObj.rules.fields.push({
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