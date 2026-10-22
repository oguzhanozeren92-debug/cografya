-- Globriva: equal-chance weekly 5-photo league, starting Monday 2026-10-26 UTC.
-- Retain all-time personal BEST for unlimited practice. Weekly score is the
-- FIRST completed five-photo round, not the sum or the best of unlimited retries.
-- The previous week is untouched, and no existing scores are deleted.
-- NOTE: browser-submitted scores can still be falsified; no prize eligibility.

create or replace function public.geo_submit_drone_score(
  p_player_name text, p_score integer, p_rounds integer
) returns void language plpgsql security definer set search_path='' as $$
declare
  v_player uuid := (select auth.uid());
  v_week date := ((now() at time zone 'UTC')::date -
    (extract(isodow from now() at time zone 'UTC')::integer - 1));
begin
  if v_player is null then raise exception 'Authentication required'; end if;
  if p_player_name is null or length(trim(p_player_name)) not between 1 and 20
    or p_score is null or p_score not between 0 and 25000
    or p_rounds is distinct from 5
  then raise exception 'Invalid drone result'; end if;

  insert into public.geo_drone_best(player_id, player_name, score)
  values(v_player, trim(p_player_name), p_score)
  on conflict(player_id) do update set
    player_name = excluded.player_name,
    score = greatest(public.geo_drone_best.score, excluded.score),
    updated_at = case when excluded.score > public.geo_drone_best.score
      then now() else public.geo_drone_best.updated_at end;

  if v_week >= date '2026-10-26' then
    insert into public.geo_drone_weekly(player_id, week_start, player_name, score)
    values(v_player, v_week, trim(p_player_name), p_score)
    on conflict(player_id, week_start) do nothing;
  else
    insert into public.geo_drone_weekly(player_id, week_start, player_name, score)
    values(v_player, v_week, trim(p_player_name), p_score)
    on conflict(player_id, week_start) do update set
      player_name = excluded.player_name,
      score = greatest(public.geo_drone_weekly.score, excluded.score),
      updated_at = case when excluded.score > public.geo_drone_weekly.score
        then now() else public.geo_drone_weekly.updated_at end;
  end if;
end;
$$;

revoke all on function public.geo_submit_drone_score(text, integer, integer) from public, anon;
grant execute on function public.geo_submit_drone_score(text, integer, integer) to authenticated;

create or replace function public.geo_submit_street_country_score(
  p_player_name text, p_score integer, p_rounds integer
) returns void language plpgsql security definer set search_path='' as $$
declare
  v_player uuid := (select auth.uid());
  v_week date := ((now() at time zone 'UTC')::date -
    (extract(isodow from now() at time zone 'UTC')::integer - 1));
begin
  if v_player is null then raise exception 'Authentication required'; end if;
  if p_player_name is null or length(trim(p_player_name)) not between 1 and 20
    or p_score is null or p_score not between 0 and 25000
    or p_rounds is distinct from 5
  then raise exception 'Invalid street result'; end if;

  insert into public.geo_street_country_best(player_id, player_name, score)
  values(v_player, trim(p_player_name), p_score)
  on conflict(player_id) do update set
    player_name = excluded.player_name,
    score = greatest(public.geo_street_country_best.score, excluded.score),
    updated_at = case when excluded.score > public.geo_street_country_best.score
      then now() else public.geo_street_country_best.updated_at end;

  if v_week >= date '2026-10-26' then
    insert into public.geo_street_country_weekly(player_id, week_start, player_name, score)
    values(v_player, v_week, trim(p_player_name), p_score)
    on conflict(player_id, week_start) do nothing;
  else
    insert into public.geo_street_country_weekly(player_id, week_start, player_name, score)
    values(v_player, v_week, trim(p_player_name), p_score)
    on conflict(player_id, week_start) do update set
      player_name = excluded.player_name,
      score = greatest(public.geo_street_country_weekly.score, excluded.score),
      updated_at = case when excluded.score > public.geo_street_country_weekly.score
        then now() else public.geo_street_country_weekly.updated_at end;
  end if;
end;
$$;

revoke all on function public.geo_submit_street_country_score(text, integer, integer) from public, anon;
grant execute on function public.geo_submit_street_country_score(text, integer, integer) to authenticated;
