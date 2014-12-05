/**
 * Created by kamalsingh.saini on 20/5/14.
 */
angularApp.controller('uploadDocumentCtrl', function($scope, $rootScope, $routeParams, flash, commonService, $modalInstance, items) {
    $scope.obj = items;
    $scope.currentTab = items.isUpload ? 'uploadDocuments' : 'linkDocuments';
    $scope.relate = items.relate;
    var fileCount = 0;
    var uploadSuccess = false;
    var files = [];

    $scope.close = function() {
        $modalInstance.close('done');
    };

    $scope.search = function() {
        var params = '';
        angular.forEach($scope.obj.fields, function(field, key) {
            if (field.isActive) params += key + '=' + field.value + '&';
        });
        if ($scope.relate) params += 'searchFor=' + $scope.relate.key;
        var promise = commonService.ajaxCall('GET', 'api/getFiles?' + params);
        promise.then(function(resultFiles) {
            $scope.resultFiles = resultFiles.msg;
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });

    };

    $scope.link = function() {
        if ($scope.resultFiles.length > 0) {
            var promise = commonService.ajaxCall('post', 'api/linkFiles', $scope.resultFiles);
            promise.then(function(data) {
                flash.pop({
                    title: 'Success',
                    body: data,
                    type: 'success'
                });
            }, function(data) {
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
        }
    };

    $scope.$on('fileuploadsubmit', function(e) {
        commonService.loader(true);
        fileCount += 1;
    });

    $scope.$on('fileuploadalways', function(e) {
        fileCount -= 1;
        if (fileCount == 0) {
            commonService.loader();
            if (uploadSuccess) {
                if($scope.obj.replaceDoc){
                    files=[];
                }
                else{
                    var promise = commonService.ajaxCall('post', 'api/saveFileData', {
                        files: files,
                        data: $scope.obj.fields,
                        systemId:$rootScope.loggedInUser.userSystem[0].id
                    });
                    promise.then(function(data) {
                        flash.pop({
                            title: 'Success',
                            body: data.msg,
                            type: 'success'
                        });
                        files=[];
                    }, function(data) {
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error',
                            options:{'timeOut':'0',"extendedTimeOut": "0"}
                        });
                    });
                }
            }
        }
    });

    $scope.$on('fileuploaddone', function(e,response) {
        uploadSuccess = true;
        files.push(response.result.msg);
    });

    $scope.$on('fileuploadfail', function(e,response) {
        flash.pop({
            title: 'Alert',
            body: response.jqXHR.responseText,
            type: 'error',
            options:{'timeOut':'0',"extendedTimeOut": "0"}
        });
    });
});