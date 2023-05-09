// PUTTING IN WHAT IS FROM OTHER SCRIPT

// /**
//  * CONSTANTS AND GLOBALS
//  * */
//  const width = window.innerWidth * 0.9,
//  height = window.innerHeight * 0.7,
//  margin = { top: 20, bottom: 50, left: 60, right: 40 };

// /** these variables allow us to access anything we manipulate in
// * init() but need access to in draw().
// * All these variables are empty before we assign something to them.*/
// let svg;

// /**
// * APPLICATION STATE
// * */
// let state = {
//  geojson: null,
//  stations: null,
//  acs: null,
//  hover: {
//  },
// };

// /**
// * LOAD DATA
// * Using a Promise.all([]), we can load more than one dataset at a time
// * */
// Promise.all([
//   d3.json("NTAsUpdated.geojson"),
//   d3.json("us-state-boundaries.geojson"), //no longer need the state boundaries but keeping if I want to use later
//   d3.csv("evstations420.csv"),
//   d3.csv("ACS-Demographic-Social-Economic.csv")
// ]).then(([geojson, geojsonUSA, stations, acs]) => {
//   // adding these additional properties for the init() function
//   geojson.features.forEach(feature => {
//     feature.properties.count = 0;
//     feature.properties.CountDC = 0;
//     feature.properties.LevelTwo = 0;
//     feature.properties.chargers = 0;

// // adding the additional properties from ACS data
// const geoId = feature.properties.nta2020;
// const acsData = acs.find(d => d.GeoID === geoId);
// if (acsData) {
//   feature.properties.medianIncome = +acsData.MdHHIncE;
//   feature.properties.percentBIPOC = +acsData.WtNHPWhite;
//   feature.properties.percentBachAndHigher = +acsData.EA_BachandHigherDHP;
// }

//   });
//   state.geojson = geojson;
//   state.geojsonUSA = geojsonUSA;
//   state.stations = stations;
//   state.acs = acs;
//   console.log("state: ", state);
//   init2();
// });

init2();

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init2() {
  /* SCALES */
  // xscale - categorical, activity

  draw2(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw2() {
  /* HTML ELEMENTS */
  // svg
}




// // dropdown section for the DC Fast Chargers
// // Function to get the amount of DC Fast Chargers
// function getCountDC(neighborhood) {
//   // Load the GeoJSON data
//   d3.json("NTAsUpdated.geojson").then(function(data) {
//     // Find the neighborhood object that matches the selected neighborhood
//     var neighborhoodObject = data.features.find(function(feature) {
//       return feature.properties.ntaname === neighborhood;
//     });
//     // Return the CountDC value of the selected neighborhood
//     return neighborhoodObject.properties.CountDC;
//   });
// }

// d3.json("NTAsUpdated.geojson", function(error, data) {
//   if (error) throw error;

//   var neighborhoods = data.features.map(function(feature) {
//     return feature.properties.ntaname;
//   });

//   d3.select("#neighborhoodDropdown")
//     .selectAll("option")
//     .data(neighborhoods)
//     .enter()
//     .append("option")
//     .text(function(d) { return d; });
// });

// d3.select("#neighborhoodDropdown")
//   .on("change", function() {
//     var neighborhood = this.value;
//     var countDC = getCountDC(neighborhood); // function to get the count of DC fast chargers for the selected neighborhood
//     d3.select("#findContainer")
//       .html("There are " + countDC + " DC fast charging stations in " + neighborhood);
//   });