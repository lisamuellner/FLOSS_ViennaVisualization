
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