/* DevSecure Lab - Dark/Light Theme Switcher */

document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.querySelector('.theme-toggle-btn');
  
  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('devsecure_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateButtonText(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('devsecure_theme', newTheme);
      updateButtonText(newTheme);
    });
  }

  function updateButtonText(theme) {
    if (themeBtn) {
      themeBtn.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
  }
});
