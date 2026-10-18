-- Run ONLY in the Atlas Arena (Geography) Supabase project.
create table if not exists public.geo_push_devices (
  player_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null,
  device_token text not null check (length(device_token) between 32 and 512),
  apns_environment text not null default 'production' check (apns_environment in ('sandbox','production')),
  enabled boolean not null default false,
  daily boolean not null default true,
  weekly boolean not null default true,
  invites boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (player_id,device_id)
);
create index if not exists geo_push_active_idx on public.geo_push_devices (enabled,updated_at desc) where enabled=true;
alter table public.geo_push_devices enable row level security;
drop policy if exists geo_push_devices_select on public.geo_push_devices;
drop policy if exists geo_push_devices_insert on public.geo_push_devices;
drop policy if exists geo_push_devices_update on public.geo_push_devices;
drop policy if exists geo_push_devices_delete on public.geo_push_devices;
create policy geo_push_devices_select on public.geo_push_devices for select to authenticated
  using (player_id=(select auth.uid()));
create policy geo_push_devices_insert on public.geo_push_devices for insert to authenticated
  with check (player_id=(select auth.uid()));
create policy geo_push_devices_update on public.geo_push_devices for update to authenticated
  using (player_id=(select auth.uid())) with check (player_id=(select auth.uid()));
create policy geo_push_devices_delete on public.geo_push_devices for delete to authenticated
  using (player_id=(select auth.uid()));
revoke all on public.geo_push_devices from public,anon,authenticated;
grant select,insert,update,delete on public.geo_push_devices to authenticated;

create table if not exists public.geo_push_delivery_log (
  player_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('daily','weekly')),
  day_key date not null,
  created_at timestamptz not null default now(),
  primary key (player_id,kind,day_key)
);
alter table public.geo_push_delivery_log enable row level security;
revoke all on public.geo_push_delivery_log from public,anon,authenticated;
