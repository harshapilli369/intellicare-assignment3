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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6428571428571429, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.522, 500, 1500, "07 GET /api/patients?search= (name search)"], "isController": false}, {"data": [1.0, 500, 1500, "02 GET / (index.html)"], "isController": false}, {"data": [0.374, 500, 1500, "09 GET /api/appointments (day view)"], "isController": false}, {"data": [1.0, 500, 1500, "04 GET /assets/index.css"], "isController": false}, {"data": [0.236, 500, 1500, "05 GET /api/dashboard/stats"], "isController": false}, {"data": [0.0, 500, 1500, "10 POST /api/ai/pre-appointment/{id}"], "isController": false}, {"data": [0.996, 500, 1500, "01 POST /api/auth/login"], "isController": false}, {"data": [0.998, 500, 1500, "03 GET /assets/index.js (main bundle)"], "isController": false}, {"data": [0.0, 500, 1500, "08 GET /api/patients/{id} (record with history)"], "isController": false}, {"data": [0.724, 500, 1500, "06 GET /api/patients (paginated list)"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2275, 0, 0.0, 1986.985494505495, 1, 21664, 436.0, 5312.200000000003, 14551.399999999996, 20393.679999999993, 13.322402131584342, 814.5334162628467, 6.073576534272246], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["07 GET /api/patients?search= (name search)", 250, 0, 0.0, 1031.6999999999994, 308, 1959, 1035.5, 1563.3, 1624.9, 1815.2300000000002, 1.5569436573229287, 5.466867071264425, 0.7328582449508317], "isController": false}, {"data": ["02 GET / (index.html)", 250, 0, 0.0, 13.051999999999992, 1, 228, 3.0, 31.600000000000023, 92.59999999999991, 212.47000000000003, 1.5609098231176988, 2.7102516264680356, 0.6768007436174397], "isController": false}, {"data": ["09 GET /api/appointments (day view)", 250, 0, 0.0, 1219.9160000000004, 271, 2132, 1241.0, 1851.5, 1951.45, 2062.4300000000003, 1.563868384836732, 2.71080701473164, 0.7025190010008757], "isController": false}, {"data": ["04 GET /assets/index.css", 250, 0, 0.0, 13.275999999999996, 1, 327, 2.0, 38.0, 88.44999999999999, 170.99000000000046, 1.560861095849358, 76.16971662176589, 0.7011680704010789], "isController": false}, {"data": ["05 GET /api/dashboard/stats", 250, 0, 0.0, 1571.7679999999998, 449, 2945, 1586.0, 2668.9, 2765.7, 2909.94, 1.555529284394308, 1.8046570213480837, 0.7033301354243794], "isController": false}, {"data": ["10 POST /api/ai/pre-appointment/{id}", 25, 0, 0.0, 4919.4000000000015, 2344, 8814, 4445.0, 8504.4, 8744.7, 8814.0, 0.16167103178452485, 0.3621746875707311, 0.07732422317069228], "isController": false}, {"data": ["01 POST /api/auth/login", 250, 0, 0.0, 131.28, 60, 541, 106.0, 214.8, 298.89999999999975, 492.5400000000004, 1.559799596947784, 2.237642195230757, 0.7610116002296026], "isController": false}, {"data": ["03 GET /assets/index.js (main bundle)", 250, 0, 0.0, 23.896, 2, 633, 3.0, 81.9, 125.79999999999995, 358.8800000000019, 1.560802627142982, 744.6964292542797, 0.6996175838463171], "isController": false}, {"data": ["08 GET /api/patients/{id} (record with history)", 250, 0, 0.0, 13059.3, 3388, 21664, 13346.0, 20319.7, 20965.25, 21562.670000000002, 1.516769402514197, 16.442900125664345, 0.6795897157725816], "isController": false}, {"data": ["06 GET /api/patients (paginated list)", 250, 0, 0.0, 525.4400000000003, 117, 1157, 542.5, 798.3000000000001, 940.25, 1078.3500000000001, 1.5585743408789112, 15.290978036570388, 0.7196290846337039], "isController": false}]}, function(index, item){
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
