document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.quiz-container').forEach((container) => {
    const options = [...container.querySelectorAll('.quiz-option')];
    const feedback = container.querySelector('.quiz-feedback');
    const lessonId = container.dataset.lessonId;

    options.forEach((option) => {
      option.addEventListener('click', () => {
        const correct = option.dataset.correct === 'true';
        options.forEach((item) => {
          item.classList.remove('correct', 'incorrect');
          item.removeAttribute('aria-current');
        });
        option.classList.add(correct ? 'correct' : 'incorrect');
        option.setAttribute('aria-current', correct ? 'true' : 'false');
        if (correct) {
          if (typeof window.feedback === 'function') window.feedback(true);
          feedback.textContent = 'Correct. Review the explanation, then continue to the next module.';
          feedback.className = 'quiz-feedback is-correct';
          if (typeof markLessonComplete === 'function') markLessonComplete(lessonId);
        } else {
          if (typeof window.feedback === 'function') window.feedback(false);
          feedback.textContent = 'Incorrect. Review the module and try again.';
          feedback.className = 'quiz-feedback is-incorrect';
        }
      });
    });
  });
});
