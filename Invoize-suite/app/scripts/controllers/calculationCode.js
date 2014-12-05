
angularApp.controller('calculationCodeCtrl', function($scope,$rootScope, $http, $location, $state, $timeout, $route, $routeParams, $modal,limitToFilter, commonService, sharedService, flash) {

        $scope.codeList=[];
        $scope.calculationCode={};
        $scope.calculationCode.codeLevels=[{},{},{}];
        $scope.isMultiple=false;
        $scope.calculationFormatList=[
                                    {"n":"Calculation With Decimal","id":"Calculation With Decimal"},
                                    {"n":"Calculation Without Decimal","id":"Calculation Without Decimal"},
                                    {"n":"Percentage Calculation","id":"Percentage Calculation"}
                                    ]
        $scope.compareList=[
            {"n":"Greater","id":"Greater"},
            {"n":"Lesser","id":"Lesser"}

        ]

        $scope.roundingFactor=[{"n":"1","id":"1"},{"n":"2","id":"2"},{"n":"3","id":"3"}];

        $scope.operators =[{"n":"+","id":"+"},{"n":"-","id":"-"},{"n":"/","id":"/"},{"n":"*","id":"*"}];

        $scope.roundingMethod=[{"n":"Round Off","id":"Round Off"},{"n":"Round Up","id":"Round Up"},{"n":"Standard ","id":"Standard "}];

        $scope.rates=[{"n":"RTE1","id":"RTE1"},{"n":"RTE2","id":"RTE2"},{"n":"RTE3","id":"RTE3"}];


        ///function to check if multiple calulaton codes avalaible or not
        $scope.checkLength=function()
        {
            var cnt=0;
            $scope.isMultiple=false;
            angular.forEach($scope.calculationCode.codeLevels, function(i,j) {
                if (i.l1Field!=undefined && i.l1Field!=null && i.l1Field!="")
                {
                    cnt++;
                }
            });
            if(cnt>1)
                $scope.isMultiple=true;
            else
            {
                $scope.isMultiple=false;
                $scope.calculationCode.resultCriteria=null;
            }
        }

        ///function to check weather pass code selected does not create any circular dependency
        $scope.checkPassCode=function()
        {
            if($scope.calculationCode.passToCode!=undefined  && $scope.calculationCode.passToCode[0]!=undefined && $scope.calculationCode.passToCode!=null)
            {
                var promise = commonService.ajaxCall('GET', '/api/checkForPassToCode?source=' + $scope.calculationCode.name+'&passToCode='+$scope.calculationCode.passToCode[0].id);
                promise.then(function(data) {
                        if(data.msg =="1")
                        {
                            flash.pop({
                                title: 'Alert',
                                body: "there is cyclic dependency which can create deadlock",
                                type: 'warning'
                            });
                            $('[name="passToCode"]').val('');
                            $scope.calculationCode.passToCode=null;
                        }
                    },
                    function(data) {
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                    });
            }
        }

        ///function to get field value for text box
        $scope.fieldBarVal = function(value,idx,name) {
            return $http.get('/api/suggestion?q=&pageLimit=100&page=1&suggestionFor=templateFields&responseType=array&docType=shipmentFields&dataType=numeric&system='+$rootScope.loggedInUser.userSystem[0].id)
                .then(function(response){
                    response.data.msg.push("previousResult");
                    var res =_.filter(response.data.msg, function(val){ return val.toLowerCase().indexOf(value) != -1 ; })
                    if(res.length==0 && isNaN($('[name="' + name + '"]').val()))
                    {
                        $('[name="' + name + '"]').val('');
                        if(name.indexOf('l1') != -1)
                            $scope.calculationCode.codeLevels[idx].l1Field=null;
                        else if(name.indexOf('l2') != -1)
                            $scope.calculationCode.codeLevels[idx].l2Field=null;
                        else if(name.indexOf('l3') != -1)
                            $scope.calculationCode.codeLevels[idx].l3Field=null;
                        if(name.indexOf('l1') != -1)
                            $scope.checkLength();
                    }
                    return limitToFilter(res, 15);
                });
        };

    ///function to read selected calculation code
    $scope.readCode=function()
    {
        $scope.calculationCode={};
        commonService.loader(true);
        var promise = commonService.ajaxCall('GET', '/api/calculationCode/' + $routeParams.id);
        promise.then(function(data) {
                $scope.calculationCode = data.msg;
                $scope.checkLength();
                commonService.loader();
            },
            function(data) {
                commonService.loader();
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
    }

    ///function to redirect to edit calculation codes
    $scope.codeEditView = function(id) {
        $location.path("/billright/calculationCode/edit/" + id);
    };

    ///function to get code list
    $scope.getCodeList=function(q)
    {
        $scope.calculationCode={};
        $scope.calculationCode.codeLevels=[{},{},{}];
        commonService.loader(true);
        var promise = commonService.ajaxCall('GET', '/api/calculationCode?system='+$rootScope.loggedInUser.userSystem[0].id+'&pageLimit=500&pageNo=1&q=' + q + '');
        promise.then(function(data) {
                $scope.codeList = data.msg;
                commonService.loader();
            },
            function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.msg,
                    type: 'error'
                });
                commonService.loader();
            });

    }

    ///function to create code
    $scope.createCode = function(calculationCode) {
        commonService.loader(true);
        calculationCode.system=$rootScope.loggedInUser.userSystem[0].id;
        var promise = commonService.ajaxCall('POST', '/api/calculationCode', calculationCode);
        promise.then(function(data) {
                flash.pop({
                    title: 'Success',
                    body: data.msg,
                    type: 'success'
                });
                commonService.loader();
//		console.log(data.id);
                if (data.id!=null) {
		    $location.path("billright/calculationCode/view");
                }
            },
            function(data) {
                commonService.loader();
                flash.pop({
                    title: 'Alert',
                    body: data.msg,
                    type: 'error'
                });
            });
    };

    ///function to update calculation code
    $scope.updateCode = function(calculationCode) {
        commonService.loader(true);
        calculationCode.system=$rootScope.loggedInUser.userSystem[0].id;
        var promise = commonService.ajaxCall('PUT', '/api/calculationCode', calculationCode);
        promise.then(function(data) {
                flash.pop({
                    title: 'Success',
                    body: data.msg,
                    type: 'success'
                });
                commonService.loader();
                $location.path("billright/calculationCode/view");
            },
            function(data) {
                commonService.loader();
                flash.pop({
                    title: 'Alert',
                    body: data.msg,
                    type: 'error'
                });
            });
    };

    ///function to add new level
    $scope.addLevel=function()
    {
        $scope.calculationCode.codeLevels.push({});
    }
    ///function to remove selected level
    $scope.removeLevel = function(index){
        $scope.calculationCode.codeLevels.splice(index, 1);
        $scope.checkLength();
    }
});