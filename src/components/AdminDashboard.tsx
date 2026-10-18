import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AlertTriangle, ArrowLeft, BarChart3, CheckCircle2, ClipboardList,
  Eye, LockKeyhole, LogOut, RefreshCcw, ShieldCheck, Signal,
} from 'lucide-react';
import { backend } from '@/lib/leaderboard';
import { COUNTRY_DATA } from '@/data/countries';

interface Overview {
  events:number;players:number;answers:number;correct:number;incorrect:number;
  avg_answer_ms:number|null;panorama_errors:number;panorama_ready:number;mode_exits:number;
}
interface QuestionStats {
  mode:string;question_id:string;shown:number;answers:number;correct:number;wrong:number;avg_ms:number|null;
}
interface FlowStats {
  mode:string;starts:number;shown:number;answers:number;exits:number;hints:number;
  panorama_ready:number;panorama_errors:number;skips:number;load_ms:number|null;
}
interface Issue { mode:string;question_id:string;detail:string;total:number;last_seen:string; }
interface Snapshot {
  days:number;last_event_at:string|null;overview:Overview;
  questions:QuestionStats[];flow:FlowStats[];issues:Issue[];
}
interface Review {question_key:string;status:string;updated_at:string}
type Tab = 'overview'|'questions'|'system';
const number=(n:number|null|undefined)=>Number(n??0).toLocaleString('tr-TR');
const date=(iso:string|null)=>iso
  ? new Date(iso).toLocaleString('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})
  : 'Henüz veri yok';
const labelForQuestion=(q:QuestionStats)=>{
  const countryId=q.question_id.split(':')[0];
  const country=COUNTRY_DATA[countryId];
  const type=q.question_id.split(':')[1]||'konum';
  return country ? country.nameTr+' · '+(
    type==='capital'?'Başkent':type==='flag'?'Bayrak':type==='clue'?'İpucu':'Harita')
    : q.mode==='street'?'360° · '+q.question_id.slice(0,16):q.question_id;
};
const percentage=(a:number,b:number)=>b>0 ? Math.round(a/b*100)+'%' : '—';
function Metric({title,value,note}:{title:string;value:string;note:string}) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.065] p-4">
    <p className="text-[11px] font-semibold text-slate-300">{title}</p>
    <p className="mt-1 text-2xl font-black tabular-nums text-white">{value}</p>
    <p className="mt-1 text-[11px] text-slate-400">{note}</p>
  </div>;
}

