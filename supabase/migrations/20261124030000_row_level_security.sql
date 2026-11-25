-- Row Level Security: each role only reads and writes the data of its own group.
-- Coordinator: everything. Leader: own group. Member: only premises assigned to them.

alter table public.surveys enable row level security;
alter table public.groups enable row level security;
alter table public.profiles enable row level security;
alter table public.premises enable row level security;
alter table public.visits enable row level security;
alter table public.photos enable row level security;

-- Anonymous users get nothing.
revoke all on all tables in schema public from anon;

-- Profiles: only the profile owner may edit, and only these columns.
-- Role and group are changed by the server (service role) when the coordinator assigns them.
revoke update on public.profiles from authenticated;
grant update (full_name, national_id, privacy_accepted_at) on public.profiles to authenticated;

create policy profiles_select on public.profiles for select to authenticated using (
  id = auth.uid()
  or public.is_coordinator()
  or (public.auth_role() = 'leader' and group_id = public.auth_group_id())
);
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Surveys and groups.
create policy surveys_select on public.surveys for select to authenticated using (
  public.is_coordinator()
  or id = (select g.survey_id from public.groups g where g.id = public.auth_group_id())
);
create policy surveys_write on public.surveys for all to authenticated
  using (public.is_coordinator()) with check (public.is_coordinator());

create policy groups_select on public.groups for select to authenticated
  using (public.is_coordinator() or id = public.auth_group_id());
create policy groups_write on public.groups for all to authenticated
  using (public.is_coordinator()) with check (public.is_coordinator());

-- Premises: leaders can only change the assignment and sector of their own group.
revoke update on public.premises from authenticated;
grant update (assigned_to, sector) on public.premises to authenticated;

create policy premises_select on public.premises for select to authenticated using (
  public.is_coordinator()
  or (public.auth_role() = 'leader' and group_id = public.auth_group_id())
  or assigned_to = auth.uid()
);
create policy premises_insert on public.premises for insert to authenticated
  with check (public.is_coordinator());
create policy premises_delete on public.premises for delete to authenticated
  using (public.is_coordinator());
create policy premises_update on public.premises for update to authenticated
  using (public.is_coordinator() or (public.auth_role() = 'leader' and group_id = public.auth_group_id()))
  with check (public.is_coordinator() or (public.auth_role() = 'leader' and group_id = public.auth_group_id()));
