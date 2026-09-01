document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('#main-content');
  if (main && !main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.toggle('reduce-motion', reduceMotion.matches);
  reduceMotion.addEventListener?.('change', (event) => {
    document.documentElement.classList.toggle('reduce-motion', event.matches);
  });
});
