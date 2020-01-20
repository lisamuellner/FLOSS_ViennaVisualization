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
            //preselect first three checkboxes
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

