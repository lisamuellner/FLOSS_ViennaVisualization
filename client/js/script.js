function loadData(){
    loadMapOfVienna();
    loadCharts();
}

function loadMapOfVienna(){

    let widthMap = 1000,
        heightMap = 500,
        centeredMap,
        clickedAreaName,
        highlighted;

    const svgMap = d3.select("#mapOfVienna")
        .attr("width", widthMap)
        .attr("height", heightMap)
        .attr("viewBox", "0 0 1000 500");


    let svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        centered;



    d3.json("./data/oesterreich.json").then(function(data){
        let projection = d3.geoMercator().fitSize([width, height], data);
            // Code for the broken vienna map
            /*.scale(80000)
            .center([16.373819, 48.208174])
            .translate([ width/2, height/2 ]);*/


        let path = d3.geoPath().projection(projection);

        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .join("path")
            .attr("fill", "green")
            .attr("d", path)
            .attr("stroke-width", 10)
            .on("click",  clicked)
            //.on("mouseover", highlight)
            //.on("mouseout", unhighlight)
            .append("title")
                .text(d => d.properties.name);

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("d", path);

        function clicked(d) {

            // FOR COLORING OF THE SELECTED AREA --------------------------------------
            clickedAreaName = d.properties.name;
            console.log(clickedAreaName); // debug output
            if (clickedAreaName != highlighted) {
                d3.select(this)
                    .transition()//Set transition
                    .style('fill', 'red');
                d3.select(highlighted)
                    .transition()//Set transition
                    .style('fill', 'green');
            }
            highlighted = this;


            // CODE FOR ZOOM ---------------------------------------------------------
            centered = centered !== d && d;

            let paths = svg.selectAll("path")
                .classed("active", d => d === centered);

            // Starting translate/scale
            let t0 = projection.translate(),
                s0 = projection.scale();

            // Re-fit to destination
            projection.fitSize([width, height], centered || data);

            // Create interpolators
            let interpolateTranslate = d3.interpolate(t0, projection.translate()),
                interpolateScale = d3.interpolate(s0, projection.scale());

            let interpolator = function(t) {
                projection.scale(interpolateScale(t))
                    .translate(interpolateTranslate(t));
                paths.attr("d", path);
            };

            // TODO: fix the performance issues, then change duration time back to 750
            d3.transition()
                .duration(750)
                .tween("projection", function() {
                    return interpolator;
                });

        }


        function highlight(d) {
            if(centered === d) { return; }

            d3.select(this)
                .transition()//Set transition
                .style('fill', 'red');
        }

        function unhighlight() {
            d3.select(this)
                .transition()//Set transition
                .style('fill', 'green');
        }
    });

}

function loadCharts() {

    // set the dimensions and margins of the graph
    let margin = {top: 10, right: 30, bottom: 30, left: 60},
        widthChart = 260 - margin.left - margin.right,
        heightChart = 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
    let svgChart = d3.select("#chart1")
        .append("svg")
        .attr("width", widthChart + margin.left + margin.right)
        .attr("height", heightChart + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    //Read the data
    d3.csv("./data/testData.csv").then(function(data){

        // Add X axis
        let x = d3.scaleLinear()
            .domain([0, 4000])
            .range([ 0, widthChart ]);
        svgChart.append("g")
            .attr("transform", "translate(0," + heightChart + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        let y = d3.scaleLinear()
            .domain([0, 500000])
            .range([ heightChart, 0]);
        svgChart.append("g")
            .call(d3.axisLeft(y));

        // Add dots
        svgChart.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.GrLivArea); } )
            .attr("cy", function (d) { return y(d.SalePrice); } )
            .attr("r", 1.5)
            .style("fill", "#69b3a2");
        })
}

