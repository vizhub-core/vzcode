import { axisBottom, axisLeft } from 'd3';

export const renderAxes = (selection, { xScale, yScale, innerWidth, innerHeight }) => {
  // Create and render x-axis
  const xAxis = axisBottom(xScale)
    .tickSize(0)
    .tickPadding(12);

  selection.selectAll('.x-axis')
    .data([null])
    .join('g')
    .attr('class', 'x-axis axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'middle');

  // Create and render y-axis
  const yAxis = axisLeft(yScale)
    .ticks(5)
    .tickSize(-innerWidth) // Add gridlines
    .tickFormat(d => d);

  selection.selectAll('.y-axis')
    .data([null])
    .join('g')
    .attr('class', 'y-axis axis')
    .call(yAxis)
    .call(g => g.select('.domain').remove()) // Remove axis line
    .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.2)); // Make gridlines lighter

  // Add axis titles
  selection.selectAll('.x-axis-title')
    .data([null])
    .join('text')
    .attr('class', 'axis-title')
    .attr('text-anchor', 'middle')
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + 50)
    .text('Letter');

  selection.selectAll('.y-axis-title')
    .data([null])
    .join('text')
    .attr('class', 'axis-title')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${-50}, ${innerHeight / 2}) rotate(-90)`)
    .text('Count');
};