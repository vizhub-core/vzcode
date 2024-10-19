console.log('This is a test file to edit');

d3.select('body');

const citiesURL =
  'https://raw.githubusercontent.com/vspatel927/CS573-Final-Project/main/parks.csv';

const bool = false;

const num = 451;
// Link test:
// https://vizhub.com/curran/parallel-coordinates-with-brushing
//
let cyberData = {};
cyberData['test'] = 'foo';
const initialData = [
  { x: 155, y: 386, r: 20, fill: '#5B9B31' },
  { x: 340, y: 238, r: 52, fill: '#99156D' },
  { x: 531, y: 151, r: 20, fill: '#1AAD68' },
  { x: 482, y: 307, r: 147, fill: '#55AA95' },
  { x: 781, y: 91, r: 61, fill: '#0E3DFB' },
  { x: 668, y: 229, r: 64, fill: '#7300FF' },
  { x: 123, y: 456, r: 30, fill: '#FFA500' },
  { x: 789, y: 101, r: 25, fill: '#00BFFF' },
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
// Ensure data is correct
console.log(data); // Debugging
