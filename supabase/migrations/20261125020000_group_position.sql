-- Keep groups in the same order as the sheets of the source Excel (G1, G2, ... G10, G11),
-- instead of sorting their names as text (G1, G10, G11, G2, ...).
alter table public.groups add column position integer not null default 0;

-- Existing groups: order by the number in their name ("G9 La Matriz" -> 9, "Grupo 10" -> 10).
update public.groups g
set position = ordered.rn
from (
  select id, row_number() over (
    partition by survey_id
    order by nullif(substring(name from '\d+'), '')::int nulls last, name
  ) as rn
  from public.groups
) as ordered
where ordered.id = g.id;

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
  v_group jsonb;
  v_position bigint;
begin
  if not public.is_coordinator() then
    raise exception 'Only coordinators can import surveys';
  end if;

  insert into public.surveys (name, institution, period, created_by)
  values (p_name, p_institution, p_period, auth.uid())
  returning id into v_survey_id;

  for v_group, v_position in select * from jsonb_array_elements(p_groups) with ordinality loop
    insert into public.groups (survey_id, name, source_sheet, position)
    values (v_survey_id, v_group->>'name', v_group->>'source_sheet', v_position)
    returning id into v_group_id;

    insert into public.premises (group_id, ruc, trade_name, owner_name, activity, address, phone, sector, value)
    select v_group_id, p->>'ruc', p->>'trade_name', p->>'owner_name', p->>'activity',
           p->>'address', p->>'phone', p->>'sector', p->>'value'
    from jsonb_array_elements(v_group->'premises') as p;
  end loop;

  return v_survey_id;
end $$;

-- New columns can only be added at the end of an existing view.
create or replace view public.group_progress
with (security_invoker = true)
as
select
  g.id as group_id,
  g.survey_id,
  g.name as group_name,
  g.leader_id,
  lp.full_name as leader_name,
  count(p.id) as total_premises,
  count(v.id) as visited,
  count(v.id) filter (where v.status = 'operating_with_permit') as with_permit,
  count(v.id) filter (where v.status = 'operating_without_permit') as without_permit,
  count(v.id) filter (where v.status = 'temporarily_closed') as closed,
  count(v.id) filter (where v.status = 'not_found') as not_found,
  count(v.id) filter (where v.status = 'not_visited') as not_visited,
  g.position
from public.groups g
left join public.profiles lp on lp.id = g.leader_id
left join public.premises p on p.group_id = g.id
left join public.visits v on v.premise_id = p.id
group by g.id, lp.full_name;
