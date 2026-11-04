import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { App as NativeApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';

// FoodVive-style on-device reminders: no APNs credential, server cron or
// Supabase device registration is required to deliver these reminders.
const KEY = 'atlas-push-settings-v1';
const LANGUAGE_KEY = 'atlas-arena-language-v1';
const LOCAL_IDS = Array.from({ length: 9 }, (_, i) => 746100 + i);
const COPY: Record<string, { daily: [string,string]; weekly: [string,string]; test: [string,string] }> = {
  tr: { daily: ['🌍 Globriva · Günlük keşif', 'Bugünün 10 coğrafya sorusunu keşfetmek ister misin?'],
        weekly: ['🏆 Globriva · Yeni hafta', 'Dünya sıralaması yenilendi. Haftalık mücadele başladı!'],
        test: ['🔔 Globriva bildirim testi', 'Harika! iPhone bildirim sistemin çalışıyor.'] },
  en: { daily: ['🌍 Globriva · Daily discovery', 'Ready for today’s 10 geography questions?'],
        weekly: ['🏆 Globriva · New week', 'The world leaderboard has reset. A new challenge awaits!'],
        test: ['🔔 Globriva notification test', 'Great! Your iPhone notifications are working.'] },
  es: { daily: ['🌍 Globriva · Reto diario', '¿Listo para las 10 preguntas de hoy?'],
        weekly: ['🏆 Globriva · Nueva semana', '¡Comienza una nueva clasificación mundial!'],
        test: ['🔔 Prueba de Globriva', 'Las notificaciones de tu iPhone funcionan.'] },
  de: { daily: ['🌍 Globriva · Tägliche Fragen', 'Bereit für die 10 Geografiefragen von heute?'],
        weekly: ['🏆 Globriva · Neue Woche', 'Die Weltrangliste beginnt von vorn!'],
        test: ['🔔 Globriva Test', 'Deine iPhone-Mitteilungen funktionieren.'] },
  fr: { daily: ['🌍 Globriva · Défi du jour', 'Prêt pour les 10 questions de géographie du jour ?'],
        weekly: ['🏆 Globriva · Nouvelle semaine', 'Le classement mondial recommence !'],
        test: ['🔔 Test Globriva', 'Les notifications de votre iPhone fonctionnent.'] },
  pt: { daily: ['🌍 Globriva · Desafio diário', 'Preparado para 10 perguntas de geografia?'],
        weekly: ['🏆 Globriva · Nova semana', 'O ranking mundial recomeçou!'],
        test: ['🔔 Teste Globriva', 'As notificações do iPhone estão funcionando.'] },
  ru: { daily: ['🌍 Globriva · Вопросы дня', 'Готовы к 10 вопросам по географии?'],
        weekly: ['🏆 Globriva · Новая неделя', 'Мировой рейтинг обновлён!'],
        test: ['🔔 Проверка Globriva', 'Уведомления iPhone работают.'] },
  zh: { daily: ['🌍 Globriva · 每日挑战', '准备好回答今天的10道地理题了吗？'],
        weekly: ['🏆 Globriva · 新的一周', '世界排行榜已重置！'],
        test: ['🔔 Globriva 测试', 'iPhone 通知正常工作。'] },
  ja: { daily: ['🌍 Globriva · 毎日の挑戦', '今日の地理10問に挑戦しませんか？'],
        weekly: ['🏆 Globriva · 新しい週', '世界ランキングが更新されました！'],
        test: ['🔔 Globriva テスト', 'iPhoneの通知は正常に動作しています。'] }
};
function copy() {
  const tag = (localStorage.getItem(LANGUAGE_KEY) || navigator.language || 'tr').split(/[-_]/)[0].toLowerCase();
  return COPY[tag] || COPY.en;
}
export interface PushPreferences { enabled: boolean; daily: boolean; weekly: boolean; invites: boolean }
export type PushTarget = 'daily' | 'weekly';
export const isIosPushSupported = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios' && Capacitor.isPluginAvailable('LocalNotifications');
export function loadPushPreferences(): PushPreferences {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null') as Partial<PushPreferences> | null;
    return { enabled: p?.enabled === true, daily: p?.daily !== false, weekly: p?.weekly !== false, invites: false };
  } catch { return { enabled: false, daily: true, weekly: true, invites: false }; }
}
function save(p: PushPreferences) { localStorage.setItem(KEY, JSON.stringify(p)); }
async function clearOurReminders() {
  const pending = await LocalNotifications.getPending();
  const ours = pending.notifications.filter(n => LOCAL_IDS.includes(n.id)).map(n => ({ id: n.id }));
  if (ours.length) await LocalNotifications.cancel({ notifications: ours });
}
async function plan(p: PushPreferences) {
  await clearOurReminders();
  if (!p.enabled || (await LocalNotifications.checkPermissions()).display !== 'granted') return 0;
  const message = copy();
  const notices: Array<{
    id: number; title: string; body: string; schedule: { on: { hour: number; minute: number } } | { at: Date };
    extra: { target: PushTarget }; foreground: boolean;
  }> = [];
  if (p.daily) {
    notices.push({
      id: LOCAL_IDS[0], title: message.daily[0], body: message.daily[1],
      schedule: { on: { hour: 19, minute: 0 } }, extra: { target: 'daily' }, foreground: false
    });
  }
  if (p.weekly) {
    // Week starts on Monday. Keep eight coming Mondays, refreshed on next app open.
    const now = new Date();
    const first = new Date(now);
    first.setHours(10, 0, 0, 0);
    first.setDate(first.getDate() + ((8 - first.getDay()) % 7));
    if (first.getTime() <= now.getTime() + 60000) first.setDate(first.getDate() + 7);
    for (let i = 0; i < 8; i++) {
      const at = new Date(first);
      at.setDate(first.getDate() + 7 * i);
      notices.push({
        id: LOCAL_IDS[i + 1], title: message.weekly[0], body: message.weekly[1],
        schedule: { at }, extra: { target: 'weekly' }, foreground: false
      });
    }
  }
  if (notices.length) await LocalNotifications.schedule({ notifications: notices });
  return notices.length;
}
export async function enableIosPush(): Promise<PushPreferences> {
  if (!isIosPushSupported()) throw new Error('Bu iPhone sürümünde yerel bildirim eklentisi bulunmuyor. Yeni build gerekiyor.');
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') throw new Error('Bildirim izni verilmedi. iPhone Ayarlar → Globriva → Bildirimler bölümünden açabilirsin.');
  const next = { ...loadPushPreferences(), enabled: true, invites: false };
  await plan(next);
  save(next);
  return next;
}
export async function disableIosPush(): Promise<PushPreferences> {
  const next = { ...loadPushPreferences(), enabled: false };
  if (isIosPushSupported()) await clearOurReminders();
  save(next);
  return next;
}
export async function setIosPushCategories(categories: Pick<PushPreferences,'daily'|'weekly'>): Promise<PushPreferences> {
  const next = { ...loadPushPreferences(), ...categories, invites: false };
  if (isIosPushSupported() && next.enabled) await plan(next);
  save(next);
  return next;
}
export async function sendIosTestNotification(): Promise<boolean> {
  if (!isIosPushSupported()) return false;
  if ((await LocalNotifications.checkPermissions()).display !== 'granted') return false;
  const message = copy().test;
  await LocalNotifications.schedule({ notifications: [{
    id: 746199, title: message[0], body: message[1],
    schedule: { at: new Date(Date.now() + 5000) },
    extra: { target: 'daily' }, foreground: false
  }] });
  return true;
}
export async function syncIosPushLanguage(): Promise<void> {
  if (isIosPushSupported() && loadPushPreferences().enabled) await plan(loadPushPreferences());
}
export async function initIosPush(onOpen: (target: PushTarget) => void): Promise<() => void> {
  if (!isIosPushSupported()) return () => {};
  const listeners: PluginListenerHandle[] = [];
  try {
    listeners.push(await LocalNotifications.addListener('localNotificationActionPerformed', action => {
      const target: unknown = action.notification.extra?.target;
      if (target === 'daily' || target === 'weekly') onOpen(target);
    }));
    listeners.push(await NativeApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive && loadPushPreferences().enabled) {
        void plan(loadPushPreferences()).catch(e => console.warn('Globriva local reminders:', e));
      }
    }));
    if (loadPushPreferences().enabled) await plan(loadPushPreferences());
  } catch (error) {
    for (const listener of listeners) await listener.remove();
    throw error;
  }
  return () => { for (const listener of listeners) void listener.remove(); };
}
