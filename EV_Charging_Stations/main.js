
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
   nta2020: null,
   ntacode: null,
   ntaname: null,
   boroname: null,
   count: null,
 },
};

/**
* LOAD DATA
* Using a Promise.all([]), we can load more than one dataset at a time
* */
Promise.all([
  d3.json("NTAsUpdated.geojson"),
  d3.json("us-state-boundaries.geojson"),
  d3.csv("evstations420.csv"),
  d3.csv("ACS-Demographic-Social-Economic.csv")
]).then(([geojson, geojsonUSA, stations, acs]) => {
  // Initialize properties of each added feature to 0
  geojson.features.forEach(feature => {
    feature.properties.count = 0;
    feature.properties.CountDC = 0;
    feature.properties.LevelTwo = 0;
    feature.properties.chargers = 0;
  });
  state.geojson = geojson;
  state.geojsonUSA = geojsonUSA;
  state.stations = stations;
  state.acs = acs;
  console.log("state: ", state);
  init();
  // init2();
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

//  This is adding to the count of the stations in each area
 state.stations.forEach(station => {
  const point = [station.Longitude, station.Latitude];

  state.geojson.features.forEach(feature => {
    if (d3.geoContains(feature, point)) {
      feature.properties.count++;
      feature.properties.CountDC += parseInt(station["EV DC Fast Count"]);
      feature.properties.LevelTwo += parseInt(station["EV Level2 EVSE Num"]);
      feature.properties.chargers += parseInt(station["EV DC Fast Count"]);
      feature.properties.chargers += parseInt(station["EV Level2 EVSE Num"])
    }
  });
});

//This is to 

 // create an svg element in our main `d3-container` element
 svg = d3
   .select("#container")
   .append("svg")
   .attr("width", width)
   .attr("height", height);

   svg
   .selectAll(".nta2020")
   // all of the features of the geojson, meaning all the neighborhoods as individuals
   .data(state.geojson.features)
   .join("path")
   .attr("d", path)
   .attr("class", "nta2020")
   .attr("fill", "black")
   .attr("fill", d => d.properties.color)
   .attr("stroke", "gray")
   .on("mouseover", (mouseEvent, d) => {
     // when the mouse rolls over this feature, do this
     state.hover["Neighborhood"] = d.properties.ntaname;
     state.hover["Borough"] = d.properties.boroname;
     state.hover["Count of Public EV Charging Locations"] = d.properties.count === 0 ? "None" : d.properties.count;
     draw(); // re-call the draw function when we set a new
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
  .attr("r", 2)
  .attr("fill", "yellow");

 draw(); // calls the draw function
}


/**
* DRAW FUNCTION
* we call this every time there is an update to the data/state
* */
function draw() {

  // Defining the colorscale since this is being redrawn on the click below
  const colorScaleIncome = d3.scaleSequential()
  .domain(d3.extent(state.acs, d => +d.MdHHIncE))
  .interpolator(d3.interpolateGreens);

  const colorScaleRace = d3.scaleSequential()
  .domain(d3.extent(state.acs, d => +d.WtNHPWhite))
  .interpolator(d3.interpolatePurples);

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
      const joinedDataIncome = state.geojson.features.map(feature => {
        const acsDataIncome = state.acs.find(d => d.GeoID === feature.properties.nta2020);
        return { ...feature, acsDataIncome };
      });
    console.log(joinedDataIncome);
      svg
        .selectAll(".nta2020")
        .data(joinedDataIncome)
        .attr("fill", d => colorScaleIncome(d.acsData.MdHHIncE));
        console.log(joinedDataIncome)
    }

    function race() {
      const joinedDataRace = state.geojson.features.map(feature => {
        const acsDataRace = state.acs.find(d => d.GeoID === feature.properties.nta2020);
        console.log(acsDataRace)
        return { ...feature, acsDataRace };
      });
    
      svg
        .selectAll(".nta2020")
        .data(joinedDataRace)
        .attr("fill", d => colorScaleRace(+d.acsData.WtNHPWhite));
    }
// these will call the above functions on the clicks
    d3.select("#income").on("click", income);
    d3.select("#race").on("click", race);

  }