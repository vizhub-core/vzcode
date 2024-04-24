document.addEventListener('DOMContentLoaded', function () {
  const colorPicker = document.getElementById('color-picker');
  const colorCircles = document.querySelectorAll('.color-circle');

  colorCircles.forEach(circle => {
      circle.addEventListener('click', function () {
          // Set current color to picker
          colorPicker.value = getComputedStyle(circle).backgroundColor;

          // Show color picker just below the circle
          colorPicker.style.position = 'absolute';
          colorPicker.style.left = `${circle.getBoundingClientRect().left}px`;
          colorPicker.style.top = `${circle.getBoundingClientRect().top + circle.getBoundingClientRect().height}px`;
          colorPicker.style.display = 'block';

          // When the user picks a color, update the text and circle color
          colorPicker.onchange = () => {
              const color = colorPicker.value;
              const colorCode = circle.previousElementSibling;
              colorCode.textContent = color;
              circle.style.backgroundColor = color;
              colorPicker.style.display = 'none';  // Hide picker after selection
          };

          // Hide color picker if user clicks elsewhere on the document
          document.addEventListener('click', function(event) {
              if (!circle.contains(event.target) && event.target !== colorPicker) {
                  colorPicker.style.display = 'none';
              }
          }, {once: true});
      });
  });
});

