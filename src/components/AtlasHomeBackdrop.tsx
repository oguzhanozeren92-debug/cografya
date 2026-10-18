import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

type Shape = {
  id?: string | number;
  geometry: unknown;
  type: string;
  properties?: { name?: string };
};
const topology = world as unknown as { objects: { countries: unknown } };
const countries = (feature(topology as never, topology.objects.countries as never) as unknown as { features: Shape[] }).features;

// Real country outlines; this is visual scenery, not a second interactive map.
const projection = geoNaturalEarth1().fitExtent(
  [[14, 60], [1186, 556]],
  { type: 'FeatureCollection', features: countries } as never,
);
const geo = geoPath(projection);
const paths = countries.map((country, index) => ({
  key: String(country.id ?? index),
  d: geo(country as never),
})).filter(country => Boolean(country.d));
const meridians = geo(geoGraticule10()) ?? '';

export function AtlasHomeBackdrop() {
  return (
    <div className="atlas-scene" aria-hidden="true">
      <span className="atlas-scene-glow atlas-scene-glow-peach" />
      <span className="atlas-scene-glow atlas-scene-glow-mint" />
      <span className="atlas-scene-glow atlas-scene-glow-lilac" />

      <svg className="atlas-scene-world" viewBox="0 0 1200 620" focusable="false">
        <defs>
          <linearGradient id="atlas-scene-land" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#6ec5ba" />
            <stop offset="58%" stopColor="#e6a886" />
            <stop offset="100%" stopColor="#ada0dc" />
          </linearGradient>
          <radialGradient id="atlas-scene-soften">
            <stop offset="52%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
        </defs>
        <g className="atlas-scene-grid">
          <path d={meridians} fill="none" stroke="#85aaa9" strokeWidth="1.5" />
        </g>
        <g fill="url(#atlas-scene-land)" stroke="#7ba4a8" strokeWidth="1.1">
          {paths.map(country => (
            <path key={country.key} d={country.d || ''} />
          ))}
        </g>
        <path d="M 25 574 C 249 514, 455 526, 595 565 S 983 630, 1178 546" fill="none"
          stroke="#df9a94" strokeWidth="3" strokeDasharray="5 13" opacity=".53" />
      </svg>

      <span className="atlas-scene-orbit atlas-scene-orbit-one" />
      <span className="atlas-scene-orbit atlas-scene-orbit-two" />

      <svg className="atlas-scene-compass" viewBox="0 0 120 120" focusable="false">
        <circle cx="60" cy="60" r="47" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 8"/>
        <path d="M60 5V24M60 96V115M5 60H24M96 60H115" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M60 22L70 60L60 98L50 60Z" fill="currentColor" opacity=".65"/>
        <path d="M22 60L60 50L98 60L60 70Z" fill="currentColor" opacity=".28"/>
        <circle cx="60" cy="60" r="6" fill="#fff6e9"/>
      </svg>
      <span className="atlas-scene-spark atlas-scene-spark-one">✦</span>
      <span className="atlas-scene-spark atlas-scene-spark-two">✧</span>
      <span className="atlas-scene-spark atlas-scene-spark-three">✦</span>
      <span className="atlas-scene-spark atlas-scene-spark-four">✳</span>
    </div>
  );
}
