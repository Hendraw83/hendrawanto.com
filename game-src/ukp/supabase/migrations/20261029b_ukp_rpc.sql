-- Fungsi RPC untuk Edge Function "ukp" (dipanggil lewat PostgREST dengan service role).
-- Semua SECURITY DEFINER, hanya service_role yang boleh mengeksekusi.

create or replace function public.ukp_bank(p_verified boolean)
returns jsonb language sql stable security definer set search_path = ukp as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'sequence', sequence, 'topic', topic, 'prompt', prompt, 'options', options,
    'correctOptionId', correct_option_id, 'explanation', explanation, 'source', source)
    order by sequence), '[]'::jsonb)
  from ukp.questions
  where case when p_verified then editorial_status = 'terverifikasi' and competition_eligible
             else editorial_status <> 'ditarik' end;
$$;

create or replace function public.ukp_session_get(p_id uuid)
returns jsonb language sql stable security definer set search_path = ukp as $$
  select jsonb_build_object('id', id, 'token_hash', token_hash, 'state', state,
                            'version', version, 'bank_mode', bank_mode)
  from ukp.sessions where id = p_id;
$$;

create or replace function public.ukp_session_create(
  p_id uuid, p_token_hash text, p_ip_hash text, p_state jsonb, p_phase text, p_bank_mode text, p_limit int)
returns boolean language plpgsql security definer set search_path = ukp as $$
declare n int;
begin
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));
  select count(*) into n from ukp.sessions
   where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
  if n >= p_limit then return false; end if;
  insert into ukp.sessions (id, token_hash, ip_hash, state, phase, bank_mode)
  values (p_id, p_token_hash, p_ip_hash, p_state, p_phase, p_bank_mode);
  return true;
end $$;

create or replace function public.ukp_session_save(p_id uuid, p_version int, p_state jsonb, p_phase text)
returns boolean language plpgsql security definer set search_path = ukp as $$
begin
  update ukp.sessions set state = p_state, phase = p_phase, version = version + 1, updated_at = now()
   where id = p_id and version = p_version;
  return found;
end $$;

create or replace function public.ukp_leaderboard_list(p_limit int)
returns jsonb language plpgsql security definer set search_path = ukp as $$
declare out jsonb;
begin
  delete from ukp.leaderboard where expires_at < now();
  select coalesce(jsonb_agg(e order by e.score desc, e.wrong_count asc, e.total_answer_ms asc, e.completed_at asc), '[]'::jsonb)
    into out
  from (
    select session_id, display_name, score, wrong_count, total_answer_ms, position, completed_at, expires_at
      from ukp.leaderboard
     order by score desc, wrong_count asc, total_answer_ms asc, completed_at asc
     limit p_limit
  ) e;
  return (select coalesce(jsonb_agg(jsonb_build_object(
      'id', x->>'session_id', 'displayName', x->>'display_name', 'score', (x->>'score')::int,
      'wrongCount', (x->>'wrong_count')::int, 'totalAnswerMs', (x->>'total_answer_ms')::bigint,
      'position', (x->>'position')::int,
      'completedAt', floor(extract(epoch from (x->>'completed_at')::timestamptz) * 1000),
      'expiresAt', floor(extract(epoch from (x->>'expires_at')::timestamptz) * 1000))
      order by ord), '[]'::jsonb)
    from jsonb_array_elements(out) with ordinality as t(x, ord));
end $$;

create or replace function public.ukp_claim(
  p_session uuid, p_name text, p_score int, p_wrong int, p_ms bigint, p_position int,
  p_bank_mode text, p_completed_ms bigint, p_expires_ms bigint)
returns boolean language plpgsql security definer set search_path = ukp as $$
declare old_score int;
begin
  select score into old_score from ukp.leaderboard where session_id = p_session for update;
  if old_score is not null and old_score >= p_score then return false; end if;
  insert into ukp.leaderboard (session_id, display_name, score, wrong_count, total_answer_ms,
                               position, bank_mode, completed_at, expires_at)
  values (p_session, p_name, p_score, p_wrong, p_ms, p_position, p_bank_mode,
          to_timestamp(p_completed_ms / 1000.0), to_timestamp(p_expires_ms / 1000.0))
  on conflict (session_id) do update set display_name = excluded.display_name,
    score = excluded.score, wrong_count = excluded.wrong_count,
    total_answer_ms = excluded.total_answer_ms, position = excluded.position,
    completed_at = excluded.completed_at, expires_at = excluded.expires_at;
  -- sesi lama yang tak masuk leaderboard dibersihkan sesekali
  if random() < 0.05 then perform ukp.cleanup(); end if;
  return true;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'ukp_bank(boolean)', 'ukp_session_get(uuid)',
    'ukp_session_create(uuid,text,text,jsonb,text,text,int)',
    'ukp_session_save(uuid,int,jsonb,text)', 'ukp_leaderboard_list(int)',
    'ukp_claim(uuid,text,int,int,bigint,int,text,bigint,bigint)']
  loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;
