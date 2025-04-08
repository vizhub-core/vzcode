import { csv } from 'd3';

// Function to load the CSV data
export const loadData = ({ state, setState }) => {
  if (!state.data) {
    csv('data.csv', d => {
      return {
        letter: d.letter,
        count: +d.count
      };
    }).then(data => {
      setState(prevState => ({
        ...prevState,
        data
      }));
    });
    return null;
  }
  return state.data;
};