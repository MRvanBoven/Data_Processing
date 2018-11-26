// add title, student data and assignment description to HTML
d3.select("title").text("Title Bar Chart Page");
d3.select("body").append("h2").attr("class", "title").text("Title Bar Chart");
d3.select("body").append("p").attr("class", "student")
    .html("By: Maud van Boven <br> Student ID: 1247467");
d3.select("body").append("p").attr("class", "text")
    .text("Story about data and visualisation.");

// add bar chart division in HTML
d3.select("body").append("div").attr("id", "chart");

// load in json
let inFile = "data.json";
d3.json(inFile, function(data) {
    let countries = Object.keys(data).map(x => x);
    let values = Object.values(data).map(x => parseInt(x.Value));

    d3.select("#chart").selectAll("p")
        .data(values)
        .enter()
        .append("p")
        .text(function(d) { return d; });
});
