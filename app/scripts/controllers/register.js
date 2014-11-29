'use strict';

angularApp.controller('registerCtrl', function($scope,$location, flash, organizationService){
        
        $scope.wizard = {};
        $scope.steps = ['Organization Type','Transport Mode','Metadata'];
        $scope.organizationTypeList = ['Local','National','International'];
        $scope.transportModeList = ['Air','Ocean','Rail','Ground'];
        $scope.wizard.transportMode = {};
        $scope.metadataList = ['Airport Codes','Countries','Currencies','Exchange Rates','Weight Qualifier','Volume Qualifier','Rate Qualifier','Service Level','Service Type']
        $scope.wizard.metaData = {};
        $scope.selection = $scope.steps[0];

        $scope.setupOrg = function(value){
                $scope.loading = true;
                var promise = organizationService.setup(value);
                promise.then(function(data){
                                flash.pop({title: 'Success', body: data.msg, type: 'success'});
                                $location.path("/home");
                        },
                        function(data){
                                flash.pop({title: 'Alert', body: data.msg, type: 'error'});
                        }
                );
                $scope.loading = false;
        }

        $scope.getCurrentStepIndex = function(){
                // Get the index of the current step given selection
                return _.indexOf($scope.steps, $scope.selection);
        };

        // Go to a defined step index
        $scope.goToStep = function(index) {
                if (!_.isUndefined($scope.steps[index])){
                        $scope.selection = $scope.steps[index];
                }
        };

        $scope.hasNextStep = function(){
                var stepIndex = $scope.getCurrentStepIndex();
                var nextStep = stepIndex + 1;
                // Return true if there is a next step, false if not
                return !_.isUndefined($scope.steps[nextStep]);
        };

        $scope.hasPreviousStep = function(){
                var stepIndex = $scope.getCurrentStepIndex();
                var previousStep = stepIndex - 1;
                // Return true if there is a next step, false if not
                return !_.isUndefined($scope.steps[previousStep]);
        };

        $scope.incrementStep = function() {
                if ($scope.hasNextStep()){
                        var stepIndex = $scope.getCurrentStepIndex();
                        var nextStep = stepIndex + 1;
                        $scope.selection = $scope.steps[nextStep];
                }
        };

        $scope.decrementStep = function() {
                if ($scope.hasPreviousStep()){
                        var stepIndex = $scope.getCurrentStepIndex();
                        var previousStep = stepIndex - 1;
                        $scope.selection = $scope.steps[previousStep];
                }
        };

        $scope.loading = false;
})