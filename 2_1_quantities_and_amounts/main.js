
// Constants and Globals
  // Setting the height to be fixed at 500
const height = 500;
  // Creating margins for chart
const marginTop = 20;
const marginRight = 20;
const marginBottom = 20;
const marginLeft = 140; // This is the largest to make room for labels
  // Setting the width to be 90% of the size of the window minus margins
const width = (window.innerWidth * .9) - marginRight - marginLeft;

// Loading Data
d3.csv('../data/squirrelActivities.csv', d3.autoType)
.then(data => {
  console.log("data", data);

// Scales
  // Since shifting to horizontal bar, these values need to be swapped from the demo
// starting with YSCALE first which is now the categorical axis
const yScale = d3.scaleBand()
    .domain(data.map(d=> d.activity))
    .range([0, height]) // using height instead of width
    .paddingInner(.2)

  // XSCALE for linear,count
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d=> d.count)])
    .range([0, width]) // using width instead of height

// html elements
// svg
const svg = d3.select("#container")
  .append("svg")
  .attr("width", width + marginLeft + marginRight)
  .attr("height", height + marginTop + marginBottom)
  .append("g") // this is a group so that we can add elements to the chart

//creating bars
svg.selectAll("rects")
      .data(data)
      .join("rect")
      .attr("x", 0) // starting the bars at the left of the chart
      .attr("y", d => yScale(d.activity))
      .attr("height", yScale.bandwidth())
      .attr("width", d => xScale(d.count)); // setting the width of the bars based on the count data

})