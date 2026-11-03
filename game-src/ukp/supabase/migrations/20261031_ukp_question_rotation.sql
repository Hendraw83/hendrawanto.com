-- Rotasi dua paket: 200 soal di bank, 100 soal unik per sesi.
-- player_hash dibentuk server dari ID anonim perangkat + nama pemain + secret salt.

alter table ukp.sessions add column if not exists player_hash text;
create index if not exists sessions_player_created
  on ukp.sessions (player_hash, created_at desc)
  where player_hash is not null;

create or replace function public.ukp_last_order(p_player_hash text)
returns jsonb language sql stable security definer set search_path = ukp as $$
  select coalesce((
    select state->'order'
      from ukp.sessions
     where player_hash = p_player_hash
       and jsonb_typeof(state->'order') = 'array'
       and jsonb_array_length(state->'order') = 100
     order by created_at desc
     limit 1
  ), '[]'::jsonb);
$$;

create or replace function public.ukp_session_create_v2(
  p_id uuid, p_token_hash text, p_ip_hash text, p_player_hash text,
  p_state jsonb, p_phase text, p_bank_mode text, p_limit int)
returns boolean language plpgsql security definer set search_path = ukp as $$
declare n int;
begin
  if char_length(p_player_hash) <> 64 then
    raise exception 'invalid player hash';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));
  select count(*) into n from ukp.sessions
   where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
  if n >= p_limit then return false; end if;
  insert into ukp.sessions (id, token_hash, ip_hash, player_hash, state, phase, bank_mode)
  values (p_id, p_token_hash, p_ip_hash, p_player_hash, p_state, p_phase, p_bank_mode);
  return true;
end $$;

revoke all on function public.ukp_last_order(text) from public, anon, authenticated;
revoke all on function public.ukp_session_create_v2(uuid,text,text,text,jsonb,text,text,int) from public, anon, authenticated;
grant execute on function public.ukp_last_order(text) to service_role;
grant execute on function public.ukp_session_create_v2(uuid,text,text,text,jsonb,text,text,int) to service_role;
