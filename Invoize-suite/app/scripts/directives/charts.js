angularApp.directive('epc', function(){
    return {
        link: function ($scope, elem, attr) {
            var $box = $(this).closest('.infobox');
            var barColor = $(this).data('color') || (!$box.hasClass('infobox-dark') ? $box.css('color') : 'rgba(255,255,255,0.95)');
            var trackColor = barColor == 'rgba(255,255,255,0.95)' ? 'rgba(255,255,255,0.25)' : '#E2E2E2';
            var size = parseInt(attr.size);
            elem.easyPieChart({
                barColor: barColor,
                trackColor: trackColor,
                scaleColor: false,
                lineCap: 'square',
                lineWidth: parseInt(size/10),
                animate: /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase()) ? false : 1000,
                size:size
            });
        }
    };
});

angularApp.directive('worldmap', function(){
    return {
        link: function ($scope, elem, attr) {
            var gData = {
                "AF": 163,
                "AL": 118,
                "DZ": 15,
                "AO": 851,
                "AG": 11,
                "AR": 35102,
                "AM": 883,
                "AU": 122,
                "AT": 366,
                "AZ": 5217,
                "BS": 754,
                "BH": 2173,
                "BD": 1054,
                "BB": 396,
                "BY": 5289,
                "BE": 463,
                "BZ": 143,
                "BJ": 649,
                "BT": 14,
                "BO": 198,
                "BA": 162,
                "BW": 125,
                "BR": 253,
                "BN": 1196,
                "BG": 484,
                "BF": 867,
                "BI": 147,
                "KH": 1136,
                "CM": 2188,
                "CA": 156,
                "CV": 157,
                "CF": 211,
                "TD": 759,
                "CL": 1918,
                "CN": 5473,
                "CO": 281,
                "KM": 56,
                "CD": 126,
                "CG": 118,
                "CR": 3502,
                "CI": 2238,
                "HR": 5,
                "CY": 25,
                "CZ": 19,
                "DK": 356,
                "DJ": 114,
                "DM": 38,
                "DO": 5087,
                "EC": 6149,
                "EG": 23,
                "SV": 218,
                "GQ": 1455,
                "ER": 225,
                "EE": 1922,
                "ET": 3094,
                "FJ": 315,
                "FI": 23198,
                "FR": 254,
                "GA": 1256,
                "GM": 104,
                "GE": 1123,
                "DE": 359,
                "GH": 1806,
                "GR": 31,
                "GD": 65,
                "GT": 4077,
                "GN": 434,
                "GW": 83,
                "GY": 22,
                "HT": 65,
                "HN": 154,
                "HK": 249,
                "HU": 28,
                "IS": 1277,
                "IN": 102,
                "ID": 606,
                "IR": 3379,
                "IQ": 8414,
                "IE": 2014,
                "IL": 205,
                "IT": 209,
                "JM": 1374,
                "JP": 509,
                "JO": 2713,
                "KZ": 976,
                "KE": 3242,
                "KI": 15,
                "KR": 98626,
                "UNDEFINED": 573,
                "KW": 11732,
                "KG": 444,
                "LA": 634,
                "LV": 239,
                "LB": 391,
                "LS": 18,
                "LR": 98,
                "LY": 7791,
                "LT": 3573,
                "LU": 5243,
                "MK": 958,
                "MG": 833,
                "MW": 504,
                "MY": 215,
                "MV": 143,
                "ML": 908,
                "MT": 78,
                "MR": 349,
                "MU": 943,
                "MX": 104,
                "MD": 536,
                "MN": 581,
                "ME": 388,
                "MA": 917,
                "MZ": 1021,
                "MM": 3565,
                "NA": 1145,
                "NP": 1511,
                "NL": 731,
                "NZ": 138,
                "NI": 638,
                "NE": 56,
                "NG": 266,
                "NO": 451,
                "OM": 5378,
                "PK": 17479,
                "PA": 272,
                "PG": 881,
                "PY": 1717,
                "PE": 155,
                "PH": 186,
                "PL": 488,
                "PT": 2237,
                "QA": 12,
                "RO": 159,
                "RU": 191,
                "RW": 569,
                "WS": 55,
                "ST": 19,
                "SA": 4344,
                "SN": 1266,
                "RS": 3892,
                "SC": 92,
                "SL": 19,
                "SG": 21,
                "SK": 8626,
                "SI": 4644,
                "SB": 67,
                "ZA": 354,
                "ES": 137,
                "LK": 4824,
                "KN": 56,
                "LC": 1,
                "VC": 58,
                "SD": 6593,
                "SR": 33,
                "SZ": 317,
                "SE": 44,
                "CH": 88,
                "SY": 5,
                "TW": 85,
                "TJ": 558,
                "TZ": 2243,
                "TH": 3161,
                "TL": 62,
                "TG": 307,
                "TO": 3,
                "TT": 212,
                "TN": 486,
                "TR": 725,
                "TM": 0,
                "UG": 172,
                "UA": 156,
                "AE": 235,
                "GB": 227,
                "US": 14568,
                "UY": 4071,
                "UZ": 3772,
                "VU": 72,
                "VE": 281,
                "VN": 1199,
                "YE": 302,
                "ZM": 19,
                "ZW": 557
            };
            elem.vectorMap({
                map: 'world_mill_en',
                focusOn:{
                    x:0.8,
                    y:0.5,
                    scale:3
                },
                series: {
                    regions: [{
                        values: gData,
                        scale: ['#C8EEFF', '#0071A4'],
                        normalizeFunction: 'polynomial'
                    }]
                },
                onRegionLabelShow: function(e, el, code){
                    el.html(el.html()+' (Unbilled - '+gData[code]+' Shipments)');
                }

            });
        }
    };
});

