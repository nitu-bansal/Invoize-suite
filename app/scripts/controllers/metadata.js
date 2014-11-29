'use strict';
angularApp.controller('metadataCtrl', function($scope,$location,$stateParams,$routeParams,$route,$dialog,metadataService,flash,Base64){
        $scope.metadataTypeList = [];
        $scope.totalMetadataType = 0;
        $scope.totalMetadata = 0;
        $scope.metadataList = [];
        $scope.metadata = {};
        $scope.selectedMetadata = {}; 
        $scope.selectedMetadataFields=[];  
        $scope.metadataType = {};                   
        $scope.dataTypeList = [{n:"Text",v: "text"},{n:"Date",v:"date"},{n:"Email",v:"email"},{n:"Number",v:"number"}];
        $scope.metadataType.fields = [{'dataType':'text','isMandatory': true}];
        $scope.CSVData = "";

        $scope.downloadCSV = function() {
                var data = Base64.encode($scope.CSVData);
                window.location.href = "data:text/csv;base64," + data
        };

        $scope.getTotalMetadataType = function(){
                var promise = metadataService.totalMetadataType({countFor:'metadataType'});
                promise.then(function(result){
                                $scope.totalMetadataType = result.count;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }

        $scope.downloadMetadata = function(){
                $scope.metadataTypeUpdateLoader = true;
                var promise = metadataService.downloadMetadata($routeParams.metadataType);
                promise.then(function(msg){
                                flash.pop({title: 'Success', body: "Downloaded succesfully", type: 'success'});
                                $scope.metadataTypeUpdateLoader = false;
                                $scope.CSVData= msg;
                                $scope.downloadCSV();
                                $scope.getMetadataTypeList();
                        },
                        function(result){
                                $scope.metadataTypeUpdateLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.getMetadataTypeList = function(){
                $scope.metadataTypeListLoader = true;
                var promise = metadataService.list({suggestionFor:'metadataType', q:'', pageLimit:20,page:1});
                promise.then(function(result){
                                $scope.metadataTypeListLoader = false;
                                $scope.metadataTypeList = result;
                        },
                        function(result){
                                $scope.metadataTypeListLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.createMetadataType = function(metadataType){
                $scope.metadataTypeCreateLoader = true;
                var promise = metadataService.createMetadataType(metadataType);
                promise.then(function(msg){
                                $scope.metadataTypeCreateLoader = false;
                                $scope.getMetadataTypeList();
                                flash.pop({title: 'Success', body: msg, type: 'success'});                                
                        },
                        function(msg){
                                $scope.metadataTypeCreateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }

        $scope.selectMetadataType = function(value){                
                $scope.metadataListLoader = true;
                $scope.metadataList=[];
                var promise = metadataService.selectMetadataType({suggestionFor:'metadata', q:'', pageLimit:20,page:1,for:value});
                promise.then(function(result){
                                $scope.metadataListLoader = false;
                                $scope.metadataList = result;
                        },
                        function(result){
                                $scope.metadataListLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.deletetMetadataType = function(){
                $scope.metadataTypeUpdateLoader = true;                
                var promise = metadataService.deletetMetadataType($routeParams.metadataTypeId);
                promise.then(function(result){                                
                                $scope.getMetadataTypeList();
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.metadataTypeUpdateLoader = false;                        
                        },
                        function(result){
                                $scope.metadataTypeUpdateLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.selectMetadata = function(value){                      
                $scope.getMetadataFields($routeParams.metadataType);        
                $location.path("/metadata/"+ $routeParams.metadataType +"/"+ value);
                var promise = metadataService.read(value);
                promise.then(function(result){
                                $scope.selectedMetadata = result;                           
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.getMetadataFields = function(value){
                $scope.metadata = {};                
                $scope.selectedMetadata = {}; 
                $scope.selectedMetadataFields=[];                                                                  
                var promise = metadataService.getMetadataFields({suggestionFor:'metadataFields', q:'', pageLimit:20, page:1, for:value});                
                promise.then(function(result){                                
                                $scope.selectedMetadataFields = result;                           
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.createMetadata = function(metadata,metadataTypeId){
                console.log(metadata);
                $scope.metadataCreateLoader = true;
                var promise = metadataService.createMetadata({metadata:metadata,metadataType:metadataTypeId});
                promise.then(function(msg){
                                $scope.metadataCreateLoader = false;
                                $scope.getMetadataTypeList();
                                $scope.selectMetadataType($routeParams.metadataType);
                                $scope.getMetadataFields($routeParams.metadataType);
                                $scope.selectMetadata(msg.id);
                                flash.pop({title: 'Success', body: msg.msg, type: 'success'});                                
                                $location.path("/metadata/"+ $routeParams.metadataType+"/"+ msg.id);
                        },
                        function(msg){
                                $scope.metadataCreateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }   

        $scope.updateMetadata = function(selectedMetadata){
                // cosole.log(selectedMetadata);
                $scope.metadataUpdateLoader = true;
                var promise = metadataService.updateMetadata(selectedMetadata);
                promise.then(function(msg){
                                $scope.getMetadataTypeList();
                                $scope.selectMetadataType($routeParams.metadataType);
                                $scope.getMetadataFields($routeParams.metadataType);
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.metadataUpdateLoader = false;
                                $scope.selectMetadata($routeParams.metadataId);
                                $location.path("/metadata/"+ $routeParams.metadataType+"/"+ $routeParams.metadataId);
                        },
                        function(msg){
                                $scope.metadataUpdateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }        

        $scope.dataTypeChanged= function(idx){
                if($scope.metadataType.fields.length == idx+1){
                        $scope.metadataType.fields.push({'dataType':'text','isMandatory': true});                        
                }
                

                
        }

        $scope.removeFields = function(idx) {                                                
                $scope.metadataType.fields.splice(idx, 1);
        }        

        $scope.initializeMetadataType=function () {                          
                $scope.metadataList = [];
                $scope.metadata = {};
                $scope.selectedMetadata = {}; 
                $scope.selectedMetadataFields=[];  
                $scope.metadataType = {}; 
                $scope.metadataType.fields = [{'dataType':'text','isMandatory': true}];
        }

        $scope.confirmDeleteMetadata = function() {
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
                        $scope.deleteMetadata();                                                                    
                }
                else
                {                  
                        
                        console.log("close");                                       
                }                
            });          
                // Code Dialog End
        };        

        $scope.deleteMetadata = function(){
                $scope.metadataUpdateLoader = true;                
                var promise = metadataService.deleteMetadata($routeParams.metadataId);
                promise.then(function(result){
                                $scope.selectMetadata($routeParams.metadataTypeId);
                                flash.pop({title: 'Success', body: result, type: 'success'});
                                $scope.metadataUpdateLoader = false;                                
                                $location.path("/metadata/"+ $routeParams.metadataType);
                        },
                        function(result){
                                $scope.metadataUpdateLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.backToListMetadataType = function(){
                $scope.getMetadataTypeList();                                
                $location.path("/metadata");
        }

        $scope.backToListMetadata = function(){
                $scope.getMetadataTypeList();          
                $scope.selectMetadataType($routeParams.metadataType);                      
                $location.path("/metadata/"+ $routeParams.metadataType);
        }

        $scope.backToDetailsMetadata = function(){
                $scope.getMetadataTypeList();
                $scope.selectMetadataType($routeParams.metadataType);
                $scope.getMetadataFields($routeParams.metadataType);                                
                $scope.selectMetadata($routeParams.metadataId);
                $location.path("/metadata/"+ $routeParams.metadataType+"/"+ $routeParams.metadataId);
        }
        

        if($route.current.name == "metadata.list.edit" || $route.current.name == "metadata.list.detail"){
                $scope.getMetadataTypeList();
                $scope.getTotalMetadataType();
                $scope.selectMetadataType($routeParams.metadataType);
                $scope.getMetadataFields($routeParams.metadataType);
                $scope.selectMetadata($routeParams.metadataId);
        }
        else if($route.current.name == "metadata.list.new"){
                $scope.getMetadataTypeList();
                $scope.getTotalMetadataType();
                $scope.selectMetadataType($routeParams.metadataType);
                $scope.getMetadataFields($routeParams.metadataType);
        }
        else if($route.current.name == "metadata.list"){
                $scope.getMetadataTypeList();
                $scope.getTotalMetadataType();
                $scope.selectMetadataType($routeParams.metadataType);                
        }
        else{
                $scope.getMetadataTypeList();
                $scope.getTotalMetadataType();
        }       
        $scope.loading = false;
});