CREATE OR REPLACE FUNCTION public.ukp_recent_orders_v3(p_player_hash text,p_level text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'ukp' AS $function$
with recent_sessions as (
 select s.state from ukp.sessions s
 where s.player_hash=p_player_hash and s.level=upper(p_level)
 and jsonb_typeof(s.state->'order')='array' and jsonb_array_length(s.state->'order')=100
 order by s.created_at desc,s.id desc
 limit (select greatest(1,count(*)::int/100-1) from ukp.questions where level=upper(p_level) and editorial_status<>'ditarik')
), recent_ids as (select distinct jsonb_array_elements_text(state->'order') id from recent_sessions)
select coalesce(jsonb_agg(id order by id),'[]'::jsonb) from recent_ids;
$function$;
CREATE OR REPLACE FUNCTION public.ukp_session_create_v3(p_id uuid, p_token_hash text, p_ip_hash text, p_player_hash text, p_state jsonb, p_phase text, p_bank_mode text, p_level text, p_limit integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'ukp'
AS $function$
declare n int;
begin
  if char_length(p_player_hash)<>64 then raise exception 'invalid player hash'; end if;
  if p_level not in ('A','B','C') or p_state->>'level'<>p_level then raise exception 'invalid game level'; end if;
  perform pg_advisory_xact_lock(hashtext(p_player_hash || p_level));
  if p_state ? 'rotationHistory' and p_state->'rotationHistory' <> public.ukp_recent_orders_v3(p_player_hash,p_level) then
    raise exception 'package_rotation_conflict';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));
  select count(*) into n from ukp.sessions
   where ip_hash=p_ip_hash and created_at>now()-interval '1 hour';
  if n>=p_limit then return false; end if;
  insert into ukp.sessions(id,token_hash,ip_hash,player_hash,state,phase,bank_mode,level)
  values(p_id,p_token_hash,p_ip_hash,p_player_hash,p_state,p_phase,p_bank_mode,p_level);
  return true;
end
$function$;