angularApp.directive('spark', function(){
    return {
        link: function ($scope, elem, attr) {
            var $box = $(this).closest('.infobox');
            var barColor = $(this).data('color') || (!$box.hasClass('infobox-dark') ? $box.css('color') : 'rgba(255,255,255,0.95)');
            var size = parseInt(attr.size);
            console.log(size);
            elem.sparkline('html', {tagValuesAttribute:'data-values', type: 'bar', barColor: barColor , chartRangeMin:$(this).data('min') || 0} );
        }
    };
});
function randNum(){
    return ((Math.floor( Math.random()* (1+40-20) ) ) + 20)* 1200;
}

function randNum2(){
    return ((Math.floor( Math.random()* (1+40-20) ) ) + 20) * 500;
}

function randNum3(){
    return ((Math.floor( Math.random()* (1+40-20) ) ) + 20) * 300;
}

function randNum4(){
    return ((Math.floor( Math.random()* (1+40-20) ) ) + 20) * 100;
}
function randNumTW(){
    return ((Math.floor( Math.random()* (1+40-20) ) ) + 20);
}

angularApp.directive('plot', function(){
    return {
        link: function ($scope, elem, attr) {
            var likes = [[1, 5+randNum()], [2, 10+randNum()], [3, 15+randNum()], [4, 20+randNum()],[5, 25+randNum()],[6, 30+randNum()],[7, 35+randNum()],[8, 40+randNum()],[9, 45+randNum()],[10, 50+randNum()],[11, 55+randNum()],[12, 60+randNum()],[13, 65+randNum()],[14, 70+randNum()],[15, 75+randNum()],[16, 80+randNum()],[17, 85+randNum()],[18, 90+randNum()],[19, 85+randNum()],[20, 80+randNum()],[21, 75+randNum()],[22, 80+randNum()],[23, 75+randNum()],[24, 70+randNum()],[25, 65+randNum()],[26, 75+randNum()],[27,80+randNum()],[28, 85+randNum()],[29, 90+randNum()], [30, 95+randNum()]];

            var plot = $.plot(elem,
                [ { data: likes, label: "Volume"} ], {
                    series: {
                        lines: { show: true,
                            lineWidth: 2,
                            fill: true, fillColor: { colors: [ { opacity: 0.5 }, { opacity: 0.2 } ] }
                        },
                        points: { show: true,
                            lineWidth: 2
                        },
                        shadowSize: 0
                    },
                    grid: { hoverable: true,
                        clickable: true,
                        tickColor: "#dddddd",
                        borderWidth: 0
                    },
                    colors: ["#3B5998"],
                    xaxis: {ticks:6, tickDecimals: 0},
                    yaxis: {ticks:3, tickDecimals: 0}
                });

            function showTooltip(x, y, contents) {
                $('<div id="tooltip">' + contents + '</div>').css( {
                    position: 'absolute',
                    display: 'none',
                    top: y + 5,
                    left: x + 5,
                    border: '1px solid #fdd',
                    padding: '2px',
                    'background-color': '#dfeffc',
                    opacity: 0.80
                }).appendTo("body").fadeIn(200);
            }

            var previousPoint = null;
            $(elem).bind("plothover", function (event, pos, item) {
                $("#x").text(pos.x.toFixed(2));
                $("#y").text(pos.y.toFixed(2));

                if (item) {
                    if (previousPoint != item.dataIndex) {
                        previousPoint = item.dataIndex;

                        $("#tooltip").remove();
                        var x = item.datapoint[0].toFixed(2),
                            y = item.datapoint[1].toFixed(2);

                        showTooltip(item.pageX, item.pageY,
                            item.series.label +" : " + y);
                    }
                }
                else {
                    $("#tooltip").remove();
                    previousPoint = null;
                }
            });
        }
    };
});


