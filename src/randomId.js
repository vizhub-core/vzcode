// Generate a random ID string consisting of digits.
const numDigits = 8;
export const randomId = () => {
  let randomString = '';
  for (let i = 0; i < numDigits; i++) {
    randomString += Math.floor(Math.random() * 10);
  }
  return randomString;
};

const probabilityOfCollision =
  1 - Math.pow(1 - 1 / Math.pow(10, numDigits), numRuns);
