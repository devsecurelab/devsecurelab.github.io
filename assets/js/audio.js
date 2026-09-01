const AUDIO_PREF_KEY = 'devsecurelab_audio_enabled';
const VIBRATION_PREF_KEY = 'devsecurelab_vibration_enabled';
let activeButton = null;
let activeStatus = null;
let activeChunks = [];
let activeChunkIndex = 0;
let isPausedByUser = false;
let runToken = 0;

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
  if (activeStatus) activeStatus.textContent = message;
  activeButton = null; activeStatus = null; activeChunks = []; activeChunkIndex = 0; isPausedByUser = false;
}
function stopLessonAudio(message = 'Audio ready') {
  runToken += 1;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  resetAudioUI(message);
}
function splitIntoChunks(text) {
  const sentences = text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks = []; let current = '';
  sentences.forEach((sentence) => {
    const next = `${current} ${sentence}`.trim();
    if (current && next.length > 220) { chunks.push(current); current = sentence.trim(); }
    else current = next;
  });
  if (current) chunks.push(current);
  return chunks;
}
function speakNextChunk(token) {
  if (token !== runToken || isPausedByUser || !activeButton) return;
  if (activeChunkIndex >= activeChunks.length) { resetAudioUI('Audio ready'); return; }
  const utterance = new SpeechSynthesisUtterance(activeChunks[activeChunkIndex]);
  utterance.lang = 'en-US'; utterance.rate = .94; utterance.pitch = 1;
  utterance.onstart = () => { if (token === runToken && !isPausedByUser) { activeButton.textContent = 'Pause lesson audio'; activeButton.setAttribute('aria-pressed','true'); activeStatus.textContent = `Playing lesson audio · Part ${activeChunkIndex + 1} of ${activeChunks.length}`; } };
  utterance.onend = () => { if (token !== runToken || isPausedByUser) return; activeChunkIndex += 1; window.setTimeout(() => speakNextChunk(token), 30); };
  utterance.onerror = () => { if (token !== runToken || isPausedByUser) return; resetAudioUI('Audio could not be played. Try again after interacting with the page.'); };
  window.speechSynthesis.speak(utterance);
}
function startLessonAudio(text, status, button) {
  if (!('speechSynthesis' in window)) { status.textContent = 'Audio is not supported in this browser.'; return; }
  stopLessonAudio(); activeButton = button; activeStatus = status; activeChunks = splitIntoChunks(text); activeChunkIndex = 0; isPausedByUser = false; runToken += 1;
  speakNextChunk(runToken);
}
function toggleLessonAudio(text, status, button) {
  if (!audioEnabled()) { status.textContent = 'Turn Audio On in the navigation first.'; return; }
  if (activeButton !== button) { startLessonAudio(text, status, button); return; }
  if (isPausedByUser) {
    isPausedByUser = false; button.textContent = 'Pause lesson audio'; button.setAttribute('aria-pressed','true'); status.textContent = `Resuming lesson audio · Part ${activeChunkIndex + 1} of ${activeChunks.length}`; runToken += 1; speakNextChunk(runToken); return;
  }
  isPausedByUser = true; runToken += 1; window.speechSynthesis.cancel(); button.textContent = 'Resume lesson audio'; button.setAttribute('aria-pressed','false'); status.textContent = `Audio paused · Part ${activeChunkIndex + 1} of ${activeChunks.length}`;
}
function playFeedbackSound(success) {
  if (!audioEnabled() || (!window.AudioContext && !window.webkitAudioContext)) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext; const ctx = new AudioCtx(); const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
  oscillator.type = success ? 'sine' : 'triangle'; oscillator.frequency.value = success ? 740 : 180; gain.gain.setValueAtTime(.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.08, ctx.currentTime + .01); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + (success ? .18 : .24)); oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + (success ? .2 : .26));
}
function feedback(success) { playFeedbackSound(success); if (!success && vibrationEnabled() && 'vibrate' in navigator && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate([120,70,120]); }

document.addEventListener('DOMContentLoaded', () => {
  updateAudioPreferenceUI();
  document.querySelectorAll('.audio-settings-btn').forEach((button) => button.addEventListener('click', () => { const enabled = !audioEnabled(); localStorage.setItem(AUDIO_PREF_KEY, String(enabled)); if (!enabled) stopLessonAudio('Audio is off'); updateAudioPreferenceUI(); }));
  document.querySelectorAll('.lesson-audio').forEach((box) => {
    const button = box.querySelector('.audio-toggle'); const status = box.querySelector('.audio-status'); const text = box.dataset.audioText;
    if (!button || !status || !text) return;
    button.addEventListener('click', () => toggleLessonAudio(text, status, button));
  });
});
