import { CONFIG } from './constants.js';

export function createStar(canvas) {
  const size = Math.random() * (CONFIG.MAX_STAR_SIZE - CONFIG.MIN_STAR_SIZE) + CONFIG.MIN_STAR_SIZE;
  const x = Math.random() * canvas.width - canvas.width / 2;
  const y = Math.random() * canvas.height - canvas.height / 2;
  const z = Math.random() * canvas.width;
  const speed = Math.random() * (CONFIG.MAX_SPEED - CONFIG.MIN_SPEED) + CONFIG.MIN_SPEED;
  const color = getRandomColor();

  return { x, y, z, size, speed, color };
}

function getRandomColor() {
  // Generate more saturated colors for better visibility on light background
  const r = Math.floor(Math.random() * 156) + 150;
  const g = Math.floor(Math.random() * 156) + 150;
  const b = Math.floor(Math.random() * 156) + 150;
  return `rgb(${r}, ${g}, ${b})`;
}