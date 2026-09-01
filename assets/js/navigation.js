document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.hamburger');
  const menu = document.querySelector('#primary-navigation');
  if (!button || !menu) return;

  const setMenuState = (open) => {
    menu.classList.toggle('show', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    setMenuState(!open);
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });
});
