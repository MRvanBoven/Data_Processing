/**
 * This file extends scatter.html.
 *
 * The file gets two JSON files via an API request, loads them into D3, converts
 * them to a usable format, and then uses their data to make a scatter plot,
 * that can be updated to show data of a year chosen by the user, via a slider.
 *
 * Name: Maud van Boven
 * Student ID: 12474673
 */


/**
 * Get data sets through API requests, reads in JSONS, and if successful
 * initialises main function.
 */
window.onload = function() {
    // get data sets (JSON) through API requests
    let womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
    let consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

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

    // convert dataSets to lists of data points per year
    let dataPoints = transformData(data1, data2);

    // make a scatter plot
    scatterPlot(dataPoints);
}


/**
 * Makes a scatter plot with given data points.
 */
function scatterPlot(dataPoints) {
    // define svg and graph dimensions
    let w = 750;
    let h = 600;
    let margins = {top: 100, bottom: 50, left: 70, right: 20},
        width = w - margins.left - margins.right,
        height = h - margins.top - margins.bottom;
    let dimensions = {margins: margins, width: width, height: height};

    // define colours to be used in plot (to mark countries)
    let colors = ["#020F33", "#1937B7", "#7493FF", "#FFC0AD", "#FF7850",
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

    // define scales for bar chart
    let scales = scale(xData, yData, dimensions);
    let xScale = scales[0],
        yScale = scales[1];

    // make axes
    axes(svg, xScale, yScale, dimensions);

    // add data points from first year in dataPoints to plot
    addDots(svg, dataPoints, d3.min(Object.keys(dataPoints)), xScale, yScale,
            counColors);

    // add slider
    let slider = makeSlider(svg, dataPoints, xScale, yScale, counColors,
                            dimensions);

    // add a legend linking the colors of the dots to the countries
    legend(svg, counColors, dimensions);

    // add a graph title
    title(svg, dimensions);
}


/**
 * Defines and creates the dots for the scatter plot and all their properties.
 */
function addDots(svg, dataPoints, year, xScale, yScale, counColors) {
    // create dots for scatter plot
    let dots = svg.selectAll("circle:not(.legendCirc)")
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
       .attr("transform", "translate(0," + (dims.margins.top + dims.height)
                                         + ")")
       .call(xAxis);

    // create y axis
    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(" + dims.margins.left + ", 0)")
       .call(yAxis);

    // add label x axis
    svg.append("text")
       .attr("class", "label")
       .attr("x", dims.margins.left + dims.width / 2)
       .attr("y", dims.margins.top + dims.height + dims.margins.bottom)
       .style("text-anchor", "middle")
       .text("Women in science (% of total headcount)");

    // add label y axis
    svg.append("text")
       .attr("class", "label")
       .attr("transform", "rotate(-90)")
       .attr("x", - dims.margins.top - dims.height / 2)
       .attr("y", dims.margins.left / 5)
       .style("text-anchor", "middle")
       .text("Consumer confidence index");
}


/**
 * Adds a legend to the given svg element.
 */
function legend(svg, counColors, dims) {
    // define legend dimensions
    let w = 145;
    let h = 150;
    let r = 8;
    let legMargins = {top: 20, bottom: 20, left: 20, right: 20},
        legWidth = w - legMargins.left - legMargins.right,
        legHeight = h - legMargins.top - legMargins.bottom;

    // get list of countries
    couns = Object.keys(counColors);

    // add legend to svg
    let legend = svg.append("g")
                    .attr("width", w)
                    .attr("height", h)
                    .attr("class", "legend")
                    .attr("transform", "translate(" + (dims.margins.left + 20)
                                                    + ","
                                                    + (dims.margins.top
                                                       + dims.height
                                                       - h - 20)
                                                    +")");

    // draw rectangle around legend
    legend.append("rect")
          .attr("width", w)
          .attr("height", h)
          .style("stroke-width", 1)
          .style("stroke", "black")
          .style("fill", "none");

    // add country data to legend
    legend.selectAll("g")
          .data(couns)
          .enter()
          .append('g')
          .each(function(d, i) {
              let g = d3.select(this);

              // add circles in the color representing the country
              g.append("circle")
               .attr("class", "legendCirc")
               .attr("cx", legMargins.left)
               .attr("cy", function(d) {
                    return legMargins.top + i * legHeight / (couns.length - 1);
                })
               .attr("r", r)
               .style("fill", function(d) {
                     return counColors[d];
                });

              // add the country in text
              g.append("text")
               .attr("x", legMargins.left + 20)
               .attr("y", function(d) {
                    return legMargins.top + i * legHeight / (couns.length - 1)
                           + 0.6 * r;
                })
               .text(function (d) {
                    return d;
                });
          });
}


/**
 * Makes a slider via which the user can choose the year of which data is shown.
 */
function makeSlider(svg, dataPoints, xScale, yScale, counColors, dims) {
    // define slider svg dimensions
    let h = 100;
    let w = dims.width + dims.margins.left + dims.margins.right;

    // get array of data for slider values
    let years = Object.keys(dataPoints).map(x => parseInt(x));

    // define slider
    let slider = d3.sliderHorizontal()
                   .min(d3.min(years))
                   .max(d3.max(years))
                   .step(1)
                   .width(dims.width)
                   .tickValues(years)
                   .tickFormat(d3.format("d"))
                   .on("onchange", function(year) {
                      return update(svg, dataPoints, year, xScale, yScale,
                                    counColors);
                    });

    // add slider to DOM
    let sliderDiv = d3.select("body")
                      .append("div")
                      .attr("class", "sliderClass");

    sliderDiv.append("svg")
             .attr("height", h)
             .attr("width", w)
             .append("g")
             .attr("transform", "translate(" + dims.margins.left
                                             + ","
                                             + h / 2
                                             + ")")
             .call(slider);

    // add text to explain variable slider represents
    sliderDiv.append("text")
             .attr("class", "slider text")
             .text("Year");
}


/**
 * Makes arrays of the x and y values of all data points in given set. Also
 * makes object with all different country values matched to a color.
 * Returns all made structures.
 */
function makeVarStructs(dataPoints, colors) {
    // initialise structures to save data values in
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
function scale(xData, yData, dims) {
    // define scale for x Axis
    let xScale = d3.scaleLinear()
                   .domain([0, d3.max(xData)])
                   .rangeRound([dims.margins.left,
                                dims.margins.left + dims.width])
                   .nice();

    // define logarithmic scale for y axis
    let yScale = d3.scaleLinear()
                   .domain([0, d3.max(yData)])
                   .rangeRound([dims.margins.top + dims.height,
                                dims.margins.top])
                   .nice();

    return [xScale, yScale];
}


/**
 * Creates a title above given svg element.
 */
function title(svg, dims) {
    svg.append("text")
       .attr("class", "chart title")
       .attr("x", dims.margins.left + dims.width / 2)
       .attr("y", dims.margins.top / 2)
       .style("text-anchor", "middle")
       .text("Consumer Confidence Index against Percentage Women In Science, \
              over the Years")
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


/**
 * Updates scatter plot to show data points of given year.
 */
function update(svg, dataPoints, year, xScale, yScale, counColors) {
    // remove all existing data points from plot
    svg.selectAll("circle:not(.legendCirc)").remove();

    // add data points to plot
    addDots(svg, dataPoints, year, xScale, yScale, counColors);
}
