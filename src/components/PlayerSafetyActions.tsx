import {useState} from 'react';
import {createPortal} from 'react-dom';
import {Ban,Flag,MoreHorizontal,X} from 'lucide-react';
import {useLanguage} from '@/lib/i18n';
import {blockPlayer,reportPlayer,type ReportContext,type ReportReason} from '@/lib/playerSafety';

const messages:Record<string,string[]>={
en:['Player safety','Report','Block and hide','Close','Report reason','Offensive nickname','Harassment','Other','Send report','Report sent for review','Report failed; contact support'],
tr:['Oyuncu güvenliği','Bildir','Engelle ve gizle','Kapat','Şikâyet nedeni','Uygunsuz takma ad','Rahatsız etme','Diğer','Şikâyet gönder','Şikâyet incelenmek üzere kaydedildi','Şikâyet gönderilemedi; destek ile iletişime geç'],
es:['Seguridad','Denunciar','Bloquear y ocultar','Cerrar','Motivo','Apodo ofensivo','Acoso','Otro','Enviar','Denuncia enviada','No se pudo enviar'],
de:['Spielerschutz','Melden','Sperren und ausblenden','Schließen','Grund','Beleidigender Name','Belästigung','Andere','Senden','Meldung gesendet','Meldung fehlgeschlagen'],
fr:['Sécurité','Signaler','Bloquer et masquer','Fermer','Motif','Pseudo offensant','Harcèlement','Autre','Envoyer','Signalement envoyé','Échec de l’envoi'],
pt:['Segurança','Denunciar','Bloquear e ocultar','Fechar','Motivo','Nome ofensivo','Assédio','Outro','Enviar','Denúncia enviada','Falha no envio'],
ru:['Безопасность','Пожаловаться','Заблокировать','Закрыть','Причина','Оскорбительное имя','Преследование','Другое','Отправить','Жалоба отправлена','Не удалось отправить'],
zh:['玩家安全','举报','屏蔽玩家','关闭','原因','不当昵称','骚扰','其他','提交','举报已提交','举报失败'],
ja:['プレイヤーの安全','通報','ブロック','閉じる','理由','不適切な名前','嫌がらせ','その他','送信','報告を送信しました','送信できませんでした']
};
export function PlayerSafetyActions({playerId,playerName,context,onBlocked}:{
 playerId:string;playerName:string;context:ReportContext;onBlocked?:()=>void;
}){
 const {language}=useLanguage(); const m=messages[language]??messages.en;
 const [open,setOpen]=useState(false);
 const [reason,setReason]=useState<ReportReason>('offensive_name');
 const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState('');
 const [error,setError]=useState('');
 async function report(){setBusy(true);setError('');
  try{await reportPlayer(playerId,playerName,context,reason);setStatus(m[9]);}
  catch{setError(m[10]);}finally{setBusy(false);}
 }
 async function block(){setBusy(true);setError('');
  try{await blockPlayer(playerId);onBlocked?.();setOpen(false);}
  catch{setError(m[10]);}finally{setBusy(false);}
 }
 return <>
  <button type="button" title={m[0]} aria-label={m[0]+': '+playerName} onClick={()=>{setOpen(true);setStatus('');setError('');}}
   className="inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 hover:bg-white/15">
   <MoreHorizontal size={18}/>
  </button>
  {open&&createPortal(<div role="presentation" onClick={()=>setOpen(false)}
    className="fixed inset-0 z-[240] flex items-center justify-center bg-[#030917]/90 p-4 text-white">
   <section role="dialog" aria-modal="true" aria-label={m[0]} onClick={e=>e.stopPropagation()}
    className="w-full max-w-sm rounded-3xl border border-cyan-200/25 bg-[#102840] p-5 shadow-2xl">
    <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-black">{m[0]}</h2>
     <button type="button" onClick={()=>setOpen(false)} aria-label={m[3]}><X size={22}/></button></div>
    <p className="mt-2 break-all text-sm text-slate-200">{playerName}</p>
    <label className="mt-5 block text-xs font-bold text-slate-200" htmlFor={'report-'+playerId}>{m[4]}</label>
    <select id={'report-'+playerId} value={reason} onChange={e=>setReason(e.target.value as ReportReason)}
      className="mt-2 w-full rounded-xl border border-white/20 bg-[#091a30] p-3 text-sm text-white">
     <option value="offensive_name">{m[5]}</option><option value="harassment">{m[6]}</option>
     <option value="other">{m[7]}</option>
    </select>
    <button type="button" disabled={busy||!!status} onClick={()=>{void report();}}
      className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-200 px-4 text-sm font-bold text-slate-950 disabled:opacity-50"><Flag size={17}/>{m[8]}</button>
    <button type="button" disabled={busy} onClick={()=>{void block();}}
      className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-300/35 bg-rose-300/10 px-4 text-sm font-bold text-rose-100"><Ban size={17}/>{m[2]}</button>
    {status&&<p role="status" className="mt-3 text-xs text-emerald-200">{status}</p>}
    {error&&<p role="alert" className="mt-3 text-xs text-rose-200">{error}: <a href="mailto:oguzhanozeren92@gmail.com" className="underline">support</a></p>}
   </section>
  </div>,document.body)}
 </>;
}
