import { select } from 'd3';
import data from './data.csv'

export const main = (container, { state, setState }) => {
  const selectedId = state.selectedId;
  const setSelectedId = (id) => {
    setState((state) => ({
      ...state,
      selectedId: id === selectedId ? undefined : id,
    }));
  };

  const width = container.clientWidth;
  const height = container.clientHeight;

  const svg = select(container)
    .selectAll('svg')
    .data([null])
    .join('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#F0FFF4');

  // Convert string values to numbers where needed
  const processedData = data.map(d => ({
    ...d,
    x: +d.x,
    y: +d.y,
    r: +d.r,
    id: +d.id
  }));

  const circles = svg
    .selectAll('circle')
    .data(processedData, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.r)
    .attr('fill', (d) => d.fill)
    .attr('opacity', 708 / 1000)
    .style('cursor', 'pointer')
    .attr('stroke', 'none');

  // Clicking on a circle highlights it
  circles.on('click', (event, d) => {
    event.stopPropagation();
    setSelectedId(d.id);
  });

  // Clicking on the background highlights nothing.
  svg.on('click', () => {
    setSelectedId(undefined);
  });

  // Put the selected circle on the top.
  circles
    .filter((d) => d.id === selectedId)
    .attr('stroke', 'black')
    .attr('stroke-width', 5)
    .raise();
};