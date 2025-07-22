const numStars = 500;
const starfield = document.getElementById('starfield');

function createStar() {
  const star = document.createElement('div');
  star.className = 'star';
  const size = Math.random() * 3 + 1;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  star.style.animationDuration = `${Math.random() * 10 + 5}s`;

  // Assign purple shades to stars
  const colors = ['purple', 'dark-purple', 'lavender', 'violet'];
  star.classList.add(colors[Math.floor(Math.random() * colors.length)]);

  return star;
}

for (let i = 0; i < numStars; i++) {
  starfield.appendChild(createStar());
}
