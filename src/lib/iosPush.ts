import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { backend, getPlayerId } from '@/lib/leaderboard';

const KEY = 'atlas-push-settings-v1';
const DEVICE = 'atlas-push-device-v1';
const APNS_ENV = import.meta.env.VITE_ATLAS_APNS_ENV === 'sandbox' ? 'sandbox' : 'production';
const LANGUAGE_KEY = 'atlas-arena-language-v1';
const ALLOWED = new Set(['tr','en','es','de','fr','pt','ru','zh','ja']);
function selectedLanguage(): string {
  const selected = (localStorage.getItem(LANGUAGE_KEY) || navigator.language || 'tr').split(/[-_]/)[0].toLowerCase();
  return ALLOWED.has(selected) ? selected : 'en';
}

export interface PushPreferences {
  enabled: boolean;
  daily: boolean;
  weekly: boolean;
  invites: boolean;
}
export type PushTarget = 'daily' | 'weekly';

export const isIosPushSupported = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
export function loadPushPreferences(): PushPreferences {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null') as Partial<PushPreferences> | null;
    return { enabled: s?.enabled === true, daily: s?.daily !== false, weekly: s?.weekly !== false, invites: false };
  } catch {
    return { enabled: false, daily: true, weekly: true, invites: false };
  }
}
function saveLocal(p: PushPreferences) { localStorage.setItem(KEY, JSON.stringify(p)); }
function deviceId() {
  let id = localStorage.getItem(DEVICE);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE, id); }
  return id;
}
async function registerToken(token: string) {
  if (!backend || !loadPushPreferences().enabled) return;
  const playerId = await getPlayerId();
  const p = loadPushPreferences();
  const { error } = await backend.from('geo_push_devices').upsert({
    player_id: playerId, device_id: deviceId(),
    device_token: token, apns_environment: APNS_ENV, language: selectedLanguage(),
    enabled: p.enabled, daily: p.daily, weekly: p.weekly, invites: false,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'player_id,device_id' });
  if (error) throw new Error('Cihaz kaydı yapılamadı. Atlas Arena Supabase bildirim tablosunu kontrol edin.');
}
async function syncPreferences(p: PushPreferences) {
  if (!backend) throw new Error('Supabase bağlantısı hazır değil.');
  const playerId = await getPlayerId();
  const { error } = await backend.from('geo_push_devices').update({
    enabled: p.enabled, daily: p.daily, weekly: p.weekly, invites: false,
    language: selectedLanguage(), updated_at: new Date().toISOString(),
  }).eq('player_id', playerId).eq('device_id', deviceId());
  if (error) throw new Error('Bildirim tercihleri sunucuya kaydedilemedi.');
}
/** Resync notification locale when a player changes the in-app language. */
export async function syncIosPushLanguage(): Promise<void> {
  if (!backend || !isIosPushSupported() || !loadPushPreferences().enabled) return;
  const playerId = await getPlayerId();
  const { error } = await backend.from('geo_push_devices')
    .update({ language: selectedLanguage(), updated_at: new Date().toISOString() })
    .eq('player_id', playerId).eq('device_id', deviceId());
  if (error) console.warn('Globriva push language sync:', error.message);
}

export async function enableIosPush(): Promise<PushPreferences> {
  if (!isIosPushSupported()) throw new Error('Yalnızca iOS uygulamasında kullanılabilir.');
  if (!backend) throw new Error('Supabase bağlantısı hazır değil.');
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') throw new Error('iPhone bildirim izni verilmedi. Ayarlar bölümünden açabilirsin.');
  const next = { ...loadPushPreferences(), enabled: true, invites: false };
  saveLocal(next);
  await PushNotifications.register();
  return next;
}
export async function disableIosPush(): Promise<PushPreferences> {
  const next = { ...loadPushPreferences(), enabled: false };
  await syncPreferences(next); // Do not claim opt-out when server is unreachable.
  saveLocal(next);
  return next;
}
export async function setIosPushCategories(categories: Pick<PushPreferences,'daily'|'weekly'>): Promise<PushPreferences> {
  const next = { ...loadPushPreferences(), ...categories, invites: false };
  if (next.enabled) await syncPreferences(next);
  saveLocal(next);
  return next;
}
export async function initIosPush(onOpen: (target: PushTarget) => void): Promise<() => void> {
  if (!isIosPushSupported()) return () => {};
  const listeners: PluginListenerHandle[] = [];
  try {
    listeners.push(await PushNotifications.addListener('registration', token => {
      void registerToken(token.value).catch(error => console.warn('Atlas token registration:', error));
    }));
    listeners.push(await PushNotifications.addListener('registrationError', error => {
      console.warn('APNs registration error:', error);
    }));
    listeners.push(await PushNotifications.addListener('pushNotificationActionPerformed', action => {
      const target = action.notification.data?.target;
      if (target === 'daily' || target === 'weekly') onOpen(target);
    }));
    if (loadPushPreferences().enabled) {
      const permission = await PushNotifications.checkPermissions();
      if (permission.receive === 'granted') await PushNotifications.register();
    }
  } catch (error) {
    for (const listener of listeners) await listener.remove();
    throw error;
  }
  return () => { for (const listener of listeners) void listener.remove(); };
}
