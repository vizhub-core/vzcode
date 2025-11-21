const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');
const history = [];
const maxHistory = 600;

// Set canvas resolution for crisp rendering
const dpr = window.devicePixelRatio || 1;
canvas.width = 600 * dpr;
canvas.height = 120 * dpr;
ctx.scale(dpr, dpr);

const drawChart = (seconds) => {
  // Update data history
  history.push(seconds);
  if (history.length > maxHistory) {
    history.shift();
  }

  // Clear canvas
  ctx.clearRect(0, 0, 600, 120);

  // Calculate value range for plotting
  let min = Math.min(...history);
  let max = Math.max(...history);

  // Ensure we have a range even if value is constant (flat line)
  if (min === max) {
    min -= 5;
    max += 5;
  }

  const width = 600;
  const height = 120;
  const range = max - min;
  const padding = 15;

  // Draw grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;

  // Horizontal grid lines
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i * (height - padding * 2)) / 4;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // Vertical grid lines
  for (let i = 0; i <= 8; i++) {
    const x = padding + (i * (width - padding * 2)) / 8;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
  }

  // Calculate X step so the chart always starts at 0 and expands
  const xStep =
    (width - padding * 2) / Math.max(history.length - 1, 1);

  // Draw glow effect
  ctx.beginPath();
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  history.forEach((val, i) => {
    const x = padding + i * xStep;
    let norm = (val - min) / range;
    norm = 0.1 + norm * 0.8;
    const y =
      height - padding - norm * (height - padding * 2);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  // Draw main line
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#D8B4FE';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  history.forEach((val, i) => {
    const x = padding + i * xStep;
    let norm = (val - min) / range;
    norm = 0.1 + norm * 0.8;
    const y =
      height - padding - norm * (height - padding * 2);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  // Draw data points on the line
  if (history.length > 1) {
    const lastVal = history[history.length - 1];
    const lastX = padding + (history.length - 1) * xStep;
    let lastNorm = (lastVal - min) / range;
    lastNorm = 0.1 + lastNorm * 0.8;
    const lastY =
      height - padding - lastNorm * (height - padding * 2);

    // Outer glow
    ctx.beginPath();
    ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(167, 139, 250, 0.4)';
    ctx.fill();

    // Inner dot
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }
};

export { drawChart };
