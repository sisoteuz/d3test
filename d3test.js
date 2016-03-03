var color = d3.scale.category20();

var width = 750;
var height = 750;
var radius = Math.min(width, height) / 2 - 45;
var donutWidth = 15;   

var svg = d3.select("#container").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

// Create arc used to draw the pie chart
var section = d3.svg.arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);


function $(id) {
    return document.getElementById(id);
}

String.prototype.visualLength = function() {
    var ruler = $("ruler");
    ruler.innerHTML = this;
    return ruler.offsetWidth;
}

String.prototype.trimToPx = function(length)  
{
    var tmp = this;
    var trimmed = this;
    if (tmp.visualLength() > length)
    {
        trimmed += "...";
        while (trimmed.visualLength() > length)
        {
            tmp = tmp.substring(0, tmp.length-1);
            trimmed = tmp + "...";
        }
    }

    return trimmed;
}

var len_normal = 30;
// function to draw the normal line of a link's source point (for debug only)
function normal_source(d, i) {
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
}
//
// function to draw the normal line of a link's target point (for debug only)
function normal_target(d, i) {
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
}

function donut(dataset) {
    // Pie chart layout, each section has a fixed size dependent on the number of sections
    var pie = d3.layout.pie()
                .value(function(d) { return 360 / dataset.nodes.length; })
                .padAngle(.2 * Math.PI / 180)
                .sort(function(a, b) { return a.group - b.group; });
    
    // Draw the sections
    var pieSections = drawPieSections(pie, dataset);

    // Draw a circle in the middle inner edge of each section and update coordinates for each node
    svg.selectAll(".circle").data(pie(dataset.nodes)).enter().append("circle")
        .attr("r", 2)
        .attr("opacity", 0.3)
        .attr("fill", "steel")
        .attr("cx", function(d, i) {
            var a = -Math.PI / 2 + d.startAngle + (d.endAngle - d.startAngle) / 2;
            var r = radius - (donutWidth);
            d.data.x = r * Math.cos(a);
            d.data.a = a;
            return r * Math.cos(a);
        })
        .attr("cy", function(d, i) {
            var a = -Math.PI / 2 + d.startAngle + (d.endAngle - d.startAngle) / 2;
            var r = radius - (donutWidth);
            d.data.y = r * Math.sin(a);
            return r * Math.sin(a);
        });

    drawLabels(pie, dataset);

    // fix graph links to map to objects instead of indices
    dataset.links.forEach(function(d, i) {
        d.source = isNaN(d.source) ? d.source : dataset.nodes[d.source];
        d.target = isNaN(d.target) ? d.target : dataset.nodes[d.target];
    });

    // draw the links
    drawLinks(dataset.links, undefined, false);
}

