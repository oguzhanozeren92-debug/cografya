// Pilot catalogue: five geolocated aerial 360° photos with reusable Commons licenses.
// These public metadata/coordinates intentionally support an unranked demo only.
// Before enabling competitive scoring, move answers and image paths behind signed server sessions.
// Commons is attribution only. Actual game imagery is always verified and served via R2.
export type DronePanorama = {
  id: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  artist: string;
  license: string;
  licenseUrl: string;
  source: string;
  fact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Optional editorial hints, supplied only for vetted live-gallery rounds. */
  regionCode?: string;
  hint?: Record<string, string>;
  photoFocus?: Record<string, string>;
  choices?: [string, string, string, string];
};
function commonsPhoto(filename: string) {
  return {
    source: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(filename.replace(/ /g, '_')),
  };
}
export const dronePanoramas: DronePanorama[] = [
  {
    id: 'air-001', country: 'Meksika', city: 'La Paz',
    difficulty: 'easy',
    lat: 24.142893, lng: -110.311479, artist: 'ProtoplasmaKid',
    license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    fact: 'La Paz, Baja California Sur bölgesinde, Kaliforniya Körfezi kıyısında yer alır.',
    ...commonsPhoto('Panorama esférico 360 de la ciudad de La Paz, Baja California, Sur.jpg'),
  },
  {
    id: 'air-002', country: 'Ermenistan', city: 'Erivan',
    difficulty: 'easy',
    lat: 40.176114, lng: 44.509025, artist: 'Aleksey Chalabyan (Xelgen)',
    license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    fact: 'Erivan şehir merkezi, 2023 sıcak hava balonu festivali sırasında havadan görüntülendi.',
    ...commonsPhoto('Aerial panorama of Yerevan Downtown during Air Balloon Festival 2023.jpg'),
  },
  {
    id: 'air-003', country: 'Avusturya', city: 'Sattledt',
    difficulty: 'hard',
    lat: 48.086220, lng: 14.048450, artist: 'PepponeDrohne',
    license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    fact: 'Bu panoramada Yukarı Avusturya bölgesindeki Sattledt yerleşimi görülür.',
    ...commonsPhoto('Sattledt - Fronius site.jpg'),
  },
  {
    id: 'air-004', country: 'Avustralya', city: 'Wagga Wagga',
    difficulty: 'medium',
    lat: -35.095478, lng: 147.393821, artist: 'Robert Myers (Bidgee)',
    license: 'CC BY-SA 3.0 AU', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/au/',
    fact: 'Bomen Lagünü, Yeni Güney Galler eyaletindeki Wagga Wagga yakınındadır. Panoramanın gökyüzü bölümü dijital düzenlenmiştir.',
    ...commonsPhoto('360° aerial panorama from the Bomen Lagoon.jpg'),
  },
  {
    id: 'air-005', country: 'Birleşik Krallık', city: 'Bexhill-on-Sea',
    difficulty: 'hard',
    lat: 50.849229, lng: 0.443017, artist: 'Alexis Markwick',
    license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    fact: 'Broad Oak Park, İngiltere’nin güneyindeki Bexhill çevresinde çayırlar ve ormanlık alanlar içerir.',
    ...commonsPhoto('Broad Oak Park, Bexhill (360 aerial panorama).jpg'),
  },
];
