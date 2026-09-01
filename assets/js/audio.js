const AUDIO_PREF_KEY = 'devsecurelab_audio_enabled';
const VIBRATION_PREF_KEY = 'devsecurelab_vibration_enabled';

function audioEnabled() {
  return localStorage.getItem(AUDIO_PREF_KEY) !== 'false';
}
function vibrationEnabled() {
  return localStorage.getItem(VIBRATION_PREF_KEY) !== 'false';
}
function updateAudioPreferenceUI() {
  document.querySelectorAll('.audio-settings-btn').forEach((button) => {
    const enabled = audioEnabled();
    button.textContent = enabled ? 'Audio On' : 'Audio Off';
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Turn lesson audio off' : 'Turn lesson audio on');
  });
}
function speakLesson(text, status, button) {
  if (!('speechSynthesis' in window)) {
    status.textContent = 'Audio is not supported in this browser.';
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = .94;
  utterance.pitch = 1;
  utterance.onstart = () => { button.setAttribute('aria-pressed', 'true'); button.textContent = 'Pause lesson audio'; status.textContent = 'Playing lesson audio'; };
  utterance.onend = () => { button.setAttribute('aria-pressed', 'false'); button.textContent = 'Listen to this lesson'; status.textContent = 'Audio ready'; };
  utterance.onerror = () => { button.setAttribute('aria-pressed', 'false'); button.textContent = 'Listen to this lesson'; status.textContent = 'Audio could not be played.'; };
  window.speechSynthesis.speak(utterance);
}
function playFeedbackSound(success) {
  if (!audioEnabled() || !window.AudioContext && !window.webkitAudioContext) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = success ? 'sine' : 'triangle';
  oscillator.frequency.value = success ? 740 : 180;
  gain.gain.setValueAtTime(.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.08, ctx.currentTime + .01);
  gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + (success ? .18 : .24));
  oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + (success ? .2 : .26));
}
function feedback(success) {
  playFeedbackSound(success);
  if (!success && vibrationEnabled() && 'vibrate' in navigator && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate([120, 70, 120]);
}

document.addEventListener('DOMContentLoaded', () => {
  updateAudioPreferenceUI();
  document.querySelectorAll('.audio-settings-btn').forEach((button) => button.addEventListener('click', () => {
    localStorage.setItem(AUDIO_PREF_KEY, String(!audioEnabled()));
    if (!audioEnabled()) window.speechSynthesis?.cancel();
    updateAudioPreferenceUI();
  }));
  document.querySelectorAll('.lesson-audio').forEach((box) => {
    const button = box.querySelector('.audio-toggle'); const status = box.querySelector('.audio-status'); const text = box.dataset.audioText;
    if (!button || !status || !text) return;
    button.addEventListener('click', () => {
      if (!audioEnabled()) { status.textContent = 'Turn Audio On in the navigation first.'; return; }
      if (window.speechSynthesis?.speaking) { window.speechSynthesis.pause(); button.textContent = 'Resume lesson audio'; status.textContent = 'Audio paused'; return; }
      if (window.speechSynthesis?.paused) { window.speechSynthesis.resume(); button.textContent = 'Pause lesson audio'; status.textContent = 'Playing lesson audio'; return; }
      speakLesson(text, status, button);
    });
  });
});
