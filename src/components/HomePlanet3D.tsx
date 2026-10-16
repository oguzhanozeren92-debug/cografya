import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import * as THREE from 'three';
import world from 'world-atlas/countries-110m.json';

interface Shape {
  type: string;
  geometry: unknown;
  properties: { name?: string };
}
const topo = world as unknown as { objects: { countries: unknown } };
const countries = (feature(topo as never, topo.objects.countries as never) as unknown as { features: Shape[] }).features;

function EarthSphere() {
  const globe = useRef<THREE.Group>(null);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const ocean = context.createLinearGradient(0, 0, 1024, 512);
    ocean.addColorStop(0, '#1d9ec3');
    ocean.addColorStop(.5, '#155c9f');
    ocean.addColorStop(1, '#071d50');
    context.fillStyle = ocean;
    context.fillRect(0, 0, 1024, 512);
    const projection = geoEquirectangular().scale(1024 / (2 * Math.PI)).translate([512, 256]);
    const trace = geoPath(projection, context);
    context.fillStyle = '#73d6ba';
    context.strokeStyle = '#a1e5db';
    context.lineWidth = .65;
    for (const country of countries) {
      context.beginPath();
      trace(country as never);
      context.fill();
      context.stroke();
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = THREE.RepeatWrapping;
    map.anisotropy = 2;
    return map;
  }, []);
  useEffect(() => () => { texture?.dispose(); }, [texture]);
  useFrame((_, delta) => {
    if (globe.current) globe.current.rotation.y += Math.min(delta, .04) * .17;
  });
  return (
    <group ref={globe} rotation={[.2, -.45, .04]}>
      <mesh>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#256dae'} roughness={.74} metalness={.06} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.06, 40, 24]} />
        <meshBasicMaterial color="#69c9fa" transparent opacity={.16} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function HomePlanet3D({ onReady }: { onReady: () => void }) {
  return (
    <div className="atlas-home-webgl">
      <Canvas camera={{ position: [0, 0, 3.3], fov: 43 }} dpr={[1, 1.5]}
        frameloop="always" gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        onCreated={onReady}>
        <ambientLight intensity={1.4} />
        <directionalLight position={[-2, 3, 5]} intensity={2.1} color="#fff7de" />
        <directionalLight position={[2, -2, -3]} intensity={.8} color="#2caff5" />
        <EarthSphere />
      </Canvas>
    </div>
  );
}
