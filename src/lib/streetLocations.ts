export interface StreetLocation {
  id: string;
  country: string;
  city: string;
  title: string;
  fact: string;
  lat: number;
  lng: number;
  heading: number;
}
// Curated public places with recognizable regional architecture, scenery and signs.
// Google Street View coverage can change: check each point at runtime before play.
// The exact scoring location is the actual panorama position returned by Google.
export const STREET_LOCATIONS: StreetLocation[] = [
  { id:'tr-istanbul',country:'Türkiye',city:'İstanbul',title:'Sultanahmet',fact:'Tarihî yarımadada iki kıtayı birleştiren şehrin izleri.',lat:41.0056,lng:28.9772,heading:40 },
  { id:'jp-kyoto',country:'Japonya',city:'Kyoto',title:'Gion sokakları',fact:'Geleneksel ahşap evleriyle tanınan eski mahalle.',lat:35.0039,lng:135.7784,heading:180 },
  { id:'jp-tokyo',country:'Japonya',city:'Tokyo',title:'Shibuya',fact:'Dünyanın en hareketli yaya geçitlerinden biri.',lat:35.6595,lng:139.7005,heading:120 },
  { id:'fr-paris',country:'Fransa',city:'Paris',title:'Montmartre',fact:'Yokuşlar, sanatçılar ve klasik Paris mimarisi.',lat:48.8867,lng:2.3430,heading:215 },
  { id:'it-rome',country:'İtalya',city:'Roma',title:'Kolezyum çevresi',fact:'Antik Roma mirasının modern şehrin içindeki izi.',lat:41.8903,lng:12.4925,heading:240 },
  { id:'es-barcelona',country:'İspanya',city:'Barselona',title:'Gotik Mahalle',fact:'Dar taş sokaklar ve Akdeniz tarihinden izler.',lat:41.3837,lng:2.1764,heading:90 },
  { id:'pt-lisbon',country:'Portekiz',city:'Lizbon',title:'Alfama',fact:'Rengârenk cepheleri ve dik yokuşlarıyla ünlü bölge.',lat:38.7128,lng:-9.1306,heading:145 },
  { id:'gb-london',country:'Birleşik Krallık',city:'Londra',title:'Piccadilly Circus',fact:'Tarihî binaları ve yoğun şehir hayatıyla tanınan meydan.',lat:51.5100,lng:-0.1347,heading:45 },
  { id:'us-newyork',country:'ABD',city:'New York',title:'Times Square',fact:'Işıklı reklamlar ve gökdelenlerle ünlü dünya metropolü.',lat:40.7580,lng:-73.9855,heading:20 },
  { id:'us-sanfrancisco',country:'ABD',city:'San Francisco',title:'Lombard Street',fact:'Eğimli sokakları ve kendine özgü mimarisiyle bilinir.',lat:37.8020,lng:-122.4187,heading:125 },
  { id:'br-rio',country:'Brezilya',city:'Rio de Janeiro',title:'Copacabana',fact:'Okyanus kıyısı ve mozaik yürüyüş yolu.',lat:-22.9712,lng:-43.1828,heading:115 },
  { id:'mx-mexico',country:'Meksika',city:'Mexico City',title:'Zócalo',fact:'Kolonyal cepheler ve büyük kent meydanı.',lat:19.4326,lng:-99.1332,heading:60 },
  { id:'ma-marrakech',country:'Fas',city:'Marakeş',title:'Medina',fact:'Kızıl şehir diye bilinen yerde hareketli çarşı atmosferi.',lat:31.6286,lng:-7.9894,heading:135 },
  { id:'za-capetown',country:'Güney Afrika',city:'Cape Town',title:'Bo-Kaap',fact:'Renkli evleri ve Masa Dağı manzarasıyla ünlü mahalle.',lat:-33.9212,lng:18.4155,heading:115 },
  { id:'in-jaipur',country:'Hindistan',city:'Jaipur',title:'Hawa Mahal',fact:'Rüzgâr Sarayı çevresindeki pembe şehir mimarisi.',lat:26.9239,lng:75.8267,heading:30 },
  { id:'th-bangkok',country:'Tayland',city:'Bangkok',title:'Khao San Road',fact:'Tropikal Asya sokak yaşamının kalabalık ritmi.',lat:13.7589,lng:100.4974,heading:150 },
  { id:'sg-singapore',country:'Singapur',city:'Singapur',title:'Marina Bay',fact:'Fütüristik kent silüeti, yeşil alanlar ve tropikal iklim.',lat:1.2834,lng:103.8607,heading:245 },
  { id:'kr-seoul',country:'Güney Kore',city:'Seul',title:'Bukchon Hanok',fact:'Modern metropolde korunan geleneksel Kore evleri.',lat:37.5826,lng:126.9849,heading:45 },
  { id:'au-sydney',country:'Avustralya',city:'Sidney',title:'Circular Quay',fact:'Liman, feribotlar ve kıtanın simge yapıları.',lat:-33.8617,lng:151.2116,heading:100 },
  { id:'nz-auckland',country:'Yeni Zelanda',city:'Auckland',title:'Viaduct Harbour',fact:'Marina, modern liman yapıları ve okyanus kültürü.',lat:-36.8431,lng:174.7589,heading:150 },
  { id:'pe-cusco',country:'Peru',city:'Cusco',title:'Plaza de Armas',fact:'And Dağları arasında İnka ve kolonyal miras.',lat:-13.5163,lng:-71.9786,heading:200 },
  { id:'ar-buenosaires',country:'Arjantin',city:'Buenos Aires',title:'La Boca',fact:'Renkli evleri ve tango kültürüyle bilinen semt.',lat:-34.6388,lng:-58.3635,heading:210 },
  { id:'nl-amsterdam',country:'Hollanda',city:'Amsterdam',title:'Jordaan kanalları',fact:'Kanal evleri ve bisikletli kent hayatı.',lat:52.3768,lng:4.8808,heading:145 },
  { id:'se-stockholm',country:'İsveç',city:'Stockholm',title:'Gamla Stan',fact:'Kuzey Avrupa’nın taş döşeli eski şehir sokakları.',lat:59.3252,lng:18.0707,heading:105 },
  { id:'no-bergen',country:'Norveç',city:'Bergen',title:'Bryggen',fact:'Renkli ahşap rıhtım evleriyle ünlü kuzey limanı.',lat:60.3975,lng:5.3247,heading:245 },
];
export interface Coordinates { lat:number; lng:number }
export const STREET_ROUNDS = 5;
export const STREET_MAX_PER_ROUND = 5000;
export function haversineKm(a:Coordinates,b:Coordinates):number{
  const rad=Math.PI/180;
  const dLat=(b.lat-a.lat)*rad,dLon=(b.lng-a.lng)*rad;
  const x=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
  return 6371.0088*2*Math.atan2(Math.sqrt(x),Math.sqrt(Math.max(0,1-x)));
}
export function locationPoints(km:number):number {
  if (!Number.isFinite(km) || km<0) return 0;
  return Math.max(0,Math.min(STREET_MAX_PER_ROUND,Math.round(STREET_MAX_PER_ROUND*Math.exp(-km/1100))));
}
export function pickLocations():StreetLocation[]{
  const pool=[...STREET_LOCATIONS];
  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  // Present different countries first; maintain plenty of fallback points if coverage fails.
  const used=new Set<string>();
  return [...pool.filter(x=>{if(used.has(x.country))return false;used.add(x.country);return true;}),...pool.filter(x=>!used.has(x.country))];
}
