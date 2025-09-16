import { scaleLinear, scaleSqrt, extent } from 'd3';
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
    sizeValue,
    pointRadiusValue,
    pointRadiusRange = [1, 30],
    sizeRange = [2, 30],
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

  const sizeScale = sizeValue
    ? scaleSqrt() // Changed from scaleLinear to scaleSqrt
        .domain(extent(data, sizeValue))
        .range(sizeRange)
    : null;

  const pointRadiusScale = pointRadiusValue
    ? scaleLinear()
        .domain(extent(data, pointRadiusValue))
        .range(pointRadiusRange)
    : null;

  renderMarks(svg, {
    ...options,
    xScale,
    yScale,
    sizeScale,
    pointRadiusScale,
    colorScale,
  });

  renderAxes(svg, {
    xScale,
    yScale,
    dimensions: { width, height },
    margin: { left, right, top, bottom },
    showAxis,
    axisColor,
  });

  renderTitle(svg, {
    title: scatterPlotTitle,
    dimensions: { width, height },
    margin: { left, right, top, bottom },
    fontSize,
    fontFamily,
  });
};
