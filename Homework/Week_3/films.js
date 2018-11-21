

// load in input file
let fileName = "output.json";
let txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function()
{
  if (txtFile.readyState === 4 && txtFile.status == 200)
  {
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


// add data to graph
function addData(ctx, xData, yData, gMargin, cTopMargin)
{
  // set graph styles
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";

  // draw graph, starting at first data point and drawing lines to each next
  ctx.beginPath();
  ctx.moveTo(gMargin + xData[0], cTopMargin + yData[0]);
  for (i = 1; i < xData.length; i++)
  {
    ctx.lineTo(gMargin + xData[i], cTopMargin + yData[i]);
  }
  ctx.stroke();
}


// draws graph axes with labels
function axes(ctx, gMargin, gHeight, cLeftMargin, cTopMargin, cWidth, cHeight)
{
  // set styles for axes
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000000";
  ctx.font = "15px sans-serif"

  // draw axes
  ctx.beginPath();
  ctx.moveTo(gMargin, cTopMargin);
  ctx.lineTo(gMargin, cHeight - gMargin);
  ctx.lineTo(cWidth, cHeight - gMargin);
  ctx.stroke();

  // axis labels
  ctx.fillText("Year", (cWidth + cLeftMargin) / 2, cHeight);
  ctx.rotate(-90 * Math.PI / 180);
  ctx.fillText("Length (min)", -(cHeight + cTopMargin) / 2, cLeftMargin);
  ctx.rotate(90 * Math.PI / 180);
}


// draws graph of given data on html canvas
function graph(xData, yData)
{
  let canvas = document.getElementById("graph");
  let ctx = canvas.getContext('2d')

  // define canvas dimensions, letting them adapt to screen size
  let cLeftMargin = 15, cRightMargin = 30, cTopMargin = 80, cBottomMargin = 200;
  let cWidth = ctx.canvas.width  = window.innerWidth - cRightMargin;
  let cHeight = ctx.canvas.height = window.innerHeight - cBottomMargin;

  // define graph dimensions
  let gMargin = 50;
  let gWidth = cWidth - gMargin, gHeight = cHeight - cTopMargin - gMargin;

  // transform input data to canvas coordinates
  let x = transform(xData, gWidth);
  let y = transform(yData, 0.9 * gHeight, Math.min(...yData) + gMargin);

  // flip y vertically
  for (i = 0; i < y.length; i++)
  {
    y[i] = cTopMargin + gHeight - y[i];
  }

  // draw axis reference values and reference lines
  reference(ctx, x, y, gMargin, gHeight, cTopMargin, cWidth);

  // make graph axes with labels
  axes(ctx, gMargin, gHeight, cLeftMargin, cTopMargin, cWidth, cHeight);

  // draw graph
  addData(ctx, x, y, gMargin, cTopMargin);
}


// draws reference values on the axes and refernce lines in graph area
function reference(ctx, xData, yData, gMargin, gHeight, cTopMargin, cWidth)
{
  // set styles
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#BBB";

  // draw reference lines
  for (i = 0; i < 0.9; i += 0.1)
  {
    ctx.beginPath();
    ctx.moveTo(gMargin, i * (gHeight) + cTopMargin);
    ctx.lineTo(cWidth, i * (gHeight) + cTopMargin);
    ctx.stroke();
  }

  // set refernce values x asis

  // set refernce values y axis

}


// transforms data to canvas coordinates in given direction, returns array
function transform(array, dir, offset = 0)
{
  let c = [];

  for (let elem of array)
  {
    newc = (elem - Math.min(...array))
           / (Math.max(...array) - Math.min(...array))
           * (dir) + offset;
    c.push(newc);
  }

  return c;
}
