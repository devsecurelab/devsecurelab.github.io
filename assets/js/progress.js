const PROGRESS_KEY = 'devsecurelab_progress';
const COURSE_TOTAL = 8;

function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
  catch (error) { return {}; }
}

function saveProgress(progress) { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); }
function isLessonComplete(lessonId) { return Boolean(getProgress()[lessonId]); }
function getCourseCompleted(courseId) { return Object.keys(getProgress()).filter((id) => id.startsWith(`${courseId}-`)).length; }

function markLessonComplete(lessonId) {
  if (!lessonId) return;
  const progress = getProgress();
  progress[lessonId] = true;
  saveProgress(progress);
  updateProgressUI();
}

function updateProgressUI() {
  const progress = getProgress();
  const completedTotal = Object.keys(progress).length;

  document.querySelectorAll('[data-course-progress]').forEach((wrapper) => {
    const courseId = wrapper.dataset.courseProgress;
    const total = Number(wrapper.dataset.total || COURSE_TOTAL);
    const completed = Math.min(getCourseCompleted(courseId), total);
    const percentage = Math.round((completed / total) * 100);
    const text = wrapper.querySelector('.progress-text');
    const fill = wrapper.querySelector('.progress-bar-fill');
    const bar = wrapper.querySelector('[role="progressbar"]');
    if (text) text.textContent = `${completed} of ${total} modules complete (${percentage}%)`;
    if (fill) fill.style.width = `${percentage}%`;
    if (bar) {
      bar.setAttribute('aria-valuenow', String(completed));
      bar.setAttribute('aria-valuetext', `${completed} of ${total} modules complete`);
    }
  });

  document.querySelectorAll('[data-dashboard-progress]').forEach((label) => {
    const completed = Math.min(getCourseCompleted(label.dataset.dashboardProgress), COURSE_TOTAL);
    label.textContent = `${completed} of ${COURSE_TOTAL} modules complete`;
  });

  const counter = document.querySelector('#overall-progress-counter');
  if (counter) counter.textContent = `${completedTotal} modules completed across all courses`;

  const overall = document.querySelector('[data-overall-progress] [role="progressbar"]');
  const overallFill = document.querySelector('[data-overall-progress] .progress-bar-fill');
  const overallPercent = Math.min(Math.round((completedTotal / 40) * 100), 100);
  if (overall) {
    overall.setAttribute('aria-valuenow', String(completedTotal));
    overall.setAttribute('aria-valuetext', `${completedTotal} of 40 modules complete`);
  }
  if (overallFill) overallFill.style.width = `${overallPercent}%`;

  document.querySelectorAll('.mark-complete-btn').forEach((button) => {
    const complete = isLessonComplete(button.dataset.lessonId);
    button.textContent = complete ? 'Completed ✓' : 'Mark as Complete';
    button.setAttribute('aria-pressed', String(complete));
    button.classList.toggle('is-complete', complete);
  });
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('.mark-complete-btn');
  if (button) markLessonComplete(button.dataset.lessonId);
});

document.addEventListener('DOMContentLoaded', updateProgressUI);
