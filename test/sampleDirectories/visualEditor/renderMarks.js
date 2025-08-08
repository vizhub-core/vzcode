export const renderMarks = (
  svg,
  {
    data,
    xScale,
    yScale,
    xValue,
    yValue,
    pointRadius,
    colorScale,
    pointOpacity,
  },
) =>
  svg
    .selectAll('circle.data-point')
    .data(data)
    .join('circle')
    .attr('class', 'data-point')
    .attr('cx', (d) => xScale(xValue(d)))
    .attr('cy', (d) => yScale(yValue(d)))
    .attr('r', pointRadius)
    .attr('fill', (d) => colorScale[d.species])
    .attr('opacity', pointOpacity);