/**
 * Get data sets through API requests, reads in JSONS, and if successful
 * initialises main function.
 */
window.onload = function() {
    // get data sets (JSON) through API requests
    // let womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
    // let consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

    let womenInScience = "women.json"
    let consConf = "consConf.json"

    // request to read in JSONs
    let requests = [d3.json(womenInScience), d3.json(consConf)];

    // if JSONS are read in successfully, got to main function
    Promise.all(requests)
           .then(function(response) {
                main(response);
            })
           .catch(function(e) {
                throw(e);
            });
};


/**
 * Main function, started once a successful response has been received.
 */
function main(response) {
    // let responses be converted to easier data formats
    let data1 = transformResponse(response[0]);
    let data2 = transformResponse(response[1]);

    console.log(data1);
    console.log(data2);

    // convert dataSets to lists of data points per year
    let dataPoints = transformData(data1, data2);

    console.log(dataPoints);

    // make a scatter plot
    scatterPlot(dataPoints);
}


/**
 * Defines and creates the dots for the scatter plot and all their properties.
 */
function addDots(svg, dataPoints, year, xScale, yScale, counColors) {
    // create dots for scatter plot
    let dots = svg.selectAll("circle")
                  .data(dataPoints[year])
                  .enter()
                  .append("circle");

    // define properties of dots
    dots.attr("cx", function(d) {
             return xScale(d[1]);
         })
        .attr("cy", function(d) {
             return yScale(d[2]);
         })
        .attr("r", 10)
        .style("fill", function(d) {
             return counColors[d[0]];
         });
        // .on("mouseover", function(d, i) {
        //      var x = margins.left + i * width / yData.length + 1;
        //      var y = 0;
        //      if (d !== 0) {
        //          y = - yScale(d) + h + y0Padding + 15;
        //      }
        //      else {
        //          y = y0Padding + barPadding + margins.bottom + barPadding;
        //      }
        //
        //      d3.select(this)
        //        .style("fill", function(d) {
        //             return "rgb(" + (Math.log10(d)) * 15 + ", 0,"
        //                        + (Math.log10(d)) * 18 + ")";
        //         });
        //
        //      tip.transition()
        //         .duration(200)
        //         .style("opacity", .9);
        //      tip.html(scientific(d))
        //         .style("left", x + "px")
        //         .style("bottom", y + "px");
        //  })
        // .on("mouseout", function(d) {
        //      d3.select(this)
        //        .style("fill", function(d) {
        //             return "rgb(0, 0," + (Math.log10(d)) * 18 + ")";
        //         });
        //
        //      tip.transition()
        //         .duration(500)
        //         .style("opacity", 0);
        //  });
}


/**
 * Defines, creates and adds labels to the x and y axis.
 */
function axes(svg, xScale, yScale, dims) {
    // define x axis
    var xAxis = d3.axisBottom()
                  .scale(xScale);

    // define y axis
    var yAxis = d3.axisLeft()
                  .scale(yScale);

    // create x axis
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + dims.margins.left
                                       + ","
                                       + (dims.margins.top
                                          + dims.height)
                                       + ")")
       .call(xAxis);

    // create y axis
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + dims.margins.left
                                       + ","
                                       + dims.margins.top
                                       + ")")
       .call(yAxis);

    // add label x axis
    svg.append("text")
       .attr("class", "label")
       .attr("x", dims.margins.left + dims.width / 2)
       .attr("y", dims.margins.top + dims.height + dims.margins.bottom)
       .style("text-anchor", "middle")
       .text("Women in science (% headcount)");

    // add label y axis
    svg.append("text")
       .attr("class", "label")
       .attr("transform", "rotate(-90)")
       .attr("x", - dims.margins.top - dims.height / 2)
       .attr("y", dims.margins.left / 5)
       .style("text-anchor", "middle")
       .text("Consumer confidence (...)");
}


/**
 * Adds a legend to the given svg element.
 */
function legend(svg, counColors) {
    let legend = svg.append("g")
                    .attr("x", 10)
                    .attr("y", 10)
                    .attr("width", 100)
                    .attr("height", 100)
                    // .attr("class", "legend")
                    .attr("transform", "translate(" + 5
                                                    + ","
                                                    + 5
                                                    +")");

    legend.append("rect")
          // .attr("x", 10)
          // .attr("y", 10)
          .attr("width", 100)
          .attr("height", 100)
          .style("stroke-width", 1)
          .style("stroke", "black")
          .style("fill", "none");

    legend.selectAll("circle")
          .data(counColors)
          .enter()
          .append("circle")
          // .attr("cx", 10)
          // .attr("cy", 10)
          .attr("r", 8);
}


/**
 * Makes arrays of the x and y values of all data points in given set. Also
 * makes object with all different country values matched to a color.
 * Returns all made structures.
 */
function makeVarStructs(dataPoints, colors) {
    // initialise arrays to save data values in
    let xData = [],
        yData = [],
        counColors = {};
    let i = 0;

    // iterate over all data points, saving x, y and country values in arrays
    Object.keys(dataPoints).forEach(function(year) {
        dataPoints[year].forEach(function(dataPoint) {
            if (!(dataPoint[0] in counColors)) {
                counColors[dataPoint[0]] = colors[i];
                i++;
            }
            xData.push(dataPoint[1]);
            yData.push(dataPoint[2]);
        });
    });

    return [counColors, xData, yData];
}


