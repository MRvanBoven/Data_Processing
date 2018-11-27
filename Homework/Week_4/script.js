/**
 * This file extends index.html.
 *
 * The file loads a JSON file into D3 and creates an interactive bar chart using
 * the data from this file.
 *
 * Name: Maud van Boven
 * Student ID: 12474673
 */


// define svg width and height as global variables
var w = 700;
var h = 600;
var barPadding = 3;
var y0Padding = 10;
var margins = {top: 30, bottom: 50, left: 70, right: 0},
    width = w - margins.left - margins.right,
    height = h - margins.top - margins.bottom;

// add title, student data and assignment description to HTML
d3.select("head")
  .append("title")
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
  .html("Through how many years of time did each incarnation of the Doctor " +
        "actually travel? David McCandless and associates created a whole" +
        " data set concerning this question, as David explains in " +
        "<a href=" +
        "https://www.theguardian.com/news/datablog/2010/aug/20/" +
        "doctor-who-time-travel-information-is-beautiful" +
        ">the Guardian</a>" +
        ". " +
        "In the bar chart below, the cumulative total of all years travelled " +
        "through by each incarnation of the Doctor is shown. Bear in mind " +
        "that the y axis has a logarithmic scale! You can hover over the " +
        "chart to find out more about each Doctor's time travels.");

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

    // define bar width for bar chart
    var barWidth = width / travels.length - barPadding;

    // define scales for bar chart
    var scales = scale(doctors, travels, barWidth);
    var xScale = scales[0],
        yScale = scales[1],
        y0Scale = scales[2];

    // define tooltip division
    var tip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    // make bar chart
    bars(travels, yScale, barWidth, tip);
    axes(xScale, yScale, y0Scale);
    title();
});


/**
 * Defines, creates and adds labels to the x and y axis.
 */
function axes(xScale, yScale, y0Scale) {
    // define x axis
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom");

    // define y axis
    var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left");

    // define y 0 axis
    var y0Axis = d3.svg.axis()
                       .scale(y0Scale)
                       .orient("left");

    // create x axis
    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(" + margins.left + ","
                                     + (height + margins.top + y0Padding
                                        + barPadding)
                                     + ")")
       .call(xAxis);

    // create y axis
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + (margins.left - barPadding)
                                     + "," + margins.top + ")")
       .call(yAxis);

    // create y 0 axis
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + (margins.left - barPadding)
                                     + "," + (margins.top + height) + ")")
       .call(y0Axis);

    // add label x axis
    svg.append("text")
       .attr("class", "label")
       .attr("x", margins.left + width / 2)
       .attr("y", h)
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


/**
 * Defines and creates the bars for the bar chart and all of their properties.
 */
function bars(yData, yScale, barWidth, tip) { //tip
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
             return height + margins.top + y0Padding - 1;
         })
        .attr("width", barWidth)
        .attr("height", function(d) {
             if (d !== 0) {
                 return height + margins.top - yScale(d) + y0Padding;
             }
             return 1;
         })
        .attr("fill", function(d) {
             return "rgb(0, 0," + (Math.log10(d)) * 18 + ")";
         })
        .on("mouseover", function(d, i) {
             var x = margins.left + i * width / yData.length + 1;
             var y = 0;
             if (d !== 0) {
                 y = - yScale(d) + h + y0Padding + 15;
             }
             else {
                 y = y0Padding + barPadding + margins.bottom + barPadding;
             }

             d3.select(this)
               .style("fill", function(d) {
                    return "rgb(" + (Math.log10(d)) * 15 + ", 0,"
                               + (Math.log10(d)) * 18 + ")";
                });

             tip.transition()
                .duration(200)
                .style("opacity", .9);
             tip.html(scientific(d))
                .style("left", x + "px")
                .style("bottom", y + "px");
         })
        .on("mouseout", function(d) {
             d3.select(this)
               .style("fill", function(d) {
                    return "rgb(0, 0," + (Math.log10(d)) * 18 + ")";
                });

             tip.transition()
                .duration(500)
                .style("opacity", 0);
         });
}


/**
 * Converts given int to a scientific notation string. Returns that string.
 */
function scientific(int) {
    // convert d to scientific power notation with "e"
    if (int !== 0) {
        var log = Math.floor(Math.log10(int));
        return "<span>" + (int / Math.pow(10, log)).toFixed(2) + "e" + log
               + "</span>"
    }
    return "<span>" + int.toFixed(2) + "</span>";
}


/**
 * Defines scales for the x and y axis.
 */
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

    // define 0 scale for y axis
    var y0Scale = d3.scale.ordinal()
                          .domain([0])
                          .range([y0Padding]);

    return [xScale, yScale, y0Scale];
}


/**
 * Creates a title above an svg element.
 */
function title() {
    // define scale for x Axis
    // add label y axis
    svg.append("text")
       .attr("class", "chart title")
       .attr("x", margins.left + width / 2)
       .attr("y", margins.top / 2)
       .style("text-anchor", "middle")
       .text("Time Travelled by All Past Incarnations of the Doctor")
}
