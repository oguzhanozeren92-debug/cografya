-- Globriva VS 2 questions per bucket across five geography topic families. Existing rooms unchanged.
CREATE OR REPLACE FUNCTION public.geo_vs_create(p_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 uid uuid := auth.uid();
 clean_name text := left(btrim(coalesce(p_name,'')),20);
 bank jsonb;
 new_code text;
begin
 if uid is null then raise exception 'VS oynamak için oyuncu oturumu açılmalı.'; end if;
 if char_length(clean_name)<2 then raise exception 'Takma ad en az 2 karakter olmalı.'; end if;
 if (select count(*) from public.geo_vs_rooms where host_id=uid and created_at>now()-interval '1 hour')>=8 then
  raise exception 'Çok fazla oda oluşturdun. Daha sonra yeniden dene.';
 end if;
 select jsonb_agg(jsonb_build_object('id',q.id,'topic',q.topic,'question',q.question,'choices',to_jsonb(q.choices),'correctIndex',q.correct_index) order by q.rank)
 into bank from (select row_number() over () as rank,x.* from (select id,topic,question,choices,correct_index from (
    select q.*,row_number() over (
      partition by case
       when topic='Başkent' then 'capital'
       when topic in ('Doğa','Dünya') then 'nature'
       when topic in ('Harita','Türkiye') then 'map'
       when topic='Yapılar' then 'landmarks'
       else 'continents'
      end order by random()
    ) as bucket_rank
    from public.geo_vs_question_bank q
  ) grouped where bucket_rank <= 2 order by random()) x) q;
 if jsonb_array_length(coalesce(bank,'[]'::jsonb))<>10 then
  raise exception 'VS soru havuzu henüz hazır değil.';
 end if;
 for i in 1..5 loop
  new_code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
  insert into public.geo_vs_rooms(code,host_id,host_name,questions) values(new_code,uid,clean_name,bank) on conflict do nothing;
  if found then return new_code; end if;
 end loop;
 raise exception 'Oda kodu oluşturulamadı; yeniden dene.';
end;
$function$;
