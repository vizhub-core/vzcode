export const renderMarks = (
  svg,
  {
    data,
    xScale,
    yScale,
    xValue,
    yValue,
    pointRadius,
    pointRadiusValue,
    pointRadiusScale,
    sizeScale,
    sizeValue,
    colorScale,
    pointOpacity,
    blurRadius = 0,
  },
) => {
  // Add filter definitions if blur is needed
  if (blurRadius > 0) {
    svg
      .append('defs')
      .append('filter')
      .attr('id', 'blur-filter')
      .append('feGaussianBlur')
      .attr('stdDeviation', blurRadius);
  }

  // Render the data points
  const points = svg
    .selectAll('circle.data-point')
    .data(data)
    .join('circle')
    .attr('class', 'data-point')
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)))
    .attr('r', (d) => {
      if (sizeValue) return sizeScale(sizeValue(d));
      if (pointRadiusValue)
        return pointRadiusScale(pointRadiusValue(d));
      return pointRadius;
    })
    .attr('fill', (d) => colorScale[d.species])
    .attr('opacity', pointOpacity);

  // Apply blur filter if needed
  if (blurRadius > 0) {
    points.attr('filter', 'url(#blur-filter)');
  } else {
    points.attr('filter', null);
  }
};
