// Constants and globals
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 60, left: 60, right: 40 },
  radius = 5,
  color = "steelblue"

// loading data
d3.csv("../data/olympics_medals_country_wise.csv", d3.autoType).then(data => {
  console.log(data)

// scales
  // I want the countries to be on the x-axis
const xScale = d3.scaleBand()
  .domain(data.map(d => d.countries))
  .range([margin.left, width - margin.right])
  .padding(0.1)

const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.total_total)]) // this is the total number of medals for each country 
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
 .data(data, d => d.country)
 .join("circle")
 .attr("cx", d => xScale(d.countries) + xScale.bandwidth() / 2)
 .attr("cy", d => yScale(d.total_total))
 .attr("r", radius)
 .attr("fill", color)

});

  // // axis scales
  // const xAxis = d3.axisBottom(xScale)
  // svg.append("g")
  // .attr("transform", `translate(0,${height - margin.bottom})`)
  // .call(xAxis);
  
  // const yAxis = d3.axisLeft(yScale)
  // svg.append("g")
  //   .attr("transform", `translate(${margin.left},0)`)
  //   .call(yAxis);

  // // circles
  // const dot = svg
  //   .selectAll("circle")
  //   .data(data, d => d.BioID) // second argument is the unique key for that row
  //   .join("circle")
  //   .attr("cx", d => xScale(d.envScore2020))
  //   .attr("cy", d => yScale(d.ideologyScore2020))
  //   .attr("r", radius)
  //   .attr("fill", d => colorScale(d.Party))