/**
 * Defines scales for the x and y axis.
 */
function scale(xData, yData, dimensions) {
    // define scale for x Axis
    let xScale = d3.scaleLinear()
                   .domain([0, d3.max(xData)])
                   .rangeRound([0, dimensions.width])
                   .nice();

    // define logarithmic scale for y axis
    let yScale = d3.scaleLinear()
                   .domain([0, d3.max(yData)])
                   .rangeRound([dimensions.height, 0])
                   .nice();

    return [xScale, yScale];
}


/**
 * Makes a scatter plot with given data points.
 */
function scatterPlot(dataPoints) {
    // define svg and graph dimensions
    let w = 750;
    let h = 600;
    let margins = {top: 30, bottom: 50, left: 70, right: 10},
        width = w - margins.left - margins.right,
        height = h - margins.top - margins.bottom;
    let dimensions = {margins: margins, width: width, height: height};

    // define colours to be used in plot (to mark countries)
    let colors = ["#020F33", "#132B94", "#688AFF", "#FFC0AD", "#FF7850",
                  "#6F210A"];

    // add SVG to DOM and remember its reference
    let svg = d3.select("body")
                .append("svg")
                .attr("height", h)
                .attr("width", w);

    // make arrays of all x, y and dict with country values and their colors
    let varStructs = makeVarStructs(dataPoints, colors);
    let counColors = varStructs[0],
        xData = varStructs[1],
        yData = varStructs[2];

    console.log("countries");
    console.log(counColors);

    // define scales for bar chart
    let scales = scale(xData, yData, dimensions);
    let xScale = scales[0],
        yScale = scales[1];

    // make axes
    axes(svg, xScale, yScale, dimensions);

    let year = 2007;
    // add data points to plot
    addDots(svg, dataPoints, year, xScale, yScale, counColors);

    // add a legend linking the colors of the dots to the countries
    legend(svg, counColors);
}


/**
 * Transforms given data sets to list of data point per year. Returns the lists.
 */
function transformData(data1, data2) {
    // save data from data1 in object with data point lists for each year
    let allYears = {};

    data1.forEach(function(series) {
        // find location of years and their observation values, remember country
        let wom = Object.keys(series)[0];
        let country = Object.keys(series[wom])[0];
        let years = series[wom][country];

        // find years and save them in object with corresponding data points
        Object.keys(years).forEach(function(index) {
            // find year
            let year = Object.keys(years[index])[0];

            // add year to object, if not already in it
            if (!(year in allYears)) {
                allYears[year] = [];
            }

            // save datapoint with country and wom value in list of right year
            let value = years[index][year];
            let dataPoint = [country, value];
            allYears[year].push(dataPoint);
        });
    });

    // add consConf data to right data points in right year lists
    data2.forEach(function(series) {
        // find location of years and their observation values, remember country
        let country = Object.keys(series)[0];
        let consConf = Object.keys(series[country])[0];
        let years = series[country][consConf]["Annual"];

        // find years and add consConf value to data point with same year & coun
        Object.keys(years).forEach(function(index) {
            // find year
            let year = Object.keys(years[index])[0];
            let value = years[index][year];

            // if data point with same year & coun in object add consConf value
            if (year in allYears) {
                allYears[year].forEach(function(dataPoint) {
                    if (dataPoint[0] === country) {
                        dataPoint.push(value);
                        return;
                    }
                });
            }
        });
    });

    // test if all data points have 3 variables, if not delete them
    Object.keys(allYears).forEach(function(year) {
        allYears[year].forEach(function(dataPoint) {
            if (dataPoint.length !== 3) {
                allYears[year].splice(allYears[year].indexOf(dataPoint), 1);
            }
        });
    });

    return allYears;
}


/**
 * Transforms SDMX-JSON to easier operable format and returns that format.
 */
function transformResponse(data) {
    // create array to save all data series in
    let dataArray = [];

    // get the locations of the variables, observation variables and actual data
    let varsLoc = data.structure.dimensions.series;
    let obsVarsLoc = data.structure.dimensions.observation[0];
    let dataLoc = data.dataSets[0].series;

    // iterate over the dimension values of all data series
    Object.keys(dataLoc).forEach(function(dimValues) {
        // split the dimension values into an array with the separated values
        let dims = dimValues.split(":");

        // translate dimension values into the variables they represent
        let varValues = [];
        varsLoc.forEach(function(variable) {
            let dimValue = Number(dims[variable.keyPosition]);
            let varValue = variable.values[dimValue].name;
            varValues.push(varValue);
        });

        // save all observations with their corresponding observation variable
        let allObs = [];
        let obsLoc = dataLoc[dimValues].observations;
        for (let index in obsLoc) {
            let obsVar = obsVarsLoc.values[Number(index)].name;
            let obs = {};
            obs[obsVar] = obsLoc[Number(index)][0];
            allObs.push(obs);
        }

        // save the data series with its variables in right format,
        let whole = allObs;
        let temp = {};
        for (i = varValues.length - 1; i >= 0; i--) {
            temp[varValues[i]] = whole;
            whole = temp;
            temp = {};
        }

        // add the rightly formatted data series to the dataArray
        dataArray.push(whole);
    });

    return dataArray;
}
