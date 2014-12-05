'use strict';
angularApp.controller('coffeeController', function($scope,$route, $state, $routeParams, $location, $modal, commonService, flash) {

  
        $scope.DashBoardData = [
{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8}];

        // $scope.Headers=Object.keys($scope.DashBoardData[0]);
        // alert($scope.DashBoardData.toSource())

    $scope.getSubDashData = function(index, id) {
        console.log(index);
        console.log(id);
        $scope.SubData=[
{'Status':'In Exception','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'Status':'Not ready for Invoicing','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'Status':'Unbilled - Additional Charges','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'Status':'Unbilled - In Process','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'Status':'Unbilled - Not In Process','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'Status':'Unbilled - Resolved Exception','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'Status':'Unbilled - Resolved Exception','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8}
]

        $scope.SubHeaders=Object.keys($scope.SubData[0]);
        // alert($scope.SubHeaders)

    };

    $scope.getDashboardData = function() {
        $scope.loader = true;

        // $scope.systemRules = {};
        // $scope.rulesData = {};
        // var sysId = $routeParams.systemId;
        // var promise = commonService.ajaxCall('GET', '/api/template/' + ($scope.currentTab == 'systemInvoice' ? 'default?systemId=' + sysId + '&' : 'systemId/' + sysId + '?') + 'type=' + $scope.currentTab);
        // promise.then(function(data) {

        //         $scope.DashBoardData = data;
        //         $scope.loader = false;
        //     },
        //     function(data) {
        //         flash.pop({
        //             title: 'Alert',
        //             body: data.data,
        //             type: 'error'
        //         });
        //         $scope.loader = false;
        //     }
        // );

    };
    //declare our angular module, injecting the 'googleChartWrap' module as a dependency

// alert('coffeeController')
                /**
                 *  provide some data to use in our charts. On a real project you'd usually
                 *  use an angular service to retrieve data from a web service endpoint somewhere.
                 */




                $scope.coffeeData = [
                    {"name": "Starbucks", "votes": 36},
                    {"name": "Costa", "votes": 34},
                    {"name": "Coffee Bean", "votes": 30}
                ];

 

});
