/* DevSecure Lab - Interactive Quiz & Knowledge Check */

document.addEventListener('DOMContentLoaded', () => {
  const quizContainers = document.querySelectorAll('.quiz-container');

  quizContainers.forEach(container => {
    const options = container.querySelectorAll('.quiz-option');
    const feedbackText = container.querySelector('.quiz-feedback');

    options.forEach(option => {
      option.addEventListener('click', () => {
        // Clear previous selection states
        options.forEach(opt => {
          opt.classList.remove('correct', 'incorrect');
        });

        const isCorrect = option.getAttribute('data-correct') === 'true';
        const lessonId = container.getAttribute('data-lesson-id');

        if (isCorrect) {
          option.classList.add('correct');
          if (feedbackText) {
            feedbackText.textContent = '🎉 Correct! Well done.';
            feedbackText.style.color = 'var(--accent-green)';
          }
          
          // Mark lesson complete in progress.js if lessonId exists
          if (typeof markLessonComplete === 'function' && lessonId) {
            markLessonComplete(lessonId);
          }
        } else {
          option.classList.add('incorrect');
          if (feedbackText) {
            feedbackText.textContent = '❌ Incorrect. Review the lesson and try again!';
            feedbackText.style.color = '#ef4444';
          }
        }
      });
    });
  });
});
