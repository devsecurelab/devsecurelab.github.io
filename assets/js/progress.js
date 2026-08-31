/**
 * DevSecure Lab - Centralized Progress Tracking Engine
 */

const TOTAL_MODULES_PER_COURSE = 8;
const COURSE_KEYS = ['linux', 'networking', 'python', 'web-security', 'ethical-hacking'];

// Load stored progress from localStorage or return empty object
function getProgress() {
  try {
    return JSON.parse(localStorage.getItem('devsecure_progress')) || {};
  } catch (e) {
    return {};
  }
}

// Save progress to localStorage
function saveProgress(progressObj) {
  localStorage.setItem('devsecure_progress', JSON.stringify(progressObj));
}

// Check if a specific lesson is completed
function isLessonCompleted(lessonId) {
  const progress = getProgress();
  return !!progress[lessonId];
}

// Mark a lesson as completed and update UI immediately across all views
function markLessonComplete(lessonId) {
  const progress = getProgress();
  if (!progress[lessonId]) {
    progress[lessonId] = true;
    saveProgress(progress);
  }
  
  // Refresh UI dynamically
  updateProgressUI();
  updateCoursePageButtons();
}

// Dynamic UI Updater for Course Pages and Dashboard
function updateProgressUI() {
  const progress = getProgress();
  const completedLessons = Object.keys(progress).filter(key => progress[key]);

  // 1. Update Homepage / Dashboard Counters
  const totalCompletedCount = completedLessons.length;
  const overallTotalModules = COURSE_KEYS.length * TOTAL_MODULES_PER_COURSE; // 40 modules total
  const overallPercentage = Math.round((totalCompletedCount / overallTotalModules) * 100);

  const dashCountElem = document.getElementById('dashboard-completed-count');
  if (dashCountElem) {
    dashCountElem.textContent = `${totalCompletedCount} modules completed`;
  }

  const dashBarFill = document.getElementById('dashboard-overall-progress-fill');
  if (dashBarFill) {
    dashBarFill.style.width = `${overallPercentage}%`;
  }

  // 2. Update Dashboard Course Card Badges & Progress Bars
  COURSE_KEYS.forEach(course => {
    const courseCompletedCount = completedLessons.filter(id => id.startsWith(`${course}-module-`)).length;
    const coursePercentage = Math.round((courseCompletedCount / TOTAL_MODULES_PER_COURSE) * 100);

    // Update bar fill
    const fillElem = document.getElementById(`${course}-progress-fill`);
    if (fillElem) {
      fillElem.style.width = `${coursePercentage}%`;
    }

    // Update course progress text (Header & Dashboard Card Label)
    const textElem = document.getElementById(`${course}-progress-text`);
    if (textElem) {
      textElem.textContent = `${courseCompletedCount} of ${TOTAL_MODULES_PER_COURSE} Modules Complete (${coursePercentage}%)`;
    }

    // Update Dashboard Card Text Subtitle if exists
    const cardTextElem = document.getElementById(`${course}-card-status`);
    if (cardTextElem) {
      cardTextElem.textContent = `${courseCompletedCount} / ${TOTAL_MODULES_PER_COURSE} Modules (${coursePercentage}%)`;
    }
  });
}

// Update Button states on Course Pages
function updateCoursePageButtons() {
  const progress = getProgress();
  
  document.querySelectorAll('.mark-complete-btn').forEach(btn => {
    // Extract lesson ID from onclick attribute or data-lesson-id
    const onclickAttr = btn.getAttribute('onclick');
    if (onclickAttr) {
      const match = onclickAttr.match(/markLessonComplete\('([^']+)'\)/);
      if (match && match[1]) {
        const lessonId = match[1];
        if (progress[lessonId]) {
          btn.textContent = 'Completed ✓';
          btn.classList.remove('btn-primary');
          btn.classList.add('btn-outline');
          btn.style.opacity = '0.7';
          btn.style.cursor = 'default';
        }
      }
    }
  });
}

// Initializing on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  updateProgressUI();
  updateCoursePageButtons();
});
