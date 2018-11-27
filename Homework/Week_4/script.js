// define svg width and height as global variables
var w = 1000;
var h = 500;
var axX = 50;
var axY = 50;

// add title, student data and assignment description to HTML
d3.select("title")
  .text("Title Bar Chart Page");
d3.select("body")
  .append("h2")
  .attr("class", "title")
  .text("Title Bar Chart");
d3.select("body")
  .append("p")
  .attr("class", "student")
  .html("By: Maud van Boven <br> Student ID: 1247467");
d3.select("body")
  .append("p")
  .attr("class", "text")
  .text("Story about data and visualisation.");

// add bar chart division in HTML
d3.select("body").append("div").attr("id", "chart");

// add SVG to DOM and remember its reference
var svg = d3.select("body")
            .append("svg")
            .attr("height", h)
            .attr("width", w);

// load in json
let inFile = "data.json";
d3.json(inFile, function(data) {
    var doctors = Object.keys(data).map(x => x);
    var travels = Object.values(data).map(x => parseInt(x.travelled));

    console.log(doctors);
    console.log(travels);

    d3.select("#chart").selectAll("p")
        .data(travels)
        .enter()
        .append("p")
        .text(function(d) { return d; });

    var bars = svg.selectAll("rect")
                  .data(travels)
                  .enter()
                  .append("rect");

    bars.attr("x", function(d, i) {
             return axX + i * (w - axX) / travels.length;
         })
        .attr("y", 0)
        .attr("width", function(){
             return (w - axX) / travels.length;
         })
        .attr("height", function(d) {
            return (h - axY) / Math.max(...travels) * d;
        });
});