angularApp.directive('flotPie', function(){
    return {
        link: function ($scope, elem, attr) {
            var data = [
                { label: "Internet Explorer",  data: 12},
                { label: "Mobile",  data: 27},
                { label: "Safari",  data: 85},
                { label: "Opera",  data: 64},
                { label: "Firefox",  data: 90},
                { label: "Chrome",  data: 112}
            ];
            $.plot(elem, data,
                {
                    series: {
                        pie: {
                            show: true
                        }
                    },
                    grid: {
                        hoverable: true,
                        clickable: true
                    },
                    legend: {
                        show: false
                    },
                    colors: ["#FA5833", "#2FABE9", "#FABB3D", "#78CD51"]
                });
            $(elem).bind("plothover", function (event, pos, obj)
            {
                if (!obj)
                    return;
                percent = parseFloat(obj.series.percent).toFixed(2);
                $("#hover").html('<span style="font-weight: bold; color: '+obj.series.color+'">'+obj.series.label+' ('+percent+'%)</span>');
            });
        }
    };
});

// we use an inline data source in the example, usually data would
// be fetched from a server
var data = [], totalPoints = 300;
function getRandomData() {
    if (data.length > 0)
        data = data.slice(1);

    // do a random walk
    while (data.length < totalPoints) {
        var prev = data.length > 0 ? data[data.length - 1] : 50;
        var y = prev + Math.random() * 10 - 5;
        if (y < 0)
            y = 0;
        if (y > 100)
            y = 100;
        data.push(y);
    }

    // zip the generated y values with the x values
    var res = [];
    for (var i = 0; i < data.length; ++i)
        res.push([i, data[i]])
    return res;
}

// setup control widget


angularApp.directive('realTimeChart', function(){
    return {

        link: function ($scope, elem, attr) {
            var updateInterval = 30;
            var options = {
                series: { shadowSize: 1 },
                lines: { fill: true, fillColor: { colors: [ { opacity: 1 }, { opacity: 0.1 } ] }},
                yaxis: { min: 0, max: 100 },
                xaxis: { show: false },

                colors: ["#A3C86D"],
                //                colors: ["#F4A506"],
                grid: {	tickColor: "#dddddd",
                    borderWidth: 0
                }
            };
            var plot = $.plot($(elem), [ getRandomData() ], options);
            function update() {
                plot.setData([ getRandomData() ]);
                // since the axes don't change, we don't need to call plot.setupGrid()
                plot.draw();

                setTimeout(update, updateInterval);
            }
            update();


        }
    };
});
angularApp.directive('googleChart', function () {
    return {
        restrict: 'A',
        scope: {
            obj: '=obj'
        },
        link: function (scope, element, attrs) {
            var chart;
            if (scope.obj != undefined) {

                switch (scope.obj.type) {
                    case('PieChart'):
                        chart = new google.visualization.PieChart(element[0]);
                        break;
                    case('ColumnChart'):
                        chart = new google.visualization.ColumnChart(element[0]);
                        break;
                    case('BarChart'):
                        chart = new google.visualization.BarChart(element[0]);
                        break;
                    case('Table'):
                        chart = new google.visualization.Table(element[0]);
                        break;
                    case('ComboChart'):
                        chart = new google.visualization.ComboChart(element[0]);
                        break;
                    case('MotionChart'):
                        chart = new google.visualization.MotionChart(element[0]);
                        break;

                }


                scope.$watch(attrs.chartdata, function (value) {
                    var data = google.visualization.arrayToDataTable(scope.obj.values);
                    var options = scope.obj.options;
                    chart.draw(data, options);
                });
            }
        }
    }
});
