-- The source Excel has a VALOR column; keep it as imported so reports match the original file.
alter table public.premises add column value text check (char_length(value) <= 40);

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
begin
  if not public.is_coordinator() then
    raise exception 'Only coordinators can import surveys';
  end if;

  insert into public.surveys (name, institution, period, created_by)
  values (p_name, p_institution, p_period, auth.uid())
  returning id into v_survey_id;

  for v_group in select * from jsonb_array_elements(p_groups) loop
    insert into public.groups (survey_id, name, source_sheet)
    values (v_survey_id, v_group->>'name', v_group->>'source_sheet')
    returning id into v_group_id;

    insert into public.premises (group_id, ruc, trade_name, owner_name, activity, address, phone, sector, value)
    select v_group_id, p->>'ruc', p->>'trade_name', p->>'owner_name', p->>'activity',
           p->>'address', p->>'phone', p->>'sector', p->>'value'
    from jsonb_array_elements(v_group->'premises') as p;
  end loop;

  return v_survey_id;
end $$;
