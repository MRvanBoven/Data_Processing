/**
 * This file extends index.html.
 *
 * The file loads in a JSON file, makes a zoomable sunburst diagram of the
 * series/season/episode data from that file and makes a donut chart of
 * character gender data from the file, that is linked to the sunburst diagram.
 *
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
    Promise.resolve(d3.json("startrek.json"))
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

    // define svg dimensions
    let w = (window.innerWidth * 0.95) / 2;
    let h = w;
    let margins = {top: 30, bottom: 30, left: 30, right: 30},
        width = (w - margins.left - margins.right),
        height = (h - margins.top - margins.bottom),
        radius = Math.min(width, height) / 2;
    let dimensions = {w: w, h: h, margins: margins, width: width,
                      height: height, radius: radius};

    // define color scale for sunburst diagram and donut chart
    let colorScaleSun = d3.scaleOrdinal()
                          .domain(function() {
                               let dom = [];
                               for (let i = 0; i < nodeData["values"].length;
                                    i++) {
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
    let colorScaleDonut = d3.scaleOrdinal()
                            .domain(["female", "male", "other", "unknown"])
                            .range([d3.rgb("#56001E").brighter(1),
                                    d3.rgb("#C34D3A").brighter(1),
                                    d3.rgb("#3B83A5").brighter(1),
                                    d3.rgb("#0F3C6B").brighter(1)]);

    // add divisions for the sunbust diagram and donut chart
    let container = d3.select("body")
                      .append("div")
                      .attr("class", "container")
                      .attr("width", w * 2);
    let sunburstDiv = container.append("div")
                               .attr("class", "container1")
                               .attr("id", "sunburst")
                               .attr("width", width);
    let donutDiv = container.append("div")
                            .attr("class", "container2")
                            .attr("id", "donut")
                            .attr("width", width);

    // make zoomable sunburst diagram, linked to donut chart
    sunburst(nodeData, sunburstDiv, dimensions, colorScaleSun);

    // make donut chart, initialize with all series data
    donut(nodeData, donutDiv, dimensions, colorScaleDonut);
}


/**
 * Makes a donut chart of given data.
 */
function donut(data, div, dims, colorScale) {
    // add SVG element and g element to division for making donut chart
    let svg = div.append("svg")
                 .attr("width", dims.w)
                 .attr("height", dims.h);

    let g = svg.append("g")
               .attr("width", dims.w)
               .attr("height", dims.h)
               .attr("transform", "translate(" + dims.w / 2 + ","
                                               + dims.h / 2 + ")");

    // get character gender ratio data of all series
    let genders = findGenderRatio(data);

    // define pie division
    let pie = d3.pie(genders)
                .padAngle(0.005)
                .sort(null)
                .value(function(d) {
                     return d["value"];
                 });

    // define arcs
    let arc = d3.arc()
                .innerRadius(dims.radius * 0.7)
                .outerRadius(dims.radius);

    let arcs = pie(genders);

    // add arcs to SVG
    g.selectAll("path")
     .data(arcs)
     .enter()
     .append("path")
     .attr("d", arc)
     .attr("fill", function(d) {
          return colorScale(d.data.label);
      })
     .append("title")
     .text(function(d) {
          return d.data.label;
      });

    // add labels to arcs, only visible if arc itself is visible (has value > 0)
    g.selectAll("text")
     .data(arcs)
     .enter()
     .append("text")
     .attr("class", "label")
     .attr("display", function(d) {
          return (d.value !== 0) ? null : "none";
      })
     .attr("text-anchor", "middle")
     .style("fill", "#EAEAEA")
     .style("font-size", `${dims.width * 0.06}px`)
     .each(function(d) {
          d3.select(this)
            .attr("x", arc.centroid(d)[0])
            .attr("y", arc.centroid(d)[1])
            .attr("dy", `${dims.width * 0.06 / 4}px`)
            .text(d.data.label);
      });

    g.append("text")
     .attr("text-anchor", "middle")
     .attr("y", dims.width * 0.08 / 4)
     .style("fill", "#EAEAEA")
     .style("font-size", `${dims.width * 1.5 / data.key.length}px`)
     .text(data.key);
}


