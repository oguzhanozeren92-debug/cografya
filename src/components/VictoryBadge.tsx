import Lottie from 'lottie-react';
import { Trophy } from 'lucide-react';
import { useReducedMotion } from 'motion/react';

// Local, hand-authored Lottie starburst. No remote assets, licensing, or tracking.
const k = (v: unknown) => ({ a: 0, k: v });
const animationData = {
  v: '5.9.6', fr: 30, ip: 0, op: 80, w: 140, h: 140, nm: 'Atlas Arena victory glow',
  ddd: 0, assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: 'Gold victory star',
    sr: 1, ks: {
      o: k(100), r: k(0), p: k([70, 70, 0]), a: k([0, 0, 0]),
      s: { a: 1, k: [
        { t: 0, s: [88, 88, 100], e: [106, 106, 100], i: { x: [.5], y: [1] }, o: { x: [.2], y: [0] } },
        { t: 38, s: [106, 106, 100], e: [88, 88, 100], i: { x: [.5], y: [1] }, o: { x: [.2], y: [0] } },
        { t: 80, s: [88, 88, 100] },
      ] },
    }, ao: 0,
    shapes: [
      { ty: 'sr', sy: 1, pt: k(8), p: k([0, 0]), r: k(0), or: k(57), os: k(0), ir: k(37), is: k(0), nm: 'Star glow' },
      { ty: 'fl', c: k([1, .75, .27, 1]), o: k(58), r: 1, nm: 'Gold' },
      { ty: 'tr', p: k([0, 0]), a: k([0, 0]), s: k([100, 100]), r: k(0), o: k(100), sk: k(0), sa: k(0) },
    ],
    ip: 0, op: 80, st: 0, bm: 0,
  }],
};

export default function VictoryBadge({ size = 78 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="atlas-victory-badge relative mx-auto" style={{ height: size, width: size }}>
      {!reduceMotion && <Lottie animationData={animationData} loop autoplay className="absolute inset-0 h-full w-full" />}
      <div className="atlas-victory-center absolute inset-0 flex items-center justify-center">
        <Trophy className="h-[39%] w-[39%] text-amber-100 drop-shadow-[0_2px_6px_rgba(249,188,69,.5)]" strokeWidth={1.8} />
      </div>
    </div>
  );
}
