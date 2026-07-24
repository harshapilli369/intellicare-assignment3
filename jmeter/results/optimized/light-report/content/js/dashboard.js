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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9895604395604396, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "07 GET /api/patients?search= (name search)"], "isController": false}, {"data": [1.0, 500, 1500, "02 GET / (index.html)"], "isController": false}, {"data": [1.0, 500, 1500, "09 GET /api/appointments (day view)"], "isController": false}, {"data": [1.0, 500, 1500, "04 GET /assets/index.css"], "isController": false}, {"data": [1.0, 500, 1500, "05 GET /api/dashboard/stats"], "isController": false}, {"data": [0.05, 500, 1500, "10 POST /api/ai/pre-appointment/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "01 POST /api/auth/login"], "isController": false}, {"data": [1.0, 500, 1500, "03 GET /assets/index.js (main bundle)"], "isController": false}, {"data": [1.0, 500, 1500, "08 GET /api/patients/{id} (record with history)"], "isController": false}, {"data": [1.0, 500, 1500, "06 GET /api/patients (paginated list)"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 910, 0, 0.0, 93.69890109890117, 1, 55195, 4.0, 63.0, 67.0, 1484.029999999997, 7.614999037664957, 239.6915578896829, 3.489371623982226], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["07 GET /api/patients?search= (name search)", 100, 0, 0.0, 12.490000000000004, 1, 67, 6.0, 24.0, 64.0, 66.97999999999999, 0.8684551052133359, 2.12042982285687, 0.408784531946121], "isController": false}, {"data": ["02 GET / (index.html)", 100, 0, 0.0, 7.15, 1, 70, 2.0, 6.0, 63.89999999999998, 69.96999999999998, 0.8677693122060431, 1.5211385892674292, 0.37625935021433904], "isController": false}, {"data": ["09 GET /api/appointments (day view)", 100, 0, 0.0, 5.369999999999999, 1, 58, 2.0, 7.0, 33.34999999999985, 57.909999999999954, 0.8685079034219212, 1.531796888570436, 0.3901500347403161], "isController": false}, {"data": ["04 GET /assets/index.css", 100, 0, 0.0, 9.55, 1, 142, 3.0, 29.600000000000136, 65.94999999999999, 141.26999999999964, 0.8677693122060431, 24.595836442840035, 0.38981824571755846], "isController": false}, {"data": ["05 GET /api/dashboard/stats", 100, 0, 0.0, 7.300000000000002, 1, 100, 2.0, 5.0, 72.84999999999951, 99.97999999999999, 0.8677015453764524, 1.0329800477452775, 0.39232989795829826], "isController": false}, {"data": ["10 POST /api/ai/pre-appointment/{id}", 10, 0, 0.0, 7079.6, 1282, 55195, 1624.5, 49960.400000000016, 55195.0, 55195.0, 0.1150814201047241, 0.26656408236952644, 0.055045780827435414], "isController": false}, {"data": ["01 POST /api/auth/login", 100, 0, 0.0, 66.44, 59, 142, 63.0, 68.80000000000001, 106.74999999999994, 141.7999999999999, 0.8667163584045485, 1.2577544029191008, 0.44122972425419055], "isController": false}, {"data": ["03 GET /assets/index.js (main bundle)", 100, 0, 0.0, 9.69, 2, 130, 3.0, 9.0, 67.0, 129.3999999999997, 0.8677542519958348, 198.00897854477614, 0.38896406412703927], "isController": false}, {"data": ["08 GET /api/patients/{id} (record with history)", 100, 0, 0.0, 9.929999999999996, 2, 101, 5.0, 12.0, 66.34999999999985, 100.74999999999987, 0.8684551052133359, 9.179129449746846, 0.38912555798240506], "isController": false}, {"data": ["06 GET /api/patients (paginated list)", 100, 0, 0.0, 16.779999999999994, 2, 83, 14.0, 27.80000000000001, 71.74999999999994, 82.97999999999999, 0.8682213617183837, 9.119351202595114, 0.40088256058014554], "isController": false}]}, function(index, item){
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
