import { CONFIG } from './constants.js';

export function createStar(canvas) {
  // Weighted random size based on distribution
  const random = Math.random();
  let size;
  
  if (random < CONFIG.SIZE_DISTRIBUTION[0]) {
    size = Math.random() * 2 + CONFIG.MIN_STAR_SIZE; // small stars
  } else if (random < CONFIG.SIZE_DISTRIBUTION[0] + CONFIG.SIZE_DISTRIBUTION[1]) {
    size = Math.random() * 3 + 3; // medium stars
  } else {
    size = Math.random() * 5 + 6; // large stars
  }

  const x = Math.random() * canvas.width - canvas.width / 2;
  const y = Math.random() * canvas.height - canvas.height / 2;
  const z = Math.random() * canvas.width;
  const speed = Math.random() * (CONFIG.MAX_SPEED - CONFIG.MIN_SPEED) + CONFIG.MIN_SPEED;
  const color = getRandomColor();

  return { x, y, z, size, speed, color };
}

function getRandomColor() {
  // Generate vibrant colors with larger stars being brighter
  const hue = Math.floor(Math.random() * 360);
  const lightness = 70 + Math.random() * 20; // Brighter stars
  return `hsl(${hue}, 100%, ${lightness}%)`;
}