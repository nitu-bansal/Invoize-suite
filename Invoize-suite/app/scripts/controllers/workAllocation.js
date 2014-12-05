/**
 * Created by kamalsingh.saini on 20/1/14.
 */
angularApp.controller('workAllocationCtrl', function($scope, $modal,$timeout, commonService,$routeParams,$rootScope, flash) {
    'use strict';
    $scope.reports = [];
    $scope.fields = {};
    $scope.rule = {};
    $scope.streams = [{id:'shipment',n:'Shipment'},{id:'invoice',n:'Invoice'},{id:'delivery',n:'Delivery'}];
    $scope.rules = [];
    $scope.users = [];
    $scope.minDate='2000-01-01';
    var users=[];

    $scope.reset = function(isReset){
        if(isReset){
            $scope.rules = [];
            $scope.rule = {};
            $scope.rule.stream=null;
            $scope.rule.source=null;
            $('select[name="stream"]').select2('val',null);
            $('select[name="source"]').select2('val',null);
            $('select[name="triggerPoint"]').select2('val','now');
            $scope.rule.triggerPoint="now";
        }
        $scope.rule.id=null;
        $scope.rule.name=null;
        $scope.rule.effectiveDate=null;
        $scope.rule.expiryDate=null;
        $scope.rule.ruleType ="metadata_workFlow";
        $scope.rule.allocated=[{user:null,work:'100'}];
        $scope.rule.conditions = {};
        $scope.rule.isActive = true;
    };

    $scope.reset();

    var promise = commonService.ajaxCall('GET','api/suggestions?suggestionFor=reportingUsers');
    promise.then(function(data) {
        $scope.users = data.msg;
        users = angular.copy(data.msg);
    },function(data){
        flash.pop({
            title: 'Alert',
            body: data.data,
            type: 'error'
        });
    });

    function createFields(){
        if($scope.sourceDetails.fields){
        var fields =  $scope.sourceDetails.fields;
        $scope.fields = {};
        for(var k= 0;k<fields.length;k++){
            $scope.fields[fields[k].key]={type:fields[k].type,label:fields[k].label};
//            $scope.destinationFields[fields[k].key]={type:fields[k].type,label:fields[k].label};
        }
        }
    }

        var promiseSources = commonService.ajaxCall('GET','/api/suggestions?suggestionFor=docType');
        promiseSources.then(function(data) {
            $scope.reports = data.msg;
            $scope.rule.source = null;
        },function(data){
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });


    $scope.getFields=function(){
        if($scope.rule.source != null && $scope.rule.source.details!=null){
            $scope.sourceDetails={};
            $('[name="CollectionType"]').select2('val',null);
            var promise = commonService.ajaxCall('GET','api/sourceType?docType='+$scope.rule.source.details.docType);
            promise.then(function(data) {
                $scope.sourceDetails = data;
                createFields();
            },function(data){
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
        }
    };

    $scope.save = function() {
        if($scope.rule.stream != null && $scope.rule.source != null && $scope.rule.source.details!=null){
            if($scope.rule.conditions.ruleDef==null)
                $scope.rule.conditions.ruleDef={};

            $scope.rule.generateJson = function (root,data){
                var ruleParents = root.find(' > div[group="condition"]');
                data.condition = root.find(' > div.inz-chk > input')[0].checked?'and':'or';
                data.level = root.parent().attr('index');
                data.fields = [];var rule = {};
                for(var k= 0;k<ruleParents.length;k++){
                    var fields = ruleParents.eq(k).find('[cname]');
                    if(!fields[0].hasAttribute('disabled') && fields[0].value != '-1'){
                        rule = {};
                        for(var j= 0;j<fields.length;j++){
                            rule[fields.eq(j).attr('cname')]=fields.eq(j).val();
                        }
                        rule.type = fields.eq(fields.length-1).attr('ftype');
                        data.fields.push(rule);
                    }
                }
                var nextRoot =  root.find(' > div[index]');
                for(var i=0;i<nextRoot.length;i++){
                    if(!nextRoot.eq(i).find(' > div.sub-condition > button')[0].hasAttribute('disabled')){
                        data.fields.push({});
                        $scope.rule.generateJson(nextRoot.eq(i).find(' > div.sub-condition'), data.fields[data.fields.length-1]);
                    }
                }
            };

            $scope.rule.generateJson($('div[rules] > div > div.row > div.sub-condition'),$scope.rule.conditions.ruleDef);
            if($scope.rule.conditions.ruleDef.fields.length!==0){
                $scope.rule.system = $rootScope.loggedInUser.userSystem[0].id;
                commonService.loader(true);
                var promise = commonService.ajaxCall('PUT','api/' + ($scope.rule.triggerPoint=='now'?'assignWorkFlow':'reportRule'),$scope.rule);
                promise.then(function(data) {
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.listRules();
                    commonService.loader();
                },function(data){
                    flash.pop({
                        title: 'Alert',
                        body: data.data.msg,
                        type: 'error'
                    });
                    commonService.loader();
                });
            }
        }
    };

    $scope.listRules = function(){
        $scope.rules = [];
        if($scope.rule.triggerPoint != 'now' && !$scope.rule.isRowCollapsed && $scope.rule.source && $scope.rule.source.details   && $scope.rule.stream){
            var promise = commonService.ajaxCall('GET','api/reportRule?system='+$rootScope.loggedInUser.userSystem[0].id+'&stream='+$scope.rule.stream+'&source='+$scope.rule.source.id+'&triggerPoint='+$scope.rule.triggerPoint);
            promise.then(function(data) {
                $scope.rules = data;
                $scope.reset(false);
            },function(data){
                $scope.rules = [];
                $scope.reset(false);
                flash.pop({
                    title: 'Information',
                    body: data.data,
                    type: 'info'
                });
            });
        }
    };

    $scope.setValue = function(obj){
        if(!obj.work || obj.work==0 || !obj.work.toString().match(/^\d*(\.\d+)?$/))
            obj.work=100;
        var workTotal=0;
        for(var i=0;i<$scope.rule.allocated.length;i++)
            workTotal+= parseInt($scope.rule.allocated[i].work,10);
        if(workTotal>99)
            obj.work=100 - (workTotal-parseInt(obj.work,10));
        else
            $scope.rule.allocated.push({user:null,work:(100-workTotal).toString()})
    };

    $scope.checkDuplicate = function(obj,j){
//        $scope.users = angular.copy(users);

//            if(obj.user){
//                for(var i=0;i< $scope.users.length;i++)
//                if($scope.users[i].id == obj.user)
//                    $scope.users.splice(i,1);
//            }
//        else
//             $scope.users.push(obj.user);

        if(obj.user){
        for(var i=0;i<$scope.rule.allocated.length;i++)
            if(i!==j && obj.user==$scope.rule.allocated[i].user){
                flash.pop({
                    title: 'Duplicate Value',
                    body: 'Duplicate user not allowed!',
                    type: 'info'
                });
                obj.user=null; $('select#user_'+j).select2('val',null); break;
            }
        }
    };

    $scope.removeUser = function(i){
        var obj = $scope.rule.allocated[i-1];
        obj.work = parseInt(obj.work,10)+parseInt($scope.rule.allocated.pop().work,10);
    };

    $scope.distribute = function(){
        var userCount = $scope.users.length;
        var workPart = Math.floor(100/userCount);
        $scope.rule.allocated=[];

        for(var i=0;i<userCount;i++)
            $scope.rule.allocated.push({user:$scope.users[i].id,work:workPart});

        var lastObj=$scope.rule.allocated[$scope.rule.allocated.length-1];
        lastObj.work=parseInt(lastObj.work,10)+(100-workPart*userCount);
    };

    $scope.setRule = function(rule){
        if($scope.rule.triggerPoint!=='now'){
            $scope.rule = angular.copy(rule);

           for(var i=0;i<$scope.reports.length;i++){
               if($scope.reports[i].id === $scope.rule.source.id){
                   $scope.rule.source = $scope.reports[i];
                   setTimeout(function(){ $('select[name="source"]').select2('val',i);},500);
                   break;
               }
           }
        }
    };

    $scope.setMinData=function(dt){
        $scope.minDate=dt.getFullYear()+'-'+(dt.getMonth()<9?'0'+(dt.getMonth()+1):dt.getMonth()+1)+'-'+(dt.getDate()<9?'0'+dt.getDate():dt.getDate());
        if(new Date($scope.rule.expiryDate)<dt)
            $scope.rule.expiryDate="";
    }

});