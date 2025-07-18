const numStars = 500;
const starfield = document.getElementById('starfield');

for (let i = 0; i < numStars; i++) {
  const star = document.createElement('div');
  star.className = 'star';
  const size = Math.random() * 3 + 1; // Vary star sizes
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  const x = Math.random() * 100; // Adjust for field size
  const y = Math.random() * 100; // Adjust for field size
  star.style.left = `${x}%`;
  star.style.top = `${y}%`;
  star.style.animationDuration = `${Math.random() * 10 + 5}s`; // Vary animation speed
  starfield.appendChild(star);
}