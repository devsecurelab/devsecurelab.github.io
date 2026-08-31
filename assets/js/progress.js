/* DevSecure Lab - Learner Progress & LocalStorage Tracker */

const PROGRESS_KEY = 'devsecurelab_progress';

// Get all completed lessons from LocalStorage
function getProgress() {
  return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
}

// Mark a lesson or module as completed
function markLessonComplete(lessonId) {
  const progress = getProgress();
  progress[lessonId] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  updateProgressUI();
}

// Check if a specific lesson is completed
function isLessonComplete(lessonId) {
  const progress = getProgress();
  return !!progress[lessonId];
}

// Update UI elements like progress bars across the platform
function updateProgressUI() {
  const progress = getProgress();
  const completedCount = Object.keys(progress).length;
  
  // Update dashboard counters if present
  const progressCounter = document.getElementById('overall-progress-counter');
  if (progressCounter) {
    progressCounter.textContent = `${completedCount} modules completed`;
  }

  // Update progress bar fills
  const progressFills = document.querySelectorAll('.progress-bar-fill');
  progressFills.forEach(fill => {
    const total = parseInt(fill.getAttribute('data-total') || '8', 10);
    const courseId = fill.getAttribute('data-course-id');
    
    // Count completions specific to this course if courseId exists
    let courseCompleted = 0;
    if (courseId) {
      courseCompleted = Object.keys(progress).filter(id => id.startsWith(courseId)).length;
    } else {
      courseCompleted = completedCount;
    }

    const percentage = Math.min(Math.round((courseCompleted / total) * 100), 100);
    fill.style.width = `${percentage}%`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateProgressUI();
});
