
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
 },
};

/**
* LOAD DATA
* Using a Promise.all([]), we can load more than one dataset at a time
* */
Promise.all([
  d3.json("NTAsUpdated.geojson"),
  d3.json("us-state-boundaries.geojson"), //no longer need the state boundaries but keeping if I want to use later
  d3.csv("evstations420.csv"),
  d3.csv("ACS-Demographic-Social-Economic.csv")
]).then(([geojson, geojsonUSA, stations, acs]) => {
  // adding these additional properties for the init() function
  geojson.features.forEach(feature => {
    feature.properties.count = 0;
    feature.properties.CountDC = 0;
    feature.properties.LevelTwo = 0;
    feature.properties.chargers = 0;

// adding the additional properties from ACS data
const geoId = feature.properties.nta2020;
const acsData = acs.find(d => d.GeoID === geoId);
if (acsData) {
  feature.properties.medianIncome = +acsData.MdHHIncE;
  feature.properties.percentBIPOC = +acsData.WtNHPWhite;
  feature.properties.percentBachAndHigher = +acsData.EA_BachandHigherDHP;
}

  });
  state.geojson = geojson;
  state.geojsonUSA = geojsonUSA;
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

//  This is adding to the count of the stations in each area
 state.stations.forEach(station => {
  const point = [station.Longitude, station.Latitude];

  state.geojson.features.forEach(feature => {
    if (d3.geoContains(feature, point)) {
      feature.properties.count++;
      // I am creating new data points in the geojson so that I can use them below
      // count of FAST CHARGERS
      feature.properties.CountDC += parseInt(station["EV DC Fast Count"]);
      // count of Level 2 chargers
      feature.properties.LevelTwo += parseInt(station["EV Level2 EVSE Num"]);
      // getting the count of both Level 2 and DC Fast Chargers with the following two lines
      feature.properties.chargers += parseInt(station["EV DC Fast Count"]);
      feature.properties.chargers += parseInt(station["EV Level2 EVSE Num"])
    }
  });
});


 // creating an svg element in our main container
 svg = d3
   .select("#container")
   .append("svg")
   .attr("width", width)
   .attr("height", height);

  // Getting the polygons drawn for the city
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

      // find the corresponding row in the acs dataset based on GeoID
      const acsRow = state.acs.find(row => row.GeoID === d.properties.nta2020);
      state.hover["Median Income"] = acsRow.MdHHIncE;
      state.hover["Percent Caucasian"] = acsRow.WtNHPWhite;
      state.hover["Percent with Bachelors or Higher"] = acsRow.EA_BachandHigherDHP;

     draw(); // re-call the draw function
   });

const stationLocations = state.stations.map(d => [d.Longitude, d.Latitude]);

const pointProjection = d3.geoMercator().fitSize([width, height], state.geojson);
const pointPath = d3.geoPath().projection(pointProjection);

function projectPoint(longitude, latitude) {
  const [x, y] = pointProjection([longitude, latitude]);
  return [x, y];
}

// usng this code to pull out those locations that do not intersect with the polygons
const filteredLocations = stationLocations.filter(loc => {
  return state.geojson.features.some(feature => {
    return d3.geoContains(feature, loc);
  });
});

svg
  .append("g")
  .attr("class", "stationPoints")
  .selectAll("circle")
  .data(filteredLocations)
  .join("circle")
  .attr("cx", d => projectPoint(d[0], d[1])[0])
  .attr("cy", d => projectPoint(d[0], d[1])[1])
  .attr("r", 1.5)
  .attr("stroke", "black")
  .attr("fill", "yellow");

  // saving this code here so that if I want the other locations that show up in long island
// svg
//   .append("g")
//   .attr("class", "stationPoints")
//   .selectAll("circle")
//   .data(stationLocations)
//   .join("circle")
//   .attr("cx", d => projectPoint(d[0], d[1])[0])
//   .attr("cy", d => projectPoint(d[0], d[1])[1])
//   .attr("r", 1.5)
//   .attr("fill", "yellow");

 draw(); // calls the draw function
}


