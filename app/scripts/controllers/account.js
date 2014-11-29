'use strict';

angularApp.controller('accountCtrl', function($scope,$http,$location,$stateParams,$route,$routeParams,$dialog,accountService,flash){
        var counter = 2;
        var moreAccounts = true;
        $scope.totalAccount = 0;
        $scope.accountList = [];
        $scope.account = {};
        $scope.account.role = [[{"c":"","g":"None","n":"role","v":"Account Manager","id":"51d2ad95c210b228a44eeac3","tc":null}],[]];
        $scope.account.user = [];
        $scope.search='';                
        $scope.workflowModeList = [{wmid:"1",n:"Direct"},{wmid:"2",n:"Group"},{wmid:"3",n:"Conditional"}];
        $scope.backUpDocumentRequirementsList = [{n:"HAWB",v:"HAWB"},{n:"COMMERCIAL INVOICE",v:"COMMERCIAL INVOICE"},{n:"POD",v:"POD"}]
        $scope.backUpDataRequirementsList = [{n:"REFERENCE #",v:"REFERENCE #"},{n:"GSDB CODE",v:"GSDB CODE"},{n:"NLMI #",v:"NLMI #"}]
        $scope.accountTypeList = [{n:"INTERNATIONAL",v:"INTERNATIONAL"},{n:"DOMESTIC",v:"DOMESTIC"}]
        $scope.shipmentModesList = [{n:"Import",v:"Import"},{n:"Export",v:"Export"},{n:"FTF",v:"FTF"}]
        $scope.ARBookedInList = [{n:"AMERICAS",v:"AMERICAS"},{n:"EMEA",v:"EMEA"},{n:"APAC",v:"APAC"}]
        $scope.invoicingTypeList = [{n:"SPLIT",v:"SPLIT"},{n:"CONSOLIDATED",v:"CONSOLIDATED"}]
        $scope.ratingTypeList = [{n:"TARIFF",v:"TARIFF"},{n:"QUOTE",v:"QUOTE"},{n:"TARIFF / QUOTE",v:"TARIFF / QUOTE"}]
        $scope.currencyConversionApplicableList = [{n:"YES",v:"YES"},{n:"NO",v:"NO"}]
        $scope.sourcesOfCurrencyConversationList = [{n:"CEVA IC RATES",v:"CEVA IC RATES"},{n:"OWANDA",v:"OWANDA"},{n:"WJS",v:"WJS"},{n:"BLOOMBERG",v:"BLOOMBERG"}]
        $scope.anyLimitationOnNoOfDaysToInvoiceList = [{n:"YES",v:"YES"},{n:"NO",v:"NO"}]
        $scope.criteriaList = [{n:"SHIPMENT DATE",v:"SHIPMENT DATE"}, {n:"POD DATE",v:"POD DATE"},{n:"ANY OTHER",v:"ANY OTHER"}]
        $scope.noOfDaysToInvoiceList = [{n:"30",v:"30"},{n:"45",v:"45"},{n:"90",v:"90"},{n:"180",v:"180"},{n:">180",v:">180"}]
        $scope.isFpcApplicableList = [{n:"YES",v:"YES"},{n:"NO",v:"NO"}]
        $scope.approvalNotificationFormatList = [{n:"WEB BASED",v:"WEB BASED"},{n:"MANUAL",v:"MANUAL"}]
        $scope.approvalNotificationFrequencyList = [{n:"DAILY",v:"DAILY"},{n:"WEEKLY",v:"WEEKLY"},{n:"FORTNIGHTLY",v:"FORTNIGHTLY"}]
        $scope.isRemittanceReceivedList = [{n:"YES",v:"YES"},{n:"NO",v:"NO"}]
        $scope.invoiceDeliveryModeList = [{n:"EDI",v:"EDI"},{n:"IMS",v:"IMS"},{n:"WebTool",v:"WebTool"},{n:"Email",v:"Email"},{n:"Handelivery",v:"Handelivery"}]
        $scope.invoiceRedeliveryModeList = [{n:"EDI",v:"EDI"},{n:"IMS",v:"IMS"},{n:"WebTool",v:"WebTool"},{n:"Email",v:"Email"},{n:"Handelivery",v:"Handelivery"}]
        $scope.invoiceDeliveryFrequencyList = [{n:"DAILY",v:"DAILY"},{n:"WEEKLY",v:"WEEKLY"},{n:"FORTNIGHTLY",v:"FORTNIGHTLY"},{n:"MONTHLY",v:"MONTHLY"}]
        $scope.paymentModeList = [{n:"ACH",v:"ACH"},{n:"CHECK",v:"CHECK"},{n:"WIRE",v:"WIRE"}]
        $scope.paymentFrequencyList = [{n:"DAILY",v:"DAILY"},{n:"WEEKLY",v:"WEEKLY"},{n:"BIWEEKLY",v:"BIWEEKLY"},{n:"MONTHLY",v:"MONTHLY"}]

        $scope.rolesCallback = function(index) {
                if($scope.account.role.length == index+1){
                        $scope.account.role.push([]);
                }
        };
        
        $scope.searchAccount = function() {
                $scope.getAccountList($scope.search);
        };

        $scope.removeRoles = function(idx) {
                $scope.account.role.splice(idx, 1);
                $scope.account.user.splice(idx, 1);
        };        

        $scope.formatResult = function (data) {
                var markup = "<div>" + $scope.toHumanReadable(data.v) + "</div>";
                return markup;}

        $scope.formatSelection = function (data) {
                return data.v;}

        $scope.removeDuplicate = function(totalData, removeableArr){
                removeableArr.forEach(function(v,i){
                        totalData.forEach(function(val,idx){
                                if(v.id === val.id)
                                        totalData.splice(idx, 1);
                        })
                })
                return totalData;
        }
        $scope.workflowBar = {
                placeholder: "Add Workflow",
                minimumInputLength: 0,
                multiple:false,
                allowClear: true,
                ajax: {
                        method: 'POST',
                        url: "/api/list/suggestion",
                        dataType: 'json',
                        quietMillis: 100,
                        data: function (term, page) { // page is the one-based page number tracked by Select2
                                return {
                                        q: term, //search term
                                        pageLimit: 10, // page size
                                        page: page, // page number
                                        selected: $scope.searchBarValue, //selected values
                                        suggestionFor: "workflow", // suggestions for
                                        //   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
                                };
                        },
                        results: function (data, page) {
                                var data = data
                                data.total = 100;
                                if(data.msg.length < 10)
                                        var more = false
                                else
                                        var more = (page * 10) < data.total;
                                return {results: data.msg, more: more};
                        }
                },
                initSelection : function (element, callback) {
                        callback($(element).data('$ngModelController').$modelValue);
                },
                formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
                formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
                dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
        };

        $scope.groupBar = {
                placeholder: "Add Group",
                minimumInputLength: 0,
                multiple:false,
                ajax: {
                        method: 'POST',
                        url: "/api/list/suggestion",
                        dataType: 'json',
                        quietMillis: 100,
                        data: function (term, page) { // page is the one-based page number tracked by Select2
                                return {
                                        q: term, //search term
                                        pageLimit: 10, // page size
                                        page: page, // page number
                                        selected: $scope.searchBarValue, //selected values
                                        suggestionFor: "account_group", // suggestions for
                                        //   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
                                };
                        },                     
                        results: function (data, page) {
                                var data = data
                                data.total = 100;
                                if(data.msg.length < 10)
                                        var more = false
                                else
                                        var more = (page * 10) < data.total;
                                return {results: data.msg, more: more};
                        }
                },
                initSelection : function (element, callback) {
                        callback($(element).data('$ngModelController').$modelValue);
                },
                formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
                formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
                dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
        };

        $scope.roleBar = {
                placeholder: "Add Role",
                minimumInputLength: 0,
                multiple:true,
                ajax: {
                        method: 'POST',
                        url: "/api/list/suggestion",
                        dataType: 'json',
                        quietMillis: 100,
                        data: function (term, page) { // page is the one-based page number tracked by Select2
                                return {
                                        q: term, //search term
                                        pageLimit: 10, // page size
                                        page: page, // page number
                                        selected: $scope.searchBarValue, //selected values
                                        suggestionFor: "role", // suggestions for
                                        //   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
                                };
                        },
                        results: function (data, page) {
                                var data = data;
                                var msg = data.msg;
                                var removable = [];
                                $scope.account.role.forEach(function(i,j){
                                        removable = removable.concat(i);
                                })
                                msg = $scope.removeDuplicate(msg,removable)
                                data.msg = msg;
                                data.total = 100;
                                // if(data.msg.length < 10)
                                //         var more = false
                                // else
                                var more = (page * 10) < data.total;
                                return {results: data.msg, more: more};
                        }
                },
                initSelection : function (element, callback) {
                        callback($(element).data('$ngModelController').$modelValue);
                },
                formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
                formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
                dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
        };

        $scope.userBar = {
                placeholder: "Add User",
                minimumInputLength: 0,
                multiple:true,
                ajax: {
                        method: 'POST',
                        url: "/api/list/suggestion",
                        dataType: 'json',
                        quietMillis: 100,
                        data: function (term, page) { // page is the one-based page number tracked by Select2
                                return {
                                        q: term, //search term
                                        pageLimit: 10, // page size
                                        page: page, // page number
                                        selected: $scope.searchBarValue, //selected values
                                        suggestionFor: "user", // suggestions for
                                        //   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
                                };
                        },
                        results: function (data, page) {
                                var data = data
                                data.total = 100;
                                if(data.msg.length < 10)
                                        var more = false
                                else
                                        var more = (page * 10) < data.total;
                                return {results: data.msg, more: more};
                        }
                },
                initSelection : function (element, callback) {
                        callback($(element).data('$ngModelController').$modelValue);
                },
                formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
                formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
                dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
        };

        $scope.create = function(account){
                $scope.accountCreateLoader = true;
                var promise = accountService.create(account);
                promise.then(function(msg){
                                $scope.getAccountList($scope.search);
                                flash.pop({title: 'Success', body: msg.msg, type: 'info'});
                                $location.path("/account/"+ msg.id);
                            },
                        function(msg){
                                $scope.accountCreateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }

        $scope.getTotalAccount = function(){
                var promise = accountService.totalAccount({countFor:'account'});
                promise.then(function(result){
                                $scope.totalAccount = result.count;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }

        $scope.getAccountList = function(q){
                $scope.accountListLoader = true;
                var promise = accountService.list({suggestionFor:'account', q:q, pageLimit:20, page:1});
                promise.then(function(result){
                                $scope.accountList = result;
                                $scope.accountListLoader = false;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                                $scope.accountListLoader = false;
                        }
                );
        }
  
        $scope.loadMore = function() {
                if(moreAccounts){
                        $scope.loadingMore = true;
                        var promise = accountService.list({suggestionFor:'account', q:'', pageLimit:20, page:counter});
                        promise.then(function(result){
                                        if (result.length === 0)
                                                moreAccounts = false;
                                        counter += 1;
                                        $scope.loadingMore = false;
                                        $scope.accountList = $scope.accountList.concat(result);},
                                function(result){
                                        $scope.loadingMore = false;
                                }
                        );
                }
        }

        $scope.selectAccount = function(value){
                $scope.accountDetailLoader = true;
                var promise = accountService.read(value);
                promise.then(function(result){
                                $scope.accountDetailLoader = false;
                                $scope.account = result;
                        },
                        function(result){
                                $scope.accountDetailLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.updateAccount = function(account){
                $scope.accountUpdateLoader = true;
                var promise = accountService.update(account);
                promise.then(function(msg){
                                $scope.accountUpdateLoader = false;
                                $scope.getAccountList($scope.search);
                                $scope.getTotalAccount();
                                flash.pop({title: 'Success', body: msg, type: 'info'});
                                $location.path("/account/"+ $routeParams.accountId);
                            },

                        function(msg){
                                $scope.accountUpdateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }

        $scope.editAccount = function(value){
                // $scope.account = $scope.account;
        }

        $scope.initializeAccount=function(){
                $scope.account = {};                
                $scope.account.role = [[{"c":"","g":"None","n":"role","v":"Account Manager","id":"51d2ad95c210b228a44eeac3","tc":null}],[]];
                $scope.account.user = [];
        }

        $scope.confirmDeleteAccount = function() {
                 // Code Dialog Start   
                $dialog.dialog(angular.extend(
                        {
                            controller: 'dialogCtrl',
                            templateUrl: 'confirm.html', // change as per the dialog html needed
                            backdrop: true  ,
                            keyboard: false,
                            backdropFade : true,
                            dialogFade : true,
                            backdropClick: false,
                            show: true
                        }, {resolve: {item: function () {return angular.copy(true);} }}))
                .open()
                .then(function(result) {                
                if(result) {                        
                        console.log(result); // user has clicked save ..   
                        $scope.delete();                                                                    
                }
                else
                {                  
                        
                        console.log("close");                                       
                }                
                });          
                // Code Dialog End
        };

        $scope.delete = function(){
                $scope.accountUpdateLoader = true;
                var promise = accountService.delete($routeParams.accountId);
                promise.then(function(result){                                
                                $scope.getAccountList($scope.search);
                                $scope.getTotalAccount();
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.accountUpdateLoader = false;
                                $location.path("/account");
                        },
                        function(result){
                                $scope.accountUpdateLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.backToDetails = function(){                
                $scope.getAccountList($scope.search);
                $scope.getTotalAccount();                
                $location.path("/account/"+ $routeParams.accountId);
                            
        }

        $scope.backToList = function(){
                $scope.getAccountList($scope.search);
                $scope.getTotalAccount();                               
                $location.path("/account");
        }

        if($route.current.name == "account.edit"){
                $scope.getAccountList($scope.search);
                $scope.getTotalAccount();
                $scope.selectAccount($routeParams.accountId);
                $scope.editAccount($routeParams.accountId);
        }
        else if($route.current.name == "account.detail"){
                $scope.getAccountList($scope.search);
                $scope.getTotalAccount();
                $scope.selectAccount($routeParams.accountId);
        }
        else
        {
                $scope.getAccountList($scope.search);
                $scope.getTotalAccount();
        }

        $scope.loading = false;
});