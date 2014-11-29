'use strict';
angularApp.controller('mRoleCtrl', function($scope,$http,$location,$routeParams,$route,$dialog,$stateParams,roleService,permissionService,flash){  
 
        var counter = 2;
        var moreRoles = true;
        $scope.totalRole = 0;
        $scope.roleList = [];
        $scope.role = {};  
        $scope.search='';
        
        $scope.toHumanReadable = function(str){
                var out = str.replace(/^[a-z]|[^\s][A-Z]/g, function(str, offset) {
                        if (offset == 0)
                                return(str.toUpperCase());
                        else 
                                return(str.substr(0,1) + " " + str.substr(1).toUpperCase());
                        });
                return(out);
        };

        $scope.formatResult = function (data) {                
                if (data.n === "new")
                        var markup = "<div>" + $scope.toHumanReadable(data.v) +"</div>";
                else
                        var markup = "<div>" + $scope.toHumanReadable(data.v) + "</div>";
                return markup;

        }

        $scope.formatSelection = function (data) {
                return "<div class='itemNew'><b>" + $scope.toHumanReadable(data.v) + "</b></div>";
        }
        $scope.roleBar = {
                placeholder: "Add Permission",
                minimumInputLength: 0,
                multiple:true,
                tags: true,                               
                ajax: {
                        method: 'POST',
                        url: "/api/list/suggestion",
                        dataType: 'json',
                        quietMillis: 100,
                        data: function (term, page) { // page is the one-based page number tracked by Select2
                                return {
                                        q: term, //search term
                                        pageLimit: 10, // page size
                                        page: page, // page number
                                        selected: $scope.role.definition, //selected values
                                        suggestionFor: "permission", // suggestions for
                                        //   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
                                };
                        },
                        results: function (data, page) {
                                var data = data
                                data.total = 100;
                                if(data.msg.length < 10)
                                        var more = false
                                else
                                        var more = (page * 10) < data.total;                                  
                
                                return {group: "Groups" ,results: data.msg, more: more}; 
                              
                         
                        }
                },
                initSelection : function (element, callback) {
                        callback($(element).data('$ngModelController').$modelValue);
                },
                formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
                formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
                dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                escapeMarkup: function (m) { return m; } 
               
        };
             
});