// Assuming you have defined CSS classes for different themes and states
var inputs = document.querySelectorAll('input, textarea');

// Function to apply initial styles and add event listeners
function applyStylesAndListeners(input) {
  input.classList.add('custom-cursor');
  input.style.cursor = 'pointer';
  input.style.caretColor = 'white'; // or any bright color

  // Adding focus and blur event listeners for enhanced user feedback
  input.addEventListener('focus', function() {
    this.classList.add('input-focused'); // Assumes .input-focused class alters the input's appearance
  });
  input.addEventListener('blur', function() {
    this.classList.remove('input-focused');
  });

}

// Apply styles and listeners to all current inputs and textareas
inputs.forEach(applyStylesAndListeners);

// apply styles and listeners to dynamically added inputs and textareas
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1 && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) { // Check if the node is an element and is an input or textarea
        applyStylesAndListeners(node);
      }
    });
  });
});

// Start observing the document body for added nodes
observer.observe(document.body, { childList: true, subtree: true });
