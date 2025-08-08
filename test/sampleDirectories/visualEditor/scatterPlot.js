import { scaleLinear, extent } from 'd3';
import { renderAxes } from './renderAxes.js';
import { renderAxisLabels } from './renderAxisLabels.js';
import { renderMarks } from './renderMarks.js';

export const scatterPlot = (svg, options) => {
  const {
    data,
    dimensions: { width, height },
    margin: { left, right, top, bottom },
    xValue,
    yValue,
    colorScale,
  } = options;

  const xScale = scaleLinear()
    .domain(extent(data, xValue))
    .range([left, width - right]);

  const yScale = scaleLinear()
    .domain(extent(data, yValue))
    .range([height - bottom, top]);

  renderAxisLabels(svg, options);
  renderAxes(svg, { ...options, xScale, yScale });
  renderMarks(svg, { ...options, xScale, yScale, colorScale });
};