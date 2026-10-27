// App Store image-review inventory; NEVER grants editorial approval automatically.
// Run: node scripts/panoramas/export-appstore-review.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalogPath = path.join(root, 'public/drone-gallery/catalog-v2.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const albums = Array.isArray(catalog.collections) ? catalog.collections : [];
const target = path.join(root, 'appstore-review');
fs.mkdirSync(target, {recursive:true});
const quote = v => '"' + String(v ?? '').replace(/"/g,'""') + '"';
const fields = ['album','city','country','approved','photo','local_file','local_exists','author','license','license_url','commons_source','source_licence_checked','source_place_checked','local_visual_checked','album_location_checked','album_quality_checked','status','review_note'];
const rows = [], pending = [], errors = [];
let totalPhotos = 0, approvedPhotos = 0, completelyReviewedPhotos = 0;
for (const album of albums) {
  const photos = Array.isArray(album.images) ? album.images : [];
  const albumReviewed = album.reviewedLocation === true && album.reviewedQuality === true;
  let reviewedThisAlbum = 0;
  for (let i=0; i<photos.length; i++) {
    const pic=photos[i], ext=pic.format||'', relative = `public/drone-gallery/photos/${album.id}/${i+1}.${ext}`;
    const exists = fs.existsSync(path.join(root, relative));
    const manual = pic.reviewedVisual === true && pic.reviewedLicense === true && pic.reviewedPlace === true;
    const reviewed = albumReviewed && manual && exists;
    if (reviewed) reviewedThisAlbum++;
    totalPhotos++;
    if(album.approved === true) approvedPhotos++;
    if(album.approved === true && reviewed) completelyReviewedPhotos++;
    if(album.approved === true && !reviewed) pending.push({album:album.id,photo:i+1,reasons:[
      !exists?'local_file_missing':null,
      !album.reviewedLocation?'album_location_unverified':null,
      !album.reviewedQuality?'album_quality_unverified':null,
      !pic.reviewedVisual?'visual_unverified':null,
      !pic.reviewedLicense?'license_unverified':null,
      !pic.reviewedPlace?'image_place_unverified':null,
    ].filter(Boolean)});
    rows.push({
      album: album.id, city:album.city,country:album.country,approved:album.approved===true,
      photo:i+1,local_file:relative,local_exists:exists,
      author:pic.artist,license:pic.license,license_url:pic.licenseUrl,commons_source:pic.source,
      source_licence_checked:pic.reviewedLicense===true,source_place_checked:pic.reviewedPlace===true,
      local_visual_checked:pic.reviewedVisual===true,album_location_checked:album.reviewedLocation===true,
      album_quality_checked:album.reviewedQuality===true,
      status:!exists?'MISSING_FILE':reviewed?'REVIEWED':'NEEDS_MANUAL_REVIEW',
      review_note:'',
    });
  }
  if (album.approved === true && photos.length < 3) errors.push(album.id+': fewer than three photos');
}
fs.writeFileSync(path.join(target,'photo-audit.csv'),[fields.map(quote).join(','), ...rows.map(row=>fields.map(k=>quote(row[k])).join(','))].join('\n')+'\n');
const result = {
  generatedAt:new Date().toISOString(), albums:albums.length,totalPhotos,approvedPhotos,
  completelyReviewedPhotos, pendingApprovedPhotos:pending.length,
  approvedReviewReady:approvedPhotos >= 50 && completelyReviewedPhotos>=50 &&
    new Set(albums.filter(a=>a.approved===true&&a.reviewedLocation===true&&a.reviewedQuality===true).map(a=>a.country)).size>=10,
  note:'Source URL availability, author/license consistency, photo contents and actual place must be verified against Commons and by looking at the local image. This report never approves an image.',
  pending, errors,
};
fs.writeFileSync(path.join(target,'release-report.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({albums:result.albums,totalPhotos,approvedPhotos,
  completelyReviewedPhotos,pendingApprovedPhotos:pending.length,
  approvedReviewReady:result.approvedReviewReady,
  report:'appstore-review/photo-audit.csv'},null,2));
