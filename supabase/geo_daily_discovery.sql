-- Coğrafya Oyunu: ONLY apply to the Geography Supabase project, not TarlaPusula.
-- Run AFTER enabling anonymous sign-in and creating public.geo_leaderboard.
-- Existing leaderboard/mode tables remain untouched.

create table if not exists public.geo_country_discoveries (
  player_id uuid not null references auth.users(id) on delete cascade,
  country_id text not null check (country_id ~ '^[0-9]{3}$'),
  discovered_at timestamptz not null default now(),
  primary key (player_id, country_id)
);
create index if not exists geo_country_discoveries_player_idx
  on public.geo_country_discoveries (player_id, discovered_at desc);
alter table public.geo_country_discoveries enable row level security;
drop policy if exists "geo_read_own_discoveries" on public.geo_country_discoveries;
create policy "geo_read_own_discoveries" on public.geo_country_discoveries for select to authenticated
  using (player_id = (select auth.uid()));
drop policy if exists "geo_insert_own_discoveries" on public.geo_country_discoveries;
create policy "geo_insert_own_discoveries" on public.geo_country_discoveries for insert to authenticated
  with check (player_id = (select auth.uid()));
revoke all on public.geo_country_discoveries from anon, authenticated;
grant select, insert on public.geo_country_discoveries to authenticated;

create table if not exists public.geo_daily_results (
  player_id uuid not null references auth.users(id) on delete cascade,
  day_key date not null,
  correct_answers smallint not null check (correct_answers between 0 and 10),
  completed_at timestamptz not null default now(),
  primary key (player_id, day_key)
);
alter table public.geo_daily_results enable row level security;
drop policy if exists "geo_read_own_daily_results" on public.geo_daily_results;
create policy "geo_read_own_daily_results" on public.geo_daily_results for select to authenticated
  using (player_id = (select auth.uid()));
drop policy if exists "geo_insert_own_daily_results" on public.geo_daily_results;
create policy "geo_insert_own_daily_results" on public.geo_daily_results for insert to authenticated
  with check (player_id = (select auth.uid()) and day_key <= (now() at time zone 'UTC')::date);
drop policy if exists "geo_update_own_daily_results" on public.geo_daily_results;
create policy "geo_update_own_daily_results" on public.geo_daily_results for update to authenticated
  using (player_id = (select auth.uid()))
  with check (player_id = (select auth.uid()) and day_key <= (now() at time zone 'UTC')::date);
revoke all on public.geo_daily_results from anon, authenticated;
grant select, insert, update on public.geo_daily_results to authenticated;

-- These are client-reported achievements, not cheat-proof competitive scores.
-- For rewards with monetary value, verify answers in a server-trusted session.