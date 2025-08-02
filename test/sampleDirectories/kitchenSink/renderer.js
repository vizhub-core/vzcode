import { CONFIG } from './constants.js';

export function setupRenderer(container) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);
  
  function resize() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  return { canvas, ctx };
}

export function renderFrame(ctx, canvas, stars, angle) {
  ctx.fillStyle = CONFIG.BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    star.z -= star.speed;

    const rotatedX = star.x * Math.cos(angle) - star.y * Math.sin(angle);
    const rotatedY = star.x * Math.sin(angle) + star.y * Math.cos(angle);

    const perspectiveX = rotatedX / (1 + star.z * CONFIG.PERSPECTIVE_FACTOR);
    const perspectiveY = rotatedY / (1 + star.z * CONFIG.PERSPECTIVE_FACTOR);
    const perspectiveSize = star.size / (1 + star.z * CONFIG.PERSPECTIVE_FACTOR);

    const screenX = perspectiveX + canvas.width / 2;
    const screenY = perspectiveY + canvas.height / 2;

    if (perspectiveSize > 0 && screenX > 0 && screenX < canvas.width && screenY > 0 && screenY < canvas.height) {
      // Enhanced glow effect scaled by star size
      const glowMultiplier = 1 + star.size / 10;
      
      ctx.beginPath();
      ctx.arc(screenX, screenY, perspectiveSize * 2 * glowMultiplier, 0, Math.PI * 2);
      ctx.fillStyle = star.color.replace(')', ', 0.1)').replace('rgb', 'rgba');
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(screenX, screenY, perspectiveSize * glowMultiplier, 0, Math.PI * 2);
      ctx.fillStyle = star.color.replace(')', ', 0.5)').replace('rgb', 'rgba');
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(screenX, screenY, perspectiveSize * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.fill();
    }

    if (star.z < -canvas.width) {
      resetStar(star, canvas);
    }
  });
}

function resetStar(star, canvas) {
  star.x = Math.random() * canvas.width - canvas.width / 2;
  star.y = Math.random() * canvas.height - canvas.height / 2;
  star.z = canvas.width;
}