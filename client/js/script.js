function loadData(){
    loadMapOfVienna();
}

function loadMapOfVienna(){

    let width = 1000,
        height = 500,
        centered,
        currentName;

    const svg = d3.select("svg")
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

            d3.transition()
                .duration(750)
                .tween("projection", function() {
                    return interpolator;
                });
        }

    });
}

