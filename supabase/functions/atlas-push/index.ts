// Atlas Arena APNs server sender. This function NEVER trusts a browser client.
// Deploy in the Geography Supabase project with verify_jwt disabled,
// guarded by a strong ATLAS_PUSH_CRON_SECRET (server-only credential).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { SignJWT, importPKCS8 } from 'npm:jose@5.9.6';
import { notice } from './messages.ts';

type PushKind = 'daily' | 'weekly';
type Device = {
  player_id: string;
  device_token: string;
  apns_environment: 'production' | 'sandbox';
  language: string;
};
const serverEnv = (name: string) => {
  const result = Deno.env.get(name);
  if (!result) throw new Error('Server setting missing: ' + name);
  return result;
};
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json' },
});
const messages: Record<PushKind, { title: string; body: string; target: PushKind }> = {
  daily: { title: '🌍 Bugünün 10 sorusu hazır!', body: 'Dünyada kısa bir tur atmaya var mısın?', target: 'daily' },
  weekly: { title: '🏆 Yeni hafta, yeni yarış!', body: 'Atlas Arena haftalık sıralaması yeniden başladı.', target: 'weekly' },
};
Deno.serve(async request => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const authorization = request.headers.get('authorization') || '';
  const supplied = authorization.replace(/^Bearer /i, '');
  if (!supplied || supplied !== Deno.env.get('ATLAS_PUSH_CRON_SECRET')) return json({ error: 'Unauthorized' }, 401);

  try {
    const payload = await request.json().catch(() => null) as { kind?: PushKind } | null;
    if (payload?.kind !== 'daily' && payload?.kind !== 'weekly') return json({ error: 'Unknown notification type' }, 400);
    const kind = payload.kind;
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const weekday = now.getUTCDay();
    if (kind === 'daily' && weekday === 1) return json({ skipped: 'Monday is reserved for weekly notice' });
    if (kind === 'weekly' && weekday !== 1 && weekday !== 4) return json({ skipped: 'Weekly notice runs Monday and Thursday' });

    const sb = createClient(serverEnv('SUPABASE_URL'), serverEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false },
    });
    const privateKey = await importPKCS8(serverEnv('APNS_PRIVATE_KEY').replace(/\\n/g, '\n'), 'ES256');
    const bearer = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: serverEnv('APNS_KEY_ID') })
      .setIssuer(serverEnv('APNS_TEAM_ID'))
      .setIssuedAt()
      .sign(privateKey);
    const topic = serverEnv('APNS_TOPIC');
    let examined = 0, sent = 0, skipped = 0, failures = 0;
    // Starter limit: 200 devices per run. Upgrade to a queue/cursor worker as users grow.
    const { data, error } = await sb.from('geo_push_devices')
      .select('player_id,device_token,apns_environment,language')
      .eq('enabled', true).eq(kind, true)
      .order('player_id', { ascending: true })
      .limit(200);
    if (error) throw error;

    for (const device of (data ?? []) as Device[]) {
      examined++;
      if (kind === 'daily') {
        // Do not remind a player who already finished today's daily challenge.
        const { data: completed, error: completeError } = await sb.from('geo_daily_results')
          .select('player_id').eq('player_id', device.player_id).eq('day_key', date).limit(1);
        if (completeError) throw completeError;
        if (completed?.length) { skipped++; continue; }
      }

      // Strict one-send-per-player-per-kind-per-day dedupe, including cron retries.
      const { data: claimed, error: claimError } = await sb.from('geo_push_delivery_log')
        .upsert({ player_id: device.player_id, kind, day_key: date }, {
          onConflict: 'player_id,kind,day_key', ignoreDuplicates: true,
        }).select('player_id');
      if (claimError) throw claimError;
      if (!claimed?.length) { skipped++; continue; }

      const host = device.apns_environment === 'sandbox'
        ? 'https://api.sandbox.push.apple.com' : 'https://api.push.apple.com';
      try {
        const res = await fetch(host + '/3/device/' + device.device_token, {
          method: 'POST',
          headers: {
            authorization: 'bearer ' + bearer,
            'apns-topic': topic,
            'apns-push-type': 'alert',
            'apns-priority': '10',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            aps: {
              alert: { title: notice(kind, device.language).title, body: notice(kind, device.language).body },
              sound: 'default',
            },
            target: kind,
          }),
        });
        if (res.ok) { sent++; continue; }
        failures++;
        const reason = await res.json().catch(() => ({})) as { reason?: string };
        if (res.status === 410 || reason.reason === 'Unregistered' || reason.reason === 'BadDeviceToken') {
          await sb.from('geo_push_devices').update({ enabled: false })
            .eq('player_id', device.player_id).eq('device_token', device.device_token);
        }
        console.warn('Apple APNs rejected request', res.status, reason.reason ?? '(none)');
      } catch (e) {
        failures++;
        console.warn('Apple APNs network failure', e);
      }
      // On errors, unblock tomorrow and explicit manual retries of today's campaign.
      await sb.from('geo_push_delivery_log').delete().eq('player_id', device.player_id)
        .eq('kind', kind).eq('day_key', date);
    }
    return json({ kind, date, examined, sent, skipped, failures });
  } catch (error) {
    console.error('Atlas APNs delivery failure', error);
    return json({ error: 'Server delivery failed; inspect Edge logs' }, 500);
  }
});
