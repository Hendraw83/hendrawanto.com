-- Keputusan Aa Hendra 6 Nov 2026: Hall of Fame berlaku permanen (tanpa batas 7 hari).
-- Trigger memaksa tanggal kedaluwarsa jauh di masa depan untuk setiap entri baru/ubahan,
-- apa pun yang dikirim Edge Function. "delete ... where expires_at < now()" di fungsi lama jadi tidak menghapus apa pun.
create or replace function ukp.leaderboard_permanent() returns trigger
language plpgsql set search_path = ukp as $$
begin
  new.expires_at := timestamptz '2999-12-31 00:00:00+00';
  return new;
end $$;
revoke all on function ukp.leaderboard_permanent() from public, anon, authenticated;

drop trigger if exists leaderboard_permanent on ukp.leaderboard;
create trigger leaderboard_permanent before insert or update on ukp.leaderboard
  for each row execute function ukp.leaderboard_permanent();

update ukp.leaderboard set expires_at = timestamptz '2999-12-31 00:00:00+00';
