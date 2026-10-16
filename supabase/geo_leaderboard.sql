-- Run only in the Supabase project dedicated to the geography game.
-- Dashboard > Authentication > Providers > Anonymous Sign-Ins must be enabled.
create table if not exists public.geo_leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null unique references auth.users(id) on delete cascade,
  player_name text not null check (char_length(trim(player_name)) between 1 and 20),
  score integer not null default 0 check (score between 0 and 10000000),
  correct_answers integer not null default 0 check (correct_answers between 0 and 100000),
  total_questions integer not null default 0 check (total_questions between 0 and 100000),
  created_at timestamptz not null default now()
);
create index if not exists geo_leaderboard_rank on public.geo_leaderboard (score desc, created_at asc);
alter table public.geo_leaderboard enable row level security;
create policy "geo_scores_visible" on public.geo_leaderboard for select to anon, authenticated using (true);
create policy "geo_player_rename" on public.geo_leaderboard for update to authenticated
  using (player_id = (select auth.uid()))
  with check (player_id = (select auth.uid()));
-- For score integrity, score submission is handled through an authenticated RPC.
-- Client-supplied scores remain untrusted: a server-validated gameplay session would be needed for anti-cheat.
create or replace function public.geo_submit_score(p_player_name text, p_score integer, p_correct_answers integer, p_total_questions integer)
returns void language plpgsql security definer set search_path = '' as $$
declare player uuid := auth.uid();
begin
  if player is null then raise exception 'Authentication required'; end if;
  if char_length(trim(p_player_name)) not between 1 and 20
     or p_score is null or p_score < 0 or p_score > 10000000
     or p_total_questions is null or p_total_questions < 0 or p_total_questions > 100000
     or p_correct_answers is null or p_correct_answers < 0 or p_correct_answers > p_total_questions then
     raise exception 'Invalid score submission';
  end if;
  insert into public.geo_leaderboard (player_id, player_name, score, correct_answers, total_questions)
  values (player, trim(p_player_name), p_score, p_correct_answers, p_total_questions)
  on conflict (player_id) do update set
    player_name = excluded.player_name,
    score = case when excluded.score > geo_leaderboard.score then excluded.score else geo_leaderboard.score end,
    correct_answers = case when excluded.score > geo_leaderboard.score then excluded.correct_answers else geo_leaderboard.correct_answers end,
    total_questions = case when excluded.score > geo_leaderboard.score then excluded.total_questions else geo_leaderboard.total_questions end,
    created_at = case when excluded.score > geo_leaderboard.score then now() else geo_leaderboard.created_at end;
end;
$$;
revoke all on function public.geo_submit_score(text,integer,integer,integer) from public, anon;
grant execute on function public.geo_submit_score(text,integer,integer,integer) to authenticated;
grant select on public.geo_leaderboard to anon, authenticated;
-- Column-specific UPDATE permissions prevent edits to scores outside of the RPC.
grant update (player_name) on public.geo_leaderboard to authenticated;
revoke insert, delete on public.geo_leaderboard from anon, authenticated;
