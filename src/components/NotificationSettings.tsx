import { useState, type ReactNode } from 'react';
import { Bell, BellOff, CalendarDays, CheckCircle2, LoaderCircle, Trophy, Users, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import {
  enableIosPush, disableIosPush, loadPushPreferences, setIosPushCategories,
  type PushPreferences,
} from '@/lib/iosPush';

export function NotificationSettings({ onClose }: { onClose: () => void }) {
  const {t}=useLanguage();
  const [prefs, setPrefs] = useState<PushPreferences>(loadPushPreferences);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action: () => Promise<PushPreferences>) {
    if (busy) return;
    setBusy(true); setError('');
    try { setPrefs(await action()); }
    catch (err) { setError(err instanceof Error ? err.message : t('Bildirim ayarları kaydedilemedi.')); }
    finally { setBusy(false); }
  }
  const row = (key: 'daily'|'weekly', icon: ReactNode, title: string, caption: string) => (
    <label className="flex min-h-[68px] items-center gap-3 py-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#203959] text-[#a9dbff]">{icon}</span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm text-white">{title}</strong>
        <small className="mt-1 block text-xs leading-5 text-blue-100/75">{caption}</small>
      </span>
      <input type="checkbox" checked={prefs[key]} disabled={busy}
        onChange={e => { void run(() => setIosPushCategories({
          daily: key === 'daily' ? e.target.checked : prefs.daily,
          weekly: key === 'weekly' ? e.target.checked : prefs.weekly,
        })); }}
        className="h-5 w-5 shrink-0 accent-[#73c8d7]" aria-label={title} />
    </label>
  );
  return (
    <div className="globriva-modal fixed inset-0 z-[90] flex items-center justify-center bg-[#030918]/80 px-4 py-6 backdrop-blur-md"
      role="dialog" aria-modal="true" aria-labelledby="atlas-notification-title">
      <section className="w-full max-w-[440px] max-h-[90dvh] overflow-y-auto rounded-[26px] border border-[#466681]/60 bg-gradient-to-b from-[#1b3355] to-[#101e37] p-5 text-white shadow-[0_22px_80px_rgba(0,0,0,.5)]">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3a17e] text-[#27364d]"><Bell className="h-6 w-6" /></span>
          <button type="button" onClick={onClose} aria-label={t("Kapat")} className="rounded-xl border border-white/20 bg-white/10 p-2"><X className="h-5 w-5" /></button>
        </div>
        <h2 id="atlas-notification-title" className="mt-4 text-[22px] font-black">{t('Macera haberleri gelsin mi? 🌍')}</h2>
        <p className="mt-2 text-sm leading-6 text-blue-100/80">{t('Sadece seçtiğin konularda haber verelim. İstediğin zaman kapatabilirsin.')}</p>
        <div className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#0d1b33]/65 px-3">
          {row('daily', <CalendarDays className="h-5 w-5"/>, t('Günlük 10 soru'), t('Bitirmediğin günlerde kısa bir hatırlatma.'))}
          {row('weekly', <Trophy className="h-5 w-5"/>, t('Haftalık sıralama'), t('Yeni hafta başladığında hatırlatalım.'))}
          <div className="flex items-center gap-3 py-3 opacity-55">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#203959] text-[#a9dbff]"><Users className="h-5 w-5"/></span>
            <span className="flex-1"><strong className="block text-sm">{t('Arkadaş davetleri')}</strong><small className="block text-xs text-blue-100/75">{t('Davet sistemi tamamlanınca açılacak.')}</small></span>
            <span className="rounded-full bg-white/10 px-2 py-1 text-[10px]">{t('Yakında')}</span>
          </div>
        </div>
        {error && <p className="mt-4 rounded-xl border border-rose-400/40 bg-rose-950/30 p-3 text-xs text-rose-100" role="alert">{error}</p>}
        {prefs.enabled ? (
          <div className="mt-5">
            <p className="mb-3 flex items-center gap-2 text-xs text-[#9aedd6]"><CheckCircle2 className="h-4 w-4"/> {t('İzin açık. Bildirimlerin gelmesi için sunucuda APNs kurulumu da gereklidir.')}</p>
            <button type="button" disabled={busy} onClick={() => { void run(disableIosPush); }}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 font-bold disabled:opacity-50">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <BellOff className="h-4 w-4"/>} {t('Bildirimleri kapat')}
            </button>
          </div>
        ) : (
          <button type="button" disabled={busy} onClick={() => { void run(enableIosPush); }}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ef866f] to-[#ffb17a] px-4 font-black text-[#24344a] disabled:opacity-50">
            {busy ? <LoaderCircle className="h-5 w-5 animate-spin"/> : <Bell className="h-5 w-5"/>} {t('Bildirimleri aç')}
          </button>
        )}
        <p className="mt-3 text-center text-[11px] leading-5 text-blue-100/65">{t("İzin vermek zorunda değilsin. iPhone Ayarlar'dan da kontrol edebilirsin.")}</p>
      </section>
    </div>
  );
}
