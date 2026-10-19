import { Clapperboard, Heart, ShieldAlert, Sparkles, Trophy, X } from 'lucide-react';
import type { GameMode } from '@/types';
import { useLanguage } from '@/lib/i18n';

interface ReviveScreenProps {
  mode: GameMode;
  score: number;
  round: number;
  available: boolean;
  busy: boolean;
  error: string;
  onWatchAd: () => void;
  onGiveUp: () => void;
}

export function ReviveScreen({ mode, score, round, available, busy, error, onWatchAd, onGiveUp }: ReviveScreenProps) {
  const {language,t}=useLanguage();
  return (
    <div className="revive-overlay fixed inset-0 z-40 flex items-center justify-center overflow-y-auto px-4 py-7" role="dialog" aria-modal="true" aria-labelledby="revive-title">
      <div className="revive-panel relative my-auto w-full max-w-sm overflow-hidden rounded-[28px] border border-white/15 px-6 pb-6 pt-8 text-center text-white shadow-2xl">
        <div className="revive-orb" aria-hidden="true" />
        <div className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[25px] border border-rose-300/40 bg-rose-400/10 shadow-[0_0_32px_rgba(244,63,94,.28)]">
          <Heart className="revive-heart h-11 w-11 fill-rose-500 text-rose-300" />
          <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-amber-300" />
        </div>
        <p className="relative z-10 mb-2 text-[11px] font-extrabold tracking-[.24em] text-amber-300">{t('DEVAM ŞANSI')}</p>
        <h2 id="revive-title" className="relative z-10 text-3xl font-black tracking-tight">{t('Canların Bitti!')}</h2>
        <p className="relative z-10 mt-2 text-sm leading-6 text-blue-100/80">
          {t(mode === 'flags' ? 'Bayrak Arenası' : mode === 'clues' ? 'İpucu Arenası' : 'Karışık Arena')} · {round}. {t('soru')}
          <span className="mx-2 text-white/25">|</span>
          <Trophy className="-mt-0.5 mr-1 inline h-3.5 w-3.5 text-amber-300" />{score.toLocaleString(language)} {t('puan')}
        </p>
        <div className="relative z-10 my-6 rounded-2xl border border-rose-300/20 bg-white/5 px-3 py-4">
          <div className="flex items-center justify-center gap-1.5"><Heart className="h-6 w-6 fill-rose-500 text-rose-400" /><span className="text-xl font-black text-white">+1 {t('CAN')}</span></div>
          <p className="mt-1 text-xs text-slate-300">{t('Ödüllü reklamı tamamla, kaldığın yerden devam et.')}</p>
          <p className="mt-1 text-[11px] text-slate-400">{t('Her oyunda en fazla bir kez.')}</p>
        </div>
        {error && <p className="relative z-10 mb-3 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-200" role="alert"><ShieldAlert className="mr-1 inline h-3.5 w-3.5" />{error}</p>}
        {!available && !error && <p className="relative z-10 mb-3 text-xs text-slate-400">{t('Bu sürümde ödüllü reklam bağlantısı henüz etkin değil.')}</p>}
        <button type="button" disabled={!available || busy} onClick={onWatchAd} className="revive-ad-button relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">
          <Clapperboard className="h-5 w-5" />{busy ? t('Reklam hazırlanıyor…') : t('Reklam İzle · +1 Can')}
        </button>
        <button type="button" disabled={busy} onClick={onGiveUp} className="relative z-10 mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 disabled:opacity-50">
          <X className="h-4 w-4" /> {t('Oyunu Bitir')}
        </button>
      </div>
    </div>
  );
}