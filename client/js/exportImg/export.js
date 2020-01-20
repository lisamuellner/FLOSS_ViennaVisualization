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
