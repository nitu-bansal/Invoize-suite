angularApp.controller('dialogCtrl',function($scope, item, dialog){          
        $scope.item=item;//{action:item.v,actionCode:"",expiredOn:"",description:""};   
     
        $scope.close = function(){               
        dialog.close(undefined);
        };

        $scope.save = function() {
        dialog.close($scope.item);
        };
});
