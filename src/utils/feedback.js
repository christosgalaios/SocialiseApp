/**
 * Interactive Feedback System — "Warm Hearth" Sound Design
 *
 * Uses the Web Audio API to generate warm, tactile sounds that match
 * the Socialise brand: terracotta warmth, organic tones, and gentle feedback.
 *
 * Sound palette:
 * - Sine & triangle waves (warm, soft — never harsh square/sawtooth)
 * - Musical intervals rooted in major thirds and fifths (inviting, friendly)
 * - Short durations (30–800ms) — enhancement, never annoyance
 * - Gentle volume (0.08–0.25) — subtle layer, not attention-grabbing
 */

let audioCtx = null;

/** Lazily initialise AudioContext (must happen after user gesture on mobile) */
function getContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      audioCtx = new Ctx();
    } catch {
      return null;
    }
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// ─── Preference helpers ──────────────────────────────────────────────

const STORAGE_KEY = 'socialise_sounds_enabled';

/** Check if sounds are enabled (defaults to true) */
export function isSoundEnabled() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : JSON.parse(stored);
  } catch {
    return true;
  }
}

/** Toggle sound on/off — persisted to localStorage */
export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
  } catch { /* quota exceeded — ignore */ }
}

/** Check prefers-reduced-motion */
function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

/** Gate: only play if enabled and motion is allowed */
function shouldPlay() {
  return isSoundEnabled() && !prefersReducedMotion();
}

// ─── Core oscillator helper ──────────────────────────────────────────

/**
 * Play a single tone with envelope shaping.
 * @param {number} freq - Frequency in Hz
 * @param {string} type - Oscillator type (sine, triangle)
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Peak gain (0–1)
 * @param {number} attack - Attack time in seconds
 * @param {number} decay - Decay time in seconds
 * @param {number} startOffset - Delay before starting (seconds)
 */
function playTone(freq, type = 'sine', duration = 0.1, volume = 0.12, attack = 0.005, decay = 0.08, startOffset = 0) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime + startOffset;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  // Envelope: silence → attack → peak → decay → silence
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.linearRampToValueAtTime(volume * 0.6, now + attack + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + decay);
}

/**
 * Play a noise burst (for swoosh/whoosh effects).
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Peak gain
 * @param {number} highpass - Highpass filter frequency
 */
function playNoise(duration = 0.12, volume = 0.04, highpass = 2000) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(highpass, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration);
}

// ─── Sound palette ───────────────────────────────────────────────────
// All frequencies chosen to feel warm and inviting.
// Musical reference: C major scale / pentatonic — no dissonance.

/** Soft tap — navigation, tab switches, general button press */
export function playTap() {
  if (!shouldPlay()) return;
  // Warm wooden tap: triangle wave, mid-frequency, very short
  playTone(520, 'triangle', 0.06, 0.10, 0.003, 0.04);
}

/** Gentle click — toggles, checkboxes, secondary actions */
export function playClick() {
  if (!shouldPlay()) return;
  // Slightly higher, snappier than tap
  playTone(660, 'sine', 0.04, 0.08, 0.002, 0.03);
}

/** Success chime — join event, save, RSVP, positive actions */
export function playSuccess() {
  if (!shouldPlay()) return;
  // Two-note ascending major third: C5 → E5
  playTone(523, 'sine', 0.12, 0.10, 0.005, 0.06);        // C5
  playTone(659, 'triangle', 0.15, 0.12, 0.005, 0.08, 0.08); // E5, offset
}

/** Error/warning tone — failed action, form validation error */
export function playError() {
  if (!shouldPlay()) return;
  // Low descending minor second: Eb4 → D4
  playTone(311, 'sine', 0.12, 0.08, 0.005, 0.06);
  playTone(294, 'sine', 0.14, 0.06, 0.005, 0.08, 0.08);
}

/** Like/heart pop — feed like, emoji reaction */
export function playLike() {
  if (!shouldPlay()) return;
  // Bright pop with harmonic overtone
  playTone(880, 'sine', 0.08, 0.10, 0.002, 0.04);
  playTone(1320, 'sine', 0.06, 0.04, 0.002, 0.03, 0.02); // Fifth harmonic, soft
}

/** Unlike/remove — undo like, unsave */
export function playUnlike() {
  if (!shouldPlay()) return;
  // Soft descending tone
  playTone(660, 'sine', 0.06, 0.06, 0.002, 0.04);
  playTone(440, 'triangle', 0.08, 0.04, 0.002, 0.04, 0.03);
}

/** Toggle switch — on/off toggles in settings */
export function playToggle(isOn) {
  if (!shouldPlay()) return;
  if (isOn) {
    // Rising: on
    playTone(440, 'triangle', 0.05, 0.08, 0.002, 0.03);
    playTone(660, 'triangle', 0.06, 0.08, 0.002, 0.03, 0.04);
  } else {
    // Falling: off
    playTone(660, 'triangle', 0.05, 0.06, 0.002, 0.03);
    playTone(440, 'triangle', 0.06, 0.06, 0.002, 0.03, 0.04);
  }
}

