-- Helper functions used by RLS policies, plus integrity triggers.
-- Helpers are SECURITY DEFINER so they can read profiles without recursing into its own policies.

create or replace function public.auth_role()
returns public.user_role
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.auth_group_id()
returns uuid
language sql stable security definer set search_path = ''
as $$ select group_id from public.profiles where id = auth.uid() $$;

create or replace function public.is_coordinator()
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(public.auth_role() = 'coordinator', false) $$;

-- Readable invite code such as "G3-7KQ2XM" (no ambiguous characters like 0/O or 1/I).
create or replace function public.generate_invite_code()
returns text
language plpgsql volatile set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
begin
  for i in 1..8 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return code;
end $$;

alter table public.groups alter column invite_code set default public.generate_invite_code();

-- A premise can only be assigned to a member of the same group.
create or replace function public.check_premise_assignment()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.assigned_to is not null and not exists (
    select 1 from public.profiles p where p.id = new.assigned_to and p.group_id = new.group_id
  ) then
    raise exception 'Assignee must belong to the same group';
  end if;
  return new;
end $$;

create trigger premises_check_assignment
before insert or update of assigned_to on public.premises
for each row execute function public.check_premise_assignment();

-- Visits: author and group come from the server, never from the client.
-- A member editing a visit sends it back to review; members can't touch review fields.
create or replace function public.prepare_visit()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if public.auth_role() = 'member' then
    new.user_id := auth.uid();
    new.review_status := 'pending';
    new.review_comment := case when tg_op = 'UPDATE' then old.review_comment end;
    new.reviewed_by := null;
    new.reviewed_at := null;
  end if;
  select group_id into new.group_id from public.premises where id = new.premise_id;
  new.updated_at := now();
  return new;
end $$;

create trigger visits_prepare
before insert or update on public.visits
for each row execute function public.prepare_visit();
