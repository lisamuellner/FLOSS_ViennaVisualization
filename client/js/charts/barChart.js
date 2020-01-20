function barChart (data, currentMaxValue) {

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

    barChart(finalDataForChart, maxValue);
}