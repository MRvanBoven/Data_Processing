window.onload = function() {
    getData();
};


/**
 * Get data sets through API requests, reads in JSONS and lets them be converted
 * to easier to use formats.
 */
function getData() {
    // get data sets (JSON) through API requests
    let womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
    let consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

    // let womenInScience = "women.json"
    // let consConf = "consConf.json"

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
}


/**
 * Main function, started once a successful response has been received.
 */
function main(response) {
    // define svg dimensions
    let w = 700;
    let h = 600;
    let barPadding = 3;
    let y0Padding = 10;
    let margins = {top: 30, bottom: 50, left: 70, right: 0},
        width = w - margins.left - margins.right,
        height = h - margins.top - margins.bottom;

    // let responses be converted to easier data formats
    let data1 = transformResponse(response[0]);
    let data2 = transformResponse(response[1]);

    // convert dataSets to lists of data points per year
    let dataPoints = transformData(data1, data2);
    console.log(dataPoints);
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
        })
    })

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
