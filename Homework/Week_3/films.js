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
function addData(ctx, x, y, gLeft, gTop) {
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
function axes(ctx, gLeft, gRight, gTop, gBottom, gWidth, gHeight, cLeftMargin,
              cHeight) {
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
  ctx.fillText("Year", gWidth / 2 + gLeft, cHeight);
  ctx.rotate(-90 * Math.PI / 180);
  ctx.fillText("Length (min)", -(gHeight / 2 + gTop), cLeftMargin / 3);
  ctx.rotate(90 * Math.PI / 180);
}


/**
 * draws graph of given data on html canvas
 */
function graph(xData, yData) {
  let canvas = document.getElementById("graph");
  let ctx = canvas.getContext('2d')

  // define canvas dimensions, letting them adapt to screen size
  let cLeftMargin = 50, cRightMargin = 20, cTopMargin = 80, cBottomMargin = 50;
  let cWidth = ctx.canvas.width = window.innerWidth - 30;
  let cHeight = ctx.canvas.height = window.innerHeight - 200;

  // define graph dimensions
  let gLeft = cLeftMargin,
      gRight = cWidth - cRightMargin;
  let gTop = cTopMargin,
      gBottom = cHeight - cBottomMargin;
  let gWidth = gRight - gLeft,
      gHeight = gBottom - gTop;

  // transform input data to canvas coordinates
  let x = transform(xData, gWidth, Math.max(...xData), Math.min(...xData));
  let y = transform(yData, gHeight, 150, 50);

  // flip y coordinates vertically
  for (i = 0; i < y.length; i++) {
    y[i] = gHeight - y[i];
  }

  // draw axis reference values and reference lines
  reference(ctx, xData, yData, gLeft, gRight, gBottom, gTop, gWidth, gHeight,
            cLeftMargin, cBottomMargin);

  // make graph axes with labels
  axes(ctx, gLeft, gRight, gTop, gBottom, gWidth, gHeight, cLeftMargin,
       cHeight);

  // draw graph
  addData(ctx, x, y, gLeft, gTop);

  // add graph title
  ctx.font = "20px sans-serif";
  ctx.fillText("Average Film Lengths Through the 20th Century",
               gWidth / 2 - 150, cTopMargin / 2);
}


/**
 * draws reference values on the axes and horizontal refernce lines in graph area
 */
function reference(ctx, xData, yData, gLeft, gRight, gBottom, gTop, gWidth,
                   gHeight, cLeftMargin, cBottomMargin) {
  // set styles
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#BBB";

  // draw horizontal reference lines
  for (i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(gLeft, i / 10 * gHeight + gTop);
    ctx.lineTo(gRight, i / 10 * gHeight + gTop);
    ctx.stroke();
  }

  // set reference values y axis
  for (i = 0; i < 10; i++) {
    ctx.fillText(150 - i * 10, gLeft - cLeftMargin / 2,
                 i / 10 * gHeight + gTop);
  }

  // set reference values x axis
  xRange = Math.max(...xData) - Math.min(...xData);
  for (i = 0; i <= 10; i++) {
    ctx.fillText(Math.round(i / 10 * xRange + Math.min(...xData)),
                 i / 10 * gWidth + gLeft - cLeftMargin / 5,
                 gBottom + cBottomMargin / 2);
  }
}


/**
 * transforms data to canvas coordinates in given direction, returns array
 */
function transform(array, dir, max, min) {
  let c = [];

  for (let elem of array) {
    newc = (elem - min) / (max - min) * (dir);
    c.push(newc);
  }

  return c;
}
