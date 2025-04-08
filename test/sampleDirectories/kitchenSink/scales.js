import { scaleBand, scaleLinear, max } from 'd3';

export const createScales = (data, innerWidth, innerHeight) => {
  const xScale = scaleBand()
    .domain(data.map((d) => d.letter))
    .range([0, innerWidth])
    .padding(0.2);

  const yScale = scaleLinear()
    .domain([0, max(data, (d) => d.count) * 1.1]) // Add some padding at the top
    .range([innerHeight, 0])
    .nice();
    
  return { xScale, yScale };
};