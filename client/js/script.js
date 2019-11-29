function loadData(){
    loadMapOfVienna();
    loadChart1();
    loadChart2();
}

function loadMapOfVienna(){

    let width = 1000,
        height = 500,
        clickedAreaName,
        highlighted,
        centered;

    // setting up map dimensions
    let svg = d3.select("#mapOfVienna")
        .attr("viewBox", "0 0 1000 500");

    // loading the data
    d3.json("http://localhost:3000/map").then(function(data){
        var newData = topojson.feature(data, data.objects.bezirke_wien_gross);

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
            clickedAreaName = d.properties.name;
            var selectedArea = this;
            console.log(clickedAreaName); // debug output
            if (selectedArea != highlighted) {
                d3.select(this)
                    .transition(500)// TODO: Set transition
                    .style('fill', '#69b3a2');
                d3.select(highlighted)
                    .transition(500)// TODO: Set transition
                    .style('fill', 'green');
                highlighted = this;
            } else {
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

            // TODO: fix the performance issues, then change duration time back to 750
            d3.transition()
                .duration(750)
                .tween("projection", function() {
                    return interpolator;
                });
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

function loadChart1() {
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

function loadChart2 () {
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 70, left: 60},
        width = 260 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#chart2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv").then(function(data) {

        // X axis
        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(data.map(function(d) { return d.Country; }))
            .padding(0.2);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 13000])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.Country); })
            .attr("y", function(d) { return y(d.Value); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.Value); })
            .attr("fill", "#69b3a2");
    })
}

