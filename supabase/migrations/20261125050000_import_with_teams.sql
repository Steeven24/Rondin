-- Import that reuses teams by their code, so leaders and members carry over to the new survey.
-- p_groups: [{ "name", "source_sheet", "team_code": "G9" | null, "premises": [...] }]
create or replace function public.import_survey(
  p_name text,
  p_institution text,
  p_period text,
  p_groups jsonb
)
returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  v_survey_id uuid;
  v_group_id uuid;
  v_team_id uuid;
  v_group jsonb;
  v_position bigint;
begin
  if not public.is_coordinator() then
    raise exception 'Only coordinators can import surveys';
  end if;
  if exists (select 1 from public.surveys where status = 'active') then
    raise exception 'Close the active survey before importing a new one';
  end if;

  insert into public.surveys (name, institution, period, created_by)
  values (p_name, p_institution, p_period, auth.uid())
  returning id into v_survey_id;

  for v_group, v_position in select * from jsonb_array_elements(p_groups) with ordinality loop
    v_team_id := null;
    if v_group->>'team_code' is not null then
      -- Existing team: keep leader, members and invite code; refresh its display name.
      update public.teams set name = v_group->>'name'
      where code = v_group->>'team_code'
      returning id into v_team_id;
    end if;
    if v_team_id is null then
      insert into public.teams (code, name)
      values (v_group->>'team_code', v_group->>'name')
      returning id into v_team_id;
    end if;

    insert into public.groups (survey_id, team_id, name, source_sheet, position)
    values (v_survey_id, v_team_id, v_group->>'name', v_group->>'source_sheet', v_position)
    returning id into v_group_id;

    insert into public.premises (group_id, ruc, trade_name, owner_name, activity, address, phone, sector, value)
    select v_group_id, p->>'ruc', p->>'trade_name', p->>'owner_name', p->>'activity',
           p->>'address', p->>'phone', p->>'sector', p->>'value'
    from jsonb_array_elements(v_group->'premises') as p;
  end loop;

  return v_survey_id;
end $$;

create view public.group_progress
with (security_invoker = true)
as
select
  g.id as group_id,
  g.survey_id,
  g.name as group_name,
  g.position,
  t.id as team_id,
  t.code as team_code,
  t.leader_id,
  lp.full_name as leader_name,
  count(p.id) as total_premises,
  count(v.id) as visited,
  count(v.id) filter (where v.status = 'operating_with_permit') as with_permit,
  count(v.id) filter (where v.status = 'operating_without_permit') as without_permit,
  count(v.id) filter (where v.status = 'temporarily_closed') as closed,
  count(v.id) filter (where v.status = 'not_found') as not_found,
  count(v.id) filter (where v.status = 'not_visited') as not_visited
from public.groups g
join public.teams t on t.id = g.team_id
left join public.profiles lp on lp.id = t.leader_id
left join public.premises p on p.group_id = g.id
left join public.visits v on v.premise_id = p.id
group by g.id, t.id, lp.full_name;

revoke all on public.group_progress from anon;
revoke all on public.teams from anon;
