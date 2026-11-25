-- Teams persist across surveys: a team (G1, G2, ...) keeps its leader, members and invite code.
-- Each survey has one group per team with that survey's premises.

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  -- Code read from the sheet name, e.g. "(G9) LA MATRIZ" -> "G9". Null when the sheet has no code.
  code text unique check (code ~ '^G\d{1,3}$'),
  name text not null check (char_length(name) between 1 and 80),
  leader_id uuid references auth.users (id) on delete set null,
  invite_code text not null unique default public.generate_invite_code(),
  created_at timestamptz not null default now()
);
alter table public.teams enable row level security;

-- Surveys are active until the coordinator closes them; closed ones stay as read-only history.
alter table public.surveys
  add column status text not null default 'active' check (status in ('active', 'closed')),
  add column closed_at timestamptz;
create unique index surveys_one_active on public.surveys ((true)) where status = 'active';

alter table public.groups add column team_id uuid references public.teams (id) on delete restrict;
alter table public.profiles add column team_id uuid references public.teams (id) on delete set null;

-- Backfill: one team per existing group code (or per group when there is no code).
do $$
declare
  g record;
  v_code text;
  v_team uuid;
begin
  for g in select * from public.groups order by survey_id, position loop
    v_code := (select 'G' || m[1] from regexp_match(g.name, '\(\s*G\s*(\d{1,3})\s*\)', 'i') as m);
    select id into v_team from public.teams where code = v_code;
    if v_team is null then
      insert into public.teams (code, name, leader_id, invite_code)
      values (v_code, g.name, g.leader_id, g.invite_code)
      returning id into v_team;
    end if;
    update public.groups set team_id = v_team where id = g.id;
    update public.profiles set team_id = v_team where group_id = g.id;
  end loop;
end $$;

-- Only the newest survey stays active.
update public.surveys set status = 'closed', closed_at = now()
where id <> (select id from public.surveys order by created_at desc limit 1);

alter table public.groups alter column team_id set not null;
create unique index groups_one_per_team on public.groups (survey_id, team_id);
create index profiles_team_idx on public.profiles (team_id);
