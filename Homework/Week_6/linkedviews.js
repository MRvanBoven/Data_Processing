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
    let h = w * 1.15;
    let margins = {top: 0.1 * w, bottom: 0.05 * h,
                   left: 0.05 * w, right: 0.05 * w},
        width = (w - margins.left - margins.right),
        height = (h - margins.top - margins.bottom),
        radius = Math.min(width, height) / 2;
    let dimensions = {w: w, h: h, margins: margins, width: width,
                      height: height, radius: radius};

    // define colofr scale for sunburst diagram and donut chart
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
    let container = d3.select("#charts")
                      .append("div")
                      .attr("class", "container")
                      .attr("width", w * 2);
    let sunburstDiv = container.append("div")
                               .attr("class", "container1")
                               .attr("id", "sunburstDiv")
                               .attr("width", width);
    let donutDiv = container.append("div")
                            .attr("class", "container2")
                            .attr("id", "donutDiv")
                            .attr("width", width);

    // make zoomable sunburst diagram, linked to donut chart
    sunburst(nodeData, sunburstDiv, dimensions, colorScaleSun, colorScaleDonut);

    // make donut chart, initialize with all series data
    donut(nodeData, donutDiv, dimensions, colorScaleDonut);
}


/**
 * Makes a donut chart of given character gender ratio data.
 */
function donut(data, div, dims, colorScale) {
    // add SVG element and g element to division for making donut chart
    let svg = div.append("svg")
                 .attr("id", "donutSVG")
                 .attr("width", dims.w)
                 .attr("height", dims.h);

    let g = svg.append("g")
               .attr("id", "donut")
               .attr("width", dims.w)
               .attr("height", dims.h)
               .attr("transform", "translate(" + dims.w / 2 + ","
                                               + dims.h / 2 + ")");

    // add title (series/season/episode of which data is shown) in middle chart
    let title = svg.append("g")
                   .attr("id", "donutTitle")
                   .attr("class", "donutTitle")
                   .attr("width", dims.w)
                   .attr("height", dims.h / 3)
                   .attr("transform", "translate(" + dims.w / 2 + ","
                                                   + dims.h / 2 + ")");

    // add subtitle division, to display nr of characters in, on mouse over arc
    let subtitle = svg.append("g")
                      .attr("id", "charNr")
                      .attr("width", dims.w)
                      .attr("height", dims.h / 3)
                      .attr("transform", "translate(" + dims.w / 2 + ","
                                                      + dims.h / 1.5 + ")");

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
    d3.select("#donut")
      .selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", function(d) {
           return colorScale(d.data.label);
       })
      .on("mouseover", function(d) {
          d3.select("#charNr")
            .selectAll("text");
          // if (charNr)
          console.log(charNr);
          console.log(typeof(charNr));

      })
      .on("mouseover", function(d) {
          // lighten arc
          d3.select(this)
            .style("fill", function(d) {
                 return d3.rgb(colorScale(d.data.label)).brighter(1);
             });

          // define title transitions, scaling font size to fit inside donut
          subtitle.transition()
                  .duration(400)
                  .style("opacity", 1);
          subtitle.append("text")
                  .text(`${d.value} ${d.data.label} characters`)
                  .attr("text-anchor", "middle")
                  .style("fill", d3.rgb(colorScale(d.data.label)).brighter(1))
                  .style("font-size", `${dims.width * 0.05}px`);
       })
      .on("mouseout", function(d) {
          d3.select(this)
                 .style("fill", function(d) {
                      return colorScale(d.data.label);
                  });

          subtitle.transition()
                  .duration(400)
                  .style("opacity", 0)
                  .selectAll("text")
                  .remove();
      });

    // add labels to arcs, only visible if arc itself is visible (has value > 0)
    d3.select("#donut")
      .selectAll("text")
      .data(arcs)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("display", function(d) {
           return (d.value !== 0) ? null : "none";
       })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
          return "translate(" + arc.centroid(d) + ")";
       })
      .text(function(d) {
          return d.data.label;
       })
      .style("fill", "#EAEAEA")
      .style("font-size", `${dims.width * 0.06}px`);

    // add title displaying series/season/episode of which gender data is shown
    d3.select("#donutTitle")
      .append("text")
      .attr("id", "tekstInDonut")
      .attr("text-anchor", "middle")
      .attr("y", dims.width * 0.08 / 4)
      .style("fill", "#EAEAEA")
      .style("font-size",
             // scale fontsize to fit inside donut
             `${dims.width * 1 / (data.name.length)}px`)
      .text(data.name);

    // add title to chart
    addChartTitle(svg, dims, "Character Gender Ratio");
}


