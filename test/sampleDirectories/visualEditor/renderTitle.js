export const renderTitle = (
  svg,
  {
    title,
    dimensions: { width },
    margin: { top },
    fontSize = '16px',
    fontFamily = 'sans-serif',
  },
) => {
  if (title && title.trim() !== '') {
    // Render the title
    svg
      .selectAll('.chart-title')
      .data([null])
      .join('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', top / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', fontSize)
      .style('font-family', fontFamily)
      .style('font-weight', 'bold')
      .text(title);
  } else {
    // Remove title when it's empty
    svg.selectAll('.chart-title').remove();
  }
};
