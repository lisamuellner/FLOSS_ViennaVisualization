function lineChart (data, currentMaxValue) {
    if(!firstRunLine){
        document.querySelector("#chart1 > svg").remove();
    }
    firstRunLine = false;
    // set the dimensions and margins of the graph
    let margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 350 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    let svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // format the data
    data.forEach(function(d) {
        d.REF_YEAR = new Date(d.REF_YEAR.toString());
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.REF_YEAR; }));
    y.domain([0, currentMaxValue]);

    // create valuelines and append them
    let valueLines = [];
    for(let i = 0; i < selectedDataSets.length; i++){
        var tempValueline = d3.line()
            .x(function(d) { return x(d.REF_YEAR); })
            .y(function(d) { return y(d[selectedDataSets[i]]); });
        valueLines.push(tempValueline);
        // Add the valueline path.
        svg.append("path")
            .data([data])
            .attr("fill", "none")
            .attr("stroke", color(i))
            .attr("stroke-width", 1.5)
            .attr("class", "line")
            .attr("d", tempValueline);
    }


    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(
            d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).ticks(6));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
}

function updateLineChart () {
    let maxValue = 0;
    let districtCode;
    let finalDataForChart = [];
    let currentMinYear = Number(selectedYear) - yearSpan;
    let currentMaxYear = Number(selectedYear) + yearSpan

    let dataToProcess = [];
    if(selectedDistrict == 0){
        //special case, whole Vienna is selected --> sum data from all districts
        dataToProcess = sumUpByYears(chartData);
    }else{
        if(selectedDistrict < 10){
            districtCode = parseInt(("90" + selectedDistrict + "00"));
        }else{
            districtCode = parseInt(("9" + selectedDistrict + "00"));
        }
        dataToProcess =  chartData.filter(function(row) {
            return (row.DISTRICT_CODE == districtCode);
        });
    }

    for(let y = 0; y < dataToProcess.length; y++) {
        let newEntry = {};
        newEntry["REF_YEAR"] = dataToProcess[y].REF_YEAR;

        for (let i = 0; i < selectedDataSets.length; i++) {
            if (Number(dataToProcess[y][selectedDataSets[i]]) > maxValue) {
                maxValue = Number(dataToProcess[y][selectedDataSets[i]]);
            }
            if (dataToProcess[y].REF_YEAR < currentMinYear || dataToProcess[y].REF_YEAR > currentMaxYear) continue;

            newEntry[selectedDataSets[i]] = dataToProcess[y][selectedDataSets[i]];

        }

        if (dataToProcess[y].REF_YEAR >= currentMinYear && dataToProcess[y].REF_YEAR <= currentMaxYear)
            finalDataForChart.push(newEntry);
    }

    lineChart(finalDataForChart, maxValue);
}