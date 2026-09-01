const THEME_KEY = 'devsecurelab_theme';

function applyTheme(theme) {
  const safeTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = safeTheme;
  document.querySelectorAll('.theme-toggle-btn').forEach((button) => {
    const next = safeTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    button.textContent = next;
    button.setAttribute('aria-label', `Switch to ${next.toLowerCase()}`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  document.querySelectorAll('.theme-toggle-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  });
});
