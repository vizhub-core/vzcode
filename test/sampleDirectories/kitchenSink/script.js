const numStars = 2000;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const starfield = document.getElementById('starfield');

const MIN_STAR_SIZE = 1;
const MAX_STAR_SIZE = 4;
const MIN_SPEED = 0.5; // Reduced speed
const MAX_SPEED = 5; // Reduced speed

function createStar() {
  const size =
    Math.random() * (MAX_STAR_SIZE - MIN_STAR_SIZE) +
    MIN_STAR_SIZE;
  const x = Math.random() * canvas.width;
  const y = -size; // Start stars above the canvas
  const speed =
    Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
  const color = 'white'; // All stars are white

  return { x, y, size, speed, color };
}

const stars = Array.from({ length: numStars }, createStar);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach((star) => {
    star.y += star.speed;
    if (star.y > canvas.height + star.size) {
      star.y = -star.size;
    }
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = star.color;
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvas.width = starfield.offsetWidth;
  canvas.height = starfield.offsetHeight;
  // Recalculate star positions after resize to fill the entire width
  stars.forEach((star) => {
    star.x = Math.random() * canvas.width;
  });
}

starfield.appendChild(canvas);
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
animate();
