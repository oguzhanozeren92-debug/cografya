import {backend,getPlayerId} from '@/lib/leaderboard';
export type ReportContext='weekly'|'global'|'street'|'drone'|'versus';
export type ReportReason='offensive_name'|'harassment'|'other';
const KEY='globriva-blocked-players-v1';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function nicknameError(name:string,language='en'):string|null {
 const n=name.trim();
 const bad=n.length<2||n.length>20||/[\x00-\x1f\x7f]/.test(n)||/https?:\/\/|www\.|@/i.test(n)
 ||/(^|[^\p{L}\p{N}])(fuck|shit|bitch|cunt|nigger|nigga|nazi|porn|porno|sikik|orospu|amk|pic)([^\p{L}\p{N}]|$)/iu.test(n);
 return bad?(language==='tr'?'2–20 karakterli uygun bir takma ad seç. Hakaret, bağlantı veya iletişim adresi kullanma.':'Choose an appropriate 2–20 character nickname. Avoid offensive terms, links and contact details.'):null;
}
export function readBlockedPlayers():Set<string>{
 try{const data:unknown=JSON.parse(localStorage.getItem(KEY)||'[]');return new Set(Array.isArray(data)?data.filter((x):x is string=>typeof x==='string'&&uuid.test(x)):[]);}
 catch{return new Set();}
}
function save(ids:Set<string>){try{localStorage.setItem(KEY,JSON.stringify([...ids]));}catch{/*restricted storage*/}}
export async function syncBlockedPlayers(){
 const ids=readBlockedPlayers();
 if(!backend)return ids;
 const {data:session}=await backend.auth.getSession();
 if(!session.session?.user.id)return ids;
 const {data,error}=await backend.from('geo_player_blocks').select('blocked_id');
 if(!error){for(const row of data??[])if(typeof row.blocked_id==='string'&&uuid.test(row.blocked_id))ids.add(row.blocked_id);save(ids);}
 return ids;
}
export async function blockPlayer(id:string){
 if(!uuid.test(id))throw new Error('Invalid player');
 const ids=readBlockedPlayers();ids.add(id);save(ids);
 if(!backend)return;
 try{const me=await getPlayerId();if(me===id)return;
 const {error}=await backend.from('geo_player_blocks').upsert({blocker_id:me,blocked_id:id});
 if(error)console.warn('Block sync:',error.message);}catch{/*local block stays in place*/}
}
export async function reportPlayer(id:string,name:string,context:ReportContext,reason:ReportReason){
 if(!backend)throw new Error('Reporting unavailable');
 if(!uuid.test(id))throw new Error('Invalid player');
 const me=await getPlayerId();
 if(me===id)throw new Error('Cannot report self');
 const {error}=await backend.from('geo_player_reports').insert({reporter_id:me,target_id:id,target_name:name.slice(0,40),context,reason});
 if(error&&error.code!=='23505')throw error;
}
export async function deleteMyPlayerData(){
 if(backend){
   const {data,error}=await backend.auth.getSession();
   if(error)throw error;
   if(data.session?.user.id){
     const result=await backend.rpc('geo_delete_my_account');
     if(result.error||result.data!==true)throw result.error??new Error('Deletion not confirmed');
     try{await backend.auth.signOut({scope:'local'});}catch{/* already deleted */}
   }
 }
 try{
   const prefixes=['geo-','globriva-','atlas-arena-','street-','drone-','vs-','discovery-'];
   for(let i=localStorage.length-1;i>=0;i--){
     const key=localStorage.key(i);
     if(key&&prefixes.some(p=>key.startsWith(p)))localStorage.removeItem(key);
   }
 }catch{/* restricted storage */}
}