/** Swoosh — modal/sheet open */
export function playSwooshOpen() {
  if (!shouldPlay()) return;
  playNoise(0.10, 0.03, 3000);
  playTone(392, 'sine', 0.08, 0.04, 0.003, 0.04);
}

/** Swoosh close — modal/sheet dismiss */
export function playSwooshClose() {
  if (!shouldPlay()) return;
  playNoise(0.08, 0.02, 4000);
  playTone(330, 'sine', 0.06, 0.03, 0.002, 0.03);
}

/** Card press — event card tap */
export function playCardPress() {
  if (!shouldPlay()) return;
  playTone(440, 'triangle', 0.05, 0.07, 0.002, 0.03);
}

/** Send message — chat send */
export function playSend() {
  if (!shouldPlay()) return;
  // Quick ascending whoosh
  playTone(523, 'sine', 0.06, 0.08, 0.002, 0.03);
  playTone(784, 'sine', 0.08, 0.06, 0.002, 0.04, 0.04); // G5
}

/** Level up — celebration fanfare */
export function playLevelUp() {
  if (!shouldPlay()) return;
  // Three-note ascending arpeggio: C5 → E5 → G5
  playTone(523, 'sine', 0.15, 0.12, 0.005, 0.08);          // C5
  playTone(659, 'triangle', 0.15, 0.14, 0.005, 0.08, 0.12); // E5
  playTone(784, 'sine', 0.20, 0.16, 0.005, 0.10, 0.24);     // G5
  // Final harmonic shimmer
  playTone(1047, 'sine', 0.30, 0.08, 0.010, 0.15, 0.36);    // C6
}

/** Confetti burst — joins, celebrations */
export function playConfetti() {
  if (!shouldPlay()) return;
  // Quick sparkle cascade
  playTone(880, 'sine', 0.06, 0.06, 0.002, 0.03);
  playTone(1047, 'sine', 0.06, 0.05, 0.002, 0.03, 0.04);
  playTone(1319, 'sine', 0.08, 0.04, 0.002, 0.04, 0.08);
}

/** Refresh — pull-to-refresh complete */
export function playRefresh() {
  if (!shouldPlay()) return;
  playTone(440, 'triangle', 0.06, 0.06, 0.002, 0.03);
  playTone(587, 'sine', 0.08, 0.08, 0.003, 0.04, 0.05);
}

// ─── Splash screen sounds ────────────────────────────────────────────

/** Splash: host letter appears — deep warm tone */
export function playSplashHost() {
  if (!shouldPlay()) return;
  playTone(262, 'sine', 0.30, 0.10, 0.010, 0.15); // C4, long and warm
}

/** Splash: members arrive — scattered taps */
export function playSplashMembers() {
  if (!shouldPlay()) return;
  const notes = [330, 392, 440, 494, 523, 587, 659]; // E4 through E5
  notes.forEach((freq, i) => {
    playTone(freq, 'triangle', 0.08, 0.06, 0.003, 0.04, i * 0.07);
  });
}

/** Splash: huddle — notes converge */
export function playSplashHuddle() {
  if (!shouldPlay()) return;
  // Warm cluster converging
  playTone(392, 'sine', 0.15, 0.06, 0.005, 0.08);
  playTone(440, 'triangle', 0.12, 0.06, 0.005, 0.06, 0.05);
  playTone(523, 'sine', 0.12, 0.06, 0.005, 0.06, 0.10);
}

/** Splash: latecomer dot arrives */
export function playSplashLatecomer() {
  if (!shouldPlay()) return;
  // Bouncy little arrival
  playTone(880, 'sine', 0.06, 0.08, 0.002, 0.03);
  playTone(660, 'sine', 0.05, 0.06, 0.002, 0.03, 0.06);
  playTone(784, 'sine', 0.06, 0.07, 0.002, 0.03, 0.10);
}

/** Splash: welcome/together — warm resolved chord */
export function playSplashWelcome() {
  if (!shouldPlay()) return;
  // C major chord, gently rolled
  playTone(262, 'sine', 0.40, 0.08, 0.010, 0.20);          // C4
  playTone(330, 'triangle', 0.35, 0.08, 0.010, 0.18, 0.06); // E4
  playTone(392, 'sine', 0.35, 0.08, 0.010, 0.18, 0.12);     // G4
  playTone(523, 'sine', 0.40, 0.06, 0.010, 0.20, 0.18);     // C5 — octave bloom
}

