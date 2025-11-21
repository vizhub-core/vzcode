let seconds = 0;
let intervalId = null;

const messageElement = document.querySelector('.message');

const startTimer = () => {
  if (!intervalId) {
    intervalId = setInterval(() => {
      seconds++;
      messageElement.textContent = seconds;
    }, 1000);
  }
};

const stopTimer = () => {
  clearInterval(intervalId);
  intervalId = null;
};

export { startTimer, stopTimer };
