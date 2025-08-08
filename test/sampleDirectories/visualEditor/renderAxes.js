import { axisBottom, axisLeft } from 'd3';
import { one } from 'd3-rosetta';

export const renderAxes = (
  svg,
  {
    xScale,
    yScale,
    dimensions: { height },
    margin: { bottom, left },
  },
) => {
  one(svg, 'g', 'x-axis')
    .attr('transform', `translate(0, ${height - bottom})`)
    .call(axisBottom(xScale));

  one(svg, 'g', 'y-axis')
    .attr('transform', `translate(${left}, 0)`)
    .call(axisLeft(yScale));
};