/**
 * Updates donut chart with given gender ratio dat, via transitions.
 */
function updateDonut(data, dims) {
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

    // define arc transitions
    d3.select("#donut")
      .selectAll("path")
      .data(arcs)
      .transition()
      .duration(750)
      .attrTween("d", function(d) {
          let interpol = d3.interpolate(this._current, d);
          this._current = interpol(0);
          return function(t) {
              return arc(interpol(t));
          };
      });

    // define label transitions
    d3.select("#donut")
      .selectAll("text")
      .data(arcs)
      .transition()
      .duration(750)
      .attrTween("transform", function(d) {
           let interpol = d3.interpolate(this._current, d);
           this._current = interpol(0);
           return function(t) {
               return "translate(" + arc.centroid(interpol(t)) + ")";
           };
       })
      .attr("display", function(d) {
           return (d.value !== 0) ? null : "none";
       });

    // define title transitions, scaling font size to fit inside donut
    d3.select("#donutTitle")
      .selectAll("text")
      .transition()
      .duration(750)
      .style("opacity", 0)
      .transition()
      .duration(750)
      .style("opacity", 1)
      .style("font-size", `${dims.width * 1.3 / (data.name.length)}px`)
      .text(data.name);
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
function sunburst(data, div, dims, colorScale, colorScaleDonut) {
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
         updateDonut(d.data, dims);
      })
     .on("dblclick", function(d) {
          // zoom in (or out) on doubleclicked arc
          zoom(d);
      })
     .append("title")
     .text(function(d) {
          return d.data.name;
      });;

    // add title to chart
    addChartTitle(svg, dims, "Star Trek Series, Seasons, and Episodes");

    // add legend to chart
    legend(data, svg, dims, colorScale);


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
 * Adds a legend to the given svg element.
 */
function legend(data, svg, dims, colorScale) {
    // define legend dimensions
    let w = dims.width * 0.1;
    let h = dims.height * 0.15;
    let r = w * 0.1;
    let legMargins = {top: 20, bottom: 20, left: 20, right: 20},
        legWidth = w - legMargins.left - legMargins.right,
        legHeight = h - legMargins.top - legMargins.bottom;

    // get list of Star Trek series
    let series = [];
    data["values"].forEach(function(d) {
        series.push(d["name"].slice(10));
    })

    // add legend to svg
    let legend = svg.append("g")
                    .attr("width", w)
                    .attr("height", h)
                    .attr("class", "legend")
                    .attr("transform", "translate(0," + (dims.margins.top
                                                      + dims.height
                                                      - h * 1.5)
                                                      + ")");

    // draw rectangle around legend
    legend.append("rect")
          .attr("width", w)
          .attr("height", h)
          .style("stroke-width", 1)
          .style("stroke", "#EAEAEA")
          .style("fill", "none");

    // add country data to legend
    legend.selectAll("g")
          .data(series)
          .enter()
          .append('g')
          .each(function(d, i) {
              let g = d3.select(this);

              // add circles in the color representing the country
              g.append("circle")
               .attr("class", "legendCirc")
               .attr("cx", legMargins.left)
               .attr("cy", function(d) {
                    return i * h / (series.length + 1);
                })
               .attr("r", r)
               .style("fill", function(d) {
                     // skip first color in scale
                     if (d === series[0]) {
                         colorScale(d);
                         return colorScale(d + 1);
                     }
                     return colorScale(d);
                });

              // add the country in text
              g.append("text")
               .attr("x", legMargins.left + 20)
               .attr("y", function(d) {
                   return i * h / (series.length + 1);
                })
               .text(function (d) {
                    return d;
                });
          });
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
            let title = `ST: ${d1["values"][0]["series"]} season `
                         + `${d1["values"][0]["seasonNumber"]}`
            d1["name"] = title.slice(0, 3) + title.slice(14);

            d1["values"].forEach(function(d2) {
                // save name with full series/S/E data and abbreviations
                let title = `ST: ${d2["series"]} `
                             + `S${d2["seasonNumber"]}E${d2["episodeNumber"]}: `
                             + `${d2["title"]}`
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
 * Creates a title above an svg element.
 */
function addChartTitle(svg, dims, title) {
    svg.append("text")
       .attr("class", "chartTitle")
       .attr("x", (dims.width + dims.margins.left + dims.margins.right) / 2)
       .attr("y", dims.margins.top / 1.5)
       .style("text-anchor", "middle")
       .style("fill", "#8E8E8E")
       .style("font-size", `${dims.width * 0.06}px`)
       .text(title);
}

//// TODO:
// Legenda
// Tooltips
