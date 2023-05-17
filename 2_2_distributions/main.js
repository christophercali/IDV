// DATASET IS FROM: https://www.kaggle.com/datasets/surajjha101/countries-olympics-medals-since-1896?resource=download

// Constants and globals
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = {top: 20, bottom: 60, left: 60, right: 40},
  radius = 5,
  color = "gold"

// loading data
d3.csv('../data/olympics.csv', d3.autoType).then(data => {
  console.log(data)

// scales
const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.total_participation)])
    .range([margin.left, width - margin.right])
    
    // I want the countries to be on the x-axis
// const xScale = d3.scaleBand()
//   .domain(data.map(d => d.countries))
//   .range([margin.left, width - margin.right])
//   .padding(0.1)
// There is an issue here where it is not showing anything bc of categorical, will work on this at later time. 

const yScale = d3.scaleLinear()
  .domain([0, d3.max (data, d => d.total_gold)]) // this is the total number of gold medals for each country 
  .range([height - margin.bottom, margin.top])

const rScale = d3.scaleSqrt() // using square root scale for radius
  .domain([0, d3.max(data, d => d.total_silver)]) // scaling radius by total number of summer golds
  .range([0, 20])

// HTML
// svg
const svg = d3.select("#container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

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

// Adding labels
svg.append("text")
  .attr("x", width / 2)
  .attr("y", height - margin.bottom / 2)
  .attr("font-size", "14px")
  .attr("text-anchor", "middle")
  .text("Participation");

  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", margin.left / 2)
  .attr("font-size", "14px")
  .attr("text-anchor", "middle")
  .text("Gold Medals");

 // circles
 const dot = svg
 .selectAll("circle")
 .data(data, d => d.total_participation)
 .join("circle")
 .attr("cx", d => xScale(d.total_participation))
 .attr("cy", d => yScale(d.total_gold))
 .attr("r", d => rScale(d.total_silver)) // set radius based on total silver
 .attr("fill", color)
 .attr("fill", color)
 .attr("opacity", 0.5) //opacity for better viewing
 .text(d => `${d.countries}: ${d.total_silver} total medals`) //text for tooltip
 //  .attr("r", 5) removing because adjusting based on total_total


//  adding the names of the countries next to the circles - this works but looks crazy and messes up other labels
// const labels = svg
//   .selectAll("text")
//   .data(data)
//   .join("text")
//   .attr("x", d => xScale(d.total_participation) + rScale(d.total_silver) + 5)
//   .attr("y", d => yScale(d.total_gold))
//   .attr("dy", "0.35em")
//   .text(d => d.countries)
//   .attr("font-size", "10px")
//   .attr("fill", "black")
//   .attr("opacity", 0.8)
//   .attr("text-anchor", "start")

 //adding legend
 svg
 .append("image")
 .attr("xlink:href", "legend.png") // Replace with the actual path to your image
 .attr("x", width/2)
 .attr("y", margin.top)
 .attr("width", 200)

});