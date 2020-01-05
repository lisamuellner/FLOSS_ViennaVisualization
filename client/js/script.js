var chartData; 
var selectedYear; 
var selectedDistrict = 0; 
var selectedDataSets = []; 
var labels;
var minYear, maxYear;
var yearSpan = 3;
var firstRunLine = true;
var firstRunBar = true;

function loadData(){
    loadDataForCharts();
    loadMapOfVienna();
}

async function loadDataForCharts(){
    var response = await fetch("http://localhost:3000/data");
    chartData = await response.json();
    console.log(chartData);
    //data loading complete - chartData is from here on available!
    fillCheckboxes();
    adaptSliderRangeToData();
    updateLineChart();
    updateBarChart();
    drawTestRadarChart();
}

function drawTestRadarChart(){
    var testData = [
        { name: 'Allocated budget',
            axes: [
                {axis: 'Sales', value: 42},
                {axis: 'Marketing', value: 20},
                {axis: 'Development', value: 60},
                {axis: 'Customer Support', value: 26},
                {axis: 'Information Technology', value: 35},
                {axis: 'Administration', value: 20}
            ],
    color: '#26AF32'
            },
            { name: 'Actual Spending',
                axes: [
                    {axis: 'Sales', value: 50},
                    {axis: 'Marketing', value: 45},
                    {axis: 'Development', value: 20},
                    {axis: 'Customer Support', value: 20},
                    {axis: 'Information Technology', value: 25},
                    {axis: 'Administration', value: 23}
                ],
    color: '#762712'
            },
    { name: 'Further Test',
                axes: [
                    {axis: 'Sales', value: 32},
                    {axis: 'Marketing', value: 62},
                    {axis: 'Development', value: 35},
                    {axis: 'Customer Support', value: 10},
                    {axis: 'Information Technology', value: 20},
                    {axis: 'Administration', value: 28}
                ],
    color: '#2a2fd4'
            }
        ];
        var margin = { top: 50, right: 80, bottom: 50, left: 80 },
            width = Math.min(700, window.innerWidth / 4) - margin.left - margin.right,
            height = Math.min(width, window.innerHeight - margin.top - margin.bottom);

    var radarChartOptions = {
        w: 290,
        h: 350,
        margin: margin,
        levels: 5,
        roundStrokes: true,
          color: d3.scaleOrdinal().range(["#26AF32", "#762712", "#2a2fd4"]),
          format: '.0f'
      };
      // Draw the chart, get a reference the created svg element :
      let svg_radar1 = RadarChart("#chart3", testData, radarChartOptions);
}

function fillCheckboxes(){
    var dataLabels = Object.entries(chartData[0]);
    let checkboxHtml = "";
    for(let i = 2; i < dataLabels.length-2; i++){
        if(i <= 3){
            //preselect first two checkboxes
            checkboxHtml += '<label><input type="checkbox" checked name="' + dataLabels[i][1] + '" value="' + dataLabels[i][0] + '" onclick="onCheckboxChange(this);">' + dataLabels[i][1] + '</label>';
            selectedDataSets.push(dataLabels[i][0]);
        }else{
            checkboxHtml += '<label><input type="checkbox" name="' + dataLabels[i][1] + '" value="' + dataLabels[i][0] + '" onclick="onCheckboxChange(this);">' + dataLabels[i][1] + '</label>';
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
    updateBarChart(false);
    updateLineChart();
    //todo: change data of visualizations to currently selected year 
}

function onCheckboxChange(clickedElement){
    selectedDataSets = [];
    let selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    for (var i = 0; i < selectedCheckBoxes.length; i++) {
        selectedDataSets.push(selectedCheckBoxes[i].value)
    }
    
    updateBarChart();
    updateLineChart();
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
            //.on("mouseover", highlight)
            //.on("mouseout", unhighlight)
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
                d3.select(this)
                    .transition(500)// TODO: Set transition
                    .style('fill', '#69b3a2');
                d3.select(highlighted)
                    .transition(500)// TODO: Set transition
                    .style('fill', 'green');
                highlighted = this;
            } else {
                //selectedDistrict = 0 --> no district selected
                selectedDistrict = 0;
                document.getElementById("selectedDistrictLabel").innerHTML = "Vienna";
                d3.select(this)
                    .transition(500)// TODO: Set transition
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
            
            updateBarChart();
            updateLineChart();

        }

        // highlight clicked area (currently unused)
        function highlight(d) {
            if(centered === d) { return; }
            d3.select(this)
                .transition()//Set transition
                .style('fill', '#69b3a2');
        }

        // unhighlight clicked area (currently unused)
        function unhighlight() {
            d3.select(this)
                .transition()//Set transition
                .style('fill', 'green');
        }
    });
}