/**
* DRAW FUNCTION
* we call this every time there is an update to the data/state
* */
function draw() {

  // Defining the colorscale since this is being redrawn on the click below
  // By default I do not want the colors to show for ACS until a button is clicked
  const colorScaleIncome = d3.scaleSequential()
  .domain(d3.extent(state.acs, d => parseInt(d.MdHHIncE)))
  .interpolator(d3.interpolateGreens);

  const colorScaleRace = d3.scaleSequential()
  .domain(d3.extent(state.acs, d => +d.WtNHPWhite))
  .interpolator(d3.interpolatePurples);

  const colorScaleEducation = d3.scaleSequential()
  .domain(d3.extent(state.acs, d=> +d.EA_BachandHigherDHP))
  .interpolator(d3.interpolateBlues);
  

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
          : "Data not available" // otherwise, show nothing
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
        .transition()
        .duration(1000)
        .attr("fill", d => {
          if (d.acsDataIncome) {
            return colorScaleIncome(d.acsDataIncome.MdHHIncE);} 
            else {
            return "black"; // setting a default color for missing data
          }
        });
// adding legend that I created in canva
// putting the image in a g tag so that I can use the d3 transition
        const legend = svg.append("g")
        .attr("transform", "translate(10, 10)")
        .style("opacity", 0);
      // since the image is not a d3 element it wouldn't fade in
      legend.append("svg:image")
        .attr("width", 200)
        .attr("height", 100)
        .attr("xlink:href", "Inc.png");
      
      legend.transition()
        .duration(1000)
        .style("opacity", 1);

    }

    function race() {
      const joinedDataRace = state.geojson.features.map(feature => {
        const acsDataRace = state.acs.find(d => d.GeoID === feature.properties.nta2020);
        return { ...feature, acsDataRace };
      });
    
      svg
        .selectAll(".nta2020")
        .data(joinedDataRace)
        .transition()
        .duration(1000)
        .attr("fill", d => {
          if (d.acsDataRace) {
            return colorScaleRace(d.acsDataRace.WtNHPWhite);} 
            else {
            return "black"; // seting default color for missing data
          }
        });
// adding legend that I created in canva
// putting the image in a g tag so that I can use the d3 transition
const legend = svg.append("g")
.attr("transform", "translate(10, 10)")
.style("opacity", 0);
// since the image is not a d3 element it wouldn't fade in
legend.append("svg:image")
.attr("width", 200)
.attr("height", 100)
.attr("xlink:href", "BIPOC.png");

legend.transition()
.duration(1000)
.style("opacity", 1);
      
    }

    function education() {
      const joinedDataEducation = state.geojson.features.map(feature => {
        const acsDataEducation = state.acs.find(d => d.GeoID === feature.properties.nta2020);
        return { ...feature, acsDataEducation };
      });
    
      svg
        .selectAll(".nta2020")
        .data(joinedDataEducation)
        .transition()
        .duration(1000)
        .attr("fill", d => {
          if (d.acsDataEducation) {
            return colorScaleEducation(d.acsDataEducation.EA_BachandHigherDHP);} 
            else {
            return "black"; // setting default color for missing data
          }
        });
// adding legend that I created in canva
// putting the image in a g tag so that I can use the d3 transition
const legend = svg.append("g")
.attr("transform", "translate(10, 10)")
.style("opacity", 0);
// since the image is not a d3 element it wouldn't fade in
legend.append("svg:image")
.attr("width", 200)
.attr("height", 100)
.attr("xlink:href", "Bach.png");

legend.transition()
.duration(1000)
.style("opacity", 1);
      
    }
// these will call the above functions on the clicks
d3.select("#income").on("click", income);
d3.select("#race").on("click", race);
d3.select("#education").on("click", education);

  }