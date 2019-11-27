function loadData(){
    loadMapOfVienna();
    loadCharts();
}

function loadMapOfVienna(){

    let width = 1000,
        height = 500,
        centered,
        currentName;

    const svg = d3.select("#mapOfVienna")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 1000 500");

    /*
    let svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        centered;

     */

    d3.json("./data/oesterreich.json").then(function(data){
        let projection = d3.geoMercator().fitSize([width, height], data);

        let path = d3.geoPath().projection(projection);

        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .join("path")
            .attr("fill", "green")
            .attr("d", path)
            .attr("stroke-width", 10)
            .on("click",  clicked)
            .on("mouseover", highlight)
            .on("mouseout", unhighlight)
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

            centered = centered !== d && d;
            if(!centered) {
                d = data;
                currentName = 'none';
                console.log(currentName);

            } else {
                currentName = d.properties.name;
                console.log(currentName);
            }

            let paths = svg.selectAll("path")
                .classed("active", d => d === centered);

            // Starting translate/scale
            let t0 = projection.translate(),
                s0 = projection.scale();

            // Re-fit to destination
            projection.fitSize([width, height], centered || d);

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
                .duration(0)
                .tween("projection", function() {
                    return interpolator;
                });
        }


        function highlight(d) {
            d3.select(this)
                .transition()//Set transition
                .style('fill', 'red');
        }

        function unhighlight(d) {
            d3.select(this)
                .transition()//Set transition
                .style('fill', 'green');
        }
    });
}

function loadCharts() {
    /*
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
    var svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    //Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv", function(data) {

        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, 4000])
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 500000])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.GrLivArea); } )
            .attr("cy", function (d) { return y(d.SalePrice); } )
            .attr("r", 1.5)
            .style("fill", "#69b3a2")

    })*/
}

