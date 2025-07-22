const numStars = 500;
const starfield = document.getElementById('starfield');

const MIN_STAR_SIZE = 1;
const MAX_STAR_SIZE = 4;
const MIN_ANIMATION_DURATION = 5;
const MAX_ANIMATION_DURATION = 15;


function createStar() {
  const star = document.createElement('div');
  star.className = 'star';
  const size = Math.random() * (MAX_STAR_SIZE - MIN_STAR_SIZE) + MIN_STAR_SIZE;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  star.style.animationDuration = `${Math.random() * (MAX_ANIMATION_DURATION - MIN_ANIMATION_DURATION) + MIN_ANIMATION_DURATION}s`;

  // Assign teal and green shades to stars
  const colors = ['teal', 'lightseagreen', 'mediumseagreen', 'seagreen'];
  star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

  return star;
}

for (let i = 0; i < numStars; i++) {
  starfield.appendChild(createStar());
}
