/**
 * This file extends index.html.
 *
 * The file loads a JSON file, puts its data into useful data structures and
 * draws a graph of this data.
 *
 * Name: Maud van Boven
 * Student ID: 12474673
 */

// load in input file
let fileName = "output.json";
let txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function() {
  if (txtFile.readyState === 4 && txtFile.status == 200) {
    // save arrays of relevant JSON data
    let data = JSON.parse(txtFile.responseText);
    let years = Object.keys(data).map(x => parseInt(x));
    let lens = Object.values(data).map(x => parseInt(x.Length));

    // draw a graph of saved data
    graph(years, lens);
  }
}
txtFile.open("GET", fileName);
txtFile.send();


/**
 * makes plot of input data and adds it to graph
 */
function addData(ctx, x, y) {
  // set graph styles
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";

  // draw graph, starting at first data point and drawing lines to each next
  ctx.beginPath();
  ctx.moveTo(gLeft + x[0], gTop + y[0]);
  for (i = 1; i < x.length; i++) {
    ctx.lineTo(gLeft + x[i], gTop + y[i]);
  }
  ctx.stroke();
}


/**
 * draws graph axes with labels
 */
function axes(ctx) {
  // set styles for axes
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.font = "15px sans-serif";

  // draw axes
  ctx.beginPath();
  ctx.moveTo(gLeft, gTop);
  ctx.lineTo(gLeft, gBottom);
  ctx.lineTo(gRight, gBottom);
  ctx.stroke();

  // axis labels
  ctx.fillText("Year", gWidth / 2 + gLeft - 15, cHeight);
  ctx.rotate(-90 * Math.PI / 180);
  ctx.fillText("Length (min)", -(gHeight / 2 + gTop) - 35, cLeftMargin / 3);
  ctx.rotate(90 * Math.PI / 180);
}


/**
 * draws graph of given data on html canvas
 */
function graph(xData, yData) {
  let canvas = document.getElementById("graph");
  let ctx = canvas.getContext('2d')

  // define canvas dimensions (global), letting them adapt to screen size
  cLeftMargin = 50, cRightMargin = 20, cTopMargin = 80, cBottomMargin = 50;
  cWidth = ctx.canvas.width = window.innerWidth - 30;
  cHeight = ctx.canvas.height = window.innerHeight - 200;

  // define graph dimensions as global variables
  gLeft = cLeftMargin;
  gRight = cWidth - cRightMargin;
  gTop = cTopMargin;
  gBottom = cHeight - cBottomMargin;
  gWidth = gRight - gLeft;
  gHeight = gBottom - gTop;

  // transform input data to canvas coordinates
  let xMin = Math.floor(Math.min(...xData) / 10) * 10,
      xMax = Math.ceil(Math.max(...xData) / 10) * 10;
  let yMin = Math.floor(Math.min(...yData) / 10) * 10,
      yMax = Math.ceil(Math.max(...yData) / 10) * 10;
  let x = transform(xData, gWidth, xMin, xMax);
  let y = transform(yData, gHeight, yMin, yMax);

  // flip y coordinates vertically
  for (i = 0; i < y.length; i++) {
    y[i] = gHeight - y[i];
  }

  // draw axis reference values and reference lines
  reference(ctx, xMin, xMax, yMin, yMax);

  // make graph axes with labels
  axes(ctx);

  // draw graph
  addData(ctx, x, y);

  // add graph title
  ctx.font = "20px sans-serif";
  ctx.fillText("Average Film Lengths Through the 20th Century",
               gWidth / 2 - 160, cTopMargin / 2);
}


/**
 * draws reference values on the axes and horizontal refernce lines in graph area
 */
function reference(ctx, xMin, xMax, yMin, yMax) {
  // set styles
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#DDDDDD";

  // set reference values y axis
  let yRange = yMax - yMin;
  for (i = 0; i < yRange / 10; i++) {
    ctx.fillText(yMax - i * 10, gLeft - cLeftMargin / 2,
                 i / (yRange / 10) * gHeight + gTop);

    // draw horizontal reference lines
    ctx.beginPath();
    ctx.moveTo(gLeft, i / (yRange / 10) * gHeight + gTop);
    ctx.lineTo(gRight, i / (yRange / 10) * gHeight + gTop);
    ctx.stroke();
  }

  // set reference values x axis
  let xRange = xMax - xMin;
  for (i = 0; i <= xRange / 10; i++) {
    ctx.fillText(xMin + i * 10,
                 i / (xRange / 10) * gWidth + gLeft - cLeftMargin / 5,
                 gBottom + cBottomMargin / 2);

    // draw vertical reference lines
    ctx.beginPath();
    ctx.moveTo(i / (xRange / 10) * gWidth + gLeft, gTop);
    ctx.lineTo(i / (xRange / 10) * gWidth + gLeft, gBottom);
    ctx.stroke();
  }
}


/**
 * transforms data to canvas coordinates in given direction, returns array
 */
function transform(array, dir, min, max) {
  let c = [];

  for (let elem of array) {
    newc = (elem - min) / (max - min) * (dir);
    c.push(newc);
  }

  return c;
}
