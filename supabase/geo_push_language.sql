-- Globriva: per-device language for APNs, never infer from account country.
-- Run against the Geography Supabase project only.
alter table public.geo_push_devices
  add column if not exists language text not null default 'tr';
update public.geo_push_devices set language='tr'
  where language not in ('tr','en','es','de','fr','pt','ru','zh','ja');
alter table public.geo_push_devices
  drop constraint if exists geo_push_device_language_valid;
alter table public.geo_push_devices
  add constraint geo_push_device_language_valid
  check (language in ('tr','en','es','de','fr','pt','ru','zh','ja'));
