import { select } from 'd3';

export const renderSVG = (container, { width, height }) =>
  select(container)
    .selectAll('svg')
    .data([null])
    .join('svg')
    .attr('width', width)
    .attr('height', height);