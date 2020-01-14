var chartData; 
var selectedYear; 
var selectedDistrict = 0;
var selectedDataSets = []; 
var labels;
var minYear, maxYear;
var yearSpan = 3;
var firstRunLine = true;
var firstRunBar = true;
var firstRunRadar = true;

function loadData(){
    loadDataForCharts();
    loadMapOfVienna();
}

var color = d3.scaleOrdinal(d3.schemeCategory10);

async function loadDataForCharts(){
    var response = await fetch("http://localhost:3000/data");
    chartData = await response.json();
    console.log(chartData);
    //data loading complete - chartData is from here on available!
    fillCheckboxes();
    adaptSliderRangeToData();
    showDistrictInformation();
    updateLineChart();
    updateBarChart();
    updateRadarChart();
}

function fillCheckboxes(){
    var dataLabels = Object.entries(chartData[0]);
    console.log(dataLabels);
    let checkboxHtml = "";
    for(let i = 2; i < dataLabels.length-5; i++){
        if(i <= 4){
            //preselect first two checkboxes
            checkboxHtml += '<label><input class="checkbox" type="checkbox" checked name="' + dataLabels[i][1] + '" value="' + dataLabels[i][0] + '" onclick="onCheckboxChange(this);">' + dataLabels[i][1] + '</label>';
            selectedDataSets.push(dataLabels[i][0]);
        }else{
            checkboxHtml += '<label><input class="checkbox" type="checkbox" name="' + dataLabels[i][1] + '" value="' + dataLabels[i][0] + '" onclick="onCheckboxChange(this);">' + dataLabels[i][1] + '</label>';
        }
    }
    
    document.getElementById("checkboxContainer").innerHTML = checkboxHtml;
    //remove first element from array which is only labeling information 
    labels = chartData.shift(); 
}

function adaptSliderRangeToData(){
    minYear = chartData[0].REF_YEAR; 
    maxYear = chartData[chartData.length-1].REF_YEAR;
    document.getElementById("yearSlider").min = minYear; 
    document.getElementById("yearSlider").max = maxYear; 
    document.getElementById("yearSlider").value = maxYear; 
    document.getElementById("minYearSlider").innerHTML = minYear; 
    document.getElementById("maxYearSlider").innerHTML = maxYear;
    document.getElementById("selectedYear").innerHTML = maxYear;
    selectedYear = maxYear;
}

function onSliderChange(sliderElement){
    selectedYear = sliderElement.value;
    document.getElementById("selectedYear").innerHTML = selectedYear;
    showDistrictInformation();
    updateBarChart();
    updateLineChart();
    updateRadarChart();
}

function onCheckboxChange(clickedElement){
    selectedDataSets = [];
    let selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    for (var i = 0; i < selectedCheckBoxes.length; i++) {
        selectedDataSets.push(selectedCheckBoxes[i].value)
    }
    
    updateBarChart();
    updateLineChart();
    updateRadarChart();
}

function onExportSelectedClick(){
    let selectedChart = document.getElementById("exportSelectBox").value;
    console.log(selectedChart);

    let selection = selectedYear +"_"+ document.getElementById("selectedDistrictLabel").innerHTML// +"_"+ selectedDataSets
    if(selectedChart == "barChart"){
        saveSvgAsPng(document.querySelector("#chart2 > svg"), "barChart_"+selection+".png", {backgroundColor: "white"});
    }else if(selectedChart == "radarChart"){
        saveSvgAsPng(document.querySelector("#chart3 > svg"), "radarChart_"+selection+".png", {backgroundColor: "white"});
    }else if(selectedChart == "lineChart"){
        saveSvgAsPng(document.querySelector("#chart1 > svg"), "lineChart_"+selection+".png", {backgroundColor: "white"});
    }
}

function onExportAllClick(){
    let selection = selectedYear +"_"+ document.getElementById("selectedDistrictLabel").innerHTML// +"_"+ selectedDataSets
    saveSvgAsPng(document.querySelector("#chart2 > svg"), "barChart_"+selection+".png", {backgroundColor: "white"});
    saveSvgAsPng(document.querySelector("#chart3 > svg"), "radarChart_"+selection+".png", {backgroundColor: "white"});
    saveSvgAsPng(document.querySelector("#chart1 > svg"), "lineChart_"+selection+".png", {backgroundColor: "white"});
}