function drawLabels(pie, dataset) {
    var trim = 40;
    svg.selectAll(".label").data(pie(dataset.nodes)).enter().append("text")
        .attr("transform", function(d) {
            var r = radius - donutWidth;
            var angle_drift = 0.25 * Math.PI / 180;
            var dist_drift = 5 + donutWidth;
            var label_rotation = d.data.a * 180 / Math.PI;
            if (d.data.a > Math.PI / 2 && d.data.a < 3 * Math.PI / 2) {
                label_rotation += 180;
                dist_drift += d.data.name.trimToPx(trim).visualLength();
                //dist_drift += d.data.name.visualLength();
                angle_drift = -angle_drift;
            }
            var x_drift_along_r = dist_drift * Math.cos(d.data.a);
            var y_drift_along_r = dist_drift * Math.sin(d.data.a);
            var x_coord_along_arc = r * Math.cos(d.data.a + angle_drift);
            var y_coord_along_arc = r * Math.sin(d.data.a + angle_drift);
            var x_drift = (x_coord_along_arc - d.data.x) + x_drift_along_r;
            var y_drift = (y_coord_along_arc - d.data.y) + y_drift_along_r;
            return "translate(" + x_drift + "," + y_drift + ") " 
            + "rotate(" + label_rotation + "," + d.data.x + "," + d.data.y + ")";
        })
        .attr("x", function(d) { return d.data.x; })
        .attr("y", function(d) { return d.data.y; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .text(function(d) { 
            return d.data.name.trimToPx(trim);
            //return d.data.name;
        })
}

function drawPieSections(pie, dataset) {
    var pieSections = svg.selectAll('node').data(pie(dataset.nodes));
    pieSections.enter()
        .append('path')
        .attr('d', section)
        .attr('fill', function(d, i) { 
            return color(d.data.group);
        })
        .attr("cursor", "pointer")
        .on("click", function(d, i) {
            //console.debug(d.data.name);
            drawLinks(dataset.links, d.data, false);
        });
    return pieSections;
}

var filterFunc = function(d, f) {
    if (f === undefined) {
        return true;
    } else {
        //console.debug("Draw links with filter on " + f.name);
        var cond = d.source.name == f.name || d.target.name == f.name;
        if (cond) {
            //console.debug(d.source.name + "<->" + d.target.name + " matches");
        }
        return cond;
    }
};

var prevData;

Array.prototype.equals = function(array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

function drawNormals(data, filter) {
    var filtered = data.filter(function(d) {return filterFunc(d, filter); })
    var s_normals = svg.selectAll(".normal_source").data(filtered, function(d) { return d.source.name + "_" + d.target.name; });
    var t_normals = svg.selectAll(".normal_target").data(filtered, function(d) { return d.source.name + "_" + d.target.name; });

    if(filtered.equals(prevData) &&
       s_normals.attr("stroke") != "#888888") {
        s_normals
            .attr("stroke", "#888888")
            .attr("stroke-opacity", 0.075);
        t_normals
            .attr("stroke", "#888888")
            .attr("stroke-opacity", 0.075);
        return;
    }

    s_normals.enter().append("path")
        .attr("class", "normal_source")
        .attr("fill", "none")
        .attr("stroke", "#888888")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "1,1")
        .attr("stroke-opacity", 0.075)
        .attr("d", normal_source);

    t_normals.enter().append("path")
        .attr("class", "normal_target")
        .attr("fill", "none")
        .attr("stroke", "#888888")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "1,1")
        .attr("stroke-opacity", 0.075)
        .attr("d", normal_target);

    if (data.length > filtered.length) {
        s_normals
            .attr("stroke", "steelblue")
            .attr("stroke-opacity", 0.7);
        t_normals
            .attr("stroke", "crimson")
            .attr("stroke-opacity", 0.7);
    }

    s_normals.exit()
        .attr("stroke", "#888888")
        .attr("stroke-opacity", 0.075);
    t_normals.exit()
        .attr("stroke", "#888888")
        .attr("stroke-opacity", 0.075);
}

function drawLinks(data, filter, withNormals) {
    var filtered = data.filter(function(d) {return filterFunc(d, filter); })
    var links = svg.selectAll(".link").data(filtered, function(d) { return d.source.name + "_" + d.target.name; });
    if (withNormals) {
        drawNormals(data, filter);
    }

    if(filtered.equals(prevData) &&
       links.attr("stroke") != "#888888") {
        links
            .attr("stroke", "#888888")
            .attr("stroke-opacity", 0.075);
        return;
    }

    links.enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#888888")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.075)
        .attr("d", bezier);

    if (data.length > filtered.length) {
        links.attr("stroke-dasharray", function(d, i) {
            if (d.target.name == filter.name) {
                return "2,2";
            }
        });
        links
            .attr("stroke", function(d) { return color(d.source.group); })
            .attr("stroke-opacity", 0.8);
    }

    links.exit()
        .attr("stroke", "#888888")
        .attr("stroke-opacity", 0.075);

    prevData = filtered;
}

// Function to draw a link as a Bezier curve
// It calculates the normal of the source and target point that will be used as control points of the curve
function bezier(d) {
    // randomize the height of bezier control points to avoid overlap
    var len_normal = 50 + 20 * Math.random();
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

