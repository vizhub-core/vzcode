document.addEventListener('DOMContentLoaded', function () {
  const colorCircles = document.querySelectorAll('.color-circle');

  colorCircles.forEach(circle => {
      circle.addEventListener('click', function () {
          // Trigger color picker
          const color = prompt("Enter a new hex color (e.g., #ff6347):", "");
          if (color) {
              const colorCode = circle.previousElementSibling;
              colorCode.textContent = color;
              circle.style.backgroundColor = color;
          }
      });
  });
});

