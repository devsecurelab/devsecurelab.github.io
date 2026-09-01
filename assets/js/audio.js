const AUDIO_PREF_KEY = 'devsecurelab_audio_enabled';
const VIBRATION_PREF_KEY = 'devsecurelab_vibration_enabled';
let activeButton = null;
let activeStatus = null;
let activeUtterance = null;

function audioEnabled() { return localStorage.getItem(AUDIO_PREF_KEY) !== 'false'; }
function vibrationEnabled() { return localStorage.getItem(VIBRATION_PREF_KEY) !== 'false'; }
function updateAudioPreferenceUI() {
  document.querySelectorAll('.audio-settings-btn').forEach((button) => {
    const enabled = audioEnabled();
    button.textContent = enabled ? 'Audio On' : 'Audio Off';
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Turn lesson audio off' : 'Turn lesson audio on');
  });
}
function resetAudioUI(message = 'Audio ready') {
  if (activeButton) { activeButton.textContent = 'Listen to this lesson'; activeButton.setAttribute('aria-pressed', 'false'); }
  if (activeStatus) { activeStatus.textContent = message; }
  activeButton = null; activeStatus = null; activeUtterance = null;
}
function stopLessonAudio(message = 'Audio ready') {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  resetAudioUI(message);
}
function speakLesson(text, status, button) {
  if (!('speechSynthesis' in window)) { status.textContent = 'Audio is not supported in this browser.'; return; }
  stopLessonAudio();
  activeButton = button; activeStatus = status;
  activeUtterance = new SpeechSynthesisUtterance(text);
  activeUtterance.lang = 'en-US'; activeUtterance.rate = .94; activeUtterance.pitch = 1;
  activeUtterance.onstart = () => { button.setAttribute('aria-pressed','true'); button.textContent='Pause lesson audio'; status.textContent='Playing lesson audio'; };
  activeUtterance.onend = () => { if (activeUtterance) resetAudioUI('Audio ready'); };
  activeUtterance.onerror = () => { if (activeUtterance) resetAudioUI('Audio could not be played. Try again after interacting with the page.'); };
  window.speechSynthesis.speak(activeUtterance);
}
function playFeedbackSound(success) {
  if (!audioEnabled() || (!window.AudioContext && !window.webkitAudioContext)) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx(); const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
  oscillator.type = success ? 'sine' : 'triangle'; oscillator.frequency.value = success ? 740 : 180;
  gain.gain.setValueAtTime(.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.08, ctx.currentTime + .01); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + (success ? .18 : .24));
  oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + (success ? .2 : .26));
}
function feedback(success) {
  playFeedbackSound(success);
  if (!success && vibrationEnabled() && 'vibrate' in navigator && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate([120,70,120]);
}

document.addEventListener('DOMContentLoaded', () => {
  updateAudioPreferenceUI();
  document.querySelectorAll('.audio-settings-btn').forEach((button) => button.addEventListener('click', () => {
    const enabled = !audioEnabled(); localStorage.setItem(AUDIO_PREF_KEY, String(enabled));
    if (!enabled) stopLessonAudio('Audio is off');
    updateAudioPreferenceUI();
  }));
  document.querySelectorAll('.lesson-audio').forEach((box) => {
    const button = box.querySelector('.audio-toggle'); const status = box.querySelector('.audio-status'); const text = box.dataset.audioText;
    if (!button || !status || !text) return;
    button.addEventListener('click', () => {
      if (!audioEnabled()) { status.textContent = 'Turn Audio On in the navigation first.'; return; }
      const synth = window.speechSynthesis;
      if (activeButton === button && synth.speaking) {
        if (synth.paused) { synth.resume(); button.textContent='Pause lesson audio'; status.textContent='Playing lesson audio'; }
        else { synth.pause(); button.textContent='Resume lesson audio'; status.textContent='Audio paused'; }
        return;
      }
      speakLesson(text, status, button);
    });
  });
});
