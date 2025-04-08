import { createScales } from './scales.js';
import { renderAxes } from './axes.js';
import { renderBarElements } from './renderBarElements.js';

// Function to render the bar chart
export const renderBars = (
  svg,
  { data, width, height, state, setState },
) => {
  const margin = {
    top: 80,
    right: 50,
    bottom: 80,
    left: 80,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create a group for the chart with margins applied
  const g = svg
    .selectAll('.bars-container')
    .data([null])
    .join('g')
    .attr('class', 'bars-container')
    .attr(
      'transform',
      `translate(${margin.left}, ${margin.top})`,
    );

  // Set up scales
  const { xScale, yScale } = createScales(data, innerWidth, innerHeight);
  
  // Render axes
  renderAxes(g, { xScale, yScale, innerWidth, innerHeight });
  
  // Render bars
  renderBarElements(g, {
    data,
    xScale,
    yScale,
    innerHeight,
    state,
    setState
  });

  return g;
};