/** Splash: together phase — final warm bloom */
export function playSplashTogether() {
  if (!shouldPlay()) return;
  // Full warm chord with gentle shimmer
  playTone(262, 'sine', 0.60, 0.10, 0.015, 0.30);           // C4
  playTone(330, 'triangle', 0.55, 0.10, 0.015, 0.25, 0.08); // E4
  playTone(392, 'sine', 0.55, 0.10, 0.015, 0.25, 0.16);     // G4
  playTone(523, 'sine', 0.60, 0.08, 0.015, 0.30, 0.24);     // C5
  // Subtle high shimmer
  playTone(1047, 'sine', 0.40, 0.03, 0.020, 0.20, 0.32);    // C6
}

// ─── Mango AI sounds ─────────────────────────────────────────────────

/** Mango: chirp — quick tap/click on Mango */
export function playMangoChirp() {
  if (!shouldPlay()) return;
  // High, cute chirp like a kitten mew
  playTone(1200, 'sine', 0.06, 0.10, 0.002, 0.03);
  playTone(1400, 'sine', 0.04, 0.06, 0.002, 0.02, 0.04);
}

/** Mango: purr — holding/petting Mango */
export function playMangoPurr() {
  if (!shouldPlay()) return;
  // Low rumbling purr via rapid gentle oscillation
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const mainGain = ctx.createGain();

  // Main tone: low and warm
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, now);

  // LFO for purr vibrato
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(22, now); // ~22Hz rumble
  lfoGain.gain.setValueAtTime(15, now);  // Frequency deviation

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  // Envelope
  mainGain.gain.setValueAtTime(0, now);
  mainGain.gain.linearRampToValueAtTime(0.06, now + 0.05);
  mainGain.gain.setValueAtTime(0.06, now + 0.35);
  mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.50);

  osc.connect(mainGain);
  mainGain.connect(ctx.destination);

  osc.start(now);
  lfo.start(now);
  osc.stop(now + 0.55);
  lfo.stop(now + 0.55);
}

/** Mango: carried — picked up by drag */
export function playMangoPickup() {
  if (!shouldPlay()) return;
  // Quick upward sweep — "wheee!"
  playTone(440, 'sine', 0.08, 0.08, 0.002, 0.04);
  playTone(660, 'sine', 0.06, 0.07, 0.002, 0.03, 0.04);
  playTone(880, 'sine', 0.06, 0.05, 0.002, 0.03, 0.07);
}

/** Mango: drop/land — released from drag */
export function playMangoDrop() {
  if (!shouldPlay()) return;
  // Descending thud with bounce
  playTone(440, 'triangle', 0.08, 0.08, 0.002, 0.04);
  playTone(262, 'sine', 0.10, 0.10, 0.003, 0.05, 0.05);
}

/** Mango: celebrate — when Mango celebrates with user */
export function playMangoCelebrate() {
  if (!shouldPlay()) return;
  // Happy little cascade
  playTone(784, 'sine', 0.08, 0.08, 0.002, 0.04);
  playTone(988, 'sine', 0.08, 0.08, 0.002, 0.04, 0.06);
  playTone(1175, 'sine', 0.10, 0.06, 0.003, 0.05, 0.12);
}

/** Mango: chat open/close */
export function playMangoChatToggle(isOpening) {
  if (!shouldPlay()) return;
  if (isOpening) {
    playTone(523, 'sine', 0.06, 0.06, 0.002, 0.03);
    playTone(659, 'triangle', 0.06, 0.06, 0.002, 0.03, 0.04);
    playMangoChirp();
  } else {
    playTone(659, 'sine', 0.05, 0.05, 0.002, 0.03);
    playTone(523, 'triangle', 0.06, 0.04, 0.002, 0.03, 0.03);
  }
}

/** Mango: sleep — gentle descending lullaby note */
export function playMangoSleep() {
  if (!shouldPlay()) return;
  playTone(392, 'sine', 0.20, 0.04, 0.010, 0.10);
  playTone(330, 'sine', 0.25, 0.03, 0.010, 0.12, 0.15);
}

/** Mango: wake — gentle ascending note */
export function playMangoWake() {
  if (!shouldPlay()) return;
  playTone(330, 'sine', 0.10, 0.05, 0.005, 0.05);
  playTone(440, 'triangle', 0.10, 0.06, 0.005, 0.05, 0.08);
}

// ─── Haptic feedback ─────────────────────────────────────────────────

/** Light haptic tap (mobile) */
export function hapticTap() {
  try {
    if (window.navigator?.vibrate) window.navigator.vibrate(8);
  } catch { /* ignore */ }
}

/** Medium haptic feedback */
export function hapticMedium() {
  try {
    if (window.navigator?.vibrate) window.navigator.vibrate(15);
  } catch { /* ignore */ }
}

/** Success haptic pattern */
export function hapticSuccess() {
  try {
    if (window.navigator?.vibrate) window.navigator.vibrate([10, 50, 10]);
  } catch { /* ignore */ }
}
