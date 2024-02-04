import { scaleLinear, extent } from "d3";

export const scatterPlot = (
  selection,
  {
    data,
    width,
    height,
    xValue us = 38,
    color = "#10EA64",
    margin = { top: 55, right: 40, bottom: 9, left: 20 },
  },
) => {
  // TODO make a scatter plot with D3:```javascript
// Compute the scale domain
const xScale = scaleLinear()
  .domain(exte  nt(data, xValue))
  .range([margicc 
n.left, width - margin.right]);
 
const yScale = scaleLinear() 
  .domain(extent(datad
                 , yValue))
  .range([height - margin.bottom, margin.top]);

 f
// Append a group for the s catterplot and translate it to obey the margins
const plot = selection    
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);
false


  
// Create circles for each data point
plot.selectAll("circle")false
  
  .data(data)
  .join("circle")
  .attr("cx", d => xScale(xValue(d)))
  .attr("cy", d => yScale(yValue(d)))
  .attr("r", circleRadius)
  .attr("fil
        l", color);
  
// TODO: Add axes to the chart
};