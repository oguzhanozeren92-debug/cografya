import { Howl, Howler } from 'howler';

/** Short synthetic sound cues, played and cached through Howler.js.
 * No remote files; a tiny WAV clip is generated once per sound on the device.
 */
export type GameSound = 'select' | 'correct' | 'wrong' | 'hint' | 'victory';
export type Celebration = 'streak' | 'daily' | 'victory';
const SOUND_KEY = 'atlas-arena-sound-v1';
const SAMPLE_RATE = 22050;
const SOUNDS: Record<GameSound, readonly (readonly [number, number, number])[]> = {
  select: [[490, 0, .08]],
  correct: [[625, 0, .10], [840, .085, .14]],
  wrong: [[270, 0, .10], [205, .085, .15]],
  hint: [[460, 0, .09], [685, .095, .12]],
  victory: [[523, 0, .11], [659, .10, .12], [784, .22, .22]],
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
  catch { /* storage may be blocked */ }
  if (!enabled) Howler.stop();
}

function createWav(sound: GameSound): string {
  const notes = SOUNDS[sound];
  const duration = Math.max(...notes.map(([, offset, len]) => offset + len)) + .04;
  const count = Math.ceil(duration * SAMPLE_RATE);
  const buffer = new ArrayBuffer(44 + count * 2);
  const view = new DataView(buffer);
  const setText = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  setText(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true);
  setText(8, 'WAVE'); setText(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); setText(36, 'data');
  view.setUint32(40, count * 2, true);
  for (let i = 0; i < count; i++) {
    const t = i / SAMPLE_RATE;
    let level = 0;
    for (const [frequency, offset, len] of notes) {
      const local = t - offset;
      if (local < 0 || local > len) continue;
      const attack = Math.min(1, local / .012);
      const fade = Math.pow(Math.max(0, 1 - local / len), 1.4);
      const angle = 2 * Math.PI * frequency * local;
      const tone = sound === 'wrong' ? (2 / Math.PI) * Math.asin(Math.sin(angle)) : Math.sin(angle);
      level += .16 * attack * fade * tone;
    }
    view.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, level)) * 32767), true);
  }
  const bytes = new Uint8Array(buffer);
  let raw = '';
  for (let i = 0; i < bytes.length; i += 4096) {
    raw += String.fromCharCode(...bytes.subarray(i, i + 4096));
  }
  return 'data:audio/wav;base64,' + btoa(raw);
}

export function playGameSound(sound: GameSound): void {
  if (typeof window === 'undefined' || !isSoundEnabled()) return;
  try {
    let howl = cache.get(sound);
    if (!howl) {
      howl = new Howl({ src: [createWav(sound)], format: ['wav'], volume: .64, preload: true });
      cache.set(sound, howl);
    }
    howl.play();
  } catch { /* Audio unsupported: play remains possible without sound */ }
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
