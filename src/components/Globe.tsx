import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent, TouchEvent, WheelEvent } from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import type { GamePhase } from '@/types';

interface GlobeProps {
  targetId: string | null;
  phase: GamePhase;
  onSpinEnd: () => void;
}

type Rotation = [number, number];
interface CountryFeature {
  id?: string | number;
  type: string;
  properties: { name?: string };
  geometry: unknown;
}

const SIZE = 800;
const BASE_SCALE = 280;
const MIN_SCALE = 180;
const MAX_SCALE = 2400;
const SPIN_DURATION = 5550;
const ZOOM_START = 0.79;
const ZOOM_MIN = 340;
const ZOOM_MAX = 2200;
const FULL_TURNS = 3;
const CENTER: [number, number] = [SIZE / 2, SIZE / 2];

const topo = worldData as unknown as { objects: { countries: unknown } };
const countries = (feature(topo as never, topo.objects.countries as never) as unknown as {
  features: CountryFeature[];
}).features;

// Son bir tam tur boyunca giderek frenler; ani duruş yapmaz.
function travelProgress(t: number): number {
  const coastUntil = 0.46;
  const coastShare = 0.66;
  if (t <= coastUntil) return (t / coastUntil) * coastShare;
  const s = (t - coastUntil) / (1 - coastUntil);
  return coastShare + (1 - coastShare) * (1 - Math.pow(1 - s, 3));
}

