import { useEffect, useMemo, useState } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { tsParticles, type ISourceOptions } from '@tsparticles/engine';

let enginePromise: Promise<void> | null = null;

function ensureParticleEngine(): Promise<void> {
  if (enginePromise) return enginePromise;
  const loading = loadSlim(tsParticles).catch((error: unknown) => {
    enginePromise = null;
    throw error;
  });
  enginePromise = loading;
  return loading;
}

/** Low particle count and low fps, only mounted in the home hero. */
export default function ArenaParticles() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    void ensureParticleEngine().then(() => { if (active) setReady(true); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const options = useMemo<ISourceOptions>(() => ({
    fullScreen: { enable: false },
    detectRetina: false,
    fpsLimit: 28,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
    particles: {
      number: { value: 17, density: { enable: false } },
      color: { value: ['#8de9ff', '#ffd58a', '#a895ff'] },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.26, max: 0.76 } },
      size: { value: { min: 0.8, max: 2.3 } },
      move: { enable: true, speed: { min: 0.18, max: 0.55 }, direction: 'none', outModes: { default: 'out' } },
    },
  }), []);

  if (!ready) return null;
  return (
    <div className="atlas-home-particles" aria-hidden="true">
      <Particles id="atlas-hero-particles" options={options} />
    </div>
  );
}
