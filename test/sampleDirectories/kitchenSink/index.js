var inputs = document.querySelectorAll('input, textarea');
inputs.forEach(function (input) {
  input.classList.add('custom-cursor');
});
inputs.forEach(function (input) {
  input.style.cursor = 'pointer';
});
inputs.forEach(function (input) {
  input.classList.add('custom-cursor'); // This assumes .custom-cursor class in CSS sets a bright caret color
  input.style.caretColor = 'white'; // Change to any bright color that contrasts with the background
});
