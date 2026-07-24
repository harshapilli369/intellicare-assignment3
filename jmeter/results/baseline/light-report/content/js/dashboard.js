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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8368131868131868, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.985, 500, 1500, "07 GET /api/patients?search= (name search)"], "isController": false}, {"data": [1.0, 500, 1500, "02 GET / (index.html)"], "isController": false}, {"data": [0.96, 500, 1500, "09 GET /api/appointments (day view)"], "isController": false}, {"data": [1.0, 500, 1500, "04 GET /assets/index.css"], "isController": false}, {"data": [0.665, 500, 1500, "05 GET /api/dashboard/stats"], "isController": false}, {"data": [0.05, 500, 1500, "10 POST /api/ai/pre-appointment/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "01 POST /api/auth/login"], "isController": false}, {"data": [1.0, 500, 1500, "03 GET /assets/index.js (main bundle)"], "isController": false}, {"data": [0.0, 500, 1500, "08 GET /api/patients/{id} (record with history)"], "isController": false}, {"data": [1.0, 500, 1500, "06 GET /api/patients (paginated list)"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 910, 0, 0.0, 719.8076923076926, 1, 5782, 168.0, 3732.7999999999993, 4751.45, 5434.12, 6.391436879293149, 391.05434235801886, 2.9287135301802247], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["07 GET /api/patients?search= (name search)", 100, 0, 0.0, 366.4299999999999, 267, 548, 354.0, 436.9, 467.95, 547.98, 0.7525360464766262, 3.0642988551104726, 0.35422106875169324], "isController": false}, {"data": ["02 GET / (index.html)", 100, 0, 0.0, 5.8900000000000015, 1, 78, 2.0, 4.900000000000006, 58.249999999999375, 77.95999999999998, 0.7544721335717465, 1.31001118504938, 0.32713440166587443], "isController": false}, {"data": ["09 GET /api/appointments (day view)", 100, 0, 0.0, 398.62999999999994, 313, 617, 383.0, 468.5, 524.9, 616.6699999999998, 0.7575528014302597, 1.31314084232296, 0.3403069225174995], "isController": false}, {"data": ["04 GET /assets/index.css", 100, 0, 0.0, 6.069999999999999, 1, 79, 2.0, 4.0, 46.799999999999955, 78.92999999999996, 0.7544892108042854, 36.81892612607515, 0.33893070016598764], "isController": false}, {"data": ["05 GET /api/dashboard/stats", 100, 0, 0.0, 525.4699999999999, 468, 693, 518.0, 578.9, 595.8499999999999, 692.7699999999999, 0.7516649378373096, 0.8713587706144108, 0.33986412716667413], "isController": false}, {"data": ["10 POST /api/ai/pre-appointment/{id}", 10, 0, 0.0, 3198.2000000000003, 1500, 5782, 3066.0, 5583.700000000001, 5782.0, 5782.0, 0.09170610028979127, 0.19698900214592274, 0.04384697920105646], "isController": false}, {"data": ["01 POST /api/auth/login", 100, 0, 0.0, 70.00000000000003, 59, 158, 65.0, 92.0, 98.79999999999995, 157.51999999999975, 0.7538635506973238, 1.0814702695062193, 0.3837783876743309], "isController": false}, {"data": ["03 GET /assets/index.js (main bundle)", 100, 0, 0.0, 4.460000000000001, 2, 64, 3.0, 5.0, 6.0, 63.76999999999988, 0.7544778258966969, 359.97949588620963, 0.3381887911001796], "isController": false}, {"data": ["08 GET /api/patients/{id} (record with history)", 100, 0, 0.0, 4676.819999999996, 3473, 5705, 4684.0, 5422.7, 5476.4, 5704.86, 0.7307751331837681, 7.799861301163394, 0.32742151475069603], "isController": false}, {"data": ["06 GET /api/patients (paginated list)", 100, 0, 0.0, 176.66, 113, 400, 166.0, 227.60000000000002, 255.79999999999995, 398.96999999999946, 0.7535567880395466, 7.405814820954907, 0.34797545194568363], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 910, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
