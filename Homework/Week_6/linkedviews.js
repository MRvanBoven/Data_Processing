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
                       .range(["#232323",
                               "#56001E",
                               "#980C1D",
                               "#C34D3A",
                               "#3B83A5",
                               "#246084",
                               "#0F3C6B",
                               "#032346"]);

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
 * Made with help of and code from the tutorial and example found on
 * https://bl.ocks.org/denjn5/e1cdbbe586ac31747b4a304f8f86efa5 and
 * https://bl.ocks.org/maybelinot/5552606564ef37b5de7e47ed2b7dc099.
 */
function sunburst(data, div, dims, colorScale) {
    // add SVG element and g element to division for making sunbust
    let svg = div.append("svg")
                 .attr("width", dims.w)
                 .attr("height", dims.h);

    let g = svg.append("g")
               .attr("width", dims.w)
               .attr("height", dims.h)
               .attr("transform", "translate(" + dims.w / 2 + ","
                                               + dims.h / 2 + ")");

    // define x and y scalers for zooming on sunburst
    let scaleX = d3.scaleLinear()
                   .range([0, 2 * Math.PI]);
    let scaleY = d3.scaleSqrt()
                   .range([0, dims.radius]);

    // set partition for the sunburst diagram
    let partition = d3.partition();

    // calculate arc angle + width for each series, season and episode
    let arc = d3.arc()
                .startAngle(function(d) {
                    return Math.max(0, Math.min(2 * Math.PI, scaleX(d.x0)));
                    // return scaleX(d.x0);
                 })
                .endAngle(function(d) {
                    return Math.max(0, Math.min(2 * Math.PI, scaleX(d.x1)));
                    // return scaleX(d.x1);
                 })
                .innerRadius(function(d) {
                    return Math.max(0, scaleY(d.y0));
                 })
                .outerRadius(function(d) {
                    return Math.max(0, scaleY(d.y1));
                 });

    // find root node (letting hierarchy know which values to use)
    let root = d3.hierarchy(data, function children(d) {
                      return d["values"];
                  })
                 .sum(function(d) {
                     return d["value"];
                  });

    // add arcs to SVG
    g.selectAll("path")
     .data(partition(root).descendants())
     .enter()
     .append("path")
     .attr("d", arc)
     .style("stroke", "#232323")
     .style("fill", function(d) {
         // give arcs same tone as 1st parent, lighter colors further from root
         let original = d;
         while (d.depth > 1) {
             d = d.parent;
         }
         return d3.rgb(colorScale(d.data.key)).brighter(original.depth - 1);
      })
     .on("click", function(d) {
         // update gender data
         // show name in middle
         console.log(d.data["key"]);
      })
     .on("dblclick", function(d) {
          // zoom in
          zoom(d);
      });

    function zoom(d) {
        g.transition()
           .duration(750)
           .tween("scale", function() {
                // scale arc dimensions
                let xd = d3.interpolate(scaleX.domain(), [d.x0, d.x1]),
                    yd = d3.interpolate(scaleY.domain(), [d.y0, 1]);
                    yr = d3.interpolate(scaleY.range(),
                                        [d.y0 ? 0.2 * dims.radius
                                              : 0, dims.radius]);

                return function(t) {
                    scaleX.domain(xd(t));
                    scaleY.domain(yd(t)).range(yr(t));
                };
            })
           .selectAll("path")
           .attrTween("d", function(d) {
                return function() {
                    return arc(d);
                };
            });
    }
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
                          let s = `${d["series"]} season ${d["seasonNumber"]}`;
                          return s;
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
