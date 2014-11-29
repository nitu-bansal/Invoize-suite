'use strict';

angularApp.controller('rateRequestCtrl', function($scope,$rootScope,$http,$location,$route,$stateParams,$state,$routeParams,$compile,rateRequestService,tmsService,sharedService,flash){
        $scope.selectedRequest={};
        $scope.selectedRequestHistory={};
        $scope.newRequest=[];
        $scope.requestCount={};
        $scope.chargeType = [{id:"Freight",val:"Freight"},{id:"Fuel Surcharge",val:"Fuel Surcharge"},{id:"Pickup Surcharge",val:"Pickup Surcharge"},{id:"Brokerage or Duty",val:"Brokerage or Duty"},{id:"Stamp Fee",val:"Stamp Fee"}];
        $scope.rateQualifier = [{id:"Per Inch",val:"Per Inch"},{id:"Per Kilograms",val:"Per Kilograms"},{id:"Per Kilometer",val:"Per Kilometer"},{id:"Per Kilotons",val:"Per Kilotons"},{id:"Per Pound Per Article",val:"Per Pound Per Article"},{id:"Per Pound",val:"Per Pound"}];
        $scope.rateRequestHistory = [{}];
        $scope.selectedRequest.weightBracket = [{sph:"0",eph:"*"}];
        $scope.selectedRequestHistory.weightBracket = [{sph:"0",eph:"*"}];
        $scope.isInProcess=true;
        $scope.isCollapse=true;
        $scope.isCollapsed=true;
        $scope.rateRequestHistoryAvailable = false;

        $scope.isCurrentTmsStackHolderCollapsed  =true;
        $scope.isCurrentRateStackHolderCollapsed  =true;

        $scope.fileTypeSelects= [
          {
            "id": "Tariff",
            "name": "<i class='icon-file-alt'></i>&nbsp;Tariff"
          },
          {
            "id": "SOP",
            "name": "<i class='icon-file-alt'></i>&nbsp;SOP"
          },
          {
            "id": "Other",
            "name": "<i class='icon-file-alt'></i>&nbsp;Other"
          }
        ];
        $scope.tariff={};
        $scope.tariff.docId=[];
        $scope.tariffList={};
        $scope.documentRequestHistory = [{}];
        $scope.globalFileUpload;
        $scope.tariffHistoryAvailable = false;
        $scope.quickViewAttachments=[];

        $scope.getRequestCount = function(){
                var promise = rateRequestService.rateRequestCount({countFor:'rateRequests'});
                promise.then(function(result){
                                $scope.requestCount = result;
                                $scope.rateRequestCountLoader = false;
                                $rootScope.pendingRateRequestCount=$scope.requestCount.rate.pending;
                                $rootScope.inProcessRateRequestCount=$scope.requestCount.rate.inProcess;
                                $rootScope.pendingTmsRequestCount=$scope.requestCount.tariff.pending;
                                $rootScope.inProcessTmsRequestCount=$scope.requestCount.tariff.inProcess;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        };

        $scope.getRateRequestHistoryDetail = function(id,data){
                var promise = rateRequestService.rateRequestHistoryRead({"rateRequestId": $routeParams.requestId,"timeStamp":data.timeStamp});
                        promise.then(function(result){
                                        $scope.selectedRequestHistory = result;
                                        $scope.getOtherFieldsList();
                                        $scope.rendorHtml(id);
                                        },
                                function(result){
                                        flash.pop({title: 'Alert', body: result, type: 'error'});
                                }
                        );
        }

        $scope.rendorHtml=function(id){
                var strHTML="<form novalidate='novalidate' class='form-horizontal'>";
                angular.forEach($scope.selectedRequestHistory.selection, function(i,j){
                                strHTML=strHTML+"<div class='control-group'><label class='control-label'><strong class='text-info'><small class='muted'>" + $scope.toHumanReadable(i.n)+" : " +"</small></strong></label><div class='controls'><label><strong class='text-info'><small class='muted'>"+i.v+"</small></strong></label></div></div>"
                        });
                strHTML=strHTML+ "<div class='control-group'><label class='control-label'><strong class='text-info'><small class='muted'>" + "Charge Type : </small></strong></label><div class='controls'>";
                strHTML=strHTML+ "<label><strong class='text-info'><small class='muted'>"+$scope.selectedRequestHistory.chargeType+"</small></strong></label></div></div>";

                strHTML=strHTML+ "<div class='control-group'><label class='control-label'><strong class='text-info'><small class='muted'>" + "Rate Qualifier : </small></strong></label><div class='controls'>";
                strHTML=strHTML+ "<label><strong class='text-info'><small class='muted'> "+$scope.selectedRequestHistory.rateQualifier+"</small></strong></label></div></div>";

                strHTML=strHTML+ "<div class='control-group'><label class='control-label'><strong class='text-info'><small class='muted'>" + "Weight Brackets : </small></strong></label><div class='controls'>"
                angular.forEach($scope.selectedRequestHistory.weightBracket, function(i,j){
                                strHTML=strHTML+"<label><strong class='text-info'><small class='muted'>"+i.s+"&nbsp&nbsp-&nbsp&nbsp"+i.e+"&nbsp&nbsp-&nbsp&nbsp"+i.v+"</small></strong></label>"+ "</div></div>";
                        });
                strHTML=strHTML+ "<div class='control-group'><label class='control-label'><strong class='text-info'><small class='muted'>" + "Comments : </small></strong></label><div class='controls'>";
                strHTML=strHTML+ "<label><strong class='text-info'><small class='muted'>"+$scope.selectedRequestHistory.comment+"</small></strong></label></div></div>";

                $("#"+id).html ($compile("<div> "+ strHTML+" </div></form>")($scope));
        }

        $scope.getRateRequestList = function(value){
                $scope.rateRequestListLoader=true;
                var promise = rateRequestService.rateRequestList({suggestionFor:"rateRequest", q:'', pageLimit:10,page:1,rateRequestType:value});
                promise.then(function(result){
                                $scope.rateRequestListLoader=false;
                                $scope.oldRequest  = result;},
                        function(result){
                                $scope.rateRequestListLoader=false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        };

        $scope.getTmsRequestList = function(value){
                $scope.tmsRequestListLoader=true;
                var promise = rateRequestService.tmsRequestList({suggestionFor:"tmsRequest", q:'', pageLimit:10,page:1,tmsRequestType:value});
                promise.then(function(result){
                                $scope.tmsRequestListLoader=false;
                                $scope.oldTmsRequest = result;
                                var desc;

                                angular.forEach($scope.oldTmsRequest, function(i,j){
                                        desc="";
                                          angular.forEach(i.docId, function(a,b){
                                                desc+=a.v + ',' ;
                                         });
                                        $scope.quickViewAttachments.push(desc.slice(0, -1));
                                });
                            },
                        function(result){
                                $scope.tmsRequestListLoader=false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        };

        $scope.getOtherFieldsList = function(){
                var promise = rateRequestService.otherFieldsList({suggestionFor:'user', q:'', pageLimit:10,page:1});
                promise.then(function(r){
                                $scope.otherFieldsList = r;
                                angular.forEach($scope.selectedRequest.selection, function(i,j){
                                        angular.forEach($scope.otherFieldsList, function(k,l){
                                                if(i.n === k.n)
                                                        $scope.otherFieldsList.splice(l,1);
                                        });
                                });

                        },
                        function(r){
                                flash.pop({title: 'Alert', body: r, type: 'error'});
                        }
                );
        };

        $scope.getRateRequestHistory = function(value){
                var promise = rateRequestService.getRateRequestHistory(value);
                $scope.rateRequestHistoryLoader = true;
                $scope.rateRequestHistoryAvailable = false;
                promise.then(function(result){
                                if(result.length>0){
                                        $scope.rateRequestHistoryAvailable = true;
                                }
                                $scope.rateRequestHistoryLoader = false;
                                $scope.rateRequestHistory = result;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        };

        $scope.selectRateRequest = function(value){
                $scope.requestUpdateLoader=true;
                $location.path("/request/rate/"+ $routeParams.requestType +"/"+ value);
                var promise = rateRequestService.rateRequestRead(value);
                promise.then(function(result){
                                $scope.selectedRequest = result;
                                $scope.getOtherFieldsList();
                                $scope.getRateRequestHistory(value);
                                $scope.requestUpdateLoader=false;
                                if($routeParams.requestType=="pending")
                                        $scope.isInProcess=false;
                                else
                                        $scope.isInProcess=true;
                                },
                        function(result){
                                $scope.requestUpdateLoader=false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        };



        $scope.approveRateRequest = function(selectedRequest){
                var promise = rateRequestService.updateRateRequest({"selectedRequest":selectedRequest,"action":"A","rateRequestId":$routeParams.requestId});
                promise.then(function(msg){
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.getRequestCount();
                                $scope.getRateRequestList($routeParams.requestType);
                                $location.path("/request/rate/"+ $routeParams.requestType);
                                },
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        };

        $scope.rejectRateRequest = function(selectedRequest){
                var promise = rateRequestService.updateRateRequest({"selectedRequest":selectedRequest,"action":"R","rateRequestId":$routeParams.requestId});
                promise.then(function(msg){
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.getRequestCount();
                                $scope.getRateRequestList($routeParams.requestType);
                                $location.path("/request/rate/"+ $routeParams.requestType);
                                },
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        };

        $scope.appendToList = function(v) {
                if($scope.selectedRequest.selection){
                     if (v.length>0)
                     {
                        var v;
                        eval("v="+v);
                        $scope.selectedRequest.selection.push(v);
                        $scope.currentSelectedField=[];
                        angular.forEach($scope.otherFieldsList, function(i,j){
                        if(i.n === v.n)
                                $scope.otherFieldsList.splice(j,1);
                        });
                    }
                }
       };

       $scope.removeFromList = function(idx) {
                $scope.otherFieldsList.push($scope.selectedRequest.selection[idx]);
                $scope.selectedRequest.selection.splice(idx, 1);
        };

        $scope.weightBracketCallback = function(field,index) {
                if($scope.selectedRequest.weightBracket[index][field])
                {
                        if(field === "e" && $scope.selectedRequest.weightBracket.length === index+1){
                                if($scope.selectedRequest.weightBracket[index].e != "*"){
                                        var difference = parseInt($scope.selectedRequest.weightBracket[index].e) - parseInt($scope.selectedRequest.weightBracket[index].s);
                                        var start = parseInt($scope.selectedRequest.weightBracket[index].e);
                                        var end = start + difference;
                                        $scope.selectedRequest.weightBracket.push({sph:start,eph:end+" or *"});
                                }
                        }
                }
                else
                {
                        if(index === 0 || field === 's')
                                $scope.selectedRequest.weightBracket[index][field] = $scope.selectedRequest.weightBracket[index][field+"ph"];
                        else if(field === 'e' && $scope.selectedRequest.weightBracket.length === index+1){
                                if($scope.selectedRequest.weightBracket[index].e != "*"){
                                        $scope.selectedRequest.weightBracket[index][field] = parseInt($scope.selectedRequest.weightBracket[index].s) + parseInt($scope.selectedRequest.weightBracket[index-1].e) - parseInt($scope.selectedRequest.weightBracket[index-1].s);
                                        var difference = parseInt($scope.selectedRequest.weightBracket[index].e) - parseInt($scope.selectedRequest.weightBracket[index].s);
                                        var start = parseInt($scope.selectedRequest.weightBracket[index].e);
                                        var end = start + difference;
                                        $scope.selectedRequest.weightBracket.push({sph:start,eph:end+" or *"});
                                }
                        }
                }
        };

        $scope.removeFromWeightBracketFields = function(idx) {
                $scope.selectedRequest.weightBracket.splice(idx, 1);
        };


        $scope.selectTmsRequest = function(value){
                $scope.accountDetailLoader = true;
                $scope.documentRequestHistory=[];
                if($routeParams.requestType ==='pending')
                        $location.path("/request/tms/"+ $routeParams.requestType +"/revise/"+ value);
                else
                        $location.path("/request/tms/"+ $routeParams.requestType +"/detail/"+ value);

                $scope.tariff={};
                var promise = tmsService.read(value);
                promise.then(function(result){
                                $scope.getDocumentRequestHistory(value);
                                $scope.tariffDetailLoader = false;
                                $scope.tariff = result;
                                    if($routeParams.requestType=="pending")
                                            $scope.isInProcess=false;
                                    else
                                            $scope.isInProcess=true;

                                    $scope.initExistingDocs();
                                 },
                        function(result){
                                $scope.tariffDetailLoader = false;
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        };
        $scope.getDocumentRequestHistoryDetail = function(id,data){
                var promise = tmsService.documentHistoryDetails({"rateRequestId": $routeParams.requestId,"timeStamp":data.timeStamp});
                promise.then(function(result){
                                $scope.selectedRequestHistory = result;
                                $scope.getOtherFieldsList();
                                $scope.rendorHtml(id);
                                },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        }

        $scope.getDocumentRequestHistory = function(value){
                $scope.tariffHistoryLoader = true;
                $scope.tariffHistoryAvailable = false;
                var promise = tmsService.documentHistory(value);
                promise.then(function(result){

                                if(result.length>0){
                                        $scope.tariffHistoryAvailable = true;
                                }

                                $scope.documentRequestHistory = result;
                                $scope.tariffHistoryLoader = false;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: result, type: 'error'});
                        }
                );
        };

        $scope.approveTariff = function(tariff){

                $scope.tariffCreateLoader = true;
                var ExistingAttachmentsId= sharedService.getFinalDocuments();
                var NewAttachmentsId=sharedService.getDocumentId();

                console.log(NewAttachmentsId);
                $scope.tariff.docId=[];
                angular.forEach(ExistingAttachmentsId, function(i,j){
                        $scope.tariff.docId.push(i);
                });
                angular.forEach(NewAttachmentsId, function(i,j){
                        $scope.tariff.docId.push(i);
                });
                $scope.tariff.accountId=$routeParams.accountId;
                $scope.tariff.id=$routeParams.requestId;
                $scope.tariff.action="A";

                var promise = tmsService.update(tariff);
                promise.then(function(msg){

                                $scope.tariffCreateLoader = false;
                                sharedService.clearDocumentId();
                                sharedService.setExistingDocs($scope.tariff.docId);
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                                $scope.getRequestCount();
                                $scope.getTmsRequestList($routeParams.requestType);
                                $location.path("/request/tms/"+ $routeParams.requestType);
                                },
                        function(msg){
                                $scope.tariffCreateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        };

        $scope.rejectTariff = function(){
                $scope.tariffCreateLoader = true;
                var ExistingAttachmentsId= sharedService.getFinalDocuments();
                var NewAttachmentsId=sharedService.getDocumentId();
                $scope.tariff.docId=[];
                angular.forEach(ExistingAttachmentsId, function(i,j){
                        $scope.tariff.docId.push(i);
                });
                angular.forEach(NewAttachmentsId, function(i,j){
                        $scope.tariff.docId.push(i);
                });
                $scope.tariff.accountId=$routeParams.accountId;
                $scope.tariff.id=$routeParams.requestId;
                $scope.tariff.action="R";

                var promise = tmsService.update($scope.tariff);
                promise.then(function(msg){
                                $scope.tariffCreateLoader = false;
                                sharedService.clearDocumentId();
                                flash.pop({title: 'Success', body: msg, type: 'info'});
                                $scope.getRequestCount();
                                $scope.getTmsRequestList($routeParams.requestType);
                                $location.path("/request/tms/"+ $routeParams.requestType);
                            },
                        function(msg){
                                $scope.tariffCreateLoader = false;
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        };

        $scope.initExistingDocs = function(){
            sharedService.setExistingDocs($scope.tariff.docId);
        };
        $scope.setFileType = function(id,t){
            sharedService.updateExistingFileType(id,t);
        };
        $scope.setNewFileType = function(id,t){
            sharedService.updateNewFileType(id,t);
        };


        $scope.removeExistingAttachment = function(id){

                var attachmentsId=sharedService.removeExistingDocumentId(id);
                $scope.tariff.docId=[];
                angular.forEach(attachmentsId, function(i,j){
                        $scope.tariff.docId.push(i);
                });
        }

        $scope.removeNewAttachment = function(id){
                var attachmentsId=sharedService.removeNewDocumentId(id);
        }

        $scope.UndoFileRevision = function(id,index){
                var attachmentsId=sharedService.resetFileRevision(id);
                angular.element('#reviseFiles'+index).scope().queue=[];
        }


        if($routeParams.requestType)
        {
                $scope.getRateRequestList($routeParams.requestType);
                $scope.getTmsRequestList($routeParams.requestType);
        }



        if($routeParams.requestId)
                $scope.selectRateRequest($routeParams.requestId);
        $scope.getRequestCount();

        $scope.loading = false;

});