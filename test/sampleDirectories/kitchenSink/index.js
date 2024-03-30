// Function to get a specific URL parameter more concisely
const getQueryParam = param => new URLSearchParams(window.location.search).get(param);

// Streamlined function to open folders leading to the file
function openFoldersForFile(filePath) {
  // Use filter() and reduce() to open each folder in the path
  filePath.split('/').filter(part => part).reduce((cumulativePath, currentPart) => {
    const folderPath = `${cumulativePath}/${currentPart}`;
    openFolder(folderPath);
    return folderPath;
  }, '');
}

// Enhanced folder opening logic with added robustness
function openFolder(folderPath) {
  // Use querySelector to find the folder and open it if it exists
  const folderElement = document.querySelector(`[data-path="${folderPath}"]`);
  folderElement?.classList.add('open'); // Optional chaining ensures error-free execution
}

// On page load, simplified logic to open the specified file's folders
document.addEventListener('DOMContentLoaded', () => {
  const openFilePath = getQueryParam('openFile');
  if (openFilePath) {
    openFoldersForFile(openFilePath);
  }
});