export function AdminDashboard() {
  const [status,setStatus]=useState<'loading'|'login'|'ready'|'denied'>('loading');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [days,setDays]=useState<1|7|30>(7);
  const [tab,setTab]=useState<Tab>('overview');
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
  const [reviews,setReviews]=useState<Record<string,string>>({});
  const [updating,setUpdating]=useState<string|null>(null);
  const [dataError,setDataError]=useState('');

  const authorize=useCallback(async():Promise<boolean>=>{
    if(!backend){setMessage('Atlas Arena Supabase bağlantısı yapılandırılmamış.');setStatus('login');return false;}
    const {data:{user},error}=await backend.auth.getUser();
    if(error||!user){setStatus('login');return false;}
    const {data, error:roleError}=await backend.from('geo_admin_members')
      .select('user_id').eq('user_id',user.id).maybeSingle();
    if(roleError){setStatus('denied');setMessage('Admin yetki tablosu henüz kurulmamış veya erişim kapalı.');return false;}
    if(!data){setStatus(user.is_anonymous?'login':'denied');setMessage(user.is_anonymous?'':'Bu hesapta yönetici yetkisi yok.');return false;}
    setStatus('ready');setMessage('');return true;
  },[]);

  const load=useCallback(async(period:1|7|30)=>{
    if(!backend)return;
    setDataError('');
    const [report,reviewResult]=await Promise.all([
      backend.rpc('geo_admin_snapshot',{p_days:period}),
      backend.from('geo_admin_question_reviews').select('question_key,status,updated_at').limit(400),
    ]);
    if(report.error){setDataError('İstatistikler alınamadı: '+report.error.message);return;}
    if(reviewResult.error){setDataError('Soru inceleme listesi alınamadı: '+reviewResult.error.message);return;}
    setSnapshot(report.data as Snapshot);
    setReviews(Object.fromEntries((reviewResult.data as Review[]??[]).map(x=>[x.question_key,x.status])));
  },[]);

  useEffect(()=>{let active=true;void authorize().then(ok=>{if(!active)return;if(ok)void load(days);});return()=>{active=false;};},[authorize,load,days]);

  const login=async(event:FormEvent)=>{
    event.preventDefault();
    if(!backend)return;
    setBusy(true);setMessage('');
    const {error}=await backend.auth.signInWithPassword({email:email.trim(),password});
    setBusy(false);
    if(error){setMessage('Giriş yapılamadı: '+error.message);return;}
    if(await authorize())void load(days);
  };
  const logout=async()=>{
    await backend?.auth.signOut();
    setStatus('login');setSnapshot(null);setPassword('');setMessage('Çıkış yapıldı.');
  };
  const setReview=async(q:QuestionStats,value:string)=>{
    if(!backend)return;
    const key=q.mode+'|'+q.question_id;
    const {data:{user}}=await backend.auth.getUser();
    if(!user){setDataError('Oturumun sona erdi.');return;}
    setUpdating(key);
    const {error}=await backend.from('geo_admin_question_reviews').upsert({
      question_key:key,status:value,updated_by:user.id,updated_at:new Date().toISOString()
    },{onConflict:'question_key'});
    setUpdating(null);
    if(error){setDataError('İnceleme durumu kaydedilemedi: '+error.message);return;}
    setReviews(prev=>({...prev,[key]:value}));
  };
  const back=()=>{window.location.hash='';window.location.reload();};

  if(status!=='ready')return (
    <div className="min-h-[100dvh] bg-[#09162b] px-4 py-8 text-white">
      <div className="mx-auto max-w-md">
        <button onClick={back} className="mb-7 inline-flex items-center gap-2 text-sm text-cyan-200">
          <ArrowLeft className="h-4 w-4"/> Oyuna dön
        </button>
        <div className="rounded-[27px] border border-cyan-200/20 bg-[#112640] p-6 shadow-2xl">
          <ShieldCheck className="h-10 w-10 text-cyan-300"/>
          <h1 className="mt-3 text-2xl font-black">Atlas Arena Admin</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            İstatistikler ve sistem sağlığı yalnız yetkili yöneticilere açıktır.
          </p>
          {status==='loading'?<p className="mt-6 text-cyan-200">Yetki doğrulanıyor...</p>:(
            <form onSubmit={login} className="mt-6 space-y-4">
              <label className="block text-xs font-bold text-slate-300">Yönetici e-postası
                <input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/40 p-3 text-sm text-white outline-none focus:border-cyan-300"/>
              </label>
              <label className="block text-xs font-bold text-slate-300">Şifre
                <input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/40 p-3 text-sm text-white outline-none focus:border-cyan-300"/>
              </label>
              {message&&<p className="text-xs leading-5 text-amber-200" role="alert">{message}</p>}
              <button type="submit" disabled={busy||!backend}
                className="w-full rounded-xl bg-cyan-300 px-4 py-3 font-black text-[#112640] disabled:opacity-50">
                <LockKeyhole className="mr-2 inline h-4 w-4"/>{busy?'Kontrol ediliyor...':'Güvenli giriş'}
              </button>
              <p className="text-[11px] leading-5 text-slate-400">
                Yönetici hesabı ve yetkisi Supabase üzerinde ayrıca oluşturulmalıdır. Oyuncu takma adı yönetici girişi sağlamaz.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  const overview=snapshot?.overview;
  const questions=[...(snapshot?.questions??[])].sort((a,b)=>{
    const ra=a.answers?a.wrong/a.answers:-1,rb=b.answers?b.wrong/b.answers:-1;
    return rb-ra||b.answers-a.answers;
  });
  return (
    <div className="min-h-[100dvh] bg-[#09162b] text-white">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-[max(20px,env(safe-area-inset-top))]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-9 w-9 text-cyan-300"/>
            <div><h1 className="text-xl font-black">Atlas Arena · Yönetim</h1>
              <p className="text-[11px] text-slate-400">Gerçek oyuncu sinyalleri · Kimlikler gizli</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>{void load(days);}} className="rounded-xl border border-white/15 p-2.5" aria-label="İstatistikleri yenile"><RefreshCcw className="h-4 w-4"/></button>
            <button onClick={()=>{void logout();}} className="rounded-xl border border-white/15 p-2.5" aria-label="Çıkış yap"><LogOut className="h-4 w-4"/></button>
            <button onClick={back} className="rounded-xl border border-white/15 p-2.5" aria-label="Oyuna dön"><ArrowLeft className="h-4 w-4"/></button>
          </div>
        </header>
        <div className="mt-5 flex items-center justify-between gap-2">
          <div className="flex gap-2">{([1,7,30] as const).map(d=><button key={d} onClick={()=>setDays(d)}
            className={'rounded-xl px-3 py-2 text-xs font-black '+(days===d?'bg-cyan-300 text-[#10243b]':'bg-white/10 text-slate-200')}>
            {d===1?'24 saat':d+' gün'}</button>)}</div>
          <p className="text-[11px] text-slate-400">Son olay: {date(snapshot?.last_event_at??null)}</p>
        </div>
        {dataError&&<div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-900/20 p-3 text-sm text-rose-200" role="alert">{dataError}</div>}
        <nav className="mt-6 grid grid-cols-3 gap-2" aria-label="Admin bölümleri">
          {([['overview','Genel','activity'],['questions','Sorular','list'],['system','Sistem','signal']] as const).map(([id,label])=>
            <button key={id} onClick={()=>setTab(id)} className={'rounded-xl border px-2 py-3 text-sm font-black '+
              (tab===id?'border-cyan-300/60 bg-cyan-300/15 text-cyan-100':'border-white/10 bg-white/5 text-slate-300')}>
              {label}</button>)}
        </nav>
        {!snapshot?<div className="mt-8 rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-300">
          Henüz rapor alınamadı. Veritabanı migration'ı ve admin yetkisini kontrol et.</div>:(
          <>
            {tab==='overview'&&<>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Metric title="Oyuncu (tekil)" value={number(overview?.players)} note="Bu dönem etkin oturum"/>
                <Metric title="Yanıtlanan soru" value={number(overview?.answers)} note="Toplam yanıt"/>
                <Metric title="Doğru cevap oranı" value={percentage(overview?.correct??0,overview?.answers??0)} note={number(overview?.incorrect)+' yanlış'}/>
                <Metric title="Ortalama cevap süresi" value={overview?.avg_answer_ms!=null?((overview.avg_answer_ms/1000).toFixed(1)+' sn'):'—'} note="Yanıtlanan sorular"/>
              </div>
              <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.055] p-4">
                <h2 className="mb-3 flex items-center gap-2 font-black"><BarChart3 className="h-4 w-4 text-cyan-300"/> Oyun modlarına göre akış</h2>
                <div className="space-y-2">{snapshot.flow.length===0?<p className="text-sm text-slate-400">Henüz gerçek oyuncu verisi yok.</p>:snapshot.flow.map(f=>
                  <div key={f.mode} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    <div className="min-w-0"><strong className="capitalize">{f.mode}</strong><p className="text-[11px] text-slate-400">{number(f.starts)} başlangıç · {number(f.exits)} çıkış</p></div>
                    <span className="text-xs text-slate-300">{number(f.shown)} gösterim</span>
                    <strong className="text-cyan-200">{number(f.answers)} yanıt</strong>
                  </div>)}</div>
                <p className="mt-3 text-[11px] text-slate-400">Gösterim ve yanıt farkı olası terk göstergesidir; internet kesintisi nedeniyle kesin terk sayısı değildir.</p>
              </section>
              <section className="mt-5 rounded-2xl border border-white/10 bg-white/[.055] p-4">
                <h2 className="mb-3 font-black">En çok zorlanılan sorular</h2>
                {questions.filter(q=>q.answers>0).slice(0,5).map(q=><div key={q.mode+q.question_id} className="flex justify-between gap-2 border-b border-white/10 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{labelForQuestion(q)}</span>
                  <strong className="text-amber-200">{percentage(q.wrong,q.answers)} yanlış <span className="text-slate-500">({q.answers})</span></strong>
                </div>)}
                {questions.every(q=>q.answers===0)&&<p className="text-sm text-slate-400">Henüz soru istatistiği yok.</p>}
              </section>
            </>}
            {tab==='questions'&&<section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[.055]">
              <div className="p-4"><h2 className="flex items-center gap-2 font-black"><ClipboardList className="h-5 w-5 text-cyan-200"/> Soru kalite kontrolü</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">Hata oranı, örneklem ve ortalama cevap süresi. İncelenecek soruları işaretle; soru bankası kendiliğinden değiştirilmez.</p></div>
              <div className="max-h-[70dvh] overflow-y-auto px-3 pb-3">
                {questions.length===0?<p className="p-4 text-sm text-slate-400">İstatistik bekleniyor.</p>:questions.map(q=>{
                  const key=q.mode+'|'+q.question_id;
                  return <div key={key} className="mb-2 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><strong className="block text-sm">{labelForQuestion(q)}</strong>
                        <span className="text-[11px] text-slate-400">{q.mode} · {number(q.shown)} gösterim · {number(q.answers)} cevap</span></div>
                      <div className="shrink-0 text-right"><strong className="text-amber-200">{percentage(q.wrong,q.answers)}</strong><p className="text-[11px] text-slate-400">{q.answers<10?'Az veri':number(q.wrong)+' yanlış'}</p></div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-300">{q.avg_ms==null?'Henüz süre yok':'Ort. '+(q.avg_ms/1000).toFixed(1)+' sn'}</span>
                      <select aria-label={labelForQuestion(q)+' inceleme durumu'} value={reviews[key]??'review'}
                        disabled={updating===key} onChange={e=>{void setReview(q,e.target.value);}}
                        className="rounded-lg border border-white/15 bg-[#1b324c] px-2 py-2 text-xs text-white">
                        <option value="review">İncelenecek</option><option value="investigating">İnceleniyor</option>
                        <option value="resolved">Düzeltildi</option><option value="ignored">Sorun yok</option>
                      </select>
                    </div>
                  </div>;
                })}
              </div>
            </section>}
            {tab==='system'&&<>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric title="360° açılma başarısı" value={percentage(overview?.panorama_ready??0,(overview?.panorama_ready??0)+(overview?.panorama_errors??0))} note="Açılan / açılan+hata"/>
                <Metric title="Panorama hataları" value={number(overview?.panorama_errors)} note="Toplam hata sinyali"/>
              </div>
              <section className="mt-5 rounded-2xl border border-white/10 bg-white/[.055] p-4">
                <h2 className="mb-2 flex items-center gap-2 font-black"><Signal className="h-5 w-5 text-emerald-300"/> Sistem durumu</h2>
                <p className="flex items-center gap-2 text-sm text-emerald-200"><CheckCircle2 className="h-4 w-4"/> Yetki ve istatistik veritabanına erişim başarılı</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Bu ekran canlı oynatma testi, Vercel deploy ve Cloudflare altyapı testi yerine geçmez.
                  Görüntü yüklenme süresi ve hata sinyalleri oyunculardan gelen kayıtları temel alır.
                </p>
              </section>
              <section className="mt-5 rounded-2xl border border-white/10 bg-white/[.055] p-4">
                <h2 className="mb-3 flex items-center gap-2 font-black"><AlertTriangle className="h-5 w-5 text-amber-200"/> Son hata türleri</h2>
                {snapshot.issues.length===0?<p className="text-sm text-slate-400">Bu dönemde kayıtlı panorama hatası yok.</p>:snapshot.issues.map(e=>
                  <div key={e.mode+e.detail} className="flex items-center justify-between gap-3 border-b border-white/10 py-3 text-sm">
                    <div><strong className="text-amber-100">{e.mode} · {e.question_id} · {e.detail}</strong><p className="text-[11px] text-slate-400">{date(e.last_seen)}</p></div>
                    <strong>{number(e.total)}</strong>
                  </div>)}
                <div className="mt-4 space-y-2">{snapshot.flow.filter(f=>f.panorama_ready+f.panorama_errors>0).map(f=>
                  <div key={f.mode} className="rounded-xl bg-white/5 p-3 text-xs">
                    <span className="font-black">{f.mode}</span> · Ortalama açılış: {f.load_ms==null?'—':(f.load_ms/1000).toFixed(1)+' sn'}
                    {' · '}{number(f.skips)} atlanan tur
                  </div>)}</div>
              </section>
            </>}
            <p className="mt-6 flex items-center justify-center gap-1 text-[11px] text-slate-500">
              <Eye className="h-3.5 w-3.5"/> Yalnız toplulaştırılmış olaylar gösterilir; bireysel oyuncu geçmişi yoktur.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
