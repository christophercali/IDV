// DATASET IS FROM: https://www.kaggle.com/datasets/surajjha101/countries-olympics-medals-since-1896?resource=download

// Constants and globals
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 60, left: 60, right: 40 },
  radius = 5,
  color = "steelblue"

// loading data
d3.csv('../data/olympics.csv', d3.autoType).then(data => {
  console.log(data)

// scales

const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.total_participation)])
    .range([margin.left, width - margin.right])

const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.total_gold)]) // this is the total number of gold medals for each country 
  .range([height - margin.bottom, margin.top])

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
  .call(yAxis);

 // circles
 const dot = svg
 .selectAll("circle")
 .data(data, d => d.total_participation)
 .join("circle")
 .attr("cx", d => xScale(d.total_participation))
 .attr("cy", d => yScale(d.total_gold))
 .attr("r", 5)
 .attr("fill", color)

});