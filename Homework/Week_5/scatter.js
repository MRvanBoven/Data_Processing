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

    // if JSONS are read in successfully, let them be converted to easier format
    Promise.all(requests)
           .then(function(response) {
                data1 = transformResponse(response[0]);
                data2 = transformResponse(response[1]);
                console.log(data1);
                console.log(data2);
            })
           .catch(function(e) {
                throw(e);
            });
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
