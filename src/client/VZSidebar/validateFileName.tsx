// Returns true if file name is valid, false otherwise.
export const validateFileName = ({ files, fileName }) => {
  // General Character Check
  const regex =
    /^[a-zA-Z0-9](?:[a-zA-Z0-9 ./+=_-]*[a-zA-Z0-9])?$/;
  let valid = regex.test(fileName);

  // Check for Duplicate Filename
  for (const key in files) {
    if (fileName + '/' === files[key].name) {
      valid = false;
    }
  }

  return valid;
};
