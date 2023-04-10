// Pushing again due to issue with live link
// constants and globals
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

//Loading data
//  Using a Promise.all([]), load more than one dataset at a time
Promise.all([
  d3.json("../data/usState.json"),
  d3.csv("../data/usHeatExtremes.csv", d3.autoType),
]).then(([geojson, heatExtremes]) => {
  
  // creating an svg element in our main `d3-container` element
  svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // specifying projection so from lat/long -> x/y values
  const projection = d3.geoAlbersUsa()
    .fitSize([
      width-margin.left-margin.right,
      height-margin.top-margin.bottom
    ], geojson);

  // defining path function
  const path = d3.geoPath(projection)

  // drawing base layer path - one path for each state
  const states = svg.selectAll("path.states")
    .data(geojson.features)
    .join("path")
    .attr("class", 'states')
    .attr("stroke", "white")
    .attr("fill", "brown")
    .attr("d", path)

    // drawing point for all heat extremes
  svg.selectAll("circle.heat")
  .data(heatExtremes)
  .join("circle")
  .attr("class", "heat")
  .attr("r", d => Math.abs(d["Change in 95 percent Days"])/2) // using this to get the size of circle to be based on the actual change
  .attr("fill", d => {
    if (d["Change in 95 percent Days"] >= 0) {
      return "orange"; //positive change
    } else {
      return "lime"; //negative change
    }
  })
  .attr("opacity", 0.7) // making somewhat transparent to see
  .attr("transform", d=> {
    const [x, y] = projection([d.Long, d.Lat]) //confirm that these are correct in each column
    return `translate(${x}, ${y})`
  })

});

    // Commenting this out from the demo code but keeping here for reference
  // // drawing point for CUNY graduate center
  // const gradCenterPoint =  { latitude: 40.7423, longitude: -73.9833 };
  // svg.selectAll("circle.point")
  //   .data([gradCenterPoint])
  //   .join("circle")
  //   .attr("r", 10)
  //   .attr("fill", "gold")
  //   .attr("transform", d=> {
  //     // use our projection to go from lat/long => x/y
  //     // ref: https://github.com/d3/d3-geo#_projection
  //     const [x, y] = projection([d.longitude, d.latitude])
  //     return `translate(${x}, ${y})`
  //   })