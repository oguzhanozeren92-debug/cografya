import { Howl, Howler } from 'howler';

/**
 * Globriva's original, lightweight UI/game sound palette.
 * Sounds are generated locally as small WAV clips: no downloads, licensing
 * dependencies, background music, or extra native permissions.
 */
export type GameSound = 'select' | 'correct' | 'wrong' | 'hint' | 'victory';
export type Celebration = 'streak' | 'daily' | 'victory';

// Keep the original storage key so players' saved sound preferences survive.
const SOUND_KEY = 'atlas-arena-sound-v1';
const SAMPLE_RATE = 44100;

type Voice = 'wood' | 'soft' | 'bell';
type Note = readonly [frequency: number, start: number, length: number, gain: number, voice: Voice];

/**
 * Soft, musical intervals rather than the old loud arcade beeps.
 * Correct: ascending perfect fifth. Wrong: quiet descending minor third.
 * Hint: glassy discovery sparkle. Victory: brief, warm ascending arpeggio.
 */
const SCORES: Record<GameSound, readonly Note[]> = {
  select: [
    [587.33, 0, .115, .30, 'wood'],
    [880, .018, .085, .08, 'bell'],
  ],
  correct: [
    [523.25, 0, .26, .30, 'bell'],
    [783.99, .09, .34, .32, 'bell'],
    [1046.50, .19, .24, .075, 'soft'],
  ],
  wrong: [
    [392, 0, .20, .22, 'soft'],
    [329.63, .085, .23, .20, 'soft'],
  ],
  hint: [
    [659.25, 0, .24, .23, 'bell'],
    [987.77, .09, .29, .21, 'bell'],
    [1318.51, .19, .24, .12, 'bell'],
  ],
  victory: [
    [523.25, 0, .28, .28, 'bell'],
    [659.25, .11, .29, .28, 'bell'],
    [783.99, .22, .33, .30, 'bell'],
    [1046.50, .36, .49, .31, 'bell'],
  ],
};

// Subtle stereo-free room reflections make the clips sound less synthetic.
// Keeping them mono avoids unexpected loudness and phase issues on phones.
const AMBIENCE: Record<GameSound, number> = {
  select: 0,
  correct: .09,
  wrong: .025,
  hint: .12,
  victory: .12,
};
const PEAK_LEVEL: Record<GameSound, number> = {
  select: .34,
  correct: .51,
  wrong: .36,
  hint: .42,
  victory: .53,
};
const cache = new Map<GameSound, Howl>();

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try { return window.localStorage.getItem(SOUND_KEY) !== 'off'; }
  catch { return true; }
}

export function saveSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off'); }
  catch { /* Storage can be blocked, but audio is still optional. */ }
  if (!enabled) Howler.stop();
}

function envelope(time: number, length: number, voice: Voice): number {
  const progress = time / length;
  if (progress < 0 || progress >= 1) return 0;
  const attack = Math.min(1, time / (voice === 'wood' ? .003 : .009));
  const release = Math.pow(Math.max(0, 1 - progress), voice === 'bell' ? 1.25 : 1.9);
  return attack * release;
}

function oscillator(time: number, frequency: number, voice: Voice): number {
  const angle = Math.PI * 2 * frequency * time;
  if (voice === 'wood') {
    // A mellow tap, without a harsh square/sawtooth transient.
    return .83 * Math.sin(angle) + .13 * Math.sin(angle * 2);
  }
  if (voice === 'soft') {
    return .87 * Math.sin(angle) + .11 * Math.sin(angle * 2);
  }
  // Bell-like overtones with gradually disappearing high partials.
  const shimmer = Math.exp(-time * 8);
  return .78 * Math.sin(angle)
    + .16 * shimmer * Math.sin(angle * 2.006)
    + .055 * shimmer * Math.sin(angle * 3.92);
}

function createWav(sound: GameSound): string {
  const notes = SCORES[sound];
  const length = Math.max(...notes.map(([, start, duration]) => start + duration));
  const sampleCount = Math.ceil((length + .16) * SAMPLE_RATE);
  const dry = new Float32Array(sampleCount);
  for (const [frequency, start, duration, gain, voice] of notes) {
    const startSample = Math.floor(start * SAMPLE_RATE);
    const endSample = Math.min(sampleCount, Math.ceil((start + duration) * SAMPLE_RATE));
    for (let i = startSample; i < endSample; i++) {
      const time = i / SAMPLE_RATE - start;
      dry[i] += gain * envelope(time, duration, voice) * oscillator(time, frequency, voice);
    }
  }

  const output = new Float32Array(sampleCount);
  const delayA = Math.round(.047 * SAMPLE_RATE);
  const delayB = Math.round(.093 * SAMPLE_RATE);
  const ambience = AMBIENCE[sound];
  let peak = 0;
  for (let i = 0; i < sampleCount; i++) {
    const sample = dry[i]
      + (i >= delayA ? dry[i - delayA] * ambience : 0)
      + (i >= delayB ? dry[i - delayB] * ambience * .48 : 0);
    output[i] = sample;
    peak = Math.max(peak, Math.abs(sample));
  }

  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);
  const writeText = (at: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(at + i, value.charCodeAt(i));
  };
  writeText(0, 'RIFF');
  view.setUint32(4, buffer.byteLength - 8, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, sampleCount * 2, true);

  const scale = peak > 0 ? PEAK_LEVEL[sound] / peak : 1;
  for (let i = 0; i < sampleCount; i++) {
    const value = Math.max(-1, Math.min(1, output[i] * scale));
    view.setInt16(44 + i * 2, Math.round(value * 32767), true);
  }

  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 8192) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
  }
  return 'data:audio/wav;base64,' + btoa(chunks.join(''));
}

export function playGameSound(sound: GameSound): void {
  if (typeof window === 'undefined' || !isSoundEnabled()) return;
  try {
    let howl = cache.get(sound);
    if (!howl) {
      howl = new Howl({
        src: [createWav(sound)],
        format: ['wav'],
        volume: .52,
        preload: true,
        html5: false,
      });
      cache.set(sound, howl);
    }
    // Rapid taps should not stack into a loud, distorted wall of sound.
    if (howl.playing()) howl.stop();
    howl.play();
  } catch {
    // The game always remains usable when audio is unavailable.
  }
}

export async function celebrateGame(kind: Celebration): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const confetti = (await import('canvas-confetti')).default;
    const daily = kind === 'daily' || kind === 'victory';
    await confetti({
      particleCount: daily ? 90 : 26,
      spread: daily ? 73 : 47,
      startVelocity: daily ? 33 : 21,
      gravity: 1.15,
      scalar: daily ? .92 : .76,
      origin: { y: daily ? .52 : .71 },
      colors: ['#f9cd78', '#ffefb1', '#55c5ed', '#a888ff', '#ffffff'],
      disableForReducedMotion: true,
      ticks: 140,
    });
  } catch {
    // The quiz must remain playable even if optional FX cannot load.
  }
}
