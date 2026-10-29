-- Game "Tangga Konsultan Pajak" (hendrawanto.com/game/ukp/) — backend leaderboard online.
-- Semua tabel di skema ukp, RLS aktif TANPA policy: browser tidak bisa membaca/menulis langsung.
-- Akses hanya lewat Edge Function "ukp" yang memakai service role.

create schema if not exists ukp;
revoke all on schema ukp from anon, authenticated;
grant usage on schema ukp to service_role;

create table ukp.questions (
  id text primary key,
  sequence int not null,
  topic text not null,
  prompt text not null,
  options jsonb not null,
  correct_option_id text not null,
  explanation text not null,
  source jsonb,
  editorial_status text not null default 'draft'
    check (editorial_status in ('draft', 'terverifikasi', 'ditarik')),
  competition_eligible boolean not null default false,
  official_source_url text,
  verified_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint correct_in_options check (
    jsonb_path_exists(options, '$[*] ? (@.id == $c)', jsonb_build_object('c', correct_option_id))
  )
);

create table ukp.sessions (
  id uuid primary key,
  token_hash text not null,
  ip_hash text not null,
  state jsonb not null,
  phase text not null,
  bank_mode text not null check (bank_mode in ('draft', 'terverifikasi')),
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sessions_ip_created on ukp.sessions (ip_hash, created_at desc);
create index sessions_updated on ukp.sessions (updated_at);

create table ukp.leaderboard (
  session_id uuid primary key references ukp.sessions (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 24),
  score int not null check (score between 0 and 100),
  wrong_count int not null check (wrong_count >= 0),
  total_answer_ms bigint not null check (total_answer_ms >= 0),
  position int not null,
  bank_mode text not null,
  completed_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index leaderboard_rank on ukp.leaderboard
  (score desc, wrong_count asc, total_answer_ms asc, completed_at asc);
create index leaderboard_expires on ukp.leaderboard (expires_at);

alter table ukp.questions enable row level security;
alter table ukp.sessions enable row level security;
alter table ukp.leaderboard enable row level security;

grant select, insert, update, delete on all tables in schema ukp to service_role;

-- Pembersihan: entri leaderboard > 7 hari dan sesi > 3 hari dihapus.
create or replace function ukp.cleanup() returns void
language sql security definer set search_path = ukp as $$
  delete from ukp.leaderboard where expires_at < now();
  delete from ukp.sessions s
   where s.updated_at < now() - interval '3 days'
     and not exists (select 1 from ukp.leaderboard l where l.session_id = s.id);
$$;
revoke all on function ukp.cleanup() from public, anon, authenticated;
grant execute on function ukp.cleanup() to service_role;
