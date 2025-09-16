export const renderMarks = (
  svg,
  {
    data,
    xScale,
    yScale,
    xValue,
    yValue,
    pointRadius,
    pointRadiusValue, // Add pointRadiusValue parameter
    pointRadiusScale, // Add pointRadiusScale parameter
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

  // Add gradient definitions
  const defs = svg.append('defs');

  // Create gradients for each species
  const speciesList = [
    ...new Set(data.map((d) => d.species)),
  ];
  speciesList.forEach((species) => {
    const gradient = defs
      .append('radialGradient')
      .attr('id', `gradient-${species}`)
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '70%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorScale[species])
      .attr('stop-opacity', pointOpacity);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorScale[species])
      .attr('stop-opacity', pointOpacity * 0.3);
  });

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
    .attr('fill', (d) => `url(#gradient-${d.species})`)
    .attr('opacity', 1);

  // Apply blur filter if needed
  if (blurRadius > 0) {
    points.attr('filter', 'url(#blur-filter)');
  } else {
    points.attr('filter', null);
  }
};
