import { axisBottom, axisLeft } from 'd3';
import { COLORS } from './colors.js';

/**
 * Renders chart axes and labels with improved styling
 * @param {Object} svg - D3 SVG selection
 * @param {Object} options - Configuration options
 * @param {Function} options.xScale - D3 scale for x-axis
 * @param {Function} options.yScale - D3 scale for y-axis
 * @param {Object} options.dimensions - Chart dimensions
 * @param {Object} options.margin - Chart margins
 * @param {boolean} [options.showAxis=true] - Whether to show axes
 * @param {string} [options.axisColor=COLORS.axisColor] - Axis color
 * @param {string} [options.xAxisLabel=''] - X-axis label text
 * @param {string} [options.yAxisLabel=''] - Y-axis label text
 * @param {string} [options.fontSize='14px'] - Label font size
 * @param {string} [options.fontFamily='sans-serif'] - Label font family
 */
export const renderAxes = (
  svg,
  {
    xScale,
    yScale,
    dimensions: { width, height },
    margin: { left, right, top, bottom },
    showAxis = true,
    axisColor = COLORS.axisColor,
    xAxisLabel = '',
    yAxisLabel = '',
    fontSize = '14px',
    fontFamily = 'sans-serif',
  },
) => {
  if (showAxis) {
    // Create D3 axis generators with improved styling
    const xAxis = axisBottom(xScale)
      .tickFormat((d) => d)
      .tickSizeOuter(0)
      .tickPadding(10); // Add padding between ticks and labels

    const yAxis = axisLeft(yScale)
      .tickFormat((d) => d)
      .tickSizeOuter(0)
      .tickPadding(10);

    // Render X-axis
    svg
      .selectAll('.x-axis')
      .data([null])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - bottom})`)
      .attr('fill', axisColor)
      .attr('color', axisColor)
      .call(xAxis)
      .selectAll('text') // Style axis tick labels
      .attr('font-size', fontSize)
      .attr('font-family', fontFamily);

    // Render X-axis label with improved positioning
    if (xAxisLabel) {
      svg
        .selectAll('.x-axis-label')
        .data([null])
        .join('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height - 10) // Position above bottom margin
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px') // Slightly larger than tick labels
        .attr('font-family', fontFamily)
        .attr('fill', axisColor)
        .attr('font-weight', 'bold')
        .text(xAxisLabel);
    }

    // Render Y-axis
    svg
      .selectAll('.y-axis')
      .data([null])
      .join('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${left}, 0)`)
      .attr('fill', axisColor)
      .attr('color', axisColor)
      .call(yAxis)
      .selectAll('text') // Style axis tick labels
      .attr('font-size', fontSize)
      .attr('font-family', fontFamily);

    // Render Y-axis label with improved positioning
    if (yAxisLabel) {
      svg
        .selectAll('.y-axis-label')
        .data([null])
        .join('text')
        .attr('class', 'y-axis-label')
        .attr('x', -height / 2 - 30) // Position further from axis
        .attr('y', 20) // Adjusted vertical position
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('font-size', '16px') // Slightly larger than tick labels
        .attr('font-family', fontFamily)
        .attr('fill', axisColor)
        .attr('font-weight', 'bold')
        .text(yAxisLabel);
    }
  } else {
    // Remove all axis elements if showAxis is false
    svg.selectAll('.x-axis').remove();
    svg.selectAll('.y-axis').remove();
    svg.selectAll('.x-axis-label').remove();
    svg.selectAll('.y-axis-label').remove();
  }
};
