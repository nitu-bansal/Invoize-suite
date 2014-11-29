'use strict';

angularApp.controller('userCtrl', function($scope,$http,$location,$routeParams,$route,$stateParams,$modal,$dialog,userService,roleService,flash){
        var counter = 2;
        var moreUsers = true;
        $scope.totalUser = 0;
        $scope.user = {};        
        $scope.user.permission = [{'for':'account'}];
        $scope.permissionforList = [{n:"user",v:"User"},{n:"account",v:"Account"},{n:"permission",v:"Permission"}];
        $scope.existingPermission = {};
        $scope.permissionOnindex='account';
        $scope.search='';
        $scope.newRoleCreated=false;

        $scope.createRole = function(role){          
                $scope.newRoleCreated =false ;
                var promise = roleService.create(role);             
                promise.then(function(result){
                                console.log('success');
                                flash.pop({title: 'New Role Addded', body: result.msg, type: 'success'});
                                $scope.newRoleCreated= true;                                
                        },
                        function(result){
                                console.log('fail') 
                                var restArr=_.initial($scope.user.role);
                                $scope.user.role=[];   
                                $scope.user.role=restArr; 
                                flash.pop({title: 'Role not added', body: result.msg, type: 'error'});
                                $scope.newRoleCreated= false;    
                               
                        }                       
                );               
        }

        // Code Dialog Start            
        $scope.showDialog = function(item){    

                if (item.length>0)
                {
                        var tempItem=item[item.length-1];
                        var itemToSend =  {name:tempItem.v,description:"",definition:""};  //change as per dialog template            
                        var selectionType=tempItem.n;
                        var isSelected=tempItem.s;

                                if (selectionType==='new' && isSelected===""){ 
                                        item[item.length-1].n="added"; 
                                        //console.log(itemToSend);
                                        $dialog.dialog(angular.extend(
                                                        {
                                                            controller: 'dialogCtrl',
                                                            templateUrl: 'm.role.new.html', // change as per the dialog html needed
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
                                                        $scope.createRole(result);                                       
                                                }
                                                else
                                                {       
                                                        console.log('close');
                                                        var restArr=_.initial($scope.user.role);
                                                        $scope.user.role=[];   
                                                        $scope.user.role=restArr;  
                                                                                             
                                                }
                                                itemToSend = undefined;
                                            });                             
                                }   
                }        
        };
        // Code Dialog End
        $scope.setfor= function(idx){
                $scope.permissionOnindex=$scope.user.permission[idx]['for'];  
        }

        $scope.permissionforChanged= function(idx){        
               $scope.user.permission[idx]['on']=[];  
        }

        $scope.addPermissions = function(){
                $scope.user.permission.push({'for':'account'});
        }

        $scope.removePermissions = function(idx) {
                //console.log(idx);
                $scope.user.permission.splice(idx, 1);
        }; 

        // $scope.formatResult = function (data) {
        //         var markup = "<div>" + $scope.toHumanReadable(data.v) + "</div>";
        //         return markup;}

        // $scope.formatSelection = function (data) {
        //         return $scope.toHumanReadable(data.v) ;}

        $scope.formatResult = function (data) {
                if(data.g === "group")
                        var markup = "<div><i class='icon-group'></i>  " + $scope.toHumanReadable(data.v) + "</div>";
                else
                        var markup = "<div><i class='icon-user'></i>  " + $scope.toHumanReadable(data.v) + "</div>";
                return markup;}

        $scope.formatSelection = function (data) {
                if(data.g === "group")
                        return "<i class='icon-group'></i>  "+$scope.toHumanReadable(data.v);
                else
                        return "<i class='icon-user'></i>  "+$scope.toHumanReadable(data.v);}

        $scope.formatUserResult = function (data) {                
                if (data.n === "new")
                        var markup = "<div> <button class='btn-success btn-margin'><i class='icon-plus icon-white'></i> Create : \""+ $scope.toHumanReadable(data.v) +"\"</button></div>";
                else
                        var markup = "<div>" + $scope.toHumanReadable(data.v) + "</div>";
                return markup;

        }

        $scope.formatUserSelection = function (data) {
                return "<div class='itemNew'><b>" + $scope.toHumanReadable(data.v) + "</b></div>";
        }

        $scope.permissionBar = {
                placeholder: "Please select..",
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

        $scope.onBar = {
                placeholder: "Please select..",
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
                                        suggestionFor: $scope.permissionOnindex, // suggestions for
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
                                        suggestionFor: "group", // suggestions for
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
                                        selected: $scope.user.role, //selected values
                                        suggestionFor: "role", // suggestions for
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
                formatResult: $scope.formatUserResult, // omitted for brevity, see the source of this page
                formatSelection: $scope.formatUserSelection, // omitted for brevity, see the source of this page
                dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
        };



        $scope.searchUser = function() {
                $scope.getUserList($scope.search);
        };

        $scope.getUserList = function(q){
                $scope.userListLoader = true;
                var promise = userService.list({suggestionFor:'user', q:q, pageLimit:20,page:1});
                promise.then(function(result){
                                $scope.userListLoader = false;
                                $scope.userList = result;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }

         $scope.getTotalUser = function(){
                var promise = userService.totalUser({countFor:'user'});
                promise.then(function(result){
                                $scope.totalUser = result.count;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }
  
        $scope.loadMore = function() {
                if(moreUsers){
                        $scope.loadingMore = true;
                        var promise = userService.list({suggestionFor:'user', q:'', pageLimit:20, page:counter});
                        promise.then(function(result){
                                        if (result.length === 0)
                                                moreUsers = false;
                                        counter += 1;
                                        $scope.loadingMore = false;
                                        $scope.userList = $scope.userList.concat(result);},
                                function(result){
                                        $scope.loadingMore = false;
                                }
                        );
                }
        }

        $scope.selectUser = function(value){
                $scope.userDetailLoader = true;
                var promise = userService.read(value);
                promise.then(function(result){
                                $scope.userDetailLoader = false;
                                $scope.user = result;
                        },
                        function(result){
                                $scope.userDetailLoader = false;
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }

        $scope.editUser = function(value){                
                if (_.isUndefined($scope.user.permission)) 
                        $scope.user.permission=[{'for':'account'}];                
        }
        
        $scope.create = function(user){
                $scope.userCreateLoader = true;
                var promise = userService.create(user);
                promise.then(function(msg){
                                $scope.getUserList($scope.search);
                                $scope.getTotalUser();
                                flash.pop({title: 'Success', body: msg.msg, type: 'success'}); 
                                $scope.userCreateLoader = false;
                                $location.path("/user/"+ msg.id);
                        },
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                                $scope.userCreateLoader = false;
                        }
                );
        }

        $scope.updateUser = function(user){
                $scope.userUpdateLoader = true;
                var promise = userService.update(user);
                promise.then(function(msg){
                                $scope.getUserList($scope.search);
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.userUpdateLoader = false;
                                $location.path("/user/"+ $routeParams.userId);
                        },
                        function(msg){
                                $scope.userUpdateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }

        $scope.initializeUser=function(){
                $scope.user = {};        
                $scope.user.permission = [{'for':'account'}];
                $scope.permissionforList = [{n:"user",v:"User"},{n:"account",v:"Account"},{n:"permission",v:"Permission"}];
                $scope.existingPermission = {};
                $scope.permissionOnindex='account';
        }

        $scope.confirmDeleteUser = function() {
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
                $scope.userUpdateLoader = true;
                var promise = userService.delete($routeParams.userId);
                promise.then(function(msg){
                                $scope.getUserList($scope.search);
                                $scope.getTotalUser();
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.userUpdateLoader = false;
                                $location.path("/user");                             
                        },
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                                $scope.userUpdateLoader = false;
                        }
                );
        }

        $scope.backToDetails = function(){               
                $scope.getUserList($scope.search);                                                                
                $location.path("/user/"+ $routeParams.userId);
        }

        $scope.backToList = function(){
                $scope.getUserList($scope.search);                                
                $location.path("/user");
        }

        //console.log($route)

        if($route.current.name == "user.edit"){
                $scope.getUserList($scope.search);
                $scope.getTotalUser();
                $scope.selectUser($routeParams.userId);
                $scope.editUser($routeParams.userId);
        }
        else if($route.current.name == "user.detail"){
                $scope.getUserList($scope.search);
                $scope.getTotalUser();
                $scope.selectUser($routeParams.userId);
        }
        else
        {
                $scope.getUserList($scope.search);
                $scope.getTotalUser();
        }

        $scope.loading = false;
});