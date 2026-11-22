-- =====================================================================
-- 가치작명소: 가족 투표 결과 모아 보기 (Supabase → SQL Editor에 붙여넣고 Run, 한 번만)
-- 저장하는 것: 투표 링크 번호, 호칭(엄마·할머니 등), 고른 후보 번호, 시각 — 이름·생년월일은 저장하지 않음
-- 이 SQL을 실행하지 않아도 투표는 '카톡으로 답장 보내기' 방식으로 동작합니다
-- =====================================================================
create table if not exists public.family_votes (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  poll        text not null check (poll ~ '^[a-z0-9]{10}$'),
  who         text not null check (char_length(who) between 1 and 12),
  picks       text not null check (picks ~ '^[0-4](,[0-4]){0,4}$')
);
create index if not exists family_votes_poll on public.family_votes (poll);
-- 같은 투표에서 같은 호칭(엄마·아빠 등)은 한 번만 (공백은 무시하고 비교)
create unique index if not exists family_votes_poll_who on public.family_votes (poll, (replace(who, ' ', '')));
alter table public.family_votes enable row level security;

-- 누구나 투표(추가)만 가능 · 목록 전체 읽기는 막음
drop policy if exists "anyone can vote" on public.family_votes;
create policy "anyone can vote" on public.family_votes for insert to anon, authenticated with check (true);
grant insert on public.family_votes to anon, authenticated;

-- 결과는 '링크 번호를 아는 사람'만 그 투표의 결과를 읽을 수 있게 함수로만 제공
create or replace function public.vote_tally(p_poll text)
returns table (who text, picks text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select v.who, v.picks, v.created_at from public.family_votes v
  where v.poll = p_poll and v.created_at > now() - interval '1 year'
  order by v.created_at limit 200
$$;
revoke all on function public.vote_tally(text) from public;
grant execute on function public.vote_tally(text) to anon, authenticated;