/**
 * Finds gender ratio of all characters appearing in given (clicked) series,
 * season, or episode.
 */
function findGenderRatio(d) {
    // create structure to save gender ratio in
    let genders = [{"label": "female", "value": 0},
                   {"label": "male", "value": 0},
                   {"label": "other", "value": 0},
                   {"label": "unknown", "value": 0}];

    addGenders(d);

    /**
     * Adds up all character genders of all episodes included in given series,
     * season or episode (d).
     */
    function addGenders(d) {
        if (d["values"]) {
            d["values"].forEach(function(d1) {
                addGenders(d1);
            });
        }
        else {
            d["characters"].forEach(function(char) {
                if (char["gender"] === "F") {
                    genders[0]["value"]++;
                }
                else if (char["gender"] === "M") {
                    genders[1]["value"]++;
                }
                else if (char["gender"] === null) {
                    genders[3]["value"]++;
                }
                else {
                    genders[2]["value"]++;
                }
            });
        }
    }

    return genders;
}


/**
 * Makes a sunburst diagram of given data set.
 * Made with help from the tutorial and example found on
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

    // define arc angle + width
    let arc = d3.arc()
                .startAngle(function(d) {
                    return Math.max(0, Math.min(2 * Math.PI, scaleX(d.x0)));
                 })
                .endAngle(function(d) {
                    return Math.max(0, Math.min(2 * Math.PI, scaleX(d.x1)));
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
         // give arcs same tone as 1st parent
         let original = d;
         while (d.depth > 1) {
             d = d.parent;
         }

         // lighter colors further from root, root & depth 1 keep original color
         if (original.depth === 0) {
             return d3.rgb(colorScale(d.data.key))
                      .brighter(original.depth);
         }
         return d3.rgb(colorScale(d.data.key))
                  .brighter(original.depth - 1);
      })
     .on("click", function(d) {
         // update gender data in donut chart
         updateDonut(d);
      })
     .on("dblclick", function(d) {
          // zoom in (or out) on doubleclicked arc
          zoom(d);
      });

    /**
     * Zooms in/out on doubleclicked arc.
     */
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
    // make hierarchy by nesting first on series then on season, sort in order
    let hierarchy = d3.nest()
                      .key(function(d) {
                          // return production start year to sort on it
                          return d["seriesProductionStartYear"];
                       })
                      .sortKeys(d3.ascending)
                      .key(function(d) {
                          return d["seasonNumber"];
                       })
                      .sortKeys(d3.ascending)
                      .sortValues(function(a, b) {
                           return d3.ascending(a["episodeNumber"],
                                               b["episodeNumber"]);
                       })
                      .entries(episodes);

    // add name to each node and add value to episode nodes
    hierarchy.forEach(function(d) {
        d["name"] = d["values"][0]["values"][0]["series"];

        d["values"].forEach(function(d1) {
            // save name with full series/season data and abbreviations
            let title = `ST: ${d1["values"][0]["series"]} season
                         ${d1["values"][0]["seasonNumber"]}`
            d1["name"] = title.slice(0, 3) + title.slice(14);

            d1["values"].forEach(function(d2) {
                // save name with full series/S/E data and abbreviations
                let title = `ST: ${d2["series"]}
                             S${d2["seasonNumber"]}E${d2["episodeNumber"]}:
                             ${d2["title"]}`
                d2["name"] = title.slice(0, 3) + title.slice(14);

                // give all episodes a value of 1
                d2["value"] = 1;
            });
        });
    });

    // add root node to hierarcical set
    hierarchy = {"key": "All Star Trek Series",
                 "name": "All Star Trek Series",
                 "values": hierarchy
                };

    return hierarchy;
}


/**
 *
 */
function updateDonut(d) {
    let genders = findGenderRatio(d.data);
    console.log(genders);
    console.log(d.data.name);


}
