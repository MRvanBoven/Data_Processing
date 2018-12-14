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
    let nodeData = makeNodeData(episodes);

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

    // add divisions for the sunbust diagram and donut chart
    let sunburstDiv = d3.select("body")
                        .append("div")
                        .attr("class", "container")
                        .attr("id", "sunburst");
    let donutDiv = d3.select("body")
                     .append("div")
                     .attr("class", "container")
                     .attr("id", "donut");

    sunburst(nodeData, sunburstDiv, dimensions);
}


/**
 * Makes a sunburst diagram of given data set.
 */
function sunburst(data, div, dims) {
    // add SVG element for plot to DOM and remember its reference
    let svg = div.append("svg")
                 .attr("width", dims.w)
                 .attr("height", dims.h)
                 .append("g")
                 .attr("transform", "translate(" + dims.w / 2 + ","
                                                 + dims.h / 2 + ")");
}


/**
 * Transforms given data set to node formatted object, usable for making a
 * sunburst diagram. Returns the made node data set.
 */
function makeNodeData(episodes) {
    // create object to save data in format usable for sunburst diagram
    let nodeData = {"title": "Star Trek Series",
                    "children": []
                   };
    let allSeries = nodeData["children"];

    // add required data from all episodes in handy format to created object
    for (let i = 0; i < episodes.length; i++) {
        // remember all required data
        let ep = episodes[i];
        let title = ep["title"];
        let series = ep["series"];
        let season = `${series} season ${ep["seasonNumber"]}`;
        let chars = ep["characters"];

        let added = false;

        // if episode series already in object, add episode to that entry
        for (let j = 0; j < allSeries.length; j++) {
            if (series === allSeries[j]["title"]) {

                // if episode season already in object, add to that entry
                let allSeasons = allSeries[j]["children"];
                for (let k = 0; k < allSeasons.length; k++) {
                    if (season === allSeasons[k]["title"]) {
                        allSeasons[k]["children"].push({"title": title,
                                                        "characters": chars,
                                                        "size": 1
                                                       });
                        added = true;
                        break;
                    }
                }

                // if episode season not in object, create entry and add episode
                if (added === true) {
                    break;
                }
                else {
                    allSeasons.push({"title": season,
                                     "children": [{"title": title,
                                                   "characters": chars,
                                                   "size": 1
                                                  }]
                                    });
                    added = true;
                    break;
                }
            }
        }

        // if episode series not in object, create entry, add season and episode
        if (added === false) {
            allSeries.push({"title": series,
                            "children": [{"title": season,
                                          "children": [{"title": title,
                                                        "characters": chars,
                                                        "size": 1
                                                       }]
                                         }]
                            });
        }
    }

    return nodeData;
}
