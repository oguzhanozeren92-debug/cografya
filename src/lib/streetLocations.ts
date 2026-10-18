export interface Coordinates { lat: number; lng: number }
export const STREET_ROUNDS = 5;
export const STREET_MAX_PER_ROUND = 5000;
export function haversineKm(a:Coordinates,b:Coordinates):number {
  const rad=Math.PI/180;
  const dl=(b.lat-a.lat)*rad, dn=(b.lng-a.lng)*rad;
  const q=Math.sin(dl/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dn/2)**2;
  return 6371.0088*2*Math.atan2(Math.sqrt(q),Math.sqrt(Math.max(0,1-q)));
}
export function locationPoints(km:number):number {
  return !Number.isFinite(km)||km<0 ? 0 :
    Math.max(0,Math.min(STREET_MAX_PER_ROUND,Math.round(STREET_MAX_PER_ROUND*Math.exp(-km/1100))));
}
