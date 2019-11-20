function loadData(){
    loadMapOfVienna();
}

function loadMapOfVienna(){

    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    // Projection
    var projection = d3.geoMercator()
        .scale(80000) //.scale(40000)
        .center([16.373819, 48.208174])
        .translate([ width/2, height/2 ]);

    d3.json("./data/bezirksgrenzen.json").then(function(data){
        console.log(data);

        // Draw the map
        svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("fill", "grey")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr('fill', 'none')
            .attr('stroke', '#999999')
            .attr('stroke-width', '0.5')
    });
}

