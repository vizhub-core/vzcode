self.addEventListener('message', async (event) => {
  const { id, type, data } = event.data;

  try {
    switch (type) {
      case 'build':
        // Simulate build process (replace with actual build logic)
        // For now, just echo back the code
        self.postMessage({ id, type: 'buildResult', result: data });
        break;
      case 'run':
        // Simulate run process (replace with actual run logic)
        self.postMessage({ id, type: 'runResult', result: 'Code executed' });
        break;
      default:
        self.postMessage({ id, type: 'error', error: 'Unknown message type' });
    }
  } catch (error) {
    self.postMessage({ id, type: 'error', error: error.message });
  }
});
