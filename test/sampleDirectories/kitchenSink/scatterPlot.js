import { scaleLinear, extent } from "d3";

export const scatterPlot = (
  selection,
  {
    data,
    width,
    height,
    xValue,
    yValue, 
    circleRadius = 38,
    color = "#10EA64",
    margin = { top: 55, right: 40, bottom: 9, left: 20 },
  },
) => {
  // TODO make a scatter plot with D3:```javascript
// Compute the scale domain
const xScale = scaleLinear()
  .domain(extent(data, xValue))
  .range([margin.left, width - margin.right]);

const yScale = scaleLinear()
  .domain(extent(data, yValue))
  .range([height - margin.bottom, margin.top]);


// Append a group for the scatterplot and translate it to obey the margins
const plot = selection
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Create circles for each data point
plot.selectAll("circle")
  .data(data)
  .join("circle")
  .attr("cx", d => xScale(xValue(d)))
  .attr("cy", d => yScale(yValue(d)))
  .attr("r", circleRadius)
  .attr("fill", color);

// TODO: Add axes to the chart
};
```