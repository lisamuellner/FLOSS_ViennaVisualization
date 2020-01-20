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
