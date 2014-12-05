/**
 * Created by pallavi.dandane on 7/29/2014.
 */
angularApp.controller('tmsTariffUploadCtrl', function($scope, $rootScope, $routeParams, flash, commonService, $modalInstance, fileUpload, items) {
    $scope.templateId = items;
    $scope.obj = items;
//    $scope.currentTab = items.isUpload ? 'uploadDocuments' : 'linkDocuments';
//    $scope.relate = items.relate;
    var fileCount = 0;
    var uploadSuccess = false;
    $scope.files = [];
    $scope.systemId = items.fields.systemId;
    $scope.account = items.fields.account;
    $scope.templateId = items.fields.templateId;




//    $scope.disabled = angular.element('<input type="file">')
//        .prop('disabled');
    $scope.url='/api/tariffLaneUploadFiles?templateId={{templateId}}&account={{account}}&systemId={{systemId}}';
//    $scope.queue = $scope.queue || [];
//    $scope.docId = [];
//    $scope.replacedDocId = {};
//    $scope.currentFileSelected = {};
//    $scope.updateCurrentFile = false;
    $scope.proceedClicked=false;

    $scope.close = function() {
        $modalInstance.dismiss(undefined);
    }

    $scope.Done = function() {
        console.log('done');
    }

    $scope.setFiles = function(element) {
        $scope.$apply(function($scope) {
            console.log('files:', element.files);
            // Turn the FileList object into an Array
//            $scope.files = []
            for (var i = 0; i < element.files.length; i++) {
//                console.log(element.files[i].name);
                var fExtension = element.files[i].name.substr(element.files[i].name.lastIndexOf('.'));
//                element.files[i].name = $scope.account + '#' + $scope.systemId + fExtension ;
                console.log(fExtension);
                if (fExtension == '.xls' || fExtension == '.xlsx') {
                    $scope.files.push(element.files[i])
                }else
                {
                    flash.pop({
                        title: 'Error',
                        body: "Upload only Excel File.",
                        type: 'error'
                    });
                }
            }
            $scope.progressVisible = false
        });
    };

    $scope.RemoveFile = function(index) {
        $scope.files.splice(index);

    };

    $scope.uploadFile = function() {
        $scope.proceedClicked = true;
        if($scope.files.length <=0){
            flash.pop({
                title: 'Warning',
                body: "Select at least one file.",
                type: 'warning'
            });
        }
        else {
            var fd = new FormData()
            for (var i in $scope.files) {
//            console.log($scope.files[i].name);
//            var fExtension = $scope.files[i].name.substr($scope.files[i].name.lastIndexOf('.'));
//            $scope.files[i].name = $scope.account + '#' + $scope.systemId + fExtension ;
//            console.log($scope.files[i].name);
                fd.append("uploadedFile", $scope.files[i])
            }
            var xhr = new XMLHttpRequest()
            xhr.upload.addEventListener("progress", uploadProgress, false)
            xhr.addEventListener("load", uploadComplete, false)
            xhr.addEventListener("error", uploadFailed, false)
            xhr.addEventListener("abort", uploadCanceled, false)
            xhr.open("POST", "/api/tariffLaneUploadFiles?templateId=" + $scope.templateId + "&account=" + $scope.account + "&systemId=" + $scope.systemId)
            $scope.progressVisible = true
            xhr.send(fd)

            flash.pop({
                title: 'Success',
                body: "File uploaded successfully. Lanes will be uploaded in some time.",
                type: 'success'
            });
            $modalInstance.dismiss(undefined);
        }
    }

    function uploadProgress(evt) {
        $scope.$apply(function(){
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total)
            } else {
                $scope.progress = 'unable to compute'
            }
        })
    }

    function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        console.log(evt.target.responseText)
    }

    function uploadFailed(evt) {
        console.log("There was an error attempting to upload the file.")
    }

    function uploadCanceled(evt) {
        $scope.$apply(function(){
            $scope.progressVisible = false
        })
        console.log("The upload has been canceled by the user or the browser dropped the connection.")
    }
});