export const Globe = ({ targetId, phase, onSpinEnd }: GlobeProps) => {
  const [rotation, setRotation] = useState<Rotation>([0, -20]);
  const [scale, setScale] = useState(BASE_SCALE);
  const scaleRef = useRef(BASE_SCALE);
  const [isDragging, setIsDragging] = useState(false);
  const rotationRef = useRef<Rotation>([0, -20]);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchDistRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const updateScale = (next: number) => {
    scaleRef.current = next;
    setScale(next);
  };

  const updateRotation = (next: Rotation) => {
    rotationRef.current = next;
    setRotation(next);
  };

  const projection = useMemo(
    () => geoOrthographic().scale(scale).translate(CENTER).rotate([rotation[0], rotation[1], 0]),
    [rotation, scale],
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => geoGraticule10(), []);

  useEffect(() => {
    if (phase !== 'spinning' || !targetId) return;
    const target = countries.find((country) => String(country.id) === String(targetId));
    if (!target) {
      onSpinEnd();
      return;
    }

    const [longitude, latitude] = geoCentroid(target as never);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      onSpinEnd();
      return;
    }

    const beginning = rotationRef.current;
    const stopLongitude = -longitude;
    const stopLatitude = -latitude;
    // Hedefe varırken birkaç turu tamamla, önceki konumdan asla ışınlanma.
    const remaining = ((stopLongitude - beginning[0]) % 360 + 360) % 360;
    const distance = FULL_TURNS * 360 + remaining;
    // Calculate zoom from the target's visible projected footprint.
    // Large countries stay readable, while small countries receive more zoom.
    const centeredProjection = geoOrthographic()
      .scale(BASE_SCALE)
      .translate(CENTER)
      .rotate([stopLongitude, stopLatitude, 0]);
    const [[x0, y0], [x1, y1]] = geoPath(centeredProjection).bounds(target as never);
    const footprint = Math.max(x1 - x0, y1 - y0);
    const zoomScale = Number.isFinite(footprint) && footprint > 0
      ? Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, BASE_SCALE * 245 / footprint))
      : ZOOM_MIN;
    const startingScale = scaleRef.current;
    const startTime = performance.now();
    let ended = false;

    const frame = (now: number) => {
      const t = Math.min(1, (now - startTime) / SPIN_DURATION);
      // First restore the full globe while it starts spinning; then fly in
      // toward the country only after the rotation has finished.
      const spinT = Math.min(1, t / ZOOM_START);
      const progress = travelProgress(spinT);
      updateRotation([
        beginning[0] + distance * progress,
        beginning[1] + (stopLatitude - beginning[1]) * progress,
      ]);
      if (spinT < 0.22) {
        const u = spinT / 0.22;
        const eased = u * u * (3 - 2 * u);
        updateScale(startingScale + (BASE_SCALE - startingScale) * eased);
      } else if (t < ZOOM_START) {
        updateScale(BASE_SCALE);
      } else {
        const u = (t - ZOOM_START) / (1 - ZOOM_START);
        const eased = u * u * (3 - 2 * u);
        updateScale(BASE_SCALE + (zoomScale - BASE_SCALE) * eased);
      }
      if (t < 1) {
        animationRef.current = requestAnimationFrame(frame);
      } else if (!ended) {
        ended = true;
        animationRef.current = null;
        onSpinEnd();
      }
    };

    animationRef.current = requestAnimationFrame(frame);
    return () => {
      ended = true;
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [targetId, phase, onSpinEnd]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    updateScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, scaleRef.current * (event.deltaY < 0 ? 1.1 : 0.9))));
  };

  const handleStart = (x: number, y: number) => {
    if (phase === 'spinning' || phase === 'locking') return;
    setIsDragging(true);
    dragStartRef.current = { x, y };
  };

  const handleMove = (x: number, y: number) => {
    if (!isDragging || phase === 'spinning' || phase === 'locking') return;
    const dx = x - dragStartRef.current.x;
    const dy = y - dragStartRef.current.y;
    updateRotation([
      rotationRef.current[0] + dx * 0.35,
      Math.max(-85, Math.min(85, rotationRef.current[1] - dy * 0.35)),
    ]);
    dragStartRef.current = { x, y };
  };

  const handleEnd = () => {
    setIsDragging(false);
    touchDistRef.current = null;
  };

  const handleTouchMove = (event: TouchEvent<SVGSVGElement>) => {
    if (event.cancelable) event.preventDefault();
    if (event.touches.length === 2) {
      const a = event.touches[0];
      const b = event.touches[1];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (touchDistRef.current !== null) {
        updateScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, scaleRef.current + (distance - touchDistRef.current!) * 1.2)));
      }
      touchDistRef.current = distance;
    } else if (event.touches.length === 1) {
      handleMove(event.touches[0].clientX, event.touches[0].clientY);
    }
  };

  const highlight = phase === 'locking' || phase === 'question' || phase === 'feedback';
  const targetCenter = useMemo(() => {
    if (!highlight || !targetId) return null;
    const target = countries.find(country => String(country.id) === String(targetId));
    if (!target) return null;
    const [x, y] = pathGenerator.centroid(target as never);
    return Number.isFinite(x) && Number.isFinite(y) ? [x, y] as const : null;
  }, [highlight, targetId, pathGenerator]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none"
      style={{ touchAction: 'none' }} onWheel={handleWheel}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full h-full max-w-[600px] cursor-grab active:cursor-grabbing"
        onMouseDown={(event: MouseEvent<SVGSVGElement>) => handleStart(event.clientX, event.clientY)}
        onMouseMove={(event: MouseEvent<SVGSVGElement>) => handleMove(event.clientX, event.clientY)}
        onMouseUp={handleEnd} onMouseLeave={handleEnd}
        onTouchStart={(event) => {
          if (event.touches.length === 1) handleStart(event.touches[0].clientX, event.touches[0].clientY);
        }}
        onTouchMove={handleTouchMove} onTouchEnd={handleEnd}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={scale} fill="#0b1329" stroke="#1e293b" strokeWidth="3" />
        <path d={pathGenerator(graticule) || ''} fill="none" stroke="#1e293b" strokeWidth="0.5" />
        {countries.map((country, index) => {
          const d = pathGenerator(country as never);
          if (!d) return null;
          const selected = highlight && String(country.id) === String(targetId);
          return <path key={country.id ?? index} d={d}
            fill={selected ? '#ef4444' : '#1e3a8a'}
            stroke={selected ? '#ffdac0' : '#0f172a'}
            strokeWidth={selected ? 1.6 : 0.5}
            className={selected ? 'atlas-globe-country-target' : 'transition-colors duration-300'} />;
        })}
        {phase === 'locking' && targetCenter && (
          <g className="atlas-globe-reticle" transform={`translate(${targetCenter[0]} ${targetCenter[1]})`}
            fill="none" stroke="#ffe9b9" strokeWidth="2.4" pointerEvents="none" aria-hidden="true">
            <circle className="atlas-globe-reticle-ring" r="35" />
            <circle r="12" strokeWidth="1.3" opacity=".9" />
            <path d="M -53 0 H -26 M 26 0 H 53 M 0 -53 V -26 M 0 26 V 53" />
          </g>
        )}
      </svg>
    </div>
  );
};
