// constants and globals
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;

/**
* APPLICATION STATE
* */
let state = {
  json: null,
  heatExtremes: null,
  hover: {
    "Heat Extreme": null,
  },
};

//Loading data
//  Using a Promise.all([]), load more than one dataset at a time
Promise.all([
  d3.json("../data/usState.json"),
  d3.csv("../data/usHeatExtremes.csv", d3.autoType),
]).then(([json, heatExtremes]) => {
  state.json = json;
  state.heatExtremes = heatExtremes;
  init();
});

function init() {
  // creating an svg element in our main `d3-container` element
  svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // specifying projection so from lat/long -> x/y values
  const projection = d3
    .geoAlbersUsa()
    .fitSize(
      [width - margin.left - margin.right, height - margin.top - margin.bottom],
      state.json
    );

  // defining path function
  const path = d3.geoPath(projection);

  // drawing base layer path - one path for each state
  const states = svg
    .selectAll("path.states")
    .data(state.json.features)
    .join("path")
    .attr("class", "states")
    .attr("stroke", "black")
    .attr("fill", "brown")
    .attr("d", path);

  // drawing point for all heat extremes
  svg
    .selectAll("circle.heat")
    .data(state.heatExtremes)
    .join("circle")
    .attr("class", "heat")
    .attr("r", (d) => Math.abs(d["Change in 95 percent Days"]) / 2) // using this to get the size of circle to be based on the actual change
    .attr("fill", (d) => {
      if (d["Change in 95 percent Days"] >= 0) {
        return "orange"; //positive change
      } else {
        return "lime"; //negative change
      }
    })
    .attr("opacity", 0.7) // making somewhat transparent to see
    .attr("transform", (d) => {
      const [x, y] = projection([d.Long, d.Lat]); //confirm that these are correct in each column
      return `translate(${x}, ${y})`;
    })
    .on("mouseover", (mouseEvent, d) => {
      // when the mouse rolls over this feature, do this
      state.hover["Heat Extreme"] = d.properties.heat;
      draw();
    });

  draw();
}

function draw() {
  const hoverData = Object.entries(state.hover["Change in 95 percent Days"]);
  
  // Selecting the hover content container for this purpose
  d3.select("#hover-content")
    .selectAll("div.row")
    .data(hoverData)
    .join("div")
    .attr("class", "row")
    .html(d => 
      // each d is [key, value] pair
      d[1] // check if value exists
        ? `${d[0]}: <span style="font-weight:bold">${d[1]}</span>` // if they do, fill them in -- also added code here so that it makes them bold
        : "Data not available" // otherwise, show nothing
    );
}