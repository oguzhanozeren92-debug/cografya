import { lazy, Suspense, useEffect, useMemo, useState } from 'react';

const HomePlanet3D = lazy(() => import('@/components/HomePlanet3D'));
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

interface Shape {
  id?: string | number;
  geometry: unknown;
  type: string;
  properties: { name?: string };
}

const topology = world as unknown as { objects: { countries: unknown } };
const geography = (feature(topology as never, topology.objects.countries as never) as unknown as { features: Shape[] }).features;

/**
 * Small static orthographic globe for the home screen. Country geometry is
 * computed only once, with CSS motion applied to the whole illustration.
 * The active quiz globe is unchanged and retains its own interactive controls.
 */
export function HomePlanet() {
  const [enable3d, setEnable3d] = useState(false);
  const [ready3d, setReady3d] = useState(false);
  useEffect(() => {
    // Keep the SVG fallback for WebGL-less devices, reduced motion and low-end hardware.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      (navigator.hardwareConcurrency ?? 4) <= 2) return;
    try {
      const probe = document.createElement('canvas');
      const context = probe.getContext('webgl2') || probe.getContext('webgl');
      if (context) {
        const gl = context as WebGLRenderingContext;
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        setEnable3d(true);
      }
    } catch { /* SVG fallback remains */ }
  }, []);
  const paths = useMemo(() => {
    const projection = geoOrthographic().scale(111).translate([130, 130]).rotate([-25, -14, 0]);
    const path = geoPath(projection);
    return {
      grid: path(geoGraticule10()) ?? '',
      countries: geography.map((country, i) => ({ id: String(country.id ?? i), d: path(country as never) })).filter(entry => Boolean(entry.d)),
    };
  }, []);

  return (
    <div className="atlas-home-planet-wrap pointer-events-none absolute" aria-hidden="true">
      <div className="atlas-home-orbit atlas-home-orbit-one" />
      <div className="atlas-home-orbit atlas-home-orbit-two" />
      <div className="atlas-home-planet-glow" />
      <svg style={{ opacity: ready3d ? 0 : 1 }} className="atlas-home-planet" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="atlas-hero-sea" cx="30%" cy="22%" r="81%">
            <stop stopColor="#42c7ec" />
            <stop offset=".32" stopColor="#2176b7" />
            <stop offset=".73" stopColor="#133766" />
            <stop offset="1" stopColor="#06122d" />
          </radialGradient>
          <linearGradient id="atlas-hero-land" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#7decd6" />
            <stop offset=".55" stopColor="#40a9a3" />
            <stop offset="1" stopColor="#225780" />
          </linearGradient>
          <radialGradient id="atlas-hero-shine" cx="30%" cy="16%" r="75%">
            <stop stopColor="#ffffff" stopOpacity=".5" />
            <stop offset=".38" stopColor="#ffffff" stopOpacity=".04" />
            <stop offset="1" stopColor="#00152b" stopOpacity=".5" />
          </radialGradient>
          <clipPath id="atlas-hero-clip"><circle cx="130" cy="130" r="111" /></clipPath>
        </defs>
        <circle cx="130" cy="130" r="118" fill="#4cb9ff" opacity=".12" />
        <circle cx="130" cy="130" r="111" fill="url(#atlas-hero-sea)" stroke="#8fdaf9" strokeWidth="1.2" />
        <g clipPath="url(#atlas-hero-clip)">
          <path d={paths.grid} fill="none" stroke="#a2e5fc" strokeWidth=".55" opacity=".3" />
          {paths.countries.map(country => (
            <path key={country.id} d={country.d || ''} fill="url(#atlas-hero-land)" stroke="#d1f4eb" strokeWidth=".33" opacity=".95" />
          ))}
          <circle cx="130" cy="130" r="111" fill="url(#atlas-hero-shine)" />
        </g>
        <circle cx="130" cy="130" r="112" fill="none" stroke="#baf8ff" strokeWidth=".6" opacity=".55" />
      </svg>
      {enable3d && (
        <Suspense fallback={null}>
          <HomePlanet3D onReady={() => setReady3d(true)} />
        </Suspense>
      )}
      <span className="atlas-home-satellite atlas-home-satellite-one" />
      <span className="atlas-home-satellite atlas-home-satellite-two" />
    </div>
  );
}
