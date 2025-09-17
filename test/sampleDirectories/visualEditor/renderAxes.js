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
    xAxisLabel = '',
    yAxisLabel = '',
    fontSize = '14px',
    fontFamily = 'sans-serif',
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

    // Render X-axis label
    svg
      .selectAll('.x-axis-label')
      .data([null])
      .join('text')
      .attr('class', 'x-axis-label')
      .attr('x', width / 2)
      .attr('y', height - bottom / 3)
      .attr('text-anchor', 'middle')
      .attr('font-size', fontSize)
      .attr('font-family', fontFamily)
      .attr('fill', axisColor)
      .text(xAxisLabel);

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

    // Render Y-axis label
    svg
      .selectAll('.y-axis-label')
      .data([null])
      .join('text')
      .attr('class', 'y-axis-label')
      .attr('x', -height / 2)
      .attr('y', left / 3)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('font-size', fontSize)
      .attr('font-family', fontFamily)
      .attr('fill', axisColor)
      .text(yAxisLabel);
  } else {
    // Remove axes and labels when showAxis is false
    svg.selectAll('.x-axis').remove();
    svg.selectAll('.y-axis').remove();
    svg.selectAll('.x-axis-label').remove();
    svg.selectAll('.y-axis-label').remove();
  }
};
