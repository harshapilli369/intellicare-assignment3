/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9925274725274725, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "07 GET /api/patients?search= (name search)"], "isController": false}, {"data": [1.0, 500, 1500, "02 GET / (index.html)"], "isController": false}, {"data": [1.0, 500, 1500, "09 GET /api/appointments (day view)"], "isController": false}, {"data": [1.0, 500, 1500, "04 GET /assets/index.css"], "isController": false}, {"data": [1.0, 500, 1500, "05 GET /api/dashboard/stats"], "isController": false}, {"data": [0.32, 500, 1500, "10 POST /api/ai/pre-appointment/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "01 POST /api/auth/login"], "isController": false}, {"data": [1.0, 500, 1500, "03 GET /assets/index.js (main bundle)"], "isController": false}, {"data": [1.0, 500, 1500, "08 GET /api/patients/{id} (record with history)"], "isController": false}, {"data": [1.0, 500, 1500, "06 GET /api/patients (paginated list)"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2275, 0, 0.0, 51.67999999999996, 1, 39001, 4.0, 65.0, 95.39999999999964, 459.71999999981927, 27.76896223421136, 873.0640994807815, 12.65968345290262], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["07 GET /api/patients?search= (name search)", 250, 0, 0.0, 16.575999999999993, 1, 139, 6.0, 64.0, 67.0, 130.49, 3.2201141208444426, 5.938230060248335, 1.5157177795381067], "isController": false}, {"data": ["02 GET / (index.html)", 250, 0, 0.0, 4.555999999999999, 1, 95, 2.0, 6.900000000000006, 8.0, 69.0, 3.2168821977739173, 5.638968305668146, 1.3948200154410344], "isController": false}, {"data": ["09 GET /api/appointments (day view)", 250, 0, 0.0, 4.956000000000003, 1, 61, 2.0, 5.0, 32.0, 53.98000000000002, 3.2203215169002473, 5.679628225957079, 1.4466288064200328], "isController": false}, {"data": ["04 GET /assets/index.css", 250, 0, 0.0, 14.883999999999999, 1, 128, 3.0, 63.0, 69.44999999999999, 128.0, 3.216840804982243, 91.17733156621546, 1.445065205363117], "isController": false}, {"data": ["05 GET /api/dashboard/stats", 250, 0, 0.0, 8.779999999999992, 1, 164, 2.0, 23.700000000000017, 62.0, 120.45000000000005, 3.21642693564573, 3.828967804370481, 1.4543024132851299], "isController": false}, {"data": ["10 POST /api/ai/pre-appointment/{id}", 25, 0, 0.0, 2854.039999999999, 15, 39001, 1491.0, 1970.6000000000008, 27950.199999999975, 39001.0, 0.34903039356667176, 0.776988011678557, 0.16694832692280845], "isController": false}, {"data": ["01 POST /api/auth/login", 250, 0, 0.0, 75.71199999999997, 59, 190, 64.0, 121.9, 128.45, 178.92000000000007, 3.2115513077436924, 4.660512932917117, 1.5668857747546376], "isController": false}, {"data": ["03 GET /assets/index.js (main bundle)", 250, 0, 0.0, 25.020000000000003, 1, 261, 4.5, 70.9, 121.39999999999986, 226.99000000000046, 3.216840804982243, 734.0365782946884, 1.4419237592645016], "isController": false}, {"data": ["08 GET /api/patients/{id} (record with history)", 250, 0, 0.0, 16.195999999999987, 1, 133, 4.0, 55.80000000000001, 64.0, 111.47000000000003, 3.22040448280304, 34.98910345951952, 1.4429047444609044], "isController": false}, {"data": ["06 GET /api/patients (paginated list)", 250, 0, 0.0, 18.204000000000015, 1, 174, 4.0, 52.0, 75.0, 128.96000000000004, 3.21949209292742, 33.7645490859862, 1.4865375932042961], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2275, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
