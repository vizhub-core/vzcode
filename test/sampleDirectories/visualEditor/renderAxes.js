import { axisBottom, axisLeft } from 'd3';

export const renderAxes = (
  svg,
  {
    xScale,
    yScale,
    dimensions: { width, height },
    margin: { left, right, top, bottom },
    showAxis = true,
    axisColor
  },
) => {
  if (showAxis) {
    // Create X-axis
    const xAxis = axisBottom(xScale);
    
    // Create Y-axis
    const yAxis = axisLeft(yScale);
    
    // Render X-axis
    svg
      .selectAll('.x-axis')
      .data([null])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - bottom})`)
      .attr('fill',axisColor)
      .call(xAxis);
    
    // Render Y-axis
    svg
      .selectAll('.y-axis')
      .data([null])
      .join('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${left}, 0)`)
      .attr('fill',axisColor)
      .call(yAxis);
  } else {
    // Remove axes when showAxis is false
    svg.selectAll('.x-axis').remove();
    svg.selectAll('.y-axis').remove();
  }
};
