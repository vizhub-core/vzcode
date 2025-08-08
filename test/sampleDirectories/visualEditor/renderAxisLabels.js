import { one } from 'd3-rosetta';

export const renderAxisLabels = (
  svg,
  {
    dimensions: { width, height },
    margin,
    xAxisLabel,
    yAxisLabel,
    xAxisLabelOffset,
    yAxisLabelOffset,
    fontSize,
    fontFamily,
  },
) => {
  one(svg, 'text', 'x-axis-label')
    .attr('x', width / 2)
    .attr('y', height - xAxisLabelOffset)
    .attr('text-anchor', 'middle')
    .attr('font-family', fontFamily)
    .attr('font-size', fontSize)
    .text(xAxisLabel);

  one(svg, 'text', 'y-axis-label')
    .attr('x', yAxisLabelOffset)
    .attr('y', height / 2)
    .attr('text-anchor', 'middle')
    .attr(
      'transform',
      `rotate(-90, ${yAxisLabelOffset}, ${height / 2})`,
    )
    .attr('font-family', fontFamily)
    .attr('font-size', fontSize)
    .text(yAxisLabel);
};
