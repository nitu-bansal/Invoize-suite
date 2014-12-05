/**
 * Created by pallavi.dandane on 9/24/2014.
 */
angularApp.controller('docProfileCtrl', function($scope, $window, $state, $routeParams, $route, $location, $modal, commonService, flash, $timeout, sharedService, $rootScope, $upload) {

    $scope.documents = [];

    $scope.data = {};

    // contains the selected fields for autosuggestions
    $scope.selectedFields = [];

//    $scope.documents.push({doc:"doc1",isMandatory: false});
//    $scope.documents.push({doc:"doc2",isMandatory: false});
//    $scope.documents.push({doc:"doc3",isMandatory: false});


    $scope.getList = function(q) {

        commonService.loader(true);

        var promise = commonService.ajaxCall('GET', '/api/docProfile?pageLimit=20&pageNo=1&q=' + q + '&systemId=' + $routeParams.systemId.toString() + '&accountId=' + $scope.selectedAccounts.accountIds.toString());
        promise.then(function(result) {
            $scope.invoiceDocTypes = result;
            commonService.loader();


        }, function(result) {
            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
            commonService.loader();



        });
    }

    $scope.editTemplate = function(value) {
//        console.log('Edit ' + value);
        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/InvoiceDeliveryDocProfilerules/edit/' + value);
    }

    $scope.viewTemplate = function(value) {
        console.log('Detail ' + value);
        $scope.redirectTo('/system/profile/' + $routeParams.systemName + '/' + $routeParams.systemId + '/account/InvoiceDeliveryDocProfilerules/detail/' + value);
    }

    $scope.setPreData = function() {
        console.log('setPredata');
        $scope.data = {};
        $scope.data.module = [{
            "c": "",
            "g": "",
            "id": "shipmentFields",
            "v": "shipmentFields",
            "n": "shipmentFields",
            "tc": null
        }];
        $scope.data.event = [{
            "c": "",
            "g": "",
            "id": "docProfile",
            "v": "docProfile",
            "n": "docProfile",
            "tc": null
        }];
        if ($state.current.url == "/new")
            $scope.getDefaultProfileBase();

    }


    $scope.getDefaultProfileBase = function() {

        var promise = commonService.ajaxCall('GET', 'api/template/profile/' + $routeParams.systemId);
        promise.then(function(data) {
            $scope.data.profileBase = data;
            var a = 10;
        }, function(data) {
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });

    }

    $scope.editDocProfile = function() {
        var docProfileId = $routeParams.docProfileId;

        console.log('editDocProfile :' + docProfileId)

        if (docProfileId != undefined) {
            var promise = commonService.ajaxCall('GET', '/api/docProfile/' + docProfileId);
            promise.then(function (data) {

                    $scope.data = data;
                    $scope.documents = $scope.data.document;
                    if($scope.documents == undefined)
                    {
                        $scope.documents = [];


                    }
                    $scope.selectedFields.push($scope.documents[0].doc.v);
                },
                function (data) {
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                });
        }
        else
        {
            $scope.getDefaultProfileBase();
        }
    }

    $scope.addDocument = function(){
        $scope.documents.push({doc:null,isMandatory: false});
    }

    $scope.fieldKeyChangedDocuments = function(id, field) {
        $scope.docsParams = [];
        if (id)
            $('input[name="fieldVal_' + id + '"]').select2('val', null);
        for (var i = 0; i < $scope.documents.length; i++)
            if ($scope.documents[i].doc && $scope.documents[i].doc.length > 0) {

                $scope.docsParams.push($scope.documents[i].doc[0].v);
            }
    }

    $scope.setMandatoryTrue = function(index, $event) {
        var checkbox = $event.target;
        $scope.documents[index].isMandatory = (checkbox.checked ? true : false);

    }


    $scope.saveData = function() {

        if($scope.documents.length <=0)
        {
            flash.pop({
                title: 'Alert',
                body: 'Select at least one Docuement',
                type: 'error'
            });

            return;
        }

        if ($routeParams.docProfileId == undefined) {

            $scope.data.docProfile.type = "docProfile";
            $scope.data.docProfile.accountID = $scope.selectedAccounts.accountIds.toString();
            $scope.data.docProfile.systemID = $scope.$routeParams.systemId.toString();
            $scope.data.document = $scope.documents;

            var promise = commonService.ajaxCall('POST', '/api/docProfile', $scope.data);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.data = [];
                    $scope.redirectTo("/system/profile/" + $routeParams.systemName + "/" + $routeParams.systemId + "/account/InvoiceDeliveryDocProfilerules/view");
                },
                function(data) {
                    $scope.templateLoader = false;
                    commonService.loader();
                    if (data.status === 412) {
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records are not saved , Please correct and save again.',
                            type: 'error'
                        });

                    } else
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                });

        } else {
            $scope.data.docProfile.type = "docProfile";
            $scope.data.docProfile.accountID = $scope.selectedAccounts.accountIds.toString();
            $scope.data.docProfile.systemID = $scope.$routeParams.systemId.toString();
            $scope.data.document = $scope.documents;

            var promise = commonService.ajaxCall('PUT', '/api/docProfile/' + $routeParams.docProfileId, $scope.data);
            promise.then(function(data) {
                    commonService.loader();
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.data = [];
                    $scope.redirectTo("/system/profile/" + $routeParams.systemName + "/" + $routeParams.systemId + "/account/InvoiceDeliveryDocProfilerules/view");
                },
                function(data) {
                    $scope.templateLoader = false;
                    commonService.loader();
                    if (data.status === 412) {
                        flash.pop({
                            title: 'Alert',
                            body: 'Some Invalid records are not saved , Please correct and save again.',
                            type: 'error'
                        });

                    } else
                        flash.pop({
                            title: 'Alert',
                            body: data.data,
                            type: 'error'
                        });
                });

        }
    }

    $scope.$on("savedocProfile", function(event, args) {
        $scope.saveData();
    });

    /**
     * @author nishith.modi@searce.com
     * @name $scope.updateSelectedList
     * @function
     *
     * @description Changing on selection of document name, change the array of selected documents.
     * $scope.selectedFields is passed "selected" in api/suggestions to avoid redundent selection of documents.
     *
     * reset the array $scope.selectedFields
     * loop through all the documents and if doc(array of object) is present, push it in selectedFields
     * @param
     * @return
     */
    $scope.updateSelectedList = function(){
        // reset the selected document list
        $scope.selectedFields = [];
        //console.log($scope.documents.length);
        //console.log(JSON.stringify($scope.documents));
        // loop through all the documents which are selected and push it in selectedFields to be sent to api/suggestions
        for (var i = 0; i < $scope.documents.length; i++)
          //  console.log(JSON.stringify($scope.documents[i]));
            if ($scope.documents[i].doc && $scope.documents[i].doc.length > 0) {
                $scope.selectedFields.push($scope.documents[i].doc[0].v);
            }

    }//end: updateSelectedList()
});
