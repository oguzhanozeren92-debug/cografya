-- Globriva: server-verified Street Detective scores.
-- Apply on the Globriva / Atlas Arena Supabase project only.
--
-- 1) geo_street_ticket_use: lets the Vercel API mark a round ticket as guessed
--    (once) and count hints for it. Called with the public anon key; it only
--    records random server-issued nonces, so it can't be used to change scores.
-- 2) geo_submit_street_country_score_v2: accepts a score ONLY with an HMAC
--    certificate from /api/street/finish, and each tour only once.
-- 3) The old client-trusted geo_submit_street_country_score is closed.
--
-- The HMAC secret is NOT in this file. After running it, run once:
--   insert into private.geo_secrets(name,value) values ('street_score','<GEO_SCORE_SECRET>')
--   on conflict (name) do update set value=excluded.value;
-- using the same value as the GEO_SCORE_SECRET environment variable on Vercel.

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.geo_secrets (
  name text primary key,
  value text not null check (char_length(value) >= 32)
);
revoke all on private.geo_secrets from public, anon, authenticated;

create table if not exists private.geo_street_ticket_uses (
  nonce text not null check (nonce ~ '^[0-9a-f-]{36}$'),
  kind text not null check (kind in ('guess','hint1','hint2','hint3','hint4')),
  created_at timestamptz not null default now(),
  primary key (nonce, kind)
);
create index if not exists geo_street_ticket_uses_age on private.geo_street_ticket_uses(created_at);
revoke all on private.geo_street_ticket_uses from public, anon, authenticated;

create table if not exists private.geo_street_used_tours (
  tour uuid primary key,
  player_id uuid not null,
  score integer not null,
  created_at timestamptz not null default now()
);
revoke all on private.geo_street_used_tours from public, anon, authenticated;

-- Returns -1 when a ticket is guessed a second time; otherwise the number of
-- hints registered for that ticket.
create or replace function public.geo_street_ticket_use(p_nonce text, p_kind text)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_rows integer;
begin
  if p_nonce is null or p_nonce !~ '^[0-9a-f-]{36}$'
     or p_kind is null or p_kind not in ('guess','hint1','hint2','hint3','hint4') then
    raise exception 'Invalid ticket use';
  end if;
  insert into private.geo_street_ticket_uses(nonce, kind) values (p_nonce, p_kind)
  on conflict do nothing;
  get diagnostics v_rows = row_count;
  if p_kind = 'guess' and v_rows = 0 then
    return -1;
  end if;
  -- Tickets live 45 minutes; keep a day of history and drop the rest.
  delete from private.geo_street_ticket_uses where created_at < now() - interval '1 day'
    and random() < 0.02;
  return (select count(*)::integer from private.geo_street_ticket_uses
          where nonce = p_nonce and kind like 'hint%');
end;
$$;
revoke all on function public.geo_street_ticket_use(text, text) from public;
grant execute on function public.geo_street_ticket_use(text, text) to anon, authenticated;

create or replace function public.geo_submit_street_country_score_v2(
  p_player_name text, p_tour uuid, p_score integer, p_exp bigint, p_sig text
) returns void language plpgsql security definer set search_path = '' as $$
declare
  v_player uuid := (select auth.uid());
  v_week date := ((now() at time zone 'UTC')::date - (extract(isodow from now() at time zone 'UTC')::integer - 1));
  v_secret text := (select value from private.geo_secrets where name = 'street_score');
  v_expected text;
begin
  if v_player is null then raise exception 'Authentication required'; end if;
  if v_secret is null then raise exception 'Score signing is not configured'; end if;
  if p_player_name is null or length(trim(p_player_name)) not between 1 and 20
     or p_tour is null or p_score is null or p_score not between 0 and 25000
     or p_exp is null or p_exp < extract(epoch from now())::bigint
     or p_sig is null or p_sig !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid result';
  end if;
  v_expected := encode(extensions.hmac(p_tour::text || '|' || p_score || '|' || p_exp, v_secret, 'sha256'), 'hex');
  if v_expected <> p_sig then raise exception 'Invalid result'; end if;

  insert into private.geo_street_used_tours(tour, player_id, score) values (p_tour, v_player, p_score);
  -- (a unique-violation here means this tour was already submitted)

  insert into public.geo_street_country_best(player_id, player_name, score)
  values (v_player, trim(p_player_name), p_score)
  on conflict (player_id) do update set
    player_name = excluded.player_name,
    score = greatest(public.geo_street_country_best.score, excluded.score),
    updated_at = case when excluded.score > public.geo_street_country_best.score then now() else public.geo_street_country_best.updated_at end;

  insert into public.geo_street_country_weekly(player_id, week_start, player_name, score)
  values (v_player, v_week, trim(p_player_name), p_score)
  on conflict (player_id, week_start) do update set
    player_name = excluded.player_name,
    score = greatest(public.geo_street_country_weekly.score, excluded.score),
    updated_at = case when excluded.score > public.geo_street_country_weekly.score then now() else public.geo_street_country_weekly.updated_at end;
end;
$$;
revoke all on function public.geo_submit_street_country_score_v2(text, uuid, integer, bigint, text) from public, anon;
grant execute on function public.geo_submit_street_country_score_v2(text, uuid, integer, bigint, text) to authenticated;

-- Close the old path where the app sent its own score.
revoke execute on function public.geo_submit_street_country_score(text, integer, integer) from authenticated;
-- Older distance league (no longer shown) also accepted client scores.
do $$ begin
  if to_regprocedure('public.geo_submit_street_score(text,integer,integer)') is not null then
    revoke execute on function public.geo_submit_street_score(text, integer, integer) from authenticated;
  end if;
end $$;