function loadLineChart (data) {
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

    let tmpMaxValueArray = data.map(entry => {
        return selectedDataSets.map(property => {
          if (entry.hasOwnProperty(property)) {
            return entry[property]
          }
        })
      })
      .reduce((total, current) => {
          return [
            ...total,
            ...current
          ]
        },
        []);
    let maxValue = Math.max(...tmpMaxValueArray);
        
    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.REF_YEAR; }));
    y.domain([0, maxValue]);
    
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
      .attr("stroke", "steelblue")
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

function loadBarChart (data) {

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
        
    y.domain([0, d3.max(data, function (d) {
		return Number(d.y);
	})]);

    //todo: labels are not visible as a whole
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(90)")
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
        });
        
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

function updateLineChart () {
    let districtCode;
    let finalDataForChart = [];
    if(selectedDistrict == 0){
        //special case, whole Vienna is selected --> sum data from all districts
        let currentMinYear = Number(selectedYear) - yearSpan; 
        let currentMaxYear = Number(selectedYear) + yearSpan
        for(let i = currentMinYear; i <= currentMaxYear; i++){
            //break loop if no data for current year is available
            //case: currentYear is greater than maximum available year
            if(i > maxYear){
                break;
            }
            let dataOfAllDistrictsPerYear = chartData.filter(function(row) {
                return (row.REF_YEAR == Number(i));
            });
            //avoid unnecessary loop if no data for current year is available
            //case: currentYear is lower than minimum available year
            if(dataOfAllDistrictsPerYear.length == 0){
                continue;
            }
            let newEntry = {};
            newEntry["REF_YEAR"] = i;
            //sum values for each selected data set per year
            for(let j = 0; j < selectedDataSets.length; j++){
                let currentSum = dataOfAllDistrictsPerYear.map(item => item[selectedDataSets[j]]).reduce((prev, next) => Number(prev) + Number(next));
                newEntry[selectedDataSets[j]] = currentSum; 
            }
            finalDataForChart.push(newEntry);
        }
        console.log(finalDataForChart);
        loadLineChart(finalDataForChart);
    }else{
        if(selectedDistrict < 10){
            districtCode = parseInt(("90" + selectedDistrict + "00"));
        }else{
            districtCode = parseInt(("9" + selectedDistrict + "00"));
        }
        
        let dataOfDistrict =  chartData.filter(function(row) {
            return (row.DISTRICT_CODE == districtCode && (row.REF_YEAR >= Number(selectedYear) - yearSpan && row.REF_YEAR <= Number(selectedYear) + yearSpan));
        });
        loadLineChart(dataOfDistrict);
    }
}

function updateBarChart(){
    let districtCode; 
    let finalDataForChart = [];
    if(selectedDistrict == 0){
        //special case, whole Vienna is selected --> sum data from all districts
        let dataOfAllDistricts =  chartData.filter(function(row) {
            return (row.REF_YEAR == selectedYear);
        });
        for(let i = 0; i < selectedDataSets.length; i++){
            let newEntry = {}; 
            //newEntry.x = labels[selectedDataSets[i]];
            newEntry.x = selectedDataSets[i];
            let currentSum = 0; 
            for(let j = 0; j < dataOfAllDistricts.length; j++){
                currentSum += Number(dataOfAllDistricts[j][selectedDataSets[i]]);
            }
            newEntry.y = currentSum;
            finalDataForChart.push(newEntry);
        }
    }else{
        if(selectedDistrict < 10){
            districtCode = parseInt(("90" + selectedDistrict + "00"));
        }else{
            districtCode = parseInt(("9" + selectedDistrict + "00"));
        }
        let dataOfDistrict =  chartData.filter(function(row) {
            return (row.DISTRICT_CODE == districtCode && row.REF_YEAR == selectedYear);
        });
        for(let i = 0; i < selectedDataSets.length; i++){
            let newEntry = {}; 
            //newEntry.x = labels[selectedDataSets[i]];
            newEntry.x = selectedDataSets[i];
            newEntry.y = dataOfDistrict[0][selectedDataSets[i]];
            finalDataForChart.push(newEntry); 
        }
        console.log(finalDataForChart);
    }
    loadBarChart(finalDataForChart);

}