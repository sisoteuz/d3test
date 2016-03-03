var color = d3.scale.category20();

var width = 500;
var height = 500;
var radius = Math.min(width, height) / 2;
var donutWidth = 20;   

var svg = d3.select("#container").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0 0 500 500")
            .append("g")
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

// Create arc used to draw the pie chart
var section = d3.svg.arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);

function donut(dataset) {
    // Pie chart layout, each section has a fixed size dependent on the number of sections
    var pie = d3.layout.pie()
                .value(function(d) { return 360 / dataset.nodes.length; })
                .padAngle(.2 * Math.PI / 180)
                .sort(function(a, b) { return a.group - b.group; });

    // Draw the sections
    drawPieSections(pie, dataset);

    // Draw a circle in the middle inner edge of each section and update coordinates for each node
    svg.selectAll(".circle").data(pie(dataset.nodes)).enter().append("circle")
        .attr("r", 2)
        .attr("opacity", 0.5)
        .attr("fill", "steel")
        .attr("cx", function(d, i) {
            var offset = - Math.PI / dataset.nodes.length
            var a = d.startAngle + (offset / 2) + (d.endAngle - d.startAngle) / 2;
            var r = radius - (donutWidth);
            d.data.x = r * Math.cos(a);
            return r * Math.cos(a);
        })
        .attr("cy", function(d, i) {
            var offset = - Math.PI / dataset.nodes.length
            var a = d.startAngle + (offset / 2) + (d.endAngle - d.startAngle) / 2;
            var r = radius - (donutWidth);
            d.data.y = r * Math.sin(a);
            return r * Math.sin(a);
        });

    //svg.selectAll(".label").data(pie(dataset.nodes)).enter().append("text")
        ////.attr("transform", function(d) {return "rotate(" + ((Math.PI / 2 + d.data.a) * (180 / Math.PI)) + ")"; })
        //.attr("x", function(d) { return d.data.x; })
        //.attr("y", function(d) { return d.data.y; })
        //.attr("font-family", "sans-serif")
        //.attr("font-size", "5px")
        //.text(function(d) { return d.data.name; });

    // fix graph links to map to objects instead of indices
    dataset.links.forEach(function(d, i) {
        d.source = dataset.nodes[d.source];
        d.target = dataset.nodes[d.target];
    });

    //var slice = dataset.links.slice(85, 86);
    var slice = dataset.links;

    // function to draw the normal line of a link's source point (for debug only)
    var normal_source = function(d, i) {
        var len_normal = 20;
        var vector = {x: d.target.x - d.source.x, y: d.target.y - d.source.y};
        var len = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
        var unit_vector = {x: vector.x / len, y: vector.y / len};
        var unit_normal_vector = transform(unit_vector, -Math.PI / 2);
        if (unit_normal_vector.x <= 0 && d.target.x < 0 && d.source.x < 0) {
            unit_normal_vector = transform(unit_vector, Math.PI / 2);
        }
        if (unit_normal_vector.x >= 0 && d.target.x > 0 && d.source.x > 0) {
            unit_normal_vector = transform(unit_vector, Math.PI / 2);
        }
        if (unit_normal_vector.y >= 0 && d.target.y > 0 && d.source.y > 0) {
            unit_normal_vector = transform(unit_vector, Math.PI / 2);
        }
        if (unit_normal_vector.y <= 0 && d.target.y < 0 && d.source.y < 0) {
            unit_normal_vector = transform(unit_vector, Math.PI / 2);
        }
        var n_p0 = {x: d.source.x + len_normal * unit_normal_vector.x, y: d.source.y + len_normal * unit_normal_vector.y};
        var n_p1 = {x: d.target.x + len_normal * unit_normal_vector.x, y: d.target.y + len_normal * unit_normal_vector.y};

        return "M" + d.source.x + "," + d.source.y + "L" + n_p0.x + "," + n_p0.y;
    };

    // function to draw the normal line of a link's target point (for debug only)
    var normal_target = function(d, i) {
        var len_normal = 20;
        var vector = {x: d.target.x - d.source.x, y: d.target.y - d.source.y};
        var len = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
        var unit_vector = {x: vector.x / len, y: vector.y / len};
        var unit_normal_vector = transform(unit_vector, -Math.PI / 2);
        if (unit_normal_vector.x <= 0 && d.target.x < 0 && d.source.x < 0) {
            unit_normal_vector = transform(unit_vector, Math.PI / 2);
        }
        if (unit_normal_vector.x >= 0 && d.target.x > 0 && d.source.x > 0) {
            unit_normal_vector = transform(unit_vector, Math.PI / 2);
        }
        if (unit_normal_vector.y >= 0 && d.target.y > 0 && d.source.y > 0) {
            unit_normal_vector = transform(unit_vector, Math.PI / 2);
        }
        if (unit_normal_vector.y <= 0 && d.target.y < 0 && d.source.y < 0) {
            unit_normal_vector = transform(unit_vector, Math.PI / 2);
        }
        var n_p0 = {x: d.source.x + len_normal * unit_normal_vector.x, y: d.source.y + len_normal * unit_normal_vector.y};
        var n_p1 = {x: d.target.x + len_normal * unit_normal_vector.x, y: d.target.y + len_normal * unit_normal_vector.y};

        return "M" + d.target.x + "," + d.target.y + "L" + n_p1.x + "," + n_p1.y;
    };

    // draw the links
    drawLinks(slice);

    // draw the source points normal
    svg.selectAll(".normal_source").data(slice).enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2")
        .attr("stroke-opacity", 0.5)
        .attr("d", function(d) {
            return normal_source(d);
        });

    // draw the target points normal
    svg.selectAll(".normal_target").data(slice).enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "crimson")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2")
        .attr("stroke-opacity", 0.5)
        .attr("d", function(d) {
            return normal_target(d);
        });
}

