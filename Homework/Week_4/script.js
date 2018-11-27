// define svg width and height as global variables
var w = 700;
var h = 500;
var barPadding = 3;
var margins = {top: 10, bottom: 50, left: 70, right: 0},
    width = w - margins.left - margins.right,
    height = h - margins.top - margins.bottom;

// add title, student data and assignment description to HTML
d3.select("title")
  .text("Time Travel Doctor Who");
d3.select("body")
  .append("h2")
  .attr("class", "title")
  .text("Time Travel Doctor Who");
d3.select("body")
  .append("p")
  .attr("class", "student")
  .html("By: Maud van Boven <br> Student ID: 1247467");
d3.select("body")
  .append("p")
  .attr("class", "text")
  .text("Through how many years of time did each incarnation of the Doctor actually travel? Data source");

// add SVG to DOM and remember its reference
var svg = d3.select("body")
            .append("svg")
            .attr("height", h)
            .attr("width", w);

// load in json
let inFile = "doctor.json";
d3.json(inFile, function(data) {
    var doctors = Object.keys(data).map(x => x);
    var travels = Object.values(data).map(x => parseInt(x.travelled));

    var barWidth = width / travels.length - barPadding;

    var scales = scale(doctors, travels, barWidth);
    var xScale = scales[0];
    var yScale = scales[1];

    bars(travels, yScale, barWidth);

    labels(travels, yScale, barWidth);

    axes(xScale, yScale);
});


function axes(xScale, yScale) {
    // define x axis
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom");

    // define y axis
    var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left");

    // create x axis
    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(" + margins.left + ","
                                     + (height + margins.top + barPadding)
                                     + ")")
       .call(xAxis);

    // create y axis
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + (margins.left - barPadding)
                                     + "," + margins.top + ")")
       .call(yAxis);

   // add label x axis
   svg.append("text")
      .attr("class", "label")
      .attr("x", margins.left + width / 2)
      .attr("y", h - margins.bottom / 10)
      .style("text-anchor", "middle")
      .text("Incarnation of the Doctor")

    // add label y axis
    svg.append("text")
       .attr("class", "label")
       .attr("transform", "rotate(-90)")
       .attr("x", - margins.top - height / 2)
       .attr("y", margins.left / 5)
       .style("text-anchor", "middle")
       .text("Time Travelled (years)")
}


function bars(yData, yScale, barWidth) {
    // create bars for bar chart
    var bars = svg.selectAll("rect")
                  .data(yData)
                  .enter()
                  .append("rect");

    // define properties of bars
    bars.attr("x", function(d, i) {
             return margins.left + i * width / yData.length;
         })
        .attr("y", function(d) {
             if (d !== 0) {
                 return yScale(d);
             }
             return height;
         })
        .attr("width", barWidth)
        .attr("height", function(d) {
            if (d !== 0) {
                return height + margins.top - yScale(d);
            }
            return 0;
         })
        .attr("fill", function(d) {
             return "rgb(0, 0," + (Math.log10(d)) * 18 + ")";
         });
}


function labels(yData, yScale, barWidth) {
    // add bar labels
    svg.selectAll("text")
       .data(yData)
       .enter()
       .append("text")
       .text(function (d) {
            if (d !== 0) {
                var log = Math.floor(Math.log10(d));
                return (d / (Math.pow(10, log))).toFixed(2) + "e" + log;
            }
            return d.toFixed(2);
        })
       .attr("x", function(d, i) {
            return margins.left + i * width / yData.length + barWidth / 2;
        })
       .attr("y", function(d) {
             if (d !== 0) {
                 return yScale(d) - barPadding;
             }
             return height + margins.top - barPadding;
        })
       .attr("text-anchor", "middle")
       .attr("font-family", "sans-serif")
       .attr("font-size", "11px")
       .attr("fill", function(d) {
             return "rgb(0, 0," + (Math.log10(d)) * 18 + ")";
        });

}


function scale(xData, yData, barWidth) {
    // define scale for x Axis
    var xScale = d3.scale.ordinal()
                   .domain(xData)
                   .rangePoints([barWidth / 2, width - barWidth / 2]);

    // define logarithmic scale for y axis
    var yScale = d3.scale.log()
                         .base(10)
                         .domain([0.1, d3.max(yData)])
                         .rangeRound([height, 0])
                         .nice();

    return [xScale, yScale];
}
