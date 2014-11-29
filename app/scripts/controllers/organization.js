'use strict';

angularApp.controller('organizationCtrl', function($state,$scope,$http,$location,$route,$routeParams,$stateParams,$modal,$dialog,organizationService,flash){
        var counter = 2;
        var moreOrganizations = true;
        $scope.totalOrganization = 0;
        $scope.organizations = [];
        $scope.org = {};
        $scope.search='';

        $scope.searchOrganization = function() {
                $scope.getOrganizationList($scope.search);
        };
        
        $scope.getOrganizationList = function(q){                
                $scope.organizationListLoader = true;
                var promise = organizationService.list({suggestionFor:'organization', q:q, pageLimit:20, page:1});
                promise.then(function(msg){
                                $scope.organizations = msg;
                                $scope.organizationListLoader = false;},
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                                $scope.organizationListLoader = false;
                        }
                );                
        }

        $scope.getTotalOrganization = function(){
                var promise = organizationService.totalOrganization({countFor:'metadataType'});
                promise.then(function(result){
                                $scope.totalOrganization = result.count;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }
  
        $scope.loadMore = function() {
                if(moreOrganizations){
                        $scope.loadingMore = true;
                        var promise = organizationService.list({suggestionFor:'organization', q:'', pageLimit:20, page:counter});
                        promise.then(function(result){
                                        if (result.length === 0)
                                                moreOrganizations = false;
                                        counter += 1;
                                        $scope.loadingMore = false;
                                        $scope.organizations = $scope.organizations.concat(result);},
                                function(result){
                                        $scope.loadingMore = false;
                                }
                        );
                }
        }

        $scope.selectOrganization = function(value){                
                $scope.organizationDetailLoader = true;
                var promise = organizationService.read(value);
                promise.then(function(msg){
                                $scope.organizationDetailLoader = false;
                                $scope.org = msg;},
                        function(msg){                                
                                $scope.organizationDetailLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                                
                        }
                );                
        }

        $scope.editOrganization = function(){
                // $scope.org = $scope.selectedOrganization;
        }
        $scope.initalizeOrganization = function(){
                $scope.org = {};
        }

        $scope.updateOrganization = function(organization){                
                $scope.organizationUpdateLoader = true;
                var promise = organizationService.update(organization);
                promise.then(function(msg){
                                $scope.organizationUpdateLoader = false;
                                $scope.getOrganizationList($scope.search);
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $location.path("/organization/"+ $routeParams.organizationId);
                                },
                        function(msg){
                                $scope.organizationUpdateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );                
        }

        $scope.create = function(organization){                
                $scope.organizationCreateLoader = true;
                var promise = organizationService.create(organization);
                promise.then(function(msg){
                                $scope.getOrganizationList($scope.search);
                                $scope.organizationCreateLoader = false;
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                },
                        function(msg){
                                $scope.organizationCreateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );                
        }

        $scope.confirmDeleteOrganization = function() {
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
                $scope.organizationUpdateLoader = true;
                var promise = organizationService.delete($routeParams.organizationId);
                promise.then(function(msg){
                                $scope.getOrganizationList($scope.search);
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.organizationUpdateLoader = false;
                                $location.path("/organization/");
                        },
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                                $scope.organizationUpdateLoader = false;
                        }
                );
        }
             

        if($route.current.name == "organization.edit"){
                $scope.getOrganizationList($scope.search);
                $scope.getTotalOrganization();
                $scope.selectOrganization($routeParams.organizationId);
                $scope.editOrganization();
        }
        else if($route.current.name == "organization.detail"){
                $scope.getOrganizationList($scope.search);
                $scope.getTotalOrganization();
                $scope.selectOrganization($routeParams.organizationId);
        }
        else{
                $scope.getOrganizationList($scope.search);
                $scope.getTotalOrganization();
        }


        $scope.loading = false;
});