function loadMapOfVienna(){

    let width = 400,
        height = 300,
        clickedAreaName,
        highlighted,
        centered;

    // setting up map dimensions
    let svg = d3.select("#mapOfVienna")
        .attr("viewBox", "0 0 400 300");

    // loading the data
    d3.json("http://localhost:3000/map").then(function(data){
        var newData = topojson.feature(data, data.objects.bezirksgrenzen);

        let projection = d3.geoMercator().fitSize([width, height], newData);

        let path = d3.geoPath().projection(projection);
        
        // For the areas
        svg.append("g")
            .selectAll("path")
            .data(newData.features)
            .join("path")
            .attr("fill", "green")
            .attr("d", path)
            .attr("stroke-width", 10)
            .on("click",  clicked)
            .append("title")
                .text(d => d.properties.name);

        // For the lines between the areas
        svg.append("path")
            .datum(newData)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("d", path);

        function clicked(d) {

            // FOR COLORING OF THE SELECTED AREA --------------------------------------
            clickedAreaName = d.properties.NAMEK;
            var selectedArea = this;
            if (selectedArea != highlighted) {
                selectedDistrict = d.properties.BEZNR;
                document.getElementById("selectedDistrictLabel").innerHTML = clickedAreaName;
                document.getElementById("selectedDistrictLabel2").innerHTML = "Charts and Data of " + clickedAreaName;
                d3.select(this)
                    .transition(500)
                    .style('fill', '#69b3a2');
                d3.select(highlighted)
                    .transition(500)
                    .style('fill', 'green');
                highlighted = this;
            } else {
                //selectedDistrict = 0 --> no district selected
                selectedDistrict = 0;
                document.getElementById("selectedDistrictLabel").innerHTML = "Vienna";
                document.getElementById("selectedDistrictLabel2").innerHTML = "Charts and Data of " + "Vienna";
                d3.select(this)
                    .transition(500)
                    .style('fill', 'green');
                highlighted = null;
            }

            // CODE FOR ZOOM ---------------------------------------------------------
            centered = centered !== d && d;

            let paths = svg.selectAll("path")
                .classed("active", d => d === centered);

            // Starting translate/scale
            let t0 = projection.translate(),
                s0 = projection.scale();

            // Re-fit to destination
            projection.fitSize([width, height], centered || newData);

            // Create interpolators
            let interpolateTranslate = d3.interpolate(t0, projection.translate()),
                interpolateScale = d3.interpolate(s0, projection.scale());

            let interpolator = function(t) {
                projection.scale(interpolateScale(t))
                    .translate(interpolateTranslate(t));
                paths.attr("d", path);
            };

            d3.transition()
                .duration(750)
                .tween("projection", function() {
                    return interpolator;
                });
            
            showDistrictInformation();
            updateBarChart();
            updateLineChart();
            updateRadarChart();

        }
    });
}

function loadLineChart (data, currentMaxValue) {
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
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
}

function loadBarChart (data, currentMaxValue) {

    if(!firstRunBar){
        document.querySelector("#chart2 > svg").remove();
    }
    firstRunBar = false;
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 350 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

    let svg = d3.select("#chart2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
        
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
   
    // X axis
    var x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.5);
    
    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    x.domain(data.map(function (d) {
		return d.x;
	}));
        
    y.domain([0, currentMaxValue]);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(45)")
    .style("text-anchor", "start");
        
    g.append("g")
        .call(d3.axisLeft(y))
            
    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.x);
        })
        .attr("y", function (d) {
            return y((d.y));
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.y);
        })
        .attr("fill", function (d, i){ return color(i); });
    
        
    //create labels on top of bars that display actual value
    g.selectAll(".label")        
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .style("display",  d => { return d.y === null ? "none" : null; })
        .style("font-size", "10px")
        .attr("x", ( d => { return x(d.x) + (x.bandwidth() / 2) -10 ; }))
        .style("fill", '#000')
        .attr("y",  d => { return height; })
        .text( d => { return d.y; })
        .attr("y",  d => { return y(d.y) + .1; })
        .attr("dy", "-.7em"); 
}

