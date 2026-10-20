import { createRequire } from 'node:module';
import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';

const require=createRequire(import.meta.url);
const atlas=require('world-atlas/countries-110m.json');
const countryFeatures=feature(atlas,atlas.objects.countries).features;
export const COUNTRY_NUMERIC_IDS=Object.freeze({
  'Kamboçya':116,'Gürcistan':268,'Fransa':250,'Almanya':276,
  'Brezilya':76,'Hindistan':356,'İspanya':724,'Avusturya':40,
  'Meksika':484,'Japonya':392,'Arjantin':32,'Slovenya':705,
  'Ermenistan':51,'Kanada':124,'Letonya':428,'Estonya':233,
  'Avustralya':36,'Birleşik Krallık':826,
});
const polygons=new Map(countryFeatures.map(p=>[Number(p.id),p]));
export function isPointInCountry(point,country){
  if(!point||!Number.isFinite(point.lat)||!Number.isFinite(point.lng)
    ||Math.abs(point.lat)>90||Math.abs(point.lng)>180)return false;
  const id=COUNTRY_NUMERIC_IDS[country];
  const polygon=polygons.get(id);
  if(!polygon)return false;
  return geoContains(polygon,[point.lng,point.lat]);
}
