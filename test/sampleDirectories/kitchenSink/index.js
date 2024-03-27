console.log('This is a test file to edit');

d3.select('body');

// Link test:
// https://vizhub.com/curran/parallel-coordinates-with-brushing
//
let cyberData = {};
cyberData['test'] = 'foo';
const initialData = [
  { x: 155, y: 386, r: 20, fill: '#0000FF' },
  { x: 340, y: 238, r: 52, fill: '#FF0AAE' },
  { x: 531, y: 151, r: 20, fill: '#00FF88' },
  { x: 482, y: 307, r: 147, fill: '#00FFBF' },
  { x: 781, y: 91, r: 61, fill: '#0FFB33' },
  { x: 668, y: 229, r: 64, fill: '#D400FF' },
  // TODO add more circles
  { x: 356, y: 145, r: 33, fill: '#00FFFB' },
  { x: 510, y: 298, r: 80, fill: '#BA00FF' },
  { x: 270, y: 390, r: 44, fill: '#00F7FA' },
];
// Add IDs to each datum
for (let i = 0; i < initialData.length; i++) {
  initialData[i].id = i + 1;
}
const text = 'foo';
// Split the text into lines
const lines = text.trim().split('\n');

// Initialize an empty array to store the data
const data = [];

for (let i = 1; i < lines.length; i++) {
  const [Month, High, Temp, Low] = lines[i].split(',');
  console.log(Month, High, Temp, Low); // Debugging
  data.push({
    Month: Month.trim(),
    High: +High.replace('°F', '').trim(),
    Temp: +Temp.replace('°F', '').trim(),
    Low: +Low.replace('°F', '').trim(),
  });
}
// Ensure data parsing
console.log(data); // Debugging
