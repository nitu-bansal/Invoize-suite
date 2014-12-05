angularApp.directive('googleChart', function () {
        return {
            restrict: 'A',
            link: function ($scope, $elm, $attr) {
                $scope.$watch($attr.data, function (value) {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'name');
                    data.addColumn('number', 'votes');

                    angular.forEach(value, function (row) {
                        data.addRow([row.name, row.votes]);
                    });

                    var options = {
                        title: $attr.title,
                        height: $attr.height,
                        width: $attr.width,
                        legend: 'bottom'
                    };
                    console.log("ccol");
                    //render the desired chart based on the type attribute provided
                    var chart;
                    switch ($attr.type) {
                        case('PieChart'):
                            chart = new google.visualization.PieChart($elm[0]);
                            break;
                        case('ColumnChart'):
                            chart = new google.visualization.ColumnChart($elm[0]);
                            break;
                        case('BarChart'):
                            chart = new google.visualization.BarChart($elm[0]);
                            break;
                        case('Table'):
                            chart = new google.visualization.Table($elm[0]);
                            break;
                    }
                    chart.draw(data, options);
                });
            }
        }
    });