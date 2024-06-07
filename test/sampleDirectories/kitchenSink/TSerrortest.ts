import { select } from 'd3';
import { viz } from './viz';
// import { data } from '@curran/daily-surface-air-temperature';
import { yearlyData } from '@python-monty/full_cyber_attack_data';
import { newData } from '@python-monty/full_cyber_attack_data';
import { observeResize } from '@curran/responsive-axes';

console.log('Here is the yearlyData:' + { yearlyData });
console.log('Here is the newData:' + { newData });

// FILTER OUT FROM NEWDATA ALL OTHER DATA EXCEPT THE SELECTED ICODE
let filter = parseInt(33); //  <---- for instance   11
console.log(filter);

const filters = new Set([filter]);

// FILTER OUT ALL OTHER DATA THAT DOES NOT HAVE AN INDUSTRY CODE OF 11,21 OR 43
const filteredDataScatter = newData.filter(
  ({ industry_code }) => filters.has(industry_code),
);

console.log(filteredDataScatter);

// SLICE ALL EVENT SUBTYPE STRINGS DOWN TO ONLY 10 DIGITS (FOR EASIER RENDERING ON SCREEN)
filteredDataScatter.forEach(function (part, index) {
  filteredDataScatter[index].event_subtype =
    filteredDataScatter[index].event_subtype.slice(0, 10);

  filteredDataScatter[index].actor = filteredDataScatter[
    index
  ].actor.slice(0, 10);
});

console.log(filteredDataScatter);

export const main = (container, { state, setState }) => {
  const dimensions = observeResize({
    state,
    setState,
    container,
  });

  if (dimensions === null) return;
  const { width, height } = dimensions;

  const iMenu1 = document.createElement('select');
  const iMenu2 = document.createElement('select');
  const iMenu3 = document.createElement('select');

  // CREATE A LIST OF CODES FROM THE YEARLYDATA USING SET.
  const menuOptions = new Set(
    yearlyData.map((d) => d.industryCode),
  );

  // APPEND EACH INDUSTRY CODE TO A LIST TO USE AS MENU OPTIONS MENU1
  menuOptions.forEach((iCode) => {
    const option = document.createElement('option');
    option.value = iCode.toString();
    option.textContent = iCode.toString();
    iMenu1.appendChild(option);
  });

  // APPEND EACH INDUSTRY CODE TO A LIST TO USE AS MENU OPTIONS MENU2
  menuOptions.forEach((iCode) => {
    const option = document.createElement('option');
    option.value = iCode.toString();
    option.textContent = iCode.toString();
    iMenu2.appendChild(option);
  });

  // APPEND EACH INDUSTRY CODE TO A LIST TO USE AS MENU OPTIONS MENU3
  menuOptions.forEach((iCode) => {
    const option = document.createElement('option');
    option.value = iCode.toString();
    option.textContent = iCode.toString();
    iMenu3.appendChild(option);
  });
  console.log(iMenu1);
  console.log(iMenu2);
  console.log(iMenu3);

  // ADD THE MENU LISTS TO THE CONTAINER
  container.appendChild(iMenu1);
  container.appendChild(iMenu2);
  container.appendChild(iMenu3);

  // CREATE EVENT LISTENER FOR MENU1, ON CHANGE RELOAD VIZ
  iMenu1.addEventListener('change', () => {
    reload();
  });
  // CREATE EVENT LISTENER FOR MENU2, ON CHANGE RELOAD VIZ
  iMenu2.addEventListener('change', () => {
    reload();
  });
  // CREATE EVENT LISTENER FOR MENU3, ON CHANGE RELOAD VIZ
  iMenu3.addEventListener('change', () => {
    reload();
  });

  const svg = select(container)
    .selectAll('svg')
    .data([null])
    .join('svg')
    .attr('width', width)
    .attr('height', height);

  function reload() {
    // GET THE VALUE OF THE SELECTED INDUSTRY CODE AND STORE IN CONSTANT
    const selectedIcode1 = iMenu1.value;
    const selectedIcode2 = iMenu2.value;
    const selectedIcode3 = iMenu3.value;

    let filter1 = parseInt(selectedIcode1); //  <---- for example...11
    let filter2 = parseInt(selectedIcode2); //  <---- for example...   21
    let filter3 = parseInt(selectedIcode3); //  <---- for example...   43

    const filters = new Set([filter1, filter2, filter3]);

    // FILTER OUT ALL OTHER DATA THAT DOES NOT HAVE AN INDUSTRY CODE OF 11,21 OR 43
    const filteredDataLine = yearlyData.filter(
      ({ industryCode }) => filters.has(industryCode),
    );

    console.log('filteredDataLine below: ');
    console.log(filteredDataLine);

    svg
      .selectAll('g.multi-line-chart')
      .data([null])
      .join('g')
      .attr('class', 'multi-line-chart')
      // svg.selectAll('g.bar-chart');
      .call(viz, {
        filteredDataLine,
        // yearlyData,
        xValueLine: (d) => d.UTCyear,
        xAxisLabelTextLine: 'Year',
        xAxisLabelOffsetLine: 30,
        yValueLine: (d) => d.count,
        lineValueLine: (d) => d.industryCode,
        yAxisLabelTextLine: 'Number of Attacks',
        yAxisLabelOffsetLine: 80,
        innerRectFillLine: '#E8E8E8',
        // circleRadius: 35 / 20,
        // circleOpacity: 629 / 1000,
        marginTopLine: 20,
        marginBottomLine: 60,
        marginLeftLine: 120,
        marginRightLine: 20,
        widthLine: width,
        heightLine: height,
        colorLegendLabelLine: '',
        colorLegendXLine: 20,
        colorLegendYLine: 50,
      });
    console.log(filteredDataLine);
    svg
      .selectAll('g.scatter-plot')
      .data([null])
      .join('g')
      .attr('class', 'scatter-plot')
      .attr('transform', `translate(${width / 2},0)`)
      // svg.selectAll('g.bar-chart');
      .call(viz, {
        filteredDataScatter,
        xValueScatter: (d) => d.day_of_year,
        xAxisLabelTextScatter: 'Day of Year',
        xAxisLabelOffsetScatter: 38,
        yValueScatter: (d) => d.airTemp,
        lineValueScatter: (d) => d.year,
        yAxisLabelTextScatter: 'Air Temperature',
        yAxisLabelOffsetScatter: 17,
        innerRectFillScatter: '#E8E8E8',
        lineOpacityScatter: 416 / 1000,
        marginTopScatter: 20,
        marginBottomScatter: 50,
        marginLeftScatter: 54,
        marginRightScatter: 20,
        widthScatter: width / 2,
        heightScatter: height,
      });
  }
};
