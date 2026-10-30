-- Globriva / Apple Review: in-app safety, reporting, blocking, and anonymous account deletion.
create or replace function public.geo_nickname_safe(p_name text)
returns boolean language sql immutable set search_path = '' as $$
  select p_name is not null
    and char_length(btrim(p_name)) between 2 and 20
    and p_name !~ '[[:cntrl:]]'
    and lower(p_name) !~ '(https?://|www[.]|@)'
    and lower(p_name) !~ '(^|[^[:alnum:]])(fuck|shit|bitch|cunt|nigger|nigga|nazi|porn|porno|sikik|orospu|amk|pic)([^[:alnum:]]|$)'
$$;

create or replace function public.geo_nickname_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_table_name = 'geo_vs_rooms' then
    if not public.geo_nickname_safe(new.host_name)
       or (new.guest_name is not null and not public.geo_nickname_safe(new.guest_name)) then
      raise exception 'Please choose an appropriate nickname';
    end if;
  elsif not public.geo_nickname_safe(new.player_name) then
    raise exception 'Please choose an appropriate nickname';
  end if;
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'geo_leaderboard','geo_weekly_leaderboard',
    'geo_street_country_best','geo_street_country_weekly',
    'geo_drone_best','geo_drone_weekly','geo_vs_rooms'
  ] loop
    execute format('drop trigger if exists geo_nickname_moderation on public.%I',t);
    execute format('create trigger geo_nickname_moderation before insert or update on public.%I for each row execute function public.geo_nickname_guard()',t);
  end loop;
end $$;

create table if not exists public.geo_player_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  target_name text not null check (char_length(target_name) between 1 and 40),
  context text not null check (context in ('weekly','global','street','drone','versus')),
  reason text not null check (reason in ('offensive_name','harassment','other')),
  created_at timestamptz not null default now(),
  constraint geo_report_not_self check (reporter_id <> target_id),
  constraint geo_report_once unique (reporter_id,target_id,context)
);
create index if not exists geo_reports_created_idx on public.geo_player_reports (created_at desc);
alter table public.geo_player_reports enable row level security;
drop policy if exists geo_player_reports_submit on public.geo_player_reports;
create policy geo_player_reports_submit on public.geo_player_reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()) and target_id <> (select auth.uid()));
revoke all on public.geo_player_reports from public, anon, authenticated;
grant insert on public.geo_player_reports to authenticated;

create table if not exists public.geo_player_blocks (
  blocker_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id,blocked_id),
  constraint geo_block_not_self check (blocker_id <> blocked_id)
);
alter table public.geo_player_blocks enable row level security;
drop policy if exists geo_player_blocks_select on public.geo_player_blocks;
drop policy if exists geo_player_blocks_insert on public.geo_player_blocks;
drop policy if exists geo_player_blocks_delete on public.geo_player_blocks;
create policy geo_player_blocks_select on public.geo_player_blocks for select to authenticated
  using (blocker_id = (select auth.uid()));
create policy geo_player_blocks_insert on public.geo_player_blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()) and blocked_id <> (select auth.uid()));
create policy geo_player_blocks_delete on public.geo_player_blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));
revoke all on public.geo_player_blocks from public, anon, authenticated;
grant select, insert, delete on public.geo_player_blocks to authenticated;

create or replace function public.geo_delete_my_account()
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'Authenticated account required'; end if;
  -- VS rooms have participant IDs without foreign keys.
  delete from public.geo_vs_rooms where host_id = v_uid or guest_id = v_uid;
  -- All geography player tables are connected by ON DELETE CASCADE.
  delete from auth.users where id = v_uid;
  if not found then raise exception 'Account not found'; end if;
  return true;
end;
$$;
revoke all on function public.geo_delete_my_account() from public, anon;
grant execute on function public.geo_delete_my_account() to authenticated;
