// loading.js
document.addEventListener('DOMContentLoaded', () => { // CRUCIAL: Wait for DOM
  const loadingOverlay = document.getElementById('loading-overlay');

  function showLoading() {
    console.log("Showing loading overlay");
    loadingOverlay.classList.remove('hidden');
  }

  function hideLoading() {
    console.log("Hiding loading overlay");
    loadingOverlay.classList.add('hidden');
  }

  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', (event) => {
      console.log("Link clicked:", link.href);
      showLoading();
      setTimeout(hideLoading, 3000);
    });
  });

  window.addEventListener('load', () => {
    console.log("Page loaded");
    hideLoading();
  });
}); // End of DOMContentLoaded listener