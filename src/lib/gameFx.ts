/**
 * Atlas Arena — short, lightweight game sounds and optional celebration FX.
 * Sounds use native Web Audio (no remote audio files, no tracking).
 * Off by a saved local preference; motion follows the OS reduce-motion option.
 */
export type GameSound = 'select' | 'correct' | 'wrong' | 'hint' | 'victory';
export type Celebration = 'streak' | 'daily' | 'victory';
const SOUND_KEY = 'atlas-arena-sound-v1';
let audioContext: AudioContext | null = null;

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try { return window.localStorage.getItem(SOUND_KEY) !== 'off'; }
  catch { return true; }
}

export function saveSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off'); }
  catch { /* storage may be blocked; the UI state still works this session */ }
}

const SOUND_NOTES: Record<GameSound, ReadonlyArray<readonly [number, number, number]>> = {
  select: [[490, 0, .08]],
  correct: [[625, 0, .10], [840, .085, .14]],
  wrong: [[270, 0, .10], [205, .085, .15]],
  hint: [[460, 0, .09], [685, .095, .12]],
  victory: [[523, 0, .11], [659, .10, .12], [784, .22, .22]],
};

export function playGameSound(sound: GameSound): void {
  if (!isSoundEnabled() || typeof window === 'undefined') return;
  try {
    if (!audioContext) audioContext = new window.AudioContext();
    const context = audioContext;
    if (context.state === 'suspended') void context.resume().catch(() => {});
    const startTime = context.currentTime;
    for (const [frequency, offset, duration] of SOUND_NOTES[sound]) {
      const oscillator = context.createOscillator();
      const volume = context.createGain();
      oscillator.type = sound === 'wrong' ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      volume.gain.setValueAtTime(.0001, startTime + offset);
      volume.gain.exponentialRampToValueAtTime(.065, startTime + offset + .015);
      volume.gain.exponentialRampToValueAtTime(.0001, startTime + offset + duration);
      oscillator.connect(volume);
      volume.connect(context.destination);
      oscillator.start(startTime + offset);
      oscillator.stop(startTime + offset + duration + .015);
    }
  } catch {
    // Audio may be unavailable in browser previews or disallowed by device settings.
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
