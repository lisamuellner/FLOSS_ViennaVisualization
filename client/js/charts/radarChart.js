function radarChart(data, currentMaxValue){

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

    radarChart(finalDataForChart, maxValue);
}