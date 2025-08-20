import { scaleLinear, extent } from 'd3';
import { renderMarks } from './renderMarks.js';
import { renderAxes } from './renderAxes.js';
import { renderTitle } from './renderTitle.js';

export const scatterPlot = (svg, options) => {
  const {
    data,
    dimensions: { width, height },
    margin: { left, right, top, bottom },
    xValue,
    yValue,
    colorScale,
    showAxis,
    scatterPlotTitle,
    fontSize,
    fontFamily,
    axisColor,
  } = options;

  const xScale = scaleLinear()
    .domain(extent(data, xValue))
    .range([left, width - right]);

  const yScale = scaleLinear()
    .domain(extent(data, yValue))
    .range([height - bottom, top]);

  renderMarks(svg, { ...options, xScale, yScale, colorScale });
  
  renderAxes(svg, { 
    xScale, 
    yScale, 
    dimensions: { width, height }, 
    margin: { left, right, top, bottom },
    showAxis,
    axisColor 
  });

  renderTitle(svg, {
    title: scatterPlotTitle,
    dimensions: { width, height },
    margin: { left, right, top, bottom },
    fontSize,
    fontFamily,
  });
};
