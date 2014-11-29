//--Home Page
angularApp.directive('organizationPieChart', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.PieChart(element[0]);
        scope.$watch(attrs.organizationPieChart, function(value) {
        var val=[
          ['Account', '$ value'],
          ['Import', 11000],
          ['Export', 5000],
          ['FTF', 3000],
          ['Domestic', 7000]
        ];
        var data = google.visualization.arrayToDataTable(val);
       
        var options = {'width':500,'height':300};

        chart.draw(data, options);
        });


        }
}); 


angularApp.directive('ratingProfile', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.ColumnChart(element[0]);
        scope.$watch(attrs.ratingProfile, function(value) {
        var val=[['', 'Tariff', 'Quote', 'Tariff / Quote'], ['', 700, 300, 400]];
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300};

        chart.draw(data, options);
        });


        }
});


angularApp.directive('revenueByAccount', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.ColumnChart(element[0]);
        scope.$watch(attrs.revenueByAccount, function(value) {
        var val= [['', 'HP', 'Lenevo', 'Dell'],['', 700, 300, 400]];    
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300 };

        chart.draw(data, options);
        });


        }
});


angularApp.directive('revenueByDeliveryMode', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.PieChart(element[0]);
        scope.$watch(attrs.revenueByDeliveryMode, function(value) {
        var val= [
          ['Delivery modes', 'Revenue'],
          ['EDI', 11],
          ['IMS', 2],
          ['PAPER', 2],
          ['EMAIL', 2]
        ];    
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300};

        chart.draw(data, options);
        });


        }
});

//--Rates Page

//Top quoted
angularApp.directive('topQuoted', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.ColumnChart(element[0]);
        scope.$watch(attrs.topQuoted, function(value) {
        var val=[['', 'Lane 1', 'Lane 2', 'Lane 3'],['', 300, 150, 200]];    
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300,hAxis: {title: "Volume by each lane"}, vAxis: {title: "# of shipments"}};
        chart.draw(data, options);
        });


        }
});

//Accounts
angularApp.directive('accounts', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.ColumnChart(element[0]);
        scope.$watch(attrs.accounts, function(value) {
        var val=[['', 'HP', 'Lenovo', 'Dell'],
                      ['', 23, 15, 13]];
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300,hAxis: {title: "Name of account"}, vAxis: {title: "Rate by each account"}};
        chart.draw(data, options);
        });


        }
});

//Total revenue per lane
angularApp.directive('totalRevenue', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.LineChart(element[0]);
        scope.$watch(attrs.totalRevenue, function(value) {
        var val=[
          ['Month', 'After adding margins in % per shipment', 'Current $ value'],
          ['JAN',   34,       19],
          ['FEB',   23,       13],
          ['MAR',   21,       12],
          ['APR',   12,       10],
          ['MAY',   26,       10],
          ['JUN',   15,       11],
          ['JUL',   18,       12],
          ['AUG',   19,       14],
          ['SEP',   16,       11],
          ['OCT',   15,       11],
          ['NOV',   15,       10],
          ['DEC',   14,       9],
      
        ];
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300,hAxis: {title: "Month"}, vAxis: {title: "$ value billed for each lane"}};
        chart.draw(data, options);
        });

        }
});


//Lane expiry status
angularApp.directive('laneExpiry', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.ColumnChart(element[0]);
        scope.$watch(attrs.laneExpiry, function(value) {
        var val=[['', 'Jan', 'Feb', 'Mar','Apr', 'May', 'Jun','Jul', 'Aug', 'Sep','Oct', 'Nov', 'Dec'],
                      ['', 10, 15,  13, 15, 12, 15, 1, 15, 23, 8, 10,  13]];
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300,hAxis: {title: "Months"}, vAxis: {title: "# of rates expiring"}};
        chart.draw(data, options);
        });


        }
});


//TLCM

//Tariff Expired
angularApp.directive('tariffExpired', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.ColumnChart(element[0]);
        scope.$watch(attrs.tariffExpired, function(value) {
        var val=[['', 'Jan', 'Feb', 'Mar','Apr', 'May', 'Jun','Jul', 'Aug', 'Sep','Oct', 'Nov', 'Dec'],
                      ['', 12, 15,  3, 20, 2, 0, 11, 25, 23, 15, 2,  13]];
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300,hAxis: {title: "Months"}, vAxis: {title: "# of rates expiring"}};
        chart.draw(data, options);
        });


        }
});

//Tariff Expiring 
angularApp.directive('tariffExpiry', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.ColumnChart(element[0]);
        scope.$watch(attrs.tariffExpiry, function(value) {
        var val=[['', 'Jan', 'Feb', 'Mar','Apr', 'May', 'Jun','Jul', 'Aug', 'Sep','Oct', 'Nov', 'Dec'],
                      ['', 11, 1,  2, 1, 23, 5, 9, 15, 8, 15, 13,  13]];
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300,hAxis: {title: "Months"}, vAxis: {title: "Number of tariffs"}};
        chart.draw(data, options);
        });


        }
});


//Rate Requests

//Quote approval status 
angularApp.directive('quoteApprovalStatus', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.ColumnChart(element[0]);
        scope.$watch(attrs.tariffExpiry, function(value) {
        var val=[['', 'Approved', 'In discussion', 'Pending'],
                      ['', 300, 150, 200]];
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300, hAxis: {title: "Status"}, vAxis: {title: "Number of quotes"}};
        chart.draw(data, options);
        });


        }
});

//Quote success comparison
angularApp.directive('quoteSuccessCompare', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.LineChart(element[0]);
        scope.$watch(attrs.tariffExpiry, function(value) {
        var val=[
          ['Month', 'Requested', 'Approved'],
          ['JAN',   34,       19],
          ['FEB',   23,       13],
          ['MAR',   21,       12],
          ['APR',   12,       10],
          ['MAY',   26,       10],
          ['JUN',   15,       11],
          ['JUL',   18,       12],
          ['AUG',   19,       14],
          ['SEP',   16,       11],
          ['OCT',   15,       11],
          ['NOV',   15,       10],
          ['DEC',   14,       9],
      
        ];
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300,curveType: "line", hAxis: {title: "Month"}, vAxis: {title: "Number of requests"}};
        chart.draw(data,options);
        });


        }
});

//Not addressed 
angularApp.directive('notAddressed', function() {
        return function(scope, element, attrs) {
        var chart = new google.visualization.ColumnChart(element[0]);
        scope.$watch(attrs.notAddressed, function(value) {
        var val=[['', '1-5', '5-10', '>10', 'week', 'month'],
                      ['', 300, 150, 200, 100, 350]];
        var data = google.visualization.arrayToDataTable(val);       
        var options = {'width':500,'height':300,hAxis: {title: "Number of days till"}, vAxis: {title: "Number of requests"}};
        chart.draw(data, options);
        });


        }
});


google.setOnLoadCallback(function() {
        angular.bootstrap(document.body,'angularApp');
});
google.load('visualization', '1', {packages: ['corechart']});

