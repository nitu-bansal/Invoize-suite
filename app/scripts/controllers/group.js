    'use strict';

angularApp.controller('groupCtrl', function($scope,$http,$location,$route,$routeParams,$stateParams,$modal,$dialog,groupService,flash){
        var counter = 2;
        var moreGroups = true;        
        $scope.totalGroup = 0;
        $scope.groupTypeList = [{n:"user",v:"User"},{n:"account",v:"Account"},{n:"permission",v:"Permission"}];
        $scope.group = {};
        $scope.group.type = "user";
        $scope.search='';

        $scope.groupList=[];
        $scope.selectedGroup={}; 


        $scope.groupTypeChanged = function(){
                $scope.group.definition = [];
                $scope.group.workflow = ' ';                
        }

        $scope.formatResult = function (data) {
                var markup = "<div>" + data.v + "</div>";
                return markup;}

        $scope.formatSelection = function (data) {
                return data.v ;}

        $scope.groupBar = {
                placeholder: "Please select...",
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
                                        selected: $scope.group.definition, //selected values
                                        suggestionFor: $scope.group.type, // suggestions for
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

        $scope.groupWorkflow = {
                placeholder: "Please select...",
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
                                        selected: '', //selected values
                                        suggestionFor: 'workflow', // suggestions for
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

        $scope.create = function(group){
                $scope.groupCreateLoader = true;
                var promise = groupService.create(group);
                promise.then(function(msg){
                                $scope.getGroupList($scope.search);
                                flash.pop({title: 'Success', body: msg.msg, type: 'success'});
                                $location.path("/group/"+ msg.id);
                                $scope.groupCreateLoader = false;
                            },
                        function(msg){
                             $scope.groupCreateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }
        
        $scope.checkWorkflow = function(data){
                if ($scope.group.type==='account'){
                        if(data.target.value != ""){
                                var accountList = data.target.value.split(',');                                
                                var account = accountList[accountList.length - 1];
                                $scope.checkWorkflowForAccount(account);
                        }                        
                }
        }


        $scope.checkWorkflowForAccount = function(account){
                var promise = groupService.checkWorkflow({"id":account,"for":"account"});
                promise.then(function(data){
                                        if(data.type == 1){
                                                flash.pop({title: 'Alert', body: "This account has already attached with other workflow.", type: 'error'});
                                                angular.forEach($scope.group.definition, function(i,j){  // loop over otherFields lists with i as object from list and j as index of that object
                                                        if(i.id === account){  // check if other fields object is same as selectedOtherField
                                                                var restArr = _.without($scope.group.definition,i); // remove that object from otherFields using index
                                                                $scope.group.definition = [];
                                                                $scope.group.definition = restArr;
                                                        }
                                                });
                                         }
                                        else
                                                return;
                                },
                                function(data){
                                        flash.pop({title: 'Alert', body: data, type: 'error'});
                                }
                );
        }

        $scope.searchGroup = function() {
                $scope.getGroupList($scope.search);
        };

        $scope.getGroupList = function(q){
                $scope.groupListLoader = true;   
                var promise = groupService.list({suggestionFor:'group', q:q, pageLimit:20,page:1});
                promise.then(function(result){
                                $scope.groupList = result;
                                $scope.groupListLoader = false;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                                $scope.groupListLoader = false;
                        }
                );
        }

        $scope.getTotalGroup = function(){
                var promise = groupService.totalGroup({countFor:'group'});
                promise.then(function(result){
                                $scope.totalGroup = result.count;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }
  
        $scope.loadMore = function() {
                if(moreGroups){
                        $scope.loadingMore = true;
                        var promise = groupService.list({suggestionFor:'group', q:'', pageLimit:20, page:counter});
                        promise.then(function(result){
                                        if (result.length === 0)
                                                moreGroups = false;
                                        counter += 1;
                                        $scope.loadingMore = false;
                                        $scope.groupList = $scope.groupList.concat(result);},
                                function(result){
                                        $scope.loadingMore = false;
                                }
                        );
                }
        }

        $scope.selectGroup = function(value){
                $scope.groupDetailLoader = true;
                var promise = groupService.read(value);
                promise.then(function(result){
                                $scope.groupDetailLoader = false;
                                $scope.group = result;                           
                        },
                        function(result){
                                $scope.groupDetailLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
               // $scope.loading = false;
        }

        $scope.editGroup= function(){           
               // $scope.group = $scope.group;              
        }

        $scope.updateGroup = function(group){
                $scope.groupUpdateLoader = true;
                var promise = groupService.update(group);
                promise.then(function(msg){                     
                                $scope.getGroupList($scope.search);
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.groupUpdateLoader = false;
                                $location.path("/group/"+ $routeParams.groupId);
                            }   ,
                        function(msg){
                                $scope.groupUpdateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }

        $scope.initializeGroup=function(){
                $scope.group = {};
        }

        $scope.confirmDeleteGroup = function() {               
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
                        }, {resolve: {item: function(){return angular.copy(true);}}}))
                .open()
                .then(function(result) {                
                if(result) {                        
                        // console.log(result); // user has clicked save ..   
                        $scope.delete();                                                                    
                }
                else
                {                  
                        
                        return;// console.log("close");                                       
                }                
            });          
                // Code Dialog End

        };

        $scope.delete = function(){
                $scope.groupUpdateLoader = true;
                var promise = groupService.delete($routeParams.groupId);
                promise.then(function(result){
                                $scope.groupUpdateLoader = false;      
                                $scope.getGroupList($scope.search);                                
                                flash.pop({title: 'Success', body: result, type: 'success'});                                
                                $location.path("/group");
                        },
                        function(result){
                                $scope.groupUpdateLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );               
        }

        $scope.backToDetails = function(){
                $scope.getGroupList($scope.search);                                
                $location.path("/group/"+ $routeParams.groupId);
        }

        $scope.backToList = function(){
                $scope.getGroupList($scope.search);                                
                $location.path("/group");
        }


        if($route.current.name == "group.edit"){
                $scope.getGroupList($scope.search);
                $scope.getTotalGroup();
                $scope.selectGroup($routeParams.groupId);
                $scope.editGroup($routeParams.groupId);
        }
        else if($route.current.name == "group.detail"){
                $scope.getGroupList($scope.search);
                $scope.getTotalGroup();
                $scope.selectGroup($routeParams.groupId);
        }
        else
        {
                $scope.getGroupList($scope.search);
                $scope.getTotalGroup();
        }

        $scope.loading = false;
});