-- RLS by team: leaders and members only work on their team's group of the ACTIVE survey.
-- Closed surveys are read-only history for the coordinator.

create or replace function public.auth_team_id()
returns uuid
language sql stable security definer set search_path = ''
as $$ select team_id from public.profiles where id = auth.uid() $$;

-- The group of the user's team in the active survey (null when there is none).
create or replace function public.auth_group_id()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select g.id
  from public.groups g
  join public.surveys s on s.id = g.survey_id
  where g.team_id = public.auth_team_id() and s.status = 'active'
$$;

-- A premise can only be assigned to someone of the team that owns its group.
create or replace function public.check_premise_assignment()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.assigned_to is not null and not exists (
    select 1 from public.profiles p
    join public.groups g on g.team_id = p.team_id
    where p.id = new.assigned_to and g.id = new.group_id
  ) then
    raise exception 'Assignee must belong to the same group';
  end if;
  return new;
end $$;

create policy teams_select on public.teams for select to authenticated
  using (public.is_coordinator() or id = public.auth_team_id());
create policy teams_write on public.teams for all to authenticated
  using (public.is_coordinator()) with check (public.is_coordinator());

drop policy profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (
  id = auth.uid()
  or public.is_coordinator()
  or (public.auth_role() = 'leader' and team_id = public.auth_team_id())
);

drop policy premises_select on public.premises;
create policy premises_select on public.premises for select to authenticated using (
  public.is_coordinator()
  or (public.auth_role() = 'leader' and group_id = public.auth_group_id())
  or (assigned_to = auth.uid() and group_id = public.auth_group_id())
);

drop policy visits_select on public.visits;
create policy visits_select on public.visits for select to authenticated using (
  public.is_coordinator()
  or (public.auth_role() = 'leader' and group_id = public.auth_group_id())
  or (user_id = auth.uid() and group_id = public.auth_group_id())
);

drop policy visits_insert on public.visits;
create policy visits_insert on public.visits for insert to authenticated with check (
  public.auth_role() = 'member'
  and exists (
    select 1 from public.premises p
    where p.id = premise_id and p.assigned_to = auth.uid() and p.group_id = public.auth_group_id()
  )
);

drop policy visits_update on public.visits;
create policy visits_update on public.visits for update to authenticated
  using (
    group_id = public.auth_group_id()
    and ((user_id = auth.uid() and review_status <> 'approved') or public.auth_role() = 'leader')
  )
  with check (
    group_id = public.auth_group_id()
    and (user_id = auth.uid() or public.auth_role() = 'leader')
  );

-- Leader, invite code and membership now live on the team.
drop view public.group_progress;
alter table public.groups drop column leader_id, drop column invite_code;
alter table public.profiles drop column group_id;
