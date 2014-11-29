'use strict';
var toggle = function(o,level){
        $(o).hide();
        var count;
        var n;
        var v;
   
        if($(o).next().length==1){
                $(o).next().show();
                count = $(o).next().attr("count");
                n = $(o).next().attr("n");
                v = $(o).next().attr("v");
        }
        else
        {
                if(level == undefined)
                {
                        var firstChield = $(":first-child",$(o).parent());
                        firstChield.next().show();
                        // $(":first-child",$(o).parent()).show();
                        count = firstChield.next().attr("count");
                        n = firstChield.next().attr("n");
                        v = firstChield.next().attr("v");
                        console.log(count);
                }
                else
                {
                        $(":first-child",$(o).parent()).show();
                        count = $(":first-child",$(o).parent()).attr("count");
                        n = $(":first-child",$(o).parent()).attr("n");
                        v = $(":first-child",$(o).parent()).attr("v");
                        console.log(count);
                }
        }

        var scope = angular.element($(o)).scope();
        console.log("before update")
        console.log(scope);

        if(level == undefined){
                level = parseInt($(o).parent().parent().parent().parent().parent().attr("id").slice(15))-1;
                console.log($(o).parent().parent().parent().parent().parent().attr("id"));
                for(var i=0;i<scope.workflow.definition[level].length;i++){
                        if (scope.workflow.definition[level][i]["n"]==n && scope.workflow.definition[level][i]["v"]==v)
                        {
                                //scope.workflow.definition[level][i]["c"] = count;
                                scope.$apply(function(){
                                        scope.workflow.definition[level][i]["c"] = count;
                                });
                        }
                }
        }
        else{
                //scope.workflow.definitionCount[level]=count;
                scope.$apply(function(){
                        scope.workflow.definitionCount[level]=count;
                })
        }
        console.log("after update");
        console.log(scope);
        // console.log(scope.workflow);
        // console.log(level +"+++++++"+ count);
}

