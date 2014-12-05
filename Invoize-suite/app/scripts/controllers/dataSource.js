/**
 * Created by kamalsingh.saini on 20/1/14.
 */
angularApp.controller('dataSourceCtrl', function($scope, $modal,$timeout, commonService,$routeParams,$http,limitToFilter, flash,$compile) {
    'use strict';
    $scope.reports = [];
    $scope.nonOpReports = [];
    $scope.rule = {};
    $scope.fields = {};
    $scope.destinationFields = {};
    $scope.rule.indx = null;
    $scope.rules = [];
    $scope.isField=false;
    $scope.rule.fieldType=[];
    $scope.rule.ruleTagNameVal=[{isField:false}];
    $scope.minDate='2010-01-01';
    var objTagNames=[];

    ///function to intialize object on new rule creation or first time.
    function initRule(){
        $scope.rule={};
        $scope.rule.conditions = {};
        $scope.rule.conditions.ruleDef=null;
        $scope.rule.fieldType=null;
        $scope.rule.ruleTagNameVal=[{isField:false}];
        $scope.rule.ruleName=null;
        $scope.rule.effectiveDate = null;
        $scope.rule.expiryDate = null;
        $scope.rule.isActive = true;
        $scope.rule.ruleCollection = null;
    }
    initRule();

    ///get the oprations and non-operations data source to bind dropdown.
    var promise = commonService.ajaxCall('GET','/api/suggestions?suggestionFor=docType&templateType=nonOperational');
    promise.then(function(data) {
        $scope.reports = data.msg;
    },function(data){
        flash.pop({
            title: 'Alert',
            body: data.data,
            type: 'error'
        });
    });
    var promise1 = commonService.ajaxCall('GET','/api/suggestions?suggestionFor=docType&templateType=operational');
    promise1.then(function(data) {
        $scope.nonOpReports = data.msg;

    },function(data){
        flash.pop({
            title: 'Alert',
            body: data.data,
            type: 'error'
        });
    });

    $scope.$watch('form.rulForm.$valid', function(newValue) {
        $scope.$parent.validForm = ($scope.rule.indx == null?!newValue:false);
    });


    ///event to handle drop down event for change rule type
    $scope.setReportIndex=function(){
        if($scope.selectedDoc != null){
            setTimeout(function() {
                $scope.listRules();
            }, 700);
            $scope.fillDetails();
            $('[name="CollectionType"]').select2('val',null);
        }
    };

    ///function to get rules source dropdown data source
    $scope.getSourceFields=function(selected){
        $scope.rule.conditions = {};
        if($scope.rule.ruleCollection!=null){
            var promise = commonService.ajaxCall('GET','api/sourceType?docType='+$scope.rule.ruleCollection);
            promise.then(function(data) {
                if(data.fields){
                    var fields =  data.fields;
                    $scope.fields = {};
                    for(var k = 0;k<fields.length;k++){
                        $scope.fields[fields[k].key]={type:fields[k].type,label:fields[k].label};
                    }
                    $scope.rule.conditions.ruleDef = selected;

                }
            },function(data){
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
        }
    };

    ///handles save rule event to save rule
    $scope.$on("saveRules", function(event, args) {
        if($scope.rule.fieldType != null && $scope.rule.ruleTagNameVal != null){
            commonService.loader(true);
            var rulesData={};
            rulesData.ruleDef={};
            rulesData.ruleType = $scope.selectedDoc;
            rulesData.labelName =  $scope.rule.fieldType;
            rulesData.tag=$scope.rule.ruleTagNameVal;
            rulesData.system=$routeParams.systemId;
            if($scope.rule.ruleId!=undefined)
                rulesData.ruleId=$scope.rule.ruleId;
            rulesData.isActive = $scope.rule.isActive;
            rulesData.ruleCollection = $scope.rule.ruleCollection;
            rulesData.effectiveDate = $scope.rule.effectiveDate;
            rulesData.expiryDate = $scope.rule.expiryDate;
            rulesData.ruleName = $scope.rule.ruleName;

            rulesData.generateJson = function (root,data){
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
                            rulesData.generateJson(nextRoot.eq(i).find(' > div.sub-condition'), data.fields[data.fields.length-1]);
                        }
                    }
            };

            rulesData.generateJson($('div[rules] > div > div.row > div.sub-condition'),rulesData.ruleDef);
            if(rulesData.ruleDef.fields.length!==0){
                var promise = commonService.ajaxCall('PUT','api/reportRule',rulesData);
                promise.then(function(data) {
                    flash.pop({
                        title: 'Success',
                        body: data,
                        type: 'success'
                    });
                    $scope.setReportIndex();
                    commonService.loader();
                },function(data){
                    flash.pop({
                        title: 'Alert',
                        body: data.data,
                        type: 'error'
                    });
                    commonService.loader();
                });
            }
            else  commonService.loader();
        }
    });

    ///function to read rule
    function getRuleConditions(ruleId){
        commonService.loader(true);
        var promise = commonService.ajaxCall('GET','api/reportRule?ruleId='+ruleId);
        promise.then(function(data) {
            $scope.rule.ruleId=ruleId;
            $scope.rule.fieldType=data.labelName;
            $scope.rule.effectiveDate = data.effectiveDate;
            $scope.rule.expiryDate = data.expiryDate;
            $scope.rule.isActive = data.isActive;
            $scope.rule.ruleName=data.ruleName;
            $scope.rule.ruleTagNameVal=data.tag;
            $timeout(function(){
                $scope.rule.ruleCollection = data.ruleCollection;
            },300);
            $timeout(function(){
                $scope.getDestFields(data.ruleDef);
            },300);
            commonService.loader(false);
            $scope.$parent.validForm = false;
        },function(data){
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'info'
            });
            commonService.loader(false);
        });
    }

    ///function to read all rules of selected rule type.
    $scope.listRules = function(){
        commonService.loader(true);
        var promise = commonService.ajaxCall('GET','api/reportRule?system='+$routeParams.systemId+'&ruleType='+$scope.selectedDoc);
        promise.then(function(data) {
            $scope.rules = data;
            commonService.loader(false);
        },function(data){
            $scope.rules = [];
            commonService.loader(false);
            flash.pop({
                title: 'Alert',
                body: data.data,
                type: 'error'
            });
        });
    };

    ///function to fill rule object on edit
    $scope.fillDetails = function(indx){
        $scope.rule.indx = indx;
        if(indx != null){
            getRuleConditions($scope.rules[indx].id);
        }
        else{
            initRule();
            $('input#createRul')[0].checked = true;
        }
    };

    ///function to clear all filter
    $scope.clearFilterAll = function(secondField){
        $scope.rule.ruleTagNameVal=[{isField:false}];
        $('.ruleTagName').val('');
        $('.ruleTagVal').select2('val',null);
        $('[name="ruleCollection"]').select2('val',[]);
        $scope.getDestFields();

    };


    $scope.clearFilter = function(index){
        $scope.rule.ruleTagNameVal[index].tagVal=null;
        $('[name="ruleTagVal_' + index + '"]').val('');
    };

    ///function to get destination fields data source for rules
    $scope.getDestFields = function(selected){
        if($scope.selectedDoc!=null){
            if($scope.rule.fieldType!=null)
                var promise = commonService.ajaxCall('GET','api/sourceType?docType='+$scope.selectedDoc+'&ruleFor='+$scope.rule.fieldType);
            else
                var promise = commonService.ajaxCall('GET','api/sourceType?docType='+$scope.selectedDoc);
            promise.then(function(data) {
                if( data.fields){
                    var fields =  data.fields;
                    $scope.destinationFields = {};
                    for(var k = 0;k<fields.length;k++){
                        $scope.destinationFields[fields[k].key]={type:fields[k].type,label:fields[k].label};
                    }
                    $scope.destinationFields["SHORTDATE"]={type:"date",label:"SHORTDATE()"};
                    $scope.getSourceFields(selected);
                }
            },function(data){
                flash.pop({
                    title: 'Alert',
                    body: data.data,
                    type: 'error'
                });
            });
        }
    };



    function formatResult(data) {
        if (data.id.indexOf('new_') == 0)
            var markup = "<div> <button class='inz-btn btn-xs btn-success'><i class='icon-plus icon-white'></i> Add : \"" + data.n + "\"</button></div>";
        else
        {
            var ruleFor=$scope.selectedDoc;
            var ruleMetadata=$scope.rule.fieldType[0].n;
            if (data.fieldsFor.indexOf(ruleFor) == 0)
            {
                var markup = "<div>&nbsp;&nbsp;" + data.n + "</div>";
            }
            else
            {
                var markup = "<div><i class='fa fa-tag'>&nbsp;&nbsp;" + data.n + "</i></div>";
            }
        }
        return markup;
    }

    function formatSelection(data) {
        return "<div class='itemNew'><b>" + data.n + "</b></div>";
    }

     var fnSearchChoice = function(term, data) {
        if (term.trim().length > 1) {
            if ($(data).filter(function() {
                return this.n.toLowerCase().localeCompare(term.toLowerCase()) === 0;
            }).length === 0) {
                return {
                    // to make id Unique so that for the same term which was removed and then addded, next time button shows up.
                    id: 'new_' + term + '_' + Math.floor((Math.random() * 1000) + 1).toString(),
                    v: term,
                    n: term,
                    s: ""
                };
            }
        }
    };

    ///function to add new rule tag
    $scope.addTag = function(){
        $scope.rule.ruleTagNameVal.push({isField:false});
    };

    ///function to remove selected tag
    $scope.removeTag = function(index){
        $scope.rule.ruleTagNameVal.splice(index, 1);
    };

    ///get the field bar suggestion for tag starts
    $scope.fieldBar = function(value) {
        return $http.get('/api/suggestion?q='+value+'&keys=true&pageLimit=100&page=1&suggestionFor='+ $scope.rule.fieldType+'&ruleFor='+ $scope.selectedDoc+'&systemId='+$routeParams.systemId)
            .then(function(response){
                var res =_.filter(response.data.msg, function(val){ return val.id.toLowerCase().indexOf(value) != -1 ; })
                objTagNames=res;
                return limitToFilter(res, 15);
            });
    };

    $scope.fieldBarVal = function(value,idx) {
        return $http.get('/api/suggestion?q='+value+'&keys=true&pageLimit=100&page=1&suggestionFor='+ $scope.rule.fieldType+'&ruleFor='+ $scope.selectedDoc+'&systemId='+$routeParams.systemId)
            .then(function(response){
                var res =_.filter(response.data.msg, function(val){ return val.id.toLowerCase().indexOf(value) != -1 ; })
                if(res.length==0)
                {
                    $scope.rule.ruleTagNameVal[idx].tagVal=null;
                    $('[name="ruleTagVal_' + idx + '"]').val('');
                }
                return limitToFilter(res, 15);
            });

    };

    $scope.valueBar = function(value,idx) {
        var objFieldFor =_.filter(objTagNames, function(val){ return val.id==$scope.rule.ruleTagNameVal[idx].tagName ; })
        if(objFieldFor.length)
            return $http.get('/api/suggestion?q='+value+'&responseType=array&pageLimit=100&page=1&suggestionFor=ruleTagValue&column='+ $scope.rule.ruleTagNameVal[idx].tagName+'&systemId='+$routeParams.systemId+'&collection='+objFieldFor[0].fieldsFor)
                .then(function(response){
                    var res =_.filter(response.data.msg, function(val){ return val.toLowerCase().indexOf(value) != -1 ; })
                    return limitToFilter(res, 15);
                });
            else return[];
    };
    ///get the field bar suggestion for tag ends

    ///function to set min date for expiry date picker
    $scope.setMinData=function(dt){
        $scope.minDate=dt.getFullYear()+'-'+(dt.getMonth()<9?'0'+(dt.getMonth()+1):dt.getMonth()+1)+'-'+(dt.getDate()<9?'0'+dt.getDate():dt.getDate());
        if(new Date($scope.rule.expiryDate)<dt)
            $scope.rule.expiryDate="";
    }

});