-- ATLAS ARENA: weekly leagues (mixed + flags + clues); idempotent upgrade.
-- Run ONLY on the Geography Supabase project. Anonymous Sign-Ins must be enabled.
-- Weeks start at Monday 00:00 UTC. Historical weeks are preserved.
-- Earlier weekly entries remain in the 'mixed' league.

create table if not exists public.geo_weekly_leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null check (char_length(trim(player_name)) between 1 and 20),
  week_start date not null,
  mode text not null default 'mixed',
  score bigint not null default 0 check (score between 0 and 2000000000),
  correct_answers integer not null default 0 check (correct_answers between 0 and 1000000),
  total_questions integer not null default 0 check (total_questions between 0 and 1000000),
  games_played integer not null default 0 check (games_played between 0 and 1000000),
  updated_at timestamptz not null default now()
);

alter table public.geo_weekly_leaderboard
  add column if not exists mode text not null default 'mixed';

-- Remove legacy one-league unique key; never delete old scores.
alter table public.geo_weekly_leaderboard
  drop constraint if exists geo_weekly_leaderboard_player_id_week_start_key;

-- Extend the mode constraint without deleting or changing existing weekly scores.
alter table public.geo_weekly_leaderboard
  drop constraint if exists geo_weekly_mode_valid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'geo_weekly_mode_valid'
      AND conrelid = 'public.geo_weekly_leaderboard'::regclass
  ) THEN
    ALTER TABLE public.geo_weekly_leaderboard
      ADD CONSTRAINT geo_weekly_mode_valid CHECK (mode in ('mixed', 'flags', 'clues'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'geo_weekly_mode_unique'
      AND conrelid = 'public.geo_weekly_leaderboard'::regclass
  ) THEN
    ALTER TABLE public.geo_weekly_leaderboard
      ADD CONSTRAINT geo_weekly_mode_unique UNIQUE (player_id, week_start, mode);
  END IF;
END $$;

create index if not exists geo_weekly_rank_mode_idx
  on public.geo_weekly_leaderboard (week_start, mode, score desc, updated_at asc);
alter table public.geo_weekly_leaderboard enable row level security;
drop policy if exists geo_weekly_scores_visible on public.geo_weekly_leaderboard;
create policy geo_weekly_scores_visible on public.geo_weekly_leaderboard
  for select to anon, authenticated using (true);

revoke all on public.geo_weekly_leaderboard from anon, authenticated;
grant select on public.geo_weekly_leaderboard to anon, authenticated;

-- Drop the previous four-argument RPC to prevent writes that mix leaderboard modes.
drop function if exists public.geo_submit_weekly_score(text,integer,integer,integer);

-- Authenticated RPC stores scores in the correct weekly league.
-- Client-side scores are not anti-cheat verified; server validation would be required for ranked tournaments.
create or replace function public.geo_submit_weekly_score(
  p_player_name text,
  p_score integer,
  p_correct_answers integer,
  p_total_questions integer,
  p_mode text
) returns void language plpgsql security definer set search_path = '' as $$
declare
  v_player uuid := (select auth.uid());
  v_week date := ((now() at time zone 'UTC')::date
    - (extract(isodow from now() at time zone 'UTC')::integer - 1));
begin
  if v_player is null then raise exception 'Authentication required'; end if;
  if p_mode is null or p_mode not in ('mixed', 'flags', 'clues')
    or p_player_name is null or char_length(trim(p_player_name)) not between 1 and 20
    or p_score is null or p_score < 0 or p_score > 10000000
    or p_total_questions is null or p_total_questions < 0 or p_total_questions > 100000
    or p_correct_answers is null or p_correct_answers < 0 or p_correct_answers > p_total_questions
  then raise exception 'Invalid weekly score submission'; end if;

  insert into public.geo_weekly_leaderboard
    (player_id, player_name, week_start, mode, score, correct_answers, total_questions, games_played)
  values (v_player, trim(p_player_name), v_week, p_mode, p_score, p_correct_answers, p_total_questions, 1)
  on conflict (player_id, week_start, mode) do update set
    player_name = excluded.player_name,
    score = least(2000000000, geo_weekly_leaderboard.score + excluded.score),
    correct_answers = least(1000000, geo_weekly_leaderboard.correct_answers + excluded.correct_answers),
    total_questions = least(1000000, geo_weekly_leaderboard.total_questions + excluded.total_questions),
    games_played = least(1000000, geo_weekly_leaderboard.games_played + 1),
    updated_at = now();
end;
$$;
revoke all on function public.geo_submit_weekly_score(text,integer,integer,integer,text) from public, anon;
grant execute on function public.geo_submit_weekly_score(text,integer,integer,integer,text) to authenticated;
