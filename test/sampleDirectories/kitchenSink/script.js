const numStars = 2000;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const starfield = document.getElementById('starfield');

const MIN_STAR_SIZE = 1;
const MAX_STAR_SIZE = 4;
const MIN_SPEED = 0.5;
const MAX_SPEED = 5;
const PERSPECTIVE_FACTOR = 0.005; // Adjust for perspective effect

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function createStar() {
  const size =
    Math.random() * (MAX_STAR_SIZE - MIN_STAR_SIZE) +
    MIN_STAR_SIZE;
  const x = Math.random() * canvas.width - canvas.width / 2;
  const y =
    Math.random() * canvas.height - canvas.height / 2;
  const z = Math.random() * canvas.width; // Add z-coordinate
  const speed =
    Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
  const color = getRandomColor();

  return { x, y, z, size, speed, color };
}

const stars = Array.from({ length: numStars }, createStar);

function animate() {
  // Draw semi-transparent rectangle to create trail effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Adjust alpha for trail opacity
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  stars.forEach((star) => {
    star.z -= star.speed; // Move star towards the viewer

    // Perspective projection
    const perspectiveX =
      star.x / (1 + star.z * PERSPECTIVE_FACTOR);
    const perspectiveY =
      star.y / (1 + star.z * PERSPECTIVE_FACTOR);
    const perspectiveSize =
      star.size / (1 + star.z * PERSPECTIVE_FACTOR);

    const screenX = perspectiveX + canvas.width / 2;
    const screenY = perspectiveY + canvas.height / 2;

    if (
      perspectiveSize > 0 &&
      screenX > 0 &&
      screenX < canvas.width &&
      screenY > 0 &&
      screenY < canvas.height
    ) {
      ctx.beginPath();
      ctx.arc(
        screenX,
        screenY,
        perspectiveSize / 2,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = star.color;
      ctx.fill();
    }

    if (star.z < -canvas.width) {
      star.x =
        Math.random() * canvas.width - canvas.width / 2;
      star.y =
        Math.random() * canvas.height - canvas.height / 2;
      star.z = canvas.width;
    }
  });

  requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvas.width = starfield.offsetWidth;
  canvas.height = starfield.offsetHeight;
  stars.forEach((star) => {
    // Recalculate star positions after resize
    star.x =
      Math.random() * canvas.width - canvas.width / 2;
    star.y =
      Math.random() * canvas.height - canvas.height / 2;
    star.z = Math.random() * canvas.width;
  });
}

starfield.appendChild(canvas);
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
animate();