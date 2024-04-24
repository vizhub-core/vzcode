document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
      // Show notification with a delay after page loads if not dismissed permanently
      if (!localStorage.getItem('infoBoxDismissed')) {
          const infoBox = document.getElementById('infoBox');
          infoBox.classList.remove('hidden');
          fadeIn(infoBox);
      }
  }, 5000); // Delay of 5000 milliseconds (5 seconds)
});

function closeInfoBox() {
  const infoBox = document.getElementById('infoBox');
  fadeOut(infoBox, () => {
      infoBox.classList.add('hidden');
      // Set a flag in local storage to not show the info box again
      localStorage.setItem('infoBoxDismissed', 'true');
  });
}

function fadeIn(element, display = 'block') {
  element.style.opacity = 0;
  element.style.display = display;
  let last = +new Date();
  let tick = function() {
      element.style.opacity = +element.style.opacity + (new Date() - last) / 400;
      last = +new Date();
      if (+element.style.opacity < 1) {
          (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
      }
  };
  tick();
}

function fadeOut(element, callback) {
  element.style.opacity = 1;
  let last = +new Date();
  let tick = function() {
      element.style.opacity = +element.style.opacity - (new Date() - last) / 400;
      last = +new Date();
      if (+element.style.opacity > 0) {
          (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
      } else {
          if (callback) callback();
      }
  };
  tick();
}

