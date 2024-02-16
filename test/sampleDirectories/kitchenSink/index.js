var inputs = document.querySelectorAll('input, textarea');
inputs.forEach(function (input) {
  input.classList.add('custom-cursor');
});
inputs.forEach(function (input) {
  input.style.cursor = 'pointer';
});
