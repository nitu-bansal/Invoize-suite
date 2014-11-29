'use strict';

angularApp.controller('permissionCtrl', function($scope,$http,$location,$routeParams,roleService,flash){
        $scope.totalPermission = 0;
        $scope.relatedToList = ["Account","User","Permission"]

        $scope.getTotalPermission = function(){
                var promise = permissionService.totalPermission({countFor:'permission'});
                promise.then(function(result){
                                $scope.totalPermission = result.count;
                        },
                        function(result){
                                flash.pop({title: 'Alert', body: "Please try after sometime..!", type: 'error'});
                        }
                );
        }

        $scope.formatResult = function (data) {
                var markup = "<div>" +  data.v + "</div>";
                return markup;
        }

        $scope.formatSelection = function (data) {
                return data.v ;
        }

        $scope.roleBar = {
                placeholder: "Add Permission",
                minimumInputLength: 1,
                multiple:true,
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
                                        selected: $scope.searchBarValue, //selected values
                                        suggestionFor: "workflow", // suggestions for
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
                                return {results: data.msg, more: more};
                        }
                },
                formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
                formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
                dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
                escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
        };

        $scope.create = function(permiission){
                var promise = permissionService.create(permission);
                promise.then(function(msg){
                                flash.pop({title: 'Success', body: msg, type: 'success'});
                        },
                        function(msg){
                                flash.pop({title: 'Alert', body: msg, type: 'error'});
                        }
                );
        }

        $scope.loading = false;
        $scope.getTotalPermission();
});