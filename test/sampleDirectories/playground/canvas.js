const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const sizeDisplay = document.getElementById('sizeDisplay');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Set canvas size with proper DPI handling
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const containerWidth = rect.width;

  // Set CSS size
  canvas.style.width = '100%';
  canvas.style.height = '500px';

  // Set actual drawing surface size
  canvas.width = containerWidth * dpr;
  canvas.height = 500 * dpr;

  // Scale context to match device pixel ratio
  ctx.scale(dpr, dpr);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Get correct cursor position accounting for DPI and scroll
function getCursorPos(e) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  const x = (e.clientX - rect.left) / dpr;
  const y = (e.clientY - rect.top) / dpr;

  return { x, y };
}

// Get correct touch position accounting for DPI and scroll
function getTouchPos(touch) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  const x = (touch.clientX - rect.left) / dpr;
  const y = (touch.clientY - rect.top) / dpr;

  return { x, y };
}

// Drawing functions
function startDrawing(e) {
  isDrawing = true;
  const pos = getCursorPos(e);
  lastX = pos.x;
  lastY = pos.y;
}

function draw(e) {
  if (!isDrawing) return;

  const pos = getCursorPos(e);
  const x = pos.x;
  const y = pos.y;

  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  lastX = x;
  lastY = y;
}

function stopDrawing() {
  isDrawing = false;
  ctx.closePath();
}

// Touch support for mobile
function startDrawingTouch(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const pos = getTouchPos(touch);
  lastX = pos.x;
  lastY = pos.y;
  isDrawing = true;
}

function drawTouch(e) {
  e.preventDefault();
  if (!isDrawing) return;

  const touch = e.touches[0];
  const pos = getTouchPos(touch);
  const x = pos.x;
  const y = pos.y;

  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  lastX = x;
  lastY = y;
}

function stopDrawingTouch() {
  isDrawing = false;
  ctx.closePath();
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', startDrawingTouch);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('touchend', stopDrawingTouch);
canvas.addEventListener('touchcancel', stopDrawingTouch);

// Clear canvas
clearBtn.addEventListener('click', () => {
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(
    0,
    0,
    canvas.width / dpr,
    canvas.height / dpr,
  );
});

// Update brush size display
brushSize.addEventListener('input', (e) => {
  sizeDisplay.textContent = e.target.value;
});
