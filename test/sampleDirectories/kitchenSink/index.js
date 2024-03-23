// Function to get a specific URL parameter
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Function to open folders leading to the file
function openFoldersForFile(filePath) {
  // Remove leading slash and split the path to get all folders and the file
  const parts = filePath.startsWith('/') ? filePath.slice(1).split('/') : filePath.split('/');

  // Iterate through the parts and open each corresponding folder
  let cumulativePath = '';
  parts.forEach((part, index) => {
      // Skip the last part as it is the file itself
      if (index < parts.length - 1) {
          cumulativePath += '/' + part;
          // Assuming you have a function to open a folder given its path
          openFolder(cumulativePath);
      }
  });
}

// Assuming there's an existing function that opens a folder given its path
// This could vary based on your implementation; you might add an 'open' class, call an API, etc.
function openFolder(folderPath) {
  // Find the folder element by its data-path attribute or similar identifier
  const folderElement = document.querySelector(`[data-path="${folderPath}"]`);
  if (folderElement) {
      // Add 'open' class, call an existing function, or whatever your logic is
      folderElement.classList.add('open');
  }
}

// On page load, open the folders leading to the specified file
document.addEventListener('DOMContentLoaded', () => {
  const openFilePath = getQueryParam('openFile');
  if (openFilePath) {
      openFoldersForFile(openFilePath);
  }
});
