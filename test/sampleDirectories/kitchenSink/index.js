import { CONFIG } from './constants.js';
import { createStar } from './star.js';
import { setupRenderer, renderFrame } from './renderer.js';

const starfield = document.getElementById('starfield');
const { canvas, ctx } = setupRenderer(starfield);

function initializeStars() {
  return Array.from({ length: CONFIG.NUM_STARS }, () => createStar(canvas));
}

function animationLoop(stars) {
  let angle = 0;
  let startTime = Date.now();
  
  function animate() {
    const currentTime = Date.now();
    const time = currentTime - startTime;
    
    angle += CONFIG.ROTATION_SPEED;
    renderFrame(ctx, canvas, stars, angle, time);
    requestAnimationFrame(animate);
  }

  animate();
}

const stars = initializeStars();
animationLoop(stars);