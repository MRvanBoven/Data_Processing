

let fileName = "output.json";
let txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function()
{
  if (txtFile.readyState === 4 && txtFile.status == 200)
  {
    let data = JSON.parse(txtFile.responseText);

    let years = Object.values(data).map(x => parseInt(x.Year));
    let lens = Object.values(data).map(x => parseInt(x.Length));

    // remove rows with missing lenghts
    while (lens.findIndex(Number.isNaN) !== -1)
    {
      let index = lens.findIndex(Number.isNaN);
      lens.splice(index, 1);
      years.splice(index, 1);
    }

    // console.log(years);
    // console.log(lengths);

    // Object.values(data).forEach(function(Year, Lenght)
    // {
    //   console.log(Year)
    //   console.log(Lenght)
    // })

    let canvas = document.getElementById("graph");
    let ctx = canvas.getContext('2d')

    // define canvas dimensions
    let cwidth = ctx.canvas.width  = window.innerWidth - 15;
    let cheight = ctx.canvas.height = window.innerHeight - 100;

    // define graph dimensions
    let gwidth = cwidth - 50, gheight = cheight - 50;

    // ctx.fillStyle = 'rgb(200,0,0)';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // let yearsMin = Math.min(...years), yearsMax = Math.max(...years);
    // let lensMin = Math.min(...lens), lenMax = Math.max(...lens);
    //
    // console.log(yearsMin)
    // console.log(yearsMax)
    // console.log(lensMin)
    // console.log(lensMax)

    let x = transform(years, width), y = transform(lens, height);

    // console.log(x)
    // console.log(y)

    // set styles for axes
    ctx.lineWidth = 3;
    ctx.font = "15px sans-serif"

    // draw axes
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, gheight);
    ctx.lineTo(width, gheight);
    ctx.stroke();

    // axis labels
    ctx.fillText("Year", width / 2, height);
    // ctx.save();
    ctx.rotate(-90 * Math.PI / 180);
    ctx.fillText("Length (min)", -height / 2, 10);
    ctx.restore();
    // ctx.rotate(-90 * Math.PI / 180);
  }

  // transforms data from to canvas coordinates in given direction, return array
  function transform(array, dir)
  {
    let c = [];

    for (let elem of array)
    {
      newc = (elem - Math.min(...array))
             / (Math.max(...array) - Math.min(...array))
             * (dir - 50);
      c.push(newc);
    }

    return c;
  }

}
txtFile.open("GET", fileName);
txtFile.send();
