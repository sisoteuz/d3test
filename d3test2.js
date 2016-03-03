var width = 500;
var height = 500;

var svg = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 500 500")
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ") scale(.95, .95)");


var f = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");

var transform = function(v, a) {
    return {x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a)};
}

// initial line
var d = [{x: 100, y: 0}, {x: 180, y: 34}];

// vector of the line
var v = {x: 80, y: 34}

// normal vector of the line
var n_v = transform(v, -Math.PI / 2);

// length of the vector
var l_v = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));

// unit vector
var u_v = {x: v.x / l_v, y: v.y / l_v};

// unit normal vector
var u_n_v = {x: n_v.x / l_v, y: n_v.y / l_v};

// length of normal vector (fixed)
var l_n_v = 80;

// point on the normal vector based on the fixed length
var n_p0 = {x: d[0].x + l_n_v * u_n_v.x, y: d[0].y + l_n_v * u_n_v.y }
var n_p1 = {x: d[1].x + l_n_v * u_n_v.x, y: d[1].y + l_n_v * u_n_v.y }

var p0 = [{x: d[0].x, y: d[0].y}, {x: n_p0.x, y: n_p0.y}]
var p1 = [{x: d[1].x, y: d[1].y}, {x: n_p1.x, y: n_p1.y}]

svg.append("path")
    .attr("stroke-width", 2)
    .attr("stroke", "steelblue")
    .attr("d", f(d));

svg.selectAll(".normal").data([p0, p1]).enter().append("path")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "5,5")
    .attr("stroke", "darkgrey")
    .attr("opacity", 0.5)
    .attr("d", function(d) { return f(d); });

var c = function(d) {
    return "M" + d[0][0].x + "," + d[0][0].y + " C" + d[0][1].x + "," + d[0][1].y + " " + d[1][1].x + "," + d[1][1].y + " " + d[1][0].x + "," + d[1][0].y;
}

svg.append("path")
    .attr("stroke-width", 2)
    .attr("stroke", "crimson")
    .attr("fill", "none")
    .attr("d", c([p0, p1]));
