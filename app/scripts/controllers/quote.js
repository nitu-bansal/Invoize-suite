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
                                scope.$apply(function(){
                                        scope.workflow.definition[level][i]["c"] = count;
                                });
                        }
                }
        }
        else{
                scope.$apply(function(){
                        scope.workflow.definitionCount[level]=count;
                })
        }
        console.log("after update");
        console.log(scope);
}


angularApp.controller('quoteCtrl', function($scope,$http,$location,$stateParams,$state,$routeParams,$route,quoteService,flash){
        var counter = 2;
        var accountCounter = 2;
        var moreAccounts = true;
        $scope.ratesAvailable = false;
        $scope.search='';
        $scope.selectionList = [];
        $scope.searchBarValue=[];
        $scope.selection = {};
        $scope.selectedQuoteType = {};
        $scope.currentRateQualifier = [];
        $scope.quoteDefinitions = {};        
        $scope.isCollapsed = false;
        $scope.selectedAccount;
        $scope.selectedChrgDefn ;
        $scope.defaultFields={};        
        $scope.chargeType = [{id:"Freight",val:"Freight"},{id:"Fuel Surcharge",val:"Fuel Surcharge"},{id:"Pickup Surcharge",val:"Pickup Surcharge"},{id:"Brokerage or Duty",val:"Brokerage or Duty"},{id:"Stamp Fee",val:"Stamp Fee"}];
        $scope.rateQualifier = [{id:"Per Inch",val:"Per Inch"},{id:"Per Kilograms",val:"Per Kilograms"},{id:"Per Kilometer",val:"Per Kilometer"},{id:"Per Kilotons",val:"Per Kilotons"},{id:"Per Pound Per Article",val:"Per Pound Per Article"},{id:"Per Pound",val:"Per Pound"}];
        $scope.weightBracketFields = [];

        var counter = 2;                
        $scope.workflow = {};
        $scope.workflow.definition = [];
        $scope.workflowDefinitions = [{}];
        $scope.workflow.definitionCount = ['*'];  

        $scope.quoteEmail={};

        $scope.newQuoteDefn =function(){
            $scope.getLaneParameter(); 
            $scope.getQuoteDefnEffctBase();
            $scope.getQuoteDefnGroup();            
        }

        $scope.itemChanged = function(e) {
                var hasAccount=false;
                console.log(e.target.value.split(','));
                for (var i=0; i<e.target.value.split(',').length;i++){
                        if(e.target.value.split(',')[i] === "Account"){
                                hasAccount=true;                                
                        }   

                }
                if (!hasAccount){
                     $scope.searchBarValue   =[];
                     $location.path("quote"); 
                     $scope.toggleCollapse(false)                   

                }                     
        };
        $scope.selectAccount = function (value) {
                $scope.selectedAccount=value;
                localStorage.currentAccoutName=value;
                
        }
        $scope.selectQuoteDefn = function (value) {   
                // $scope.weightBracketFields = [[{sph:"0",eph:"*"}],[{sph:"0",eph:"*"}],[{sph:"0",eph:"*"}]];             
                $scope.selectedChrgDefn=value;
                localStorage.currentQuoteName=value;               
                $location.path("quote/search/"+$routeParams.accountId+"/"+value);                

        }       

        $scope.searchFor = function(k,param,accountId,templateId) {
                //$scope.toggleList();
                var searchBarValue = [];
                
                angular.forEach($scope.searchBarValue, function(i,j){  // loop over otherFields lists with i as object from list and j as index of that object
                        if(i.id === k)  // check if other fields object is same as selectedOtherField
                            $scope.searchBarValue.splice(j,1); // remove that object from otherFields using index
                 });
                searchBarValue = $scope.searchBarValue;
                searchBarValue = searchBarValue.concat([{id:k,v:param,n:k}]);
                $scope.searchBarValue = searchBarValue;
                $scope.searchQuote(searchBarValue,accountId,templateId);
        };

        $scope.toggleCollapse = function (t) {
              
                 $scope.isCollapsed = t;
        }       
        $scope.updateSearchBar = function (k,param,id) {              
            

        }     
        $scope.formatAccResult = function (data) {
              
                if(data.g === "group")
                        var markup = "<div><i class='icon-group'></i>  " + $scope.toHumanReadable(data.v) + "</div>";
                else
                        var markup = "<div><i class='icon-user'></i>  " + $scope.toHumanReadable(data.v) + "</div>";
                return markup;
            }

        $scope.formatAccSelection = function (data) {
           
                if(data.g === "group")
                        return "<i class='icon-group'></i>  "+$scope.toHumanReadable(data.v);
                else
                        return "<i class='icon-user'></i>  "+$scope.toHumanReadable(data.v);
                }
        $scope.accountBar = {
                placeholder: "Please select..",
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
                                        selected: $scope.selectedAccount, //selected values
                                        suggestionFor: "account", // suggestions for
                                        //   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
                                };
                        },
                        results: function (data, page) {
                                var data = data;                             
                                data.total = 100;
                                if(data.msg.length < 10)
                                        var more = false;
                                else
                                        var more = (page * 10) < data.total;
                                return {results: data.msg, more: more};
                        }
                },
                initSelection : function (element, callback) {
                        callback($(element).data('$ngModelController').$modelValue);
                },
                
                formatResult: $scope.formatAccResult, // omitted for brevity, see the source of this page
                formatSelection: $scope.formatAccSelection, // omitted for brevity, see the source of this page
                dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
        };



        $scope.weightBracketCallback = function(field,parentIndex,index) {                
                if($scope.weightBracketFields[parentIndex][index][field])
                {
                        if(field === "e" && $scope.weightBracketFields[parentIndex].length === index+1)
                        {
                                if($scope.weightBracketFields[parentIndex][index].e != "*")
                                {
                                        var difference = parseInt($scope.weightBracketFields[parentIndex][index].e) - parseInt($scope.weightBracketFields[parentIndex][index].s);
                                        var start = parseInt($scope.weightBracketFields[parentIndex][index].e);
                                        var end = start + difference;
                                        $scope.weightBracketFields[parentIndex].push({sph:start,eph:end+" or *"});
                                }
                        }
                }
                else
                {
                        if(index === 0 || field === 's')
                                $scope.weightBracketFields[parentIndex][index][field] = $scope.weightBracketFields[parentIndex][index][field+"ph"];
                        else if(field === 'e' && $scope.weightBracketFields[parentIndex].length === index+1)
                        {
                                if($scope.weightBracketFields[parentIndex][index].e != "*")
                                {
                                        $scope.weightBracketFields[parentIndex][index][field] = parseInt($scope.weightBracketFields[parentIndex][index].s) + parseInt($scope.weightBracketFields[parentIndex][index-1].e) - parseInt($scope.weightBracketFields[parentIndex][index-1].s);
                                        var difference = parseInt($scope.weightBracketFields[parentIndex][index].e) - parseInt($scope.weightBracketFields[parentIndex][index].s);
                                        var start = parseInt($scope.weightBracketFields[parentIndex][index].e);
                                        var end = start + difference;
                                        $scope.weightBracketFields[parentIndex].push({sph:start,eph:end+" or *"});
                                }
                        }
                }
        };



       
        $scope.removeFromWeightBracketFields = function(parentIndex,idx) {
                // This function is used to remove fields from weightBracketFields
                $scope.weightBracketFields[parentIndex].splice(idx, 1);  // delete form field from weightBracketFields object using fields index
        };        

        $scope.appendToList = function(v) {                
                // This function is used to append fields into new rate request from
                // selectedOtherField is in template used for select box ng-model name                
                
             
                if($scope.defaultFields.selectionCriteria){
                     if (v.length>0)
                     {
                         var v;                    
                         eval("v="+v);
                            $scope.defaultFields.selectionCriteria.push(v);
                            $scope.currentSelectedField=[];                           
                    }
                }
                
       };


        $scope.formatResult = function (data) {
                var markup = "<div>" + $scope.toHumanReadable(data.id) + " : " + data.v + "</div>";
                return markup;}

        $scope.formatSelection = function (data) {
                return $scope.toHumanReadable(data.id) + " : " + data.v;}

        $scope.searchBar = {
                placeholder: "Search for a Rates",
                minimumInputLength: 1,
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
                                        suggestionFor: "quote", // suggestions for
                                        //   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
                                };
                        },
                        results: function (data, page) {
                                var data = data
                                // {"data":[{"id":"origin","val":"SFO"},{"id":"Destination","val":"SFO"},{"id":"Service Type","val":"SFO"},{"id":"origin","val":"LAX"},{"id":"Destination","val":"LAX"},{"id":"Service Type","val":"LAX"}]}
                                data.total = 100;
                                if(data.msg.length < 10)
                                        var more = false
                                else
                                        var more = (page * 10) < data.total; // whether or not there are more results available

                                // notice we return the value of more so Select2 knows if more results can be loaded
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

        $scope.selectQuote = function(value){
                var promise = quoteService.read(value);
                promise.then(function(result){
                                $scope.selectedQuote = result;},
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }


        if($routeParams.quoteId)
                $scope.selectQuote($routeParams.quoteId);
                // else
                //   $scope.getAccountList()

        $scope.searchQuote = function(value,accountId,templateId){               
                
                if(templateId=== undefined )
                {
                   templateId=""; 
                }
                localStorage.searchBarvals=JSON.stringify($scope.searchBarValue);                
                $scope.list = [];
                $scope.ratesAvailable = false;              
                counter = 2;
                $location.path("quote/search/"+accountId+"/"+templateId);
                $scope.loadingRates = true;
                var promise = quoteService.quoteList({"accountId":accountId,"quoteDefnId":templateId,selected:value,pageLimit:10,page:1});
                promise.then(function(result){
                                $scope.loadingRates = false;
                                $scope.list = result;
                                if(!result.length){
                                        $scope.ratesAvailable = true;
                                       // flash.pop({title: 'Alert', body: "No Rates available for this search..!", type: 'error'});
                                        }
                                    },
                        function(result){
                                $scope.loadingRates = false;
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );

        }

  
        $scope.loadMore = function(accountId,templateId) {
                $scope.loadingRates = true;
                var promise = quoteService.quoteList({"accountId":accountId,"quoteDefnId":templateId,selected:$scope.searchBarValue,pageLimit:10,page:counter});
                promise.then(function(result){
                                counter += 1;
                                $scope.loadingRates = false;
                                $scope.list = $scope.list.concat(result);
                                },
                        function(result){
                                $scope.loadingRates = false;
                        }
                );
        }

        $scope.create = function(quote,weightBracket,currentRateQualifier,accountId,quoteDefnId,workflow,quoteEmail){                
                var promise = quoteService.create({"selection":quote , "weightBracket" : weightBracket,"rateQualifier":currentRateQualifier,"accountId":accountId,"quoteDefnId":quoteDefnId,"chargeType":$scope.defaultFields.chargeType,"workflow":workflow,"quoteEmail":quoteEmail});
                promise.then(function(msg){
                                flash.pop({title: 'Success', body: msg, type: 'success'});},
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }
        $scope.createQuoteDefn = function(quoteDefn,accountId){                
                var promise = quoteService.createQuoteDefinition({"quoteDefn":quoteDefn , "accountId" : accountId});
                promise.then(function(msg){
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.getQuoteDefs($routeParams.accountId); 
                                $location.path("quote");
                            },

                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }

        $scope.searchAccount = function() {
                $scope.getAccountCodeList($scope.search);
        };
        
        $scope.getAccountCodeList = function(q){      
                $scope.accountListLoader = true;     
                var promise = quoteService.list({suggestionFor:'account', q:q, pageLimit:20,page:1});
                promise.then(function(result){
                                $scope.accountList = result;
                                $scope.accountListLoader = false;     
                        },
                        function(result){
                                $scope.accountListLoader = false;     
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.loadMoreAccounts = function() {
                if(moreAccounts){
                        $scope.loadingMoreAccounts = true;
                        var promise = quoteService.list({suggestionFor:'account', q:'', pageLimit:20, page:accountCounter});
                        promise.then(function(result){
                                        if (result.length === 0)
                                                moreAccounts = false;
                                        accountCounter += 1;
                                        $scope.loadingMoreAccounts = false;
                                        $scope.accountList = $scope.accountList.concat(result);},
                                function(result){
                                        $scope.loadingMoreAccounts = false;
                                }
                        );
                }
        }

        $scope.getCount= function(){           
                var promise = quoteService.rateRequestCount();
                promise.then(function(result){
                                $scope.rateRequestCount = result;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

         $scope.getTemplate=function (accountId,templateId) {
            $location.path("quote/new/"+$routeParams.accountId+"/"+templateId);     
            $scope.initializeData();      
            $scope.getDefaultFieldsList(templateId);            
         }
         $scope.getQuoteDefs=function (accountId) {             
            $scope.quoteDefinitions={};
            $scope.quoteDefnListLoader = true;
             //$location.path("rate/"+accountId+"/template");          
             var promise = quoteService.getQuoteDefinitions(accountId);
                promise.then(function(result){                               
                                $scope.quoteDefinitions=result;
                                $scope.quoteDefnListLoader = false;
                                                           
                                },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
         }

         $scope.getDefaultFieldsList = function(templateId){                     
                var promise = quoteService.defaultFieldsList(templateId);
                promise.then(function(result){
                                $scope.defaultFields = result;
                                $scope.appendFromSearchBar();
                                $scope.defaultFields.chargeType.forEach(function(i){  // loop over otherFields lists with i as object from list and j as index of that object
                                        $scope.weightBracketFields.push([{sph:"0",eph:"*"}]);
                                        $scope.currentRateQualifier.push({});                                        
                                    });                                 
                                },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        };
        
        $scope.getLaneParameter = function(){
                var promise = quoteService.laneParameter({suggestionFor:'selectionCriteria', q:'', pageLimit:10,page:1});
                promise.then(function(r){       
                                                      
                                $scope.laneParameterList = r;                              
                        },
                        function(r){
                                flash.pop({title: 'Alert', body: r, type: 'error'});
                        }
                );
        };
        

        $scope.getQuoteDefnGroup = function(){ //need to update suggestion for when API is ready
                var promise = quoteService.quoteDefnGroups({suggestionFor:'selectionCriteria', q:'', pageLimit:10,page:1});
                promise.then(function(r){   
                               
                                $scope.quoteDefnGroup = r;                              
                        },
                        function(r){
                                flash.pop({title: 'Alert', body: r, type: 'error'});
                        }
                );
        };

        $scope.getQuoteDefnEffctBase = function(){ //need to update suggestion for when API is ready
                var promise = quoteService.quoteDefneffectiveBase({suggestionFor:'selectionCriteria', q:'', pageLimit:10,page:1});
                promise.then(function(r){   
                                                         
                                $scope.quoteDefnEffectiveBase = r;                              
                        },
                        function(r){
                                flash.pop({title: 'Alert', body: r, type: 'error'});
                        }
                );
        };
        
        $scope.formatFieldsResult = function (data) {                
                  return "<div class='itemNew'><b>" + $scope.toHumanReadable(data.n) + "</b></div>";       
        }

        $scope.formatFieldselection = function (data) {
                  return "<div>" + $scope.toHumanReadable(data.n) + "</div>";
        }
            
        $scope.appendFromSearchBar = function() {
             if ($scope.defaultFields)
                {              
            
                angular.forEach($scope.searchBarValue, function(i,j){ 
                        var fieldToAdd=i.n;   
                        var hasField=false;
                                angular.forEach($scope.defaultFields, function(obj,k){                                                
                                        if (obj.n === fieldToAdd) {
                                                obj.v=i.v;
                                                hasField=true;   
                                                $scope.selection[obj.n]=obj.v;                                                                       
                                        }
                                });

                                if (fieldToAdd==="quote Type")
                                {
                                    $scope.selectedQuoteType=i.v;                                    
                                    hasField=true;
                                }
                                if(hasField===false && i.n!="quoteDefn"&& i.n!="Account"){                                     
                                   i.n=$scope.toHumanReadable(i.n);                           
                                   $scope.defaultFields.push(i);    
                                   $scope.selection[i.n]=i.v;                                      
                                }                        
                        });
                }  
        };        
        

        

        $scope.workflowDefinitionsCallback = function(index) {
                if($scope.workflowDefinitions.length == index+1){                        
                        $scope.workflowDefinitions.push({});
                        $scope.workflow.definitionCount.push('*');
                }
                if($("div[style$='display: none;']","#workflowLevel"+index).length==$("div","#workflowLevel"+index).length){                        
                        $("div:last-child","#workflowLevel"+index).show();
                        if($scope.workflow.definition[index].length == 1)
                                $scope.workflow.definitionCount[index] = "*";
                        else
                                $scope.workflow.definitionCount[index] = $scope.workflow.definition[index].length - 1;                                
                }
        };

        $scope.removeFromWorkflowDefinitions = function(idx) {                
                console.log(idx);
                $scope.workflow.definitionCount.splice(idx, 1);    
                $scope.workflow.definition.splice(idx, 1);
                $scope.workflowDefinitions.splice(idx, 1);                
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
                        var str = "<span><i class='icon-group'></i>  "  + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v)  + str2 + "</span> ";
                        return str
               }
                else
                        return "<span><i class='icon-user'></i>  " + $scope.toHumanReadable(data.n) + " : " + $scope.toHumanReadable(data.v) + "</span>";
        }

        $scope.userGroupBar = {
                placeholder: "Add User or Role or Group",
                minimumInputLength: 0,
                multiple:true,
                ajax: {
                        method: 'POST',
                        url: "/api/list/suggestion/",
                        dataType: 'json',
                        quietMillis: 100,
                        data: function (term, page) {
                                return {
                                        q: term,
                                        pageLimit: 10,
                                        page: page,
                                        selected: $scope.searchBarValue,
                                        suggestionFor: "workflowDefinition",
                                        
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
                formatResult: $scope.formatResult,
                formatSelection: $scope.formatSelection,
                dropdownCssClass: "bigdrop",
                escapeMarkup: function (m) { return m; }
        };        

        $scope.userBar = {
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
                                        selected: $scope.searchBarValue, //selected values
                                        suggestionFor: "user", // suggestions for                                        
                                };
                        },
                        results: function (data, page) {
                                var data = data;                                
                                data.total = 100;                                
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


        $scope.initializeData= function () {
                $scope.workflow = {};
                $scope.workflow.definition = [];
                $scope.workflowDefinitions = [{}];
                $scope.workflow.definitionCount = ['*'];
                $scope.weightBracketFields = [];
                $scope.defaultFields={};
        }

        if($route.current.name === 'quote.template'){
            $scope.getLaneParameter(); 
            $scope.getQuoteDefnEffctBase();
            $scope.getQuoteDefnGroup();
        }

        else if($route.current.name === 'quote.search'){                            
                $scope.selectedAccount= localStorage.currentAccoutName; 
                $scope.searchBarValue= eval(localStorage.searchBarvals);//[{"id":"Account","v":localStorage.currentAccoutName,"n":"Account"}];
                      
                if ($routeParams.quoteTemplateId){                        
                        $scope.toggleCollapse(true);
                        $scope.getQuoteDefs($routeParams.accountId);     
                }
                else{                        
                        $scope.toggleCollapse(true); 
                        $scope.getQuoteDefs($routeParams.accountId);
                        $scope.searchQuote($scope.searchBarValue,$routeParams.accountId,$routeParams.quoteTemplateId);
                }
                
        }
        else if($route.current.name === 'quote.new'){            
            $location.path("quote/new/"+$routeParams.accountId+"/"+$routeParams.quoteTemplateId);                     
            $scope.initializeData();          
            $scope.searchAccount();
            $scope.selectedAccount= localStorage.currentAccoutName;            
            $scope.searchBarValue= eval(localStorage.searchBarvals);
            $scope.toggleCollapse(true);
            $scope.getQuoteDefs($routeParams.accountId);            
            $scope.getDefaultFieldsList($routeParams.quoteTemplateId);  
            
        }       
        else $scope.getAccountCodeList($scope.search); 
        $scope.loading = false;

});