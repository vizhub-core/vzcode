import { select } from 'd3';
import { one } from 'd3-rosetta';

export const setupSVG = (container, { width, height }) =>
  one(select(container), 'svg')
    .attr('width', width)
    .attr('height', height);
