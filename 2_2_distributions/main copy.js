// DATASET IS FROM: https://www.kaggle.com/datasets/surajjha101/countries-olympics-medals-since-1896?resource=download

/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 60, left: 60, right: 40 },
  radius = 5;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let colorScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedParty: "All" // + YOUR INITIAL FILTER SELECTION
};

/* LOAD DATA */
d3.json("../data/olympics.csv", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH
  console.log("data", raw_data);
  // save our data to application state
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  const xScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.total_participation)])
  .range([margin.left, width - margin.right])

  const yScale = d3.scaleLinear()
  .domain([0, d3.max (data, d => d.total_gold)]) // this is the total number of gold medals for each country 
  .range([height - margin.bottom, margin.top])

  const rScale = d3.scaleSqrt() // using square root scale for radius
  .domain([0, d3.max(data, d => d.total_silver)]) // scaling radius by total number of summer golds
  .range([0, 20])

  // + AXES
// axis scales
const xAxis = d3.axisBottom(xScale)
svg.append("g")
.attr("transform", `translate(0,${height - margin.bottom})`)
.call(xAxis)
.selectAll("text")
.attr("transform", "rotate(-90)")
.attr("text-anchor", "end")
.attr("dx", "-.8em")
.attr("dy", "-.15em")

const yAxis = d3.axisLeft(yScale)
svg.append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .call(yAxis)

  // // + UI ELEMENT SETUP
  // const selectElement = d3.select("#dropdown") // select drowpdown element from HTML
  // // add in dropdown options
  // selectElement
  //   .selectAll("option")
  //   .data([ // can do this programmatically also if we want
  //     { key: "All", label: "All" }, // doesn't exist in data, we're adding this as an extra option
  //     { key: "R", label: "Republican" },
  //     { key: "D", label: "Democrat" }])
  //   .join("option")
  //   .attr("value", d => d.key) // set the key to the 'value' -- what we will use to FILTER our data later
  //   .text(d => d.label); // set the label to text -- easier for the user to read than the key

  // // set up our event listener
  // selectElement.on("change", event => {
  //   // 'event' holds all the event information that triggered this callback
  //   console.log("DROPDOWN CALLBACK: new value is", event.target.value);
  //   // save this new selection to application state
  //   state.selectedParty = event.target.value
  //   console.log("NEW STATE:", state);
  //   draw(); // re-draw the graph based on this new selection
  // });

  // + CREATE SVG ELEMENT
  svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  // + CALL AXES
  const xAxisGroup = svg.append("g")
    .attr("class", 'xAxis')
    .attr("transform", `translate(${0}, ${height - margin.bottom})`) // move to the bottom
    .call(xAxis)

  const yAxisGroup = svg.append("g")
    .attr("class", 'yAxis')
    .attr("transform", `translate(${margin.left}, ${0})`) // align with left margin
    .call(yAxis)

  // add labels - xAxis
  xAxisGroup.append("text")
    .attr("class", 'axis-title')
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .text("Ideology Score 2020")

  // add labels - yAxis
  yAxisGroup.append("text")
    .attr("class", 'axis-title')
    .attr("x", -40)
    .attr("y", height / 2)
    .attr("writing-mode", "vertical-lr")
    .attr("text-anchor", "middle")
    .text("Environmental Score 2020")

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {

  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
    .filter(d => state.selectedParty === "All" || state.selectedParty === d.Party)

  const dot = svg
    .selectAll("circle")
    .data(filteredData, d => d.BioID)
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter.append("circle")
        .attr("r", radius)
        .attr("fill", d => colorScale(d.Party))
        .attr("cx", 0) // start dots on the left
        .attr("cy", d => yScale(d.envScore2020))
        .call(sel => sel.transition()
          .duration(500)
          .attr("cx", d => xScale(d.ideologyScore2020)) // transition to correct position
        ),

      // + HANDLE UPDATE SELECTION
      update => update
        .call(sel => sel
          .transition()
          .duration(250)
          .attr("r", radius * 1.5) // increase radius size
          .transition()
          .duration(250)
          .attr("r", radius) // bring it back to original size
        ),

      // + HANDLE EXIT SELECTION
      exit => exit
        .call(sel => sel
          .attr("opacity", 1)
          .transition()
          .duration(500)
          .attr("opacity", 0)
          .remove()
        )
    );
}