import { startTimer, stopTimer } from './timer.js';
import { drawChart } from './chart.js';

let seconds = 0;
let animationId = null;

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');

const animate = () => {
  drawChart(seconds);
  animationId = requestAnimationFrame(animate);
};

// Start automatically
startTimer();
animate();

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
