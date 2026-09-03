const DS_TOTAL = 48;

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); }
  catch (error) { return {}; }
}
function dsState() { return readJSON('devsecure_progress'); }
function dsPractice() { return readJSON('devsecure_practice'); }
function dsAssess() { return readJSON('devsecure_assess'); }
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function courseProgress(slug) {
  const done = new Set(dsState()[slug] || []).size;
  return { done, total: 8, pct: Math.round(done / 8 * 100) };
}
function updateGate(card) {
  if (!card) return false;
  const id = card.dataset.moduleId;
  const assessment = dsAssess();
  const practice = dsPractice();
  const checks = [...card.querySelectorAll('[data-practice-check]')];
  if (practice[id]) checks.forEach((box, i) => { box.checked = !!practice[id][i]; });
  const practiceDone = checks.length > 0 && checks.every(box => box.checked);
  const score = Number(card.dataset.quizScore || assessment[id] || 0);
  card.dataset.quizScore = String(score);
  const viewed = card.dataset.viewed === 'true' || !!assessment[id + '_viewed'];
  const pass = viewed && practiceDone && score >= 60;
  const button = card.querySelector('.complete-btn');
  const status = card.querySelector('.gate-status');
  if (button && !(dsState()[card.dataset.course] || []).includes(id)) {
    button.disabled = !pass;
    button.setAttribute('aria-disabled', String(!pass));
    button.textContent = pass ? 'Mark as complete' : 'Locked: complete requirements';
  }
  if (status) {
    status.textContent = pass
      ? 'Requirements met: module completion is unlocked.'
      : `Requirements: ${viewed ? 'lesson viewed' : 'view lesson'} · ${practiceDone ? 'practice complete' : 'complete practice'} · ${score >= 60 ? 'quiz passed' : 'pass 60% quiz'}`;
  }
  return pass;
}
function updateProgressUI() {
  document.querySelectorAll('[data-course-progress]').forEach(el => {
    const p = courseProgress(el.dataset.courseProgress);
    el.querySelectorAll('[data-progress-text]').forEach(x => { x.textContent = `${p.done} of ${p.total} modules complete (${p.pct}%)`; });
    el.querySelectorAll('[data-progress-fill]').forEach(x => { x.style.width = p.pct + '%'; });
  });
  document.querySelectorAll('[data-module-id]').forEach(card => {
    const done = (dsState()[card.dataset.course] || []).includes(card.dataset.moduleId);
    const button = card.querySelector('.complete-btn');
    if (button && done) { button.classList.add('done'); button.disabled = false; button.textContent = 'Completed ✓'; }
    else updateGate(card);
  });
  const totalDone = Object.values(dsState()).reduce((sum, list) => sum + (Array.isArray(list) ? new Set(list).size : 0), 0);
  document.querySelectorAll('[data-overall-fill]').forEach(x => { x.style.width = Math.round(totalDone / DS_TOTAL * 100) + '%'; });
  document.querySelectorAll('[data-overall-text]').forEach(x => { x.textContent = `${totalDone} of ${DS_TOTAL} modules complete (${Math.round(totalDone / DS_TOTAL * 100)}%)`; });
  document.querySelectorAll('[data-course-card]').forEach(card => {
    const p = courseProgress(card.dataset.courseCard);
    card.querySelector('[data-card-text]').textContent = `${p.done}/8 modules · ${p.pct}%`;
    card.querySelector('[data-card-fill]').style.width = p.pct + '%';
  });
}
function markComplete(slug, id) {
  const state = dsState();
  state[slug] = [...new Set([...(state[slug] || []), id])];
  saveJSON('devsecure_progress', state);
  updateProgressUI();
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.module-card').forEach(card => {
    const id = card.dataset.moduleId;
    const checks = [...card.querySelectorAll('[data-practice-check]')];
    const practice = dsPractice();
    const assessment = dsAssess();
    if (practice[id]) checks.forEach((box, i) => { box.checked = !!practice[id][i]; });
    if (assessment[id + '_viewed']) card.dataset.viewed = 'true';
    checks.forEach(box => box.addEventListener('change', () => {
      const saved = dsPractice();
      saved[id] = checks.map(item => item.checked);
      saveJSON('devsecure_practice', saved);
      updateGate(card);
    }));
    card.querySelector('.complete-btn')?.addEventListener('click', () => {
      if (!card.querySelector('.complete-btn').disabled) markComplete(card.dataset.course, id);
    });
    const markViewed = () => {
      card.dataset.viewed = 'true';
      const saved = dsAssess();
      saved[id + '_viewed'] = true;
      saveJSON('devsecure_assess', saved);
      updateGate(card);
    };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { markViewed(); observer.disconnect(); }
    }), { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });
    observer.observe(card);
    card.addEventListener('pointerdown', markViewed, { once: true });
  });
  updateProgressUI();
});
