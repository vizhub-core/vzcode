export const renderBarElements = (
  selection, 
  { data, xScale, yScale, innerHeight, state, setState }
) => {
  selection.selectAll('.bar')
    .data(data)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(d.letter))
    .attr('y', (d) => yScale(d.count))
    .attr('rx', 4)
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => innerHeight - yScale(d.count))
    .attr('fill', '#5b8c85')
    .style('cursor', 'pointer')
    .attr('fill', (d) =>
      state.selectedLetter === d.letter
        ? '#3d5c57'
        : '#5b8c85',
    )
    .attr('opacity', (d) =>
      state.selectedLetter === d.letter || !state.selectedLetter ? 1 : 0.4,
    )
    .on('click', (event, d) => {
      setState((prevState) => ({
        ...prevState,
        selectedLetter:
          prevState.selectedLetter === d.letter
            ? null
            : d.letter,
      }));
    });
};