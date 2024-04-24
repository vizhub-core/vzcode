window.onload = function() {
  // Check if the user is new or hasn't dismissed the info box permanently
  if (!localStorage.getItem('infoBoxDismissed')) {
      document.getElementById('infoBox').classList.remove('hidden');
  }
};

function closeInfoBox() {
  document.getElementById('infoBox').classList.add('hidden');
  // Set a flag in local storage to not show the info box again
  localStorage.setItem('infoBoxDismissed', 'true');
}

