'use strict';
angularApp.controller('roleCtrl', function($scope,$http,$location,$routeParams,$route,$dialog,$stateParams,roleService,permissionService,flash){  
        var counter = 2;
        var moreRoles = true;
        $scope.totalRole = 0;
        $scope.roleList = [];
        $scope.role = {};  
        $scope.search='';
        $scope.role.definition=[];

       
        $scope.createPermission = function(permission){               
             
                var promise = permissionService.create(permission);
                promise.then(function(result){                               
                                console.log('success');
                                flash.pop({title: 'New permission Addded', body: result.msg, type: 'success'});                                                    
                        },
                        function(result){
                            var restArr=_.initial($scope.role.definition);
                            $scope.role.definition=[];   
                            $scope.role.definition=restArr; 
                            flash.pop({title: 'permission not created', body: result.msg, type: 'error'}); 
                        }
                );
        }
        

       // Code Dialog Start            
        $scope.showDialog = function(item){    

                if (item.length>0)
                {
                        var tempItem=item[item.length-1];
                        var itemToSend =  {action:tempItem.v,actionCode:"",expiredOn:"",description:"", relatedTo:{}, relatedToList:["Account","User","Permission"]};  //change as per dialog template            
                        var selectionType=tempItem.n;
                        var isSelected=tempItem.s;

                                if (selectionType==='new' && isSelected===""){ 
                                        item[item.length-1].n="added"; 
                                        console.log(itemToSend);
                                        $dialog.dialog(angular.extend(
                                                        {
                                                            controller: 'dialogCtrl',
                                                            templateUrl: 'm.permission.new.html', // change as per the dialog html needed
                                                            backdrop: true  ,
                                                            keyboard: false,
                                                            backdropFade : true,
                                                            dialogFade : true,
                                                            backdropClick: false,
                                                            show: true
                                                        }, 
                                                        {resolve: {item: function() {return angular.copy(itemToSend);}}}))   
                                                        //{resolve: {item: angular.copy(itemToSend)}})) In ver > 0.2.0 they've changed the resolve syntax updated aa above
                                              .open()
                                              .then(function(result) {                                                
                                                if(result) {
                                                        $scope.createPermission(result);                                                       
                                                                                                                          
                                                }
                                                else
                                                {                                               
                                                        var restArr=_.initial($scope.role.definition);
                                                        $scope.role.definition=[];   
                                                        $scope.role.definition=restArr;  
                                                                                             
                                                }
                                                itemToSend = undefined;
                                            });                             
                                }   
                }        
        };
        // Code Dialog End

       

        $scope.getTotalRole = function(){
                var promise = roleService.totalRole({countFor:'role'});
                promise.then(function(result){
                                $scope.totalRole = result.count;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }

        $scope.formatResult = function (data) {                
                if (data.n === "new")
                        var markup = "<div> <button class='btn-success btn-margin'><i class='icon-plus icon-white'></i> Create : \""+ $scope.toHumanReadable(data.v) +"\"</button></div>";
                else
                        var markup = "<div>" + $scope.toHumanReadable(data.v) + "</div>";
                return markup;

        }

        $scope.formatSelection = function (data) {
                return "<div class='itemNew'><b>" + $scope.toHumanReadable(data.v) + "</b></div>";
        }
        
        $scope.roleBar = {
                placeholder: "Add Permission",
                minimumInputLength: 0,
                multiple:true,
                tags: true,
                tokenSeparators: [","],
                createSearchChoice:function(term, data) {
                        if ($(data).filter(function() {                              
                                return this.v.localeCompare(term)===0;
                        }).length===0) {                                                  
                                return {
                                                id: term,
                                                v: term,
                                                n:"new",
                                                s: ""
                                        };
                        }
                },
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
                                        selected: $scope.role.definition, //selected values
                                        suggestionFor: "permission", // suggestions for
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
                
                                return {group: "Groups" ,results: data.msg, more: more}; 
                              
                         
                        }
                },
                initSelection : function (element, callback) {
                        callback($(element).data('$ngModelController').$modelValue);
                },
                formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
                formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
                dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                escapeMarkup: function (m) { return m; } ,// we do not want to escape markup since we are displaying html in results
                // formatNoMatches: function (term) { return '<li class="select2-results-dept-0 select2-result select2-result-unselectable select2-result-with-children"><div class="select2-result-label view-more">Add New</div></li>'; },
                // createSearchChoice : function (term) { return {id: term, v: term}; },
                // $(this).append('<li class="select2-results-dept-0 select2-result select2-result-unselectable select2-result-with-children"><div class="select2-result-label view-more">View More</div></li>');
        };

      
        $scope.create = function(role){
                $scope.roleCreateLoader = true;
                var promise = roleService.create(role);
                promise.then(function(msg){
                                $scope.roleCreateLoader = false;
                                $scope.getRoleList($scope.search);
                                flash.pop({title: 'Success', body: msg.msg, type: 'success'});
                                $location.path("/role/"+ msg.id);                             
                        },
                        function(msg){
                                $scope.roleCreateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }

        $scope.searchRole = function() {
                $scope.getRoleList($scope.search);
        };
       
        $scope.getRoleList = function(q){           
                $scope.roleListLoader = true;
                var promise = roleService.list({suggestionFor:'role', q:q, pageLimit:20,page:1});
                promise.then(function(result){
                                $scope.roleListLoader = false;
                                $scope.roleList = result;
                        },
                        function(result){
                                $scope.roleListLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }
  
        $scope.loadMore = function() {
                if(moreRoles){
                        $scope.loadingMore = true;
                        var promise = roleService.list({suggestionFor:'role', q:'', pageLimit:20, page:counter});
                        promise.then(function(result){
                                        if (result.length === 0)
                                                moreRoles = false;
                                        counter += 1;
                                        $scope.loadingMore = false;
                                        $scope.roleList = $scope.roleList.concat(result);},
                                function(result){
                                        $scope.loadingMore = false;
                                }
                        );
                }
        }

        $scope.selectRole = function(value){
                $scope.roleDetailLoader = true;
                var promise = roleService.read(value);
                promise.then(function(result){
                                $scope.roleDetailLoader = false;
                                $scope.role = result;                           
                        },
                        function(result){
                                $scope.roleDetailLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.editRole = function(){           
               // $scope.role = $scope.selectedRole;              
        }

        $scope.initializeRole=function(){
                $scope.role = {};
        }
       
        $scope.updateRole = function(role){
                $scope.roleUpdateLoader = true;
                var promise = roleService.update(role);
                promise.then(function(msg){
                                $scope.roleUpdateLoader = false;
                                $scope.getRoleList($scope.search);
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $location.path("/role/"+ $routeParams.roleId);                             
                                },
                        function(msg){
                                $scope.roleUpdateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }        

        $scope.confirmDeleteRole = function() {
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
                        },  {resolve: {item: function() {return angular.copy(true);}}}))   
                                //{resolve: {item: angular.copy(true)}})) In ver > 0.2.0 they've changed the resolve syntax updated aa above
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
                $scope.roleUpdateLoader = true;
                var promise = roleService.delete($routeParams.roleId);
                promise.then(function(result){                                
                                flash.pop({title: 'Success', body: result, type: 'success'});
                                $scope.roleUpdateLoader = false;
                                $scope.getRoleList($scope.search);   
                                $location.path("/role");                                 
                        },
                        function(result){
                                $scope.roleUpdateLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.backToDetails = function(){                
                $scope.getRoleList($scope.search);                
                $location.path("/role/"+ $routeParams.roleId);     
        }

        $scope.backToList = function(){
                $scope.getRoleList($scope.search);                                
                $location.path("/role");
        }

        if($route.current.name == "role.edit"){
                $scope.getRoleList($scope.search);
                $scope.getTotalRole();
                $scope.selectRole($routeParams.roleId);
                $scope.editRole();
        }
        else if($route.current.name == "role.detail"){
                $scope.getRoleList($scope.search);
                $scope.getTotalRole();
                $scope.selectRole($routeParams.roleId);
        }
        else{
                $scope.getRoleList($scope.search);
                $scope.getTotalRole();
        }



        $scope.loading = false;
});