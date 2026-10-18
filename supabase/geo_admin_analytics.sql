-- ATLAS ARENA / GEO — admin analytics, v1
-- IMPORTANT: Apply ONLY to the Supabase project used by VITE_SUPABASE_URL in Atlas Arena.
-- Never apply to TarlaPusula or GıdaLab databases.
-- Anonymous Sign-Ins may continue for normal players. Admin must use email/password auth.
-- DO NOT place a service_role key, admin password, or grant-admin SQL in the app.

create table if not exists public.geo_admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.geo_admin_members enable row level security;
revoke all on public.geo_admin_members from anon, authenticated;
grant select on public.geo_admin_members to authenticated;
drop policy if exists geo_admin_self_read on public.geo_admin_members;
create policy geo_admin_self_read on public.geo_admin_members for select to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.geo_play_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  player_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_id uuid not null,
  mode text not null check (mode in ('mixed','flags','clues','daily','street','drone')),
  event_type text not null check (event_type in (
    'mode_start','question_shown','answer','hint','mode_exit',
    'panorama_ready','panorama_error','panorama_skipped','street_guess','daily_complete'
  )),
  question_id text check (length(question_id) between 1 and 72),
  correct boolean,
  duration_ms integer check (duration_ms between 0 and 120000),
  option_index smallint check (option_index between 0 and 3),
  detail text check (length(detail) <= 32)
);
create index if not exists geo_events_created_idx on public.geo_play_events (created_at desc);
create index if not exists geo_events_question_idx on public.geo_play_events (mode,question_id,created_at desc)
  where question_id is not null;
create index if not exists geo_events_player_idx on public.geo_play_events (player_id,created_at desc);
alter table public.geo_play_events enable row level security;
revoke all on public.geo_play_events from public, anon, authenticated;
grant insert on public.geo_play_events to authenticated;
grant usage, select on sequence public.geo_play_events_id_seq to authenticated;
drop policy if exists geo_events_player_insert on public.geo_play_events;
create policy geo_events_player_insert on public.geo_play_events for insert to authenticated
  with check (player_id = (select auth.uid()) and session_id is not null);
-- Players cannot SELECT or modify analytics. The read RPC returns aggregates to admins.

create table if not exists public.geo_admin_question_reviews (
  question_key text primary key check (length(question_key) between 3 and 100),
  status text not null default 'review' check (status in ('review','investigating','resolved','ignored')),
  updated_by uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now()
);
alter table public.geo_admin_question_reviews enable row level security;
revoke all on public.geo_admin_question_reviews from public, anon, authenticated;
grant select, insert, update on public.geo_admin_question_reviews to authenticated;
drop policy if exists geo_admin_reviews_read on public.geo_admin_question_reviews;
drop policy if exists geo_admin_reviews_insert on public.geo_admin_question_reviews;
drop policy if exists geo_admin_reviews_update on public.geo_admin_question_reviews;
create policy geo_admin_reviews_read on public.geo_admin_question_reviews for select to authenticated
  using (exists (select 1 from public.geo_admin_members a where a.user_id = (select auth.uid())));
create policy geo_admin_reviews_insert on public.geo_admin_question_reviews for insert to authenticated
  with check (updated_by = (select auth.uid()) and
    exists (select 1 from public.geo_admin_members a where a.user_id = (select auth.uid())));
create policy geo_admin_reviews_update on public.geo_admin_question_reviews for update to authenticated
  using (exists (select 1 from public.geo_admin_members a where a.user_id = (select auth.uid())))
  with check (updated_by = (select auth.uid()) and
    exists (select 1 from public.geo_admin_members a where a.user_id = (select auth.uid())));

create or replace function public.geo_admin_snapshot(p_days integer default 7)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare since_ts timestamptz;
begin
  if (select auth.uid()) is null or not exists
    (select 1 from public.geo_admin_members where user_id = (select auth.uid())) then
    raise exception 'Atlas admin authorization required' using errcode='42501';
  end if;
  if p_days not in (1,7,30) then
    raise exception 'Supported periods: 1, 7, 30 days' using errcode='22023';
  end if;
  since_ts := now() - make_interval(days => p_days);
  return jsonb_build_object(
    'days', p_days,
    'last_event_at', (select max(e.created_at) from public.geo_play_events e where e.created_at >= since_ts),
    'overview', (
      select jsonb_build_object(
        'events',count(*),
        'players',count(distinct player_id),
        'answers',count(*) filter (where event_type='answer'),
        'correct',count(*) filter (where event_type='answer' and correct is true),
        'incorrect',count(*) filter (where event_type='answer' and correct is false),
        'avg_answer_ms',round(avg(duration_ms) filter (where event_type='answer')),
        'panorama_errors',count(*) filter (where event_type='panorama_error'),
        'panorama_ready',count(*) filter (where event_type='panorama_ready'),
        'mode_exits',count(*) filter (where event_type='mode_exit')
      ) from public.geo_play_events where created_at >= since_ts
    ),
    'questions', (
      with q as (
        select mode,question_id,
          count(*) filter (where event_type='question_shown') as shown,
          count(*) filter (where event_type='answer') as answers,
          count(*) filter (where event_type='answer' and correct is true) as correct,
          count(*) filter (where event_type='answer' and correct is false) as wrong,
          round(avg(duration_ms) filter (where event_type='answer')) as avg_ms
        from public.geo_play_events
        where created_at >= since_ts and question_id is not null
          and mode in ('mixed','flags','clues','daily')
          and event_type in ('question_shown','answer')
        group by mode,question_id
      ), ordered as (
        select * from q
        order by case when answers > 0 then wrong::numeric / answers else 0 end desc,
          answers desc, shown desc, question_id
        limit 120
      )
      select coalesce(jsonb_agg(to_jsonb(ordered)), '[]'::jsonb) from ordered
    ),
    'flow', (
      with f as (
        select mode,
          count(*) filter (where event_type='mode_start') as starts,
          count(*) filter (where event_type='question_shown') as shown,
          count(*) filter (where event_type in ('answer','street_guess')) as answers,
          count(*) filter (where event_type='mode_exit') as exits,
          count(*) filter (where event_type='hint') as hints,
          count(*) filter (where event_type='panorama_ready') as panorama_ready,
          count(*) filter (where event_type='panorama_error') as panorama_errors,
          count(*) filter (where event_type='panorama_skipped') as skips,
          round(avg(duration_ms) filter (where event_type='panorama_ready')) as load_ms
        from public.geo_play_events
        where created_at >= since_ts group by mode
      )
      select coalesce(jsonb_agg(to_jsonb(f) order by f.mode), '[]'::jsonb) from f
    ),
    'issues', (
      with e as (
        select mode,coalesce(detail,'unknown') as detail,coalesce(question_id,'unknown') as question_id,count(*) as total,max(created_at) as last_seen
        from public.geo_play_events where created_at >= since_ts and event_type = 'panorama_error'
        group by mode,coalesce(detail,'unknown'),coalesce(question_id,'unknown')
        order by total desc, last_seen desc limit 50
      ) select coalesce(jsonb_agg(to_jsonb(e)), '[]'::jsonb) from e
    )
  );
end;
$$;
revoke all on function public.geo_admin_snapshot(integer) from public, anon;
grant execute on function public.geo_admin_snapshot(integer) to authenticated;

-- After creating a dedicated EMAIL/PASSWORD user in Atlas Arena Supabase Auth,
-- grant access via Supabase SQL editor (never from the browser or .env):
-- insert into public.geo_admin_members(user_id) values ('<THE_ADMIN_AUTH_USER_UUID>');
-- Do not guess a UUID or give ordinary anonymous players admin status.
