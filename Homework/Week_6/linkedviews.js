/**
 * This file extends index.html.
 *
 * The file does things.
 *
 * Name: Maud van Boven
 * Student ID: 12474673
 */


/**
 * Loads in local JSON data file and hands it to main.
 */
window.onload = function() {
    // load in JSON data file
    console.log("--> BETTER WAY TO DO THIS? JQUERY?");
    Promise.resolve(d3.json("startrekEpisodes.json"))
           .then(function(data) {
                main(data);
            })
           .catch(function(e) {
               throw(e);
            });
};


/**
 * Main function, started once a successful response has been received.
 */
function main(episodes) {
    // convert data to useful format for making sunburst diagram
    let nodeData = makeHierarchical(episodes);

    console.log(nodeData);

    // define svg dimensions
    let w = (window.innerWidth - 20) / 2;
    let h = w;
    let margins = {top: 30, bottom: 30, left: 30, right: 30},
        width = w - margins.left - margins.right,
        height = h - margins.top - margins.bottom,
        radius = Math.min(width, height) / 2;
    let dimensions = {w: w, h: h, margins: margins, width: width,
                      height: height, radius: radius};

    // define color scale for coloring diagram
    let colorScale = d3.scaleOrdinal()
                      .domain(function() {
                           let dom = [];
                           for (let i = 0; i < nodeData["values"].length; i++) {
                               dom.push(i);
                           }
                           return dom;
                        })
                       .range(["#56001E",
                               "#980C1D",
                               "#C34D3A",
                               "#69A6C3",
                               "#2A6E96",
                               "#12477D",
                               "#021A35"]);

    // add divisions for the sunbust diagram and donut chart
    let sunburstDiv = d3.select("body")
                        .append("div")
                        .attr("class", "container")
                        .attr("id", "sunburst");
    let donutDiv = d3.select("body")
                     .append("div")
                     .attr("class", "container")
                     .attr("id", "donut");

    sunburst(nodeData, sunburstDiv, dimensions, colorScale);
}


/**
 * Makes a sunburst diagram of given data set.
 * Made with help of and code from the tutorial found on
 * https://bl.ocks.org/denjn5/e1cdbbe586ac31747b4a304f8f86efa5.
 */
function sunburst(data, div, dims, colorScale) {
    // add SVG element for plot to DOM and remember its reference
    let svg = div.append("svg")
                 .attr("width", dims.w)
                 .attr("height", dims.h);

    let g = svg.append("g")
               .attr("width", dims.w)
               .attr("height", dims.h)
               .attr("transform", "translate(" + dims.w / 2 + ","
                                               + dims.h / 2 + ")");

    // set partition for the sunburst diagram
    let partition = d3.partition()
                      .size([2 * Math.PI, dims.radius]);

    // find root node
    let root = d3.hierarchy(data, function children(d) {
                      return d["values"];
                  })
                 .sum(function(d) {
                     return d["value"];
                  });

    // calculate arc angle + width for each series, season and episode
    partition(root);
    let arc = d3.arc()
                .startAngle(function(d) {
                    return d.x0;
                 })
                .endAngle(function(d) {
                    return d.x1;
                 })
                .innerRadius(function(d) {
                    return d.y0;
                 })
                .outerRadius(function(d) {
                    return d.y1;
                 });

    // add calculated arcs to SVG
    g.selectAll("path")
     .data(root.descendants())
     .enter()
     .append("path")
     .attr("display", function(d) {
         return d.depth ? null : "none";
      })
     .attr("d", arc)
     .style("stroke", "#fff")
     .style("fill", function(d) {
         // give arcs same tone as 1st parent, lighter colors further from root
         let original = d;
         while (d.depth > 1) {
             d = d.parent;
         }
         return d3.rgb(colorScale(d.data.key)).brighter(original.depth - 1);
      });
}


/**
 * Transforms given data set to hierarchical object, usable for making a
 * sunburst diagram. Returns the made hierarchical data set.
 */
 function makeHierarchical(episodes) {
    // make a hierarchy by nesting first on series and then on season
    let hierarchy = d3.nest()
                      .key(function(d) {
                          return d["series"];
                       })
                      .key(function(d) {
                          return d["seasonNumber"];
                       })
                      .entries(episodes);

    // add value to episode nodes
    hierarchy.forEach(function(d) {
                  d["values"].forEach(function(d1) {
                      d1["values"].forEach(function(d2) {
                          d2["value"] = 1;
                      });
                  });
              });

    // add root node to hierarcical set
    hierarchy = {"key": "Star Trek Series",
                 "values": hierarchy
                };

    return hierarchy;
}