function loadRadarChart(data, currentMaxValue){

    if(!firstRunRadar){
        document.querySelector("#chart3 > svg").remove();
    }
    firstRunRadar = false;
    // set the dimensions and margins of the graph
    var margin = {top: 40, right: 10, bottom: 50, left: 10},
    width = 350 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        levels: 5,
        maxValue: currentMaxValue,
        roundStrokes: true,
          color: color,
          format: '.0f'
      };
    // Draw the chart, get a reference the created svg element :
    RadarChart("#chart3", data, radarChartOptions);
}

function showDistrictInformation(){
    let districtCode; 
    let filteredData = [];
    if(selectedDistrict == 0){
        let tmpFilteredData = chartData.filter(function(row){
            return (row.REF_YEAR == selectedYear);
        });
        let areaSum = 0.0;
        let populationSum = 0;
        for(let i = 0; i < tmpFilteredData.length; i++){
            areaSum += parseFloat(tmpFilteredData[i].AREA.replace(',', '.'));
            populationSum += Number(tmpFilteredData[i].POP_TOTAL);
        }
        filteredData[0] = {};
        filteredData[0].AREA = parseFloat(areaSum).toFixed(2);
        filteredData[0].DISTRICT_BLAZON = "VIENNA_BLAZON.svg";
        filteredData[0].DENSITY_OF_POPULATION = (populationSum/areaSum).toFixed(2);

    }else{
        if(selectedDistrict < 10){
            districtCode = parseInt(("90" + selectedDistrict + "00"));
        }else{
            districtCode = parseInt(("9" + selectedDistrict + "00"));
        }

        filteredData = chartData.filter(function(row){
            return (row.DISTRICT_CODE == districtCode && row.REF_YEAR == selectedYear);
        });
    }
    
    
    let blazonImageName = filteredData[0].DISTRICT_BLAZON;
    let area = filteredData[0].AREA; 
    let densityOfPopulation = filteredData[0].DENSITY_OF_POPULATION;
    document.getElementById("area").innerHTML = area + " km<sup>2</sup>";
    document.getElementById("densityOfPopulation").innerHTML = densityOfPopulation + "/km<sup>2</sup>";
    document.getElementById("blazon").src = ("img/" + blazonImageName);
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

    loadLineChart(finalDataForChart, maxValue);
}

function updateBarChart(){
    let maxValue = 0;
    let districtCode;
    let finalDataForChart = [];

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
        for (let i = 0; i < selectedDataSets.length; i++) {
            if (Number(dataToProcess[y][selectedDataSets[i]]) > maxValue) {
                maxValue = Number(dataToProcess[y][selectedDataSets[i]]);
            }
            if (dataToProcess[y].REF_YEAR != selectedYear) continue;

            
            let newEntry = {};
            newEntry.x = labels[selectedDataSets[i]];
            newEntry.y = dataToProcess[y][selectedDataSets[i]];

            finalDataForChart.push(newEntry);
        }
    }

    loadBarChart(finalDataForChart, maxValue);
}

function updateRadarChart(){
    let maxValue = 0;
    let districtCode;
    let finalDataForChart = [];
    finalDataForChart[0] = {};
    finalDataForChart[0].name = selectedYear;
    finalDataForChart[0].axes = [];
    finalDataForChart[0].color = '#69b3a2';

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
        for (let i = 0; i < selectedDataSets.length; i++) {
            if (Number(dataToProcess[y][selectedDataSets[i]]) > maxValue) {
                maxValue = Number(dataToProcess[y][selectedDataSets[i]]);
            }
            if (dataToProcess[y].REF_YEAR != selectedYear) continue;

            let newEntry = {};
            newEntry.axis = labels[selectedDataSets[i]];
            newEntry.value = dataToProcess[y][selectedDataSets[i]];

            finalDataForChart[0].axes.push(newEntry);
        }
    }

    loadRadarChart(finalDataForChart, maxValue);
}

function sumUpByYears(chartData) {
    let summedUpData = [];
    for (let y = minYear; y <= maxYear; y++) {

        let filteredData =  chartData.filter(function(row) {
            return (row.REF_YEAR == y);
        });

        let newEntry = {};
        for(let j = 0; j < selectedDataSets.length; j++) {
            let summedUpYear = 0;

            for (let i = 0; i < filteredData.length; i++) {
                summedUpYear += Number(filteredData[i][selectedDataSets[j]]);
            }

            newEntry[selectedDataSets[j]] = summedUpYear;
            newEntry["REF_YEAR"] = +y;
        }

        summedUpData.push(newEntry);
    }

    return summedUpData;
}

