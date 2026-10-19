-- Atlas Arena: Drone Detective lifetime and weekly non-prize leaderboards.
-- Run ONLY in the dedicated Atlas Arena Supabase project.
-- Anonymous Auth sign-in must be enabled.
-- Scores submitted from the client are NOT cheat-proof; do not offer monetary prizes.
create table if not exists public.geo_drone_best (
  player_id uuid primary key references auth.users(id) on delete cascade,
  player_name text not null check (char_length(trim(player_name)) between 1 and 20),
  score integer not null check (score between 0 and 25000),
  updated_at timestamptz not null default now()
);
create table if not exists public.geo_drone_weekly (
  player_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  player_name text not null check (char_length(trim(player_name)) between 1 and 20),
  score integer not null check (score between 0 and 25000),
  updated_at timestamptz not null default now(),
  primary key(player_id,week_start)
);
create index if not exists geo_drone_best_rank on public.geo_drone_best(score desc,updated_at asc);
create index if not exists geo_drone_weekly_rank on public.geo_drone_weekly(week_start,score desc,updated_at asc);
alter table public.geo_drone_best enable row level security;
alter table public.geo_drone_weekly enable row level security;
drop policy if exists geo_drone_best_visible on public.geo_drone_best;
drop policy if exists geo_drone_weekly_visible on public.geo_drone_weekly;
create policy geo_drone_best_visible on public.geo_drone_best for select to anon,authenticated using(true);
create policy geo_drone_weekly_visible on public.geo_drone_weekly for select to anon,authenticated using(true);
revoke all on public.geo_drone_best from public,anon,authenticated;
revoke all on public.geo_drone_weekly from public,anon,authenticated;
grant select on public.geo_drone_best to anon,authenticated;
grant select on public.geo_drone_weekly to anon,authenticated;

create or replace function public.geo_submit_drone_score(
  p_player_name text,p_score integer,p_rounds integer
) returns void language plpgsql security definer set search_path='' as $$
declare
  v_player uuid:=(select auth.uid());
  v_week date:=((now() at time zone 'UTC')::date-(extract(isodow from now() at time zone 'UTC')::integer-1));
begin
  if v_player is null then raise exception 'Authentication required'; end if;
  if p_player_name is null or length(trim(p_player_name)) not between 1 and 20
    or p_score is null or p_score not between 0 and 25000
    or p_rounds is distinct from 5
  then raise exception 'Invalid drone result'; end if;
  insert into public.geo_drone_best(player_id,player_name,score)
  values(v_player,trim(p_player_name),p_score)
  on conflict(player_id) do update set
    player_name=excluded.player_name,
    score=greatest(public.geo_drone_best.score,excluded.score),
    updated_at=case when excluded.score>public.geo_drone_best.score then now() else public.geo_drone_best.updated_at end;

  insert into public.geo_drone_weekly(player_id,week_start,player_name,score)
  values(v_player,v_week,trim(p_player_name),p_score)
  on conflict(player_id,week_start) do update set
    player_name=excluded.player_name,
    score=greatest(public.geo_drone_weekly.score,excluded.score),
    updated_at=case when excluded.score>public.geo_drone_weekly.score then now() else public.geo_drone_weekly.updated_at end;
end;
$$;
revoke all on function public.geo_submit_drone_score(text,integer,integer) from public,anon;
grant execute on function public.geo_submit_drone_score(text,integer,integer) to authenticated;
