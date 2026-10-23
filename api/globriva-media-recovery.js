// Temporary read-only migration bridge for PUBLIC Globriva gallery images.
// Only fixed, already publicly exposed Cloudflare R2 objects can be served.
// Remove this endpoint once recovery is complete.
const ALBUM = /^album-0(?:0[1-9]|1[0-9]|20)$/;
const R2 = 'https://pub-b3a9d7c95b2449c1a1532fb5b389ef88.r2.dev';
const MAX_SIZE = 3 * 1024 * 1024;
const TITLES = {"album-001":["File:Tower Bridge from London Tower.jpg","File:London Tower Bridge 2026.jpg","File:Westminster Palace London.jpg","File:BigBen London.jpg"],"album-002":["File:Hagia Sophia Istanbul 4.jpg","File:Galata Tower, Istanbul 2022.jpg","File:Bosphorus, Istanbul (P1100297).jpg","File:Bosphorus - البوسفور - Bosphore - İstanbul Boğazı.jpg"],"album-003":["File:Colosseum (Rome).jpg","File:Trevi fountain Rome.jpg","File:Pantheon. Rome.jpg","File:Spanish steps, Rome.jpg"],"album-004":["File:Eiffel Tower, Paris.jpg","File:Arc de Triomphe, Paris.jpg","File:Louvre Paris.jpg"],"album-005":["File:Brandenburg-Gate-Berlin.jpg","File:East side gallery Berlin.jpg","File:Berlin, fernsehturm..jpg"],"album-006":["File:SydneyOperaHouse.jpg","File:Sydney - Harbour Bridge.jpg","File:Sydney city skyline.jpg"],"album-007":["File:Tokyo SkyTree.jpg","File:Tokyo station.jpg","File:City you see from Tokyo Skytree.jpg"],"album-008":["File:Sagrada Familia Barcelona.jpg","File:Park Güell Barcelona.jpg","File:Casa Batllo Barcelona.jpg"],"album-009":["File:Statue of Liberty New York.jpg","File:Brooklyn Bridge-New York.jpg","File:Times Square, NYC.jpg"],"album-010":["File:Christ-Redeemer-Rio-de-Janeiro.jpg","File:Copacabana beach.jpg","File:Sugarloaf Mountain - Rio de Janeiro.jpg"],"album-011":["File:Athens Acropolis with the Parthenon, viewed from Philopappou Hill.jpg","File:The Acropolis of Athens as seen from Dionysiou Areopagitou Pedestrian Street on December 21, 2020.jpg","File:View of Acropolis of Athens.jpg"],"album-012":["File:Amsterdam Canals (Ank Kumar) 04.jpg","File:Amsterdam - Dam Square - View on Damrak, Beurs van Berlage & Bijenkorf.jpg","File:Amsterdam Centraal -.jpg"],"album-013":["File:Toronto-skyline.jpg","File:Toronto City Hall, Toronto ON.jpg","File:Toronto City Hall and Nathan Phillips Square (55401075630).jpg"],"album-014":["File:Pyramids of Giza.jpg","File:Sphinx giza.jpg","File:The Pyramids of GIZA.jpg"],"album-015":["File:Taj Mahal view from Mehtab Bagh.jpg","File:Agra Fort in Agra, Uttar Pradesh.jpg","File:Mehtab Bagh on the river bank, facing Taj.jpg"],"album-016":["File:Angel of Independence Mexico City.jpg","File:Palacio de Bellas Artes, Mexico City, MX.jpg","File:ZOCALO MEXICO CITY.jpg"],"album-017":["File:PRAGUE.jpg","File:OldTownSquarePraha.JPG","File:Prague - Prague Castle.jpg"],"album-018":["File:Grand Canal from Rialto Bridge.jpg","File:Facade of St. Mark's Basilica-Venice.jpg","File:Gondola venice.JPG"],"album-019":["File:Schönbrunn Palace. in Vienna.jpg","File:Wien-Stephansdom.jpg","File:Hofburg Vienne.jpg"],"album-020":["File:Belém Tower in Lisbon.jpg","File:Praça do Comércio Lisboa.jpg","File:Santa Justa Lift, Lisbon.jpg"]};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const album = String(req.query?.album||'');
  const number = Number(req.query?.number);
  if(!ALBUM.test(album)||![1,2,3,4].includes(number)){
    return res.status(400).json({error:'Invalid album or photo number'});
  }
  const source = String(req.query?.source||'r2');
  if(source!=='r2' && source!=='commons')return res.status(400).json({error:'Unsupported source'});
  const key = 'drone-gallery/photos/' + album + '/' + number + (source==='r2'?'.webp':'.jpg');
  try {
    let sourceUrl=R2 + '/' + key;
    if(source==='commons'){
      const title=TITLES[album]?.[number-1];
      if(!title)return res.status(404).json({error:'No listed source for that album and number',key});
      const wiki=new URL('https://commons.wikimedia.org/w/api.php');
      wiki.searchParams.set('action','query');
      wiki.searchParams.set('titles',title);
      wiki.searchParams.set('prop','imageinfo');
      wiki.searchParams.set('iiprop','url|mime|extmetadata');
      wiki.searchParams.set('iiurlwidth','1500');
      wiki.searchParams.set('format','json');
      const w=await fetch(wiki,{headers:{'User-Agent':'GlobrivaMediaResearch/1.0 (open-license photo sourcing)'},signal:AbortSignal.timeout(6000)});
      if(!w.ok)return res.status(404).json({error:'Commons metadata unavailable',status:w.status,key});
      const obj=await w.json();
      const page=Object.values(obj.query?.pages||{})[0];
      const info=page?.imageinfo?.[0];
      if(!info || info.mime!=='image/jpeg')
        return res.status(404).json({error:'Commons JPEG source missing',key,missing:page?.missing??false});
      sourceUrl=info.thumburl || info.url;
      const mediaUrl = new URL(sourceUrl);
      if(mediaUrl.protocol!=='https:' || !['upload.wikimedia.org','thumb.wikimedia.org'].includes(mediaUrl.hostname) || !mediaUrl.pathname.startsWith('/wikipedia/commons/'))
        return res.status(422).json({error:'Unexpected Wikimedia host',key});
    }
    const response = await fetch(sourceUrl,{signal:AbortSignal.timeout(10000),cache:'no-store'});
    if(!response.ok)return res.status(404).json({error:'Public R2 source unavailable',sourceStatus:response.status,key});
    const bytes = Buffer.from(await response.arrayBuffer());
    const validImage=source==='r2'
      ? bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'
      : bytes.length>3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
    if(bytes.length<2048||bytes.length>MAX_SIZE||!validImage)
       return res.status(422).json({error:'Invalid image or file exceeds size limit',key,bytes:bytes.length});
    return res.status(200).json({key,length:bytes.length,base64:bytes.toString('base64')});
  }catch(error){
    return res.status(502).json({error:'Could not reach R2 public object',message:error?.message||'Upstream unavailable',key});
  }
}
