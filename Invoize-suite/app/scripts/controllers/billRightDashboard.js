/**
 * Created by kamalsingh.saini on 26/3/14.
 */

angularApp.controller('billRightDashboardCtrl', function($scope,$modal,flash,$location,$state,commonService,promiseObj) {

//    var promise = commonService.ajaxCall('GET', '/api/suggestion?suggestionFor=metadata_Status&responseType=array&module=BillRight');
//    promise.then(function(result) {
//        $scope.StatusesList=result
//    }, function(result) {
//        flash.pop({
//            title: 'Alert',
//            body:result.data,
//            type: 'error'
//        });
//    });

    $scope.pagination = {};
    $scope.pagination.totalItems = 0;
    $scope.pagination.currentPage = 1;
    $scope.pagination.paginationSize = 20;
    $scope.pagination.pageLimit = 14;
    $scope.detailsUrl = null;
    $scope.entryDate = new Date();
    $scope.initData=[];
    $scope.exclude=[];
    $scope.StatusesList=['Not In Process'];
    // template of the summary table(promiseObj returned as resolve)
    $scope.summaryTemplate = promiseObj.data;
    var downloadFileId = null;

    //Start Filter Object
    $scope.rule = {};
    $scope.rule.conditions = {};
    //$scope.filterObj = {};
    $scope.list = [];
    $scope.selectedFilterFields = {};
    $scope.autosuggestSource = $state.current.url.slice(1, $state.current.url.length);
    $scope.fields = {};
    $scope.sortedFields = [];
    $scope.custObj = {};
    //End filter object

    // last bpr summary updation on particular date
    $scope.updatedOn = null;

    var windowHeight = $(window).height();
    $scope.Hhw = $('.div-bpr').css({
        'height': windowHeight - 120
    });

    $scope.setPage = function() {
        setTimeout(function() {
            $scope.pagination.currentPage = angular.element("li.active.ng-scope").scope().page.number;
            $scope.showDetails();
        }, 100);
    };

    $scope.$watch('dialog',function(){downloadFileId=null;});

    $scope.setExcludes = function(ele,id){
        var i = $scope.exclude.indexOf(id);
        if(ele.checked) {
            if (i===-1) $scope.exclude.push(id);
        }
        else if(i!==-1) $scope.exclude.splice(i,1);

        $scope.details.all = ($scope.exclude.length===$scope.details.data.length);
    };

    $scope.excludesAll = function(ele){
        $scope.exclude = [];
        if(ele.checked)
        for (var i=0; i < $scope.details.data.length; i++) {
            $scope.exclude.push($scope.details.data[i].id);
        }
    };

    $scope.redirectTo = function(path) {
        $location.path(path);
    };

    function downloadFileInIframe(){
        var $iframe = $('iframe#ddoc');
        if ($iframe.length)
            $iframe.attr("src", 'api/tms/download/file?temp=1&id=' + downloadFileId);
        else
            $("body").append("<iframe id='ddoc' src='api/tms/download/file?temp=1&id=" + downloadFileId + "' style='display:none'>");
    }

    $scope.exportData = function () {
        $scope.loader = true;
        if(downloadFileId)  downloadFileInIframe();
        else{
            var promise = commonService.ajaxCall('GET', $scope.detailsUrl.replace('&pageLimit='+$scope.pagination.pageLimit,'') + '&isExcel=true');
            promise.then(function (result) {
                downloadFileId = result.msg;
                downloadFileInIframe();
                $scope.loader = false;
            }, function (result) {
                flash.pop({
                    title: 'Alert',
                    body: result.data,
                    type: 'error'
                });
                $scope.loader = false;
            });
        }
    };

    $scope.excludeShipments = function (which) {
//        var reqObj = $scope.exclude;

        if ($scope.exclude.length) {
            commonService.setHtml("<p>Are you sure? The shipment(s) will be "+which+"!</p>" +
                "<label>Comment:</label><textarea name='comment' ng-model='item.comment' placeholder='Enter comment here' required></textarea>" +
                "<span class='help-inline required' ng-show='confirmForm.comment.$error.required'> *</span>");

            var modalInstance = $modal.open({
                templateUrl: 'confirm.html',
                controller: 'modalInstanceCtrl',
                resolve: {
                    items: function() {
                        return {};
                    }
                }
            });
            modalInstance.result.then(function(modalData) {
                commonService.setHtml("");
                var promise = commonService.ajaxCall('POST', 'api/excludeShipment',{ids:$scope.exclude,comment:modalData.comment,flag:which});
                promise.then(function (result) {
                    for (var j = 0; j < $scope.details.data.length; j++){
                        if($scope.exclude.indexOf($scope.details.data[j].id)!==-1){
                            $scope.details.data[j]['tag.excluded'] = 'excluded';
                        }
                    }
                    $scope.exclude = [];
                    flash.pop({
                        title: 'Success',
                        body: result.msg,
                        type: 'success'
                    });
                }, function (result) {
                    flash.pop({
                        title: 'Alert',
                        body: result.data.msg,
                        type: 'error'
                    });
                });
            }, function(){ commonService.setHtml("");});
        }
    }

    /**
     * @author nishith.modi@searce.com
     * @name angular.reAllocateShipments
     * @function
     *
     * @description change the ownership of selected shipments to new user
     * $scope.exclude contains the selected shipments
     * @param
     * @return
     */
    $scope.reAllocateShipments = function(){//start: reAllocateShipments()

        // check if any shipment is selected or not
        if($scope.exclude.length) {

            // show modal/popup which takes the input of new user to be allocated to
            var modalInstance = $modal.open({
                templateUrl : 'm.reAllocate.html',
                controller: 'reAllocateUserCtrl',
                resolve : {
                    shipments : function() {
                        return angular.copy($scope.exclude);
                    }
                }
            });

        } else {
            // no shipment selected
        }//if-else: $scope.exclude.length

    }//end: reAllocateShipments()

    /**
     * @author nishith.modi@searce.com
     * @name $scope.getRuleFields
     * @function
     *
     * @description Take the active fields to be supplied for the filter
     *
     * fields contains the array of object(of type and label)
     * sortedFields contains the keys of all the header rules present in the table
     *
     * @param
     * @return
     */
    $scope.getRuleFields = function(){
        $scope.sortedFields = [];
        angular.forEach($scope.summaryTemplate.fields, function(i) {
            if (i.isActive) {
                if (i.type != "checkbox") {
                    $scope.fields[i.key] = {
                        type: i.type,
                        label: i.label,
                        autoSuggestSource: i.suggestionsSource
                    };
                    $scope.sortedFields.push(i.key);
                    $scope.custObj[i.label] = {
                        column: i.suggestionField,
                        systemId: $scope.loggedInUser.userSystem[0].id
                    }
                }
            }
        });

    }//end: getRuleFields()

    /**
     * @author nishith.modi@searce.com
     * @name $scope.resetFlexiFilter()
     * @function
     *
     * @description reset the easy filter
     * make the value of each input select2 in filter to null and call the getData function to fetch the data again
     * $scope.selectedFieldFilter reset
     * @param
     * @return
     */
    $scope.resetEasyFilter = function(){
        commonService.loader(true);

        // reset the value of each fields in filter
        for (var k in $scope.fields)
            if ($scope.fields.hasOwnProperty(k) && $scope.fields[k].val) {
                $scope.fields[k].val = null;
                if ($scope.fields[k].type == "dropdown" || $scope.fields[k].type == "multiselect")
                    $('input[name="' + k + '"]').select2('val', null);
                // delete $scope.fields[k];
            }


        // reset the selectedFilterFields object
        $scope.selectedFilterFields = {};
        // get the summary data again(directive fn)
        $scope.getSummaryData('');
        //close the filter popup
        commonService.hideDropPanel();

        commonService.loader(false);
    }//end: resetEasyFilter()

    /**
     * @author nishith.modi@searce.com
     * @name $scope.applyEasyFilter()
     * @function
     *
     * @description apply the filter based on input from user in filters fields.
     * for loop checks each field and if not null, put it in json. call the api
     * @param
     * @return
     */
    $scope.applyEasyFilter = function(){
        commonService.loader(true);

        //var selectedFields = {};
        // collect which fields are entered for filter to be applied and bunch it in json
        for(var k in $scope.fields) {
            if ($scope.fields[k].val != null) {
                $scope.selectedFilterFields[k] = $scope.fields[k].val[0].n;
                //selectedFields[k] = $scope.fields[k].val;
            }
        }

        // api call to apply filter(directive fn)
        $scope.getSummaryData('');
        //close the filter popup
        commonService.hideDropPanel();

        commonService.loader(false);
    }//end: applyEasyFilter()

});