angularApp.controller('workflowCtrl', function($scope,$http,$location,$compile,$stateParams,$route,$routeParams,$modal,$dialog,workflowService,flash){
        var counter = 2;
        var moreWorkflows = true;
        $scope.totalWorkflow = 0;
        $scope.workflow = {};
        $scope.workflow.definition = [];
        $scope.workflowDefinitions = [{}];
        $scope.workflow.definitionCount = ['*'];
        $scope.selectedWorkflow = {};
        $scope.search='';

        $scope.workflowDefinitionsCallback = function(index) {
                if($scope.workflowDefinitions.length == index+1){                        
                        $scope.workflowDefinitions.push({});
                        $scope.workflow.definitionCount.push('*');
                }
                // console.log(Object.keys($scope.workflow.definition).length);
                if($("div[style$='display: none;']","#workflowLevel"+index).length==$("div","#workflowLevel"+index).length){                        
                        $("div:last-child","#workflowLevel"+index).show();
                        if($scope.workflow.definition[index].length == 1)
                                $scope.workflow.definitionCount[index] = "*";
                        else
                                $scope.workflow.definitionCount[index] = $scope.workflow.definition[index].length - 1;
                                //console.log($("div[style$='display: none;']","#workflowLevel"+index).length);
                }
        };
        
        $scope.removeFromWorkflowDefinitions = function(idx) {
                // This function is used to remove fields from weightBracketFields
                console.log(idx);
                $scope.workflow.definitionCount.splice(idx, 1);    
                $scope.workflow.definition.splice(idx, 1);
                $scope.workflowDefinitions.splice(idx, 1);  // delete form field from weightBracketFields object using fields index
                // delete $scope.workflow.definition[Object.keys($scope.workflow.definition).length - 1];
        }; 

        $scope.formatResult = function (data) {
                if(data.g === "group" || data.n === "group" || data.n === "role")
                        var markup = "<div><i class='icon-group'></i>  " + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v)  + "</div>";
                else
                        var markup = "<div><i class='icon-user'></i>  " + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v) + "</div>";
                return markup;
        }

        $scope.formatSelection = function (data) {
                if(data.g === "group" || data.n === "group" || data.n === "role") {
                        // return  "<span><i class='icon-group'></i>  "  + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v)  + " <div style='cursor: pointer;' onclick='toggle(this)' n='"+data.n+"' v='"+data.v+"' count='1' class='help-inline label btn-primary'>Any 1</div><div style='cursor: pointer;display:none;' onclick='toggle(this)' n='"+data.n+"' v='"+data.v+"' count='2' class='help-inline label btn-primary'>Any 2</div><div style='cursor: pointer; display:none;' onclick='toggle(this)' n='"+data.n+"' v='"+data.v+"' count='*' class='help-inline label btn-primary'>All</div></span>";
                        var arr = _.range(data.tc)
                        var str2 = ""
                        if(data.c != "*")
                                data.c = parseInt(data.c);
                        arr.forEach(function(element, index){
                                var counter = element+1
                                if(data.c === counter)
                                        str2 += "<div style='cursor: pointer;' onclick='toggle(this)' n='"+data.n+"' v='"+data.v+"' count='"+ counter +"' class='help-inline label btn-primary'>Any "+ counter +"</div>";
                                else if(data.tc >  counter )
                                        str2 += "<div style='cursor: pointer;display:none;' onclick='toggle(this)' n='"+data.n+"' v='"+data.v+"' count='"+ counter +"' class='help-inline label btn-primary'>Any "+ counter +"</div>";
                                else if(data.c === "*")
                                        str2 += "<div style='cursor: pointer;' onclick='toggle(this)' n='"+data.n+"' v='"+data.v+"' count='*' class='help-inline label btn-primary'>All</div>";
                                else
                                        str2 += "<div style='cursor: pointer;display:none;' onclick='toggle(this)' n='"+data.n+"' v='"+data.v+"' count='*' class='help-inline label btn-primary'>All</div>";
                        });
                        // console.log(str2);
                        var str = "<span><i class='icon-group'></i>  "  + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v)  + str2 + "</span> ";
                        return str
               }
                else
                        return "<span><i class='icon-user'></i>  " + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v) + "</span>";
        }

        // $scope.asdf = $compile('<div ng-click="showHide=!showHide" class="help-inline"><div style="cursor: pointer;" ng-show="!!showHide" ng-model="workflow.select" class="label">ANY</div><div style="cursor: pointer;" ng-hide="!!showHide" ng-model="workflow.select" class="label">ALL</div></div>')( $scope );
        $scope.userGroupBar = {
                placeholder: "Add User or Role or Group",
                minimumInputLength: 0,
                multiple:true,
                ajax: {
                        method: 'POST',
                        url: "/api/list/suggestion/",
                        dataType: 'json',
                        quietMillis: 100,
                        data: function (term, page) { // page is the one-based page number tracked by Select2
                                return {
                                        q: term, //search term
                                        pageLimit: 10, // page size
                                        page: page, // page number
                                        selected: $scope.searchBarValue, //selected values
                                        suggestionFor: "workflowDefinition", // suggestions for
                                        //   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
                                };
                        },
                        // results: function (data, page) {
                        //         var data = {"total":100,"data":[{"n":"User","v":"Rupesh Tare","id":"111","c":"1"},{"n":"User","v":"Avinash Keshri","id":"112","c":"1"},{"n":"User","v":"Satish Vagadia","id":"114","c":"1"},{"n":"User","v":"Murtaza Husain","id":"115","c":"1"},{"n":"Group","v":"Central Pricing Team","id":"16","c":"1"},{"n":"Group","v":"Sales Team","id":"17","c":"1"},{"n":"Role","v":"Account Manager","id":"8","c":"1"},{"n":"Role","v":"Regional Manager","id":"90","c":"1"}]}
                        //         var more = (page * 10) < data.total; // whether or not there are more results available

                        //         // notice we return the value of more so Select2 knows if more results can be loaded
                        //         return {results: data.data, more: more};
                        // }
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

        $scope.searchWorkflow = function() {
                $scope.getWorkflowList($scope.search);
        };

        $scope.getWorkflowList = function(q){
                $scope.workflowLisLoader = true;
                var promise = workflowService.list({suggestionFor:'workflow', q:q, pageLimit:20,page:1});
                promise.then(function(result){
                                $scope.workflowLisLoader = false;
                                $scope.workflows = result;
                        },
                        function(result){
                                $scope.workflowLisLoader = false;
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }

        $scope.getTotalWorkflow = function(){
                var promise = workflowService.totalWorkflow({countFor:'workflow'});
                promise.then(function(result){
                                $scope.totalWorkflow = result.count;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }
  
        $scope.loadMore = function() {
                if(moreWorkflows){
                        $scope.loadingMore = true;
                        var promise = workflowService.list({suggestionFor:'workflow', q:'', pageLimit:20, page:counter});
                        promise.then(function(result){
                                        if (result.length === 0)
                                                moreWorkflows = false;
                                        counter += 1;
                                        $scope.loadingMore = false;
                                        $scope.workflows = $scope.workflows.concat(result);},
                                function(result){
                                        $scope.loadingMore = false;
                                }
                        );
                }
        }

        $scope.selectWorkflow = function(value){
                $scope.workflowDetailLoader = true;
                var promise = workflowService.read(value);
                promise.then(function(result){
                                $scope.workflowDefinitions = [];
                                $scope.workflow = result;
                                result.definitionCount.forEach(function (i){
                                        $scope.workflowDefinitions.push({})                                    
                                })
                                $scope.workflowDetailLoader = false;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                                $scope.workflowDetailLoader = false;
                        }
                );
        }

        $scope.editWorkflow = function(value){
                // $scope.workflow = $scope.selectedWorkflow;
                // $scope.workflowDefinitions = $scope.workflow.definitionCount;
        }      

        $scope.confirmDeleteWorkflow = function() {
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
                        }, {resolve: {item: function() {return angular.copy(true);}}}))
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
                console.log("delete..");
                $scope.workflowUpdateLoader = true;
                var promise = workflowService.delete($routeParams.workflowId);
                promise.then(function(msg){
                                $scope.getWorkflowList($scope.search);
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.workflowUpdateLoader = false;
                                $location.path("/workflow");  
                        },
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                                $scope.workflowUpdateLoader = false;
                        }
                );
        }
      
        $scope.create = function(workflow){
                $scope.workflowCreateLoader = true;
                var promise = workflowService.create(workflow);
                promise.then(function(msg){
                                $scope.getWorkflowList($scope.search);
                                flash.pop({title: 'Success', body: msg.msg, type: 'success'});
                                $scope.workflowCreateLoader = false;
                                $location.path("/workflow/"+ msg.id);
                        },
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                                $scope.workflowCreateLoader = false;
                        }
                );
        }

        $scope.updateWorkflow = function(workflow){
                $scope.workflowUpdateLoader = true;
                var promise = workflowService.update(workflow);
                promise.then(function(msg){
                                $scope.workflowUpdateLoader = false;
                                $scope.getWorkflowList($scope.search);
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $location.path("/workflow/"+ $routeParams.workflowId);
                            },

                        function(msg){
                                $scope.workflowUpdateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }
        
        $scope.initializeWorkflow= function () {
                $scope.workflow = {};
                $scope.workflow.definition = [];
                $scope.workflowDefinitions = [{}];
                $scope.workflow.definitionCount = ['*'];
        }

        $scope.deleteWorkflow = function(){                
                $scope.workflowUpdateLoader = true;
                var promise = workflowService.delete($routeParams.workflowId);
                promise.then(function(msg){
                                $scope.getWorkflowList($scope.search);
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.workflowUpdateLoader = false;
                        },
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                                $scope.workflowUpdateLoader = false;
                        }
                );
        }

        $scope.backToDetails = function(){
                $scope.getWorkflowList($scope.search);
                $scope.getTotalWorkflow();                                
                $location.path("/workflow/"+ $routeParams.workflowId);
        }

        $scope.backToList = function(){
                $scope.getWorkflowList($scope.search);
                $scope.getTotalWorkflow();                                
                $location.path("/workflow");
        }

        if($route.current.name == "workflow.edit"){
                $scope.getWorkflowList($scope.search);
                $scope.getTotalWorkflow();
                $scope.selectWorkflow($routeParams.workflowId);
                $scope.editWorkflow($routeParams.workflowId);
        }
        else if($route.current.name == "workflow.detail"){
                $scope.getWorkflowList($scope.search);
                $scope.getTotalWorkflow();
                $scope.selectWorkflow($routeParams.workflowId);
        }
        else{
                $scope.getWorkflowList($scope.search);
                $scope.getTotalWorkflow();
        }

        $scope.loading = false;
});