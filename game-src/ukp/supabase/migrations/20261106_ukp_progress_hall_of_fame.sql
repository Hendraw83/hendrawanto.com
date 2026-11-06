-- Keputusan Aa Hendra 6 Nov 2026: Hall of Fame menampilkan SEMUA pemain yang sudah menjawab minimal 1 soal.
-- Progres disimpan permanen di tabel terpisah (tidak ikut dibersihkan bersama sesi 3 hari).
-- Edge Function "ukp" v16 memanggil ukp_progress_upsert setiap sesi tersimpan dan memakai ukp_leaderboard_list_v3.
create table if not exists ukp.progress (
  session_id uuid primary key,
  level text not null check (level in ('A','B','C')),
  player_hash text not null,
  display_name text not null,
  score int not null,
  wrong_count int not null,
  total_answer_ms bigint not null,
  position int not null,
  phase text not null,
  updated_at timestamptz not null default now()
);
alter table ukp.progress enable row level security;
revoke all on ukp.progress from public, anon, authenticated;
create index if not exists progress_level_player on ukp.progress(level, player_hash, score desc);

create or replace function public.ukp_progress_upsert(p_session uuid, p_level text, p_player_hash text, p_name text,
  p_score int, p_wrong int, p_ms bigint, p_position int, p_phase text)
returns boolean language plpgsql security definer set search_path = ukp as $$
begin
  if p_score + p_wrong < 1 then return false; end if;
  if p_level not in ('A','B','C') or char_length(p_player_hash) <> 64 then raise exception 'invalid progress'; end if;
  insert into ukp.progress(session_id,level,player_hash,display_name,score,wrong_count,total_answer_ms,position,phase,updated_at)
  values(p_session,p_level,p_player_hash,left(p_name,24),p_score,p_wrong,p_ms,p_position,p_phase,now())
  on conflict(session_id) do update set display_name=excluded.display_name, score=excluded.score,
    wrong_count=excluded.wrong_count, total_answer_ms=excluded.total_answer_ms, position=excluded.position,
    phase=excluded.phase, updated_at=now();
  return true;
end $$;
revoke all on function public.ukp_progress_upsert(uuid,text,text,text,int,int,bigint,int,text) from public, anon, authenticated;
grant execute on function public.ukp_progress_upsert(uuid,text,text,text,int,int,bigint,int,text) to service_role;

-- Gabungan entri klaim + progres pemain yang belum klaim (sesi terbaik per pemain per level).
create or replace function public.ukp_leaderboard_list_v3(p_limit int, p_level text)
returns jsonb language sql security definer set search_path = ukp as $$
  with claimed as (
    select session_id id, display_name, score, wrong_count, total_answer_ms, position, completed_at at_time, 'klaim'::text status
    from ukp.leaderboard where level = p_level
  ), prog as (
    select distinct on (p.player_hash) p.session_id id, p.display_name, p.score, p.wrong_count, p.total_answer_ms,
           p.position, p.updated_at at_time, 'bermain'::text status
    from ukp.progress p
    where p.level = p_level and not exists (select 1 from ukp.leaderboard l where l.session_id = p.session_id)
    order by p.player_hash, p.score desc, p.wrong_count, p.total_answer_ms, p.updated_at desc
  ), allrows as (
    select * from claimed union all select * from prog
    order by score desc, wrong_count, total_answer_ms, at_time limit p_limit
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',id,'level',p_level,'displayName',display_name,'score',score,'wrongCount',wrong_count,
    'totalAnswerMs',total_answer_ms,'position',position,'status',status,
    'completedAt',floor(extract(epoch from at_time)*1000),
    'expiresAt',floor(extract(epoch from timestamptz '2999-12-31')*1000))
    order by score desc, wrong_count, total_answer_ms, at_time),'[]'::jsonb)
  from allrows;
$$;
revoke all on function public.ukp_leaderboard_list_v3(int,text) from public, anon, authenticated;
grant execute on function public.ukp_leaderboard_list_v3(int,text) to service_role;
