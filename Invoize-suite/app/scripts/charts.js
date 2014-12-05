 google.load('visualization', '1', {packages: ['corechart']});
 function drawVisualization() {
        // Create and populate the data table.
        var data = google.visualization.arrayToDataTable([
          ['Account', '$ value'],
          ['Import', 11000],
          ['Export', 5000],
          ['FTE', 3000],
          ['Domestic', 7000]
        ]);
      
        // Create and draw the visualization.
        new google.visualization.PieChart($('#ssd')).
            draw(data, {title:"Organizational DB"});
      }

google.setOnLoadCallback(drawVisualization);

