
/**
 * CONSTANTS AND GLOBALS
 * */
 const width = window.innerWidth * 0.9,
 height = window.innerHeight * 0.7,
 margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
* init() but need access to in draw().
* All these variables are empty before we assign something to them.*/
let svg;

/**
* APPLICATION STATE
* */
let state = {
 geojson: null,
 stations: null,
 acs: null,
 hover: {
   latitude: null,
   longitude: null,
   ntaname: null,
   ntacode: null,
   boro_name: null
 },
};

/**
* LOAD DATA
* Using a Promise.all([]), we can load more than one dataset at a time
* */
Promise.all([
  d3.json("neighborhoodsnyc.geojson"),
  d3.csv("evstations420.csv"),
  d3.csv("ACSDATASET-NYC.csv")
]).then(([geojson, stations, acs]) => {
  state.geojson = geojson;
  state.stations = stations;
  state.acs = acs;
  console.log("state: ", state);
  init();
});

  /**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {
 // our projection and path are only defined once, and we don't need to access them in the draw function,
 // so they can be locally scoped to init()
 const projection = d3.geoMercator().fitSize([width, height], state.geojson);
 const path = d3.geoPath().projection(projection);

 // create an svg element in our main `d3-container` element
 svg = d3
   .select("#container")
   .append("svg")
   .attr("width", width)
   .attr("height", height);
   
   svg
   .selectAll(".ntaname")
   // all of the features of the geojson, meaning all the zip codes as individuals
   .data(state.geojson.features)
   .join("path")
   .attr("d", path)
   .attr("class", "ntaname")
   .attr("fill", "black")
   .attr("fill", d => d.properties.color)
   .attr("stroke", "gray")
   .on("mouseover", (mouseEvent, d) => {
     // when the mouse rolls over this feature, do this
     state.hover["ntaname"] = d.properties.ntaname;
     draw(); // re-call the draw function when we set a new hoveredZipcode
   });

const stationLocations = state.stations.map(d => [d.Longitude, d.Latitude]);

const pointProjection = d3.geoMercator().fitSize([width, height], state.geojson);
const pointPath = d3.geoPath().projection(pointProjection);

function projectPoint(longitude, latitude) {
  const [x, y] = pointProjection([longitude, latitude]);
  return [x, y];
}

svg
  .append("g")
  .attr("class", "stationPoints")
  .selectAll("circle")
  .data(stationLocations)
  .join("circle")
  .attr("cx", d => projectPoint(d[0], d[1])[0])
  .attr("cy", d => projectPoint(d[0], d[1])[1])
  .attr("r", 3)
  .attr("fill", "yellow");


 // EXAMPLE 2: going from x, y => lat-long
 // this triggers any movement at all while on the svg
 svg.on("mousemove", (e) => {
   // we can d3.pointer to tell us the exact x and y positions of our cursor
   const [mx, my] = d3.pointer(e);
   // projection can be inverted to return [lat, long] from [x, y] in pixels
   const proj = projection.invert([mx, my]);
   state.hover["longitude"] = proj[0];
   state.hover["latitude"] = proj[1];
   draw();
 });

 draw(); // calls the draw function
}

/**
* DRAW FUNCTION
* we call this every time there is an update to the data/state
* */
function draw() {

  // Defining the colorscale since this is being redrawn on the click below
  const colorScale = d3.scaleSequential()
  .domain(d3.extent(state.acs, d => +d.MedianHHIncome))
  .interpolator(d3.interpolateGreens);

 // return an array of [key, value] pairs
 hoverData = Object.entries(state.hover);

  d3.select("#hover-content")
    .selectAll("div.row")
    .data(hoverData)
    .join("div")
    .attr("class", "row")
    .html(
      d =>
        // each d is [key, value] pair
        d[1] // check if value exist
          ? `${d[0]}: ${d[1]}` // if they do, fill them in
          : null // otherwise, show nothing
    );

    // THE BUTTON CLICKS
    function income() {
      const joinedData = state.geojson.features.map(feature => {
        const acsData = state.acs.find(d => d.GeoID === feature.properties.ntacode);
        return { ...feature, acsData };
      });
    
      svg
        .selectAll(".ntaname")
        .data(joinedData)
        .attr("fill", d => colorScale(+d.acsData.MedianHHIncome));
    }

    function race() {
      const joinedData = state.geojson.features.map(feature => {
        const acsData = state.acs.find(d => d.GeoID === feature.properties.ntacode);
        return { ...feature, acsData };
      });
    
      svg
        .selectAll(".ntaname")
        .data(joinedData)
        .attr("fill", d => colorScale(+d.acsData.WhiteP));
    }
  // When the button is clicked, it calls the function to change based on median income
    d3.select("#income").on("click", income);
    d3.select("#race").on("click", race);
}