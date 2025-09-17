import { axisBottom, axisLeft } from 'd3';

export const renderAxes = (
  svg,
  {
    xScale,
    yScale,
    dimensions: { width, height },
    margin: { left, right, top, bottom },
    showAxis = true,
    axisColor = '#e0e0e0',
  },
) => {
  if (showAxis) {
    // Create X-axis
    const xAxis = axisBottom(xScale)
      .tickFormat((d) => d)
      .tickSizeOuter(0);

    // Create Y-axis
    const yAxis = axisLeft(yScale)
      .tickFormat((d) => d)
      .tickSizeOuter(0);

    // Render X-axis
    svg
      .selectAll('.x-axis')
      .data([null])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - bottom})`)
      .attr('fill', axisColor)
      .attr('color', axisColor)
      .call(xAxis);

    // Render Y-axis
    svg
      .selectAll('.y-axis')
      .data([null])
      .join('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${left}, 0)`)
      .attr('fill', axisColor)
      .attr('color', axisColor)
      .call(yAxis);
  } else {
    // Remove axes when showAxis is false
    svg.selectAll('.x-axis').remove();
    svg.selectAll('.y-axis').remove();
  }
};
