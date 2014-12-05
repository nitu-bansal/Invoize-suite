'use strict';
angularApp.controller('coffeeController', function($scope,$route, $state, $routeParams, $location, $modal, commonService, flash) {


    $scope.DashBoardData = [
{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},{'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8}];

        // $scope.countries = [
        //   {id: 1, n: 'US'},
        //   {id: 2, n: 'INDIA'},
        // ];

        // $scope.stationsval = [
        //   {id: 1, n: 'AMD'},
        //   {id: 2, n: 'SNG'},
        //   {id: 2, n: 'AMM'},
        //   {id: 2, n: 'ACV'},
        // ];
        
        // $scope.accountsval = [
        //   {id: 1, n: 'AMD'},
        //   {id: 2, n: 'SNG'},
        //   {id: 2, n: 'AMM'},
        //   {id: 2, n: 'ACV'},
        // ];


    var promise = commonService.ajaxCall('GET', '/api/suggestion?suggestionFor=metadata_Status&responseType=array&module=BillRight');
    promise.then(function(result) {
        //$scope.historyLoader = false;
        var arr1=result.msg.sort();
        var results=[];

        for (var i = 0; i < result.msg.length - 1; i++) {
            if (arr1[i + 1] != result.msg[i]) {
                results.push(result.msg[i]);
            }
        }

        $scope.StatusesList=results
        // alert($scope.StatusesList)
        // alert(results);
    }, function(result) {
        //$scope.historyLoader = false;
        flash.pop({
            title: 'Alert',
            body: "Please try after sometime..!",
            type: 'error'
        });
    });


// $scope.Headers=Object.keys($scope.DashBoardData[0]);

    $scope.applyDBFilter = function(id) {
        alert('flter')
        $scope.DashBoardData = [
    {'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8},
    {'ClientID':91,'Clientname':'ACH','Count0To2':2,'Amount0To2':5932.75,'Count3To5':1,'Amount3To5':6030.12,'Count6To10':1,'Amount6To10':4403,
    'CountMoreThan10':2,'AmountMoreThan10':7061.83,'Total':8}
    ];

    }



    $scope.SaveToArr = function(id) {
        // alert(id);
    };




    $scope.GetStatuses = function() {
        alert(4)
        $scope.StatusesList= [
          {id: 1, n: '1111'},
          {id: 2, n: 'bbb'},
          {id: 2, n: 'ccc'},
          {id: 2, n: 'ddd'},
          {id: 2, n: 'ddd'},
          {id: 2, n: 'ddd'},
          {id: 2, n: 'ddd'},
          {id: 2, n: 'ddd'},
        ];
    };

    $scope.getSubDBData = function(index, id) {
        $scope.loader = true;
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
        // $scope.companies=['example'];
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


    $scope.displayDBData = function(ClientID,Group,Count) {
        
        var itemToSend ={'ClientID': ClientID,'Group':Group,'Count':Count};


        // itemToSend.templateId = $scope.templateData.templateId;

        var modalInstance = $modal.open({
            templateUrl: 'DBData.html',
            controller: 'dsshboardCtrl',
            resolve: {
                items: function() {
                    return angular.copy(itemToSend);
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {
            // $scope.templateData = selectedItem;
            //            $scope.getTemplate();
        }, function(selectedItem) {
            console.log('Modal dismissed ');
        });

    };

     


    //declare our angular module, injecting the 'googleChartWrap' module as a dependency
    // alert('coffeeController')
                /**
                 *  provide some data to use in our charts. On a real project you'd usually
                 *  use an angular service to retrieve data from a web service endpoint somewhere.
                 */





 

});
