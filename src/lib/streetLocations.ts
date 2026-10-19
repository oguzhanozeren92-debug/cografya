export interface Coordinates { lat: number; lng: number }
export const STREET_ROUNDS = 5;
export const STREET_MAX_PER_ROUND = 5000;
export function haversineKm(a:Coordinates,b:Coordinates):number {
  const rad=Math.PI/180;
  const dl=(b.lat-a.lat)*rad, dn=(b.lng-a.lng)*rad;
  const q=Math.sin(dl/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dn/2)**2;
  return 6371.0088*2*Math.atan2(Math.sqrt(q),Math.sqrt(Math.max(0,1-q)));
}
/**
 * One transparent distance ladder for both Street and Drone modes.
 * Accuracy near the location matters; distant guesses no longer get thousands of points.
 */
export const STREET_SCORE_STEPS = [
  {km:0,points:5000}, {km:10,points:4900}, {km:50,points:4500},
  {km:100,points:4000}, {km:250,points:3000}, {km:500,points:1800},
  {km:1000,points:600}, {km:2000,points:100}, {km:3000,points:0},
] as const;
export function locationPoints(km:number):number {
  if(!Number.isFinite(km)||km<0)return 0;
  for(let i=1;i<STREET_SCORE_STEPS.length;i++){
    const low=STREET_SCORE_STEPS[i-1],high=STREET_SCORE_STEPS[i];
    if(km<=high.km){
      const factor=(km-low.km)/(high.km-low.km);
      return Math.max(0,Math.round(low.points+(high.points-low.points)*factor));
    }
  }
  return 0;
}
