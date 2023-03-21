// dataset is from kaggle
// https://www.kaggle.com/datasets/meetnagadia/apple-stock-price-from-19802021
// I will be using the daily close price for the line chart 


// constants and globals
 const width = window.innerWidth * 0.7,
 height = window.innerHeight * 0.7,
 margin = { top: 20, bottom: 50, left: 60, right: 60 }


// loading data
d3.csv('../data/AAPL.csv', d => {
 return {
   date: new Date(d.Date),
   close: +d.Close
 }

}).then(data => {
 console.log('data :>> ', data);

 //setting scales
 const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([margin.right, width - margin.left])

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.close))
    .range([height - margin.bottom, margin.top])

 //creating holder svg element
 const svg = d3.select("#container")
   .append("svg")
   .attr("width", width)
   .attr("height", height)

 //axes
 const xAxis = d3.axisBottom(xScale)
   .ticks(10) 

 const xAxisGroup = svg.append("g")
   .attr("class", "xAxis")
   .attr("transform", `translate(${0}, ${height - margin.bottom})`)
   .call(xAxis)

 xAxisGroup.append("text")
   .attr("class", 'xLabel')
   .attr("transform", `translate(${width / 2}, ${35})`)
   .text("Date")

 const yAxis = d3.axisLeft(yScale)

 const yAxisGroup = svg.append("g")
   .attr("class", "yAxis")
   .attr("transform", `translate(${margin.right}, ${0})`)
   .call(yAxis)

 yAxisGroup.append("text")
   .attr("class", 'yLabel')
   .attr("transform", `translate(${-45}, ${height / 2})`)
   .attr("writing-mode", 'vertical-rl')
   .text("Close")

 // area/line generator function - Keeping for line
//  const lineGen = d3.line() - changing this to areaGen
 const areaGen = d3.area()
  //  .x(d => xScale(d.date)) - if want to put back to line
  //  .y(d => yScale(d.close))
    .x(d => xScale(d.date))
    .y0(yScale.range()[0])
    .y1(d => yScale(d.close));

 // drawing area/line
//  svg.selectAll(".line")
 svg.selectAll(".area")
   .data([data])
   .join("path")
  //  .attr("class", 'line')
   .attr("class", "area")
   .attr("fill", "red")
   .attr("opacity", 0.3)
   .attr("stroke", "black")
  //  .attr("d", d => lineGen(d))
   .attr("d", d => areaGen(d))
});