function drawPieSections(pie, dataset) {
    svg.selectAll('node')
        .data(pie(dataset.nodes))
        .enter()
        .append('path')
        .attr('d', section)
        .attr('fill', function(d, i) { 
            return color(d.data.group);
        });
}

var filterFunc = function(d, f) {
    if (f === undefined) {
        return true;
    } else {
        console.debug("Draw links with filter on " + f.name);
        var cond = d.source.name == f.name || d.target.name == f.name;
        if (cond) {
            console.debug(d.source.name + "<->" + d.target.name + " matches");
        }
        return d.source.name == f.name;
    }
};

function drawLinks(data, filter) {
    var filtered = data.filter(function(d) {return filterFunc(d, filter); })
    var links = svg.selectAll(".link").data(filtered);
    console.debug("filtered: " + filtered);

    links.enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#888888")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.2)
        .attr("d", function(d) {
            return bezier(d);
        });
    links.exit().remove();
}

// Function to draw a link as a Bezier curve
// It calculate the normal of the source and target point that will be used as control points of the curve
function bezier(d) {
    // randomize the height of bezier control points to avoid overlap
    var len_normal = 25 + 20 * Math.random();
    var vector = {x: d.target.x - d.source.x, y: d.target.y - d.source.y};
    var len = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    var unit_vector = {x: vector.x / len, y: vector.y / len};
    var unit_normal_vector = transform(unit_vector, -Math.PI / 2);
    // flip normals if bezier control points are heading wrong way, that was tough..
    if (unit_normal_vector.x <= 0 && d.target.x < 0 && d.source.x < 0) {
        unit_normal_vector = transform(unit_vector, Math.PI / 2);
    }
    if (unit_normal_vector.x >= 0 && d.target.x > 0 && d.source.x > 0) {
        unit_normal_vector = transform(unit_vector, Math.PI / 2);
    }
    if (unit_normal_vector.y >= 0 && d.target.y > 0 && d.source.y > 0) {
        unit_normal_vector = transform(unit_vector, Math.PI / 2);
    }
    if (unit_normal_vector.y <= 0 && d.target.y < 0 && d.source.y < 0) {
        unit_normal_vector = transform(unit_vector, Math.PI / 2);
    }

    // control points coordinates
    var n_p0 = {x: d.source.x + len_normal * unit_normal_vector.x, y: d.source.y + len_normal * unit_normal_vector.y};
    var n_p1 = {x: d.target.x + len_normal * unit_normal_vector.x, y: d.target.y + len_normal * unit_normal_vector.y};

    var data = [[{x: d.source.x, y: d.source.y}, n_p0], [{x: d.target.x, y: d.target.y}, n_p1]];

    return "M" + data[0][0].x + "," + data[0][0].y + " C" + data[0][1].x + "," + data[0][1].y + " " + data[1][1].x + "," + data[1][1].y + " " + data[1][0].x + "," + data[1][0].y;
}

// Generic 2D transformation
function transform(v, a) {
    return {x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a)};
}

d3.json("data.json", donut);

