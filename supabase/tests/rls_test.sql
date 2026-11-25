-- RLS tests. Run with: supabase test db
begin;
select plan(9);

-- Fixtures (as postgres, RLS bypassed).
insert into auth.users (id, email) values
  ('10000000-0000-4000-8000-000000000001', 'leader.a@test.local'),
  ('10000000-0000-4000-8000-000000000002', 'member1.a@test.local'),
  ('10000000-0000-4000-8000-000000000003', 'member2.a@test.local'),
  ('10000000-0000-4000-8000-000000000004', 'leader.b@test.local');

insert into public.surveys (id, name, created_by)
values ('20000000-0000-4000-8000-000000000001', 'Test survey', '00000000-0000-4000-8000-000000000001');

insert into public.groups (id, survey_id, name) values
  ('30000000-0000-4000-8000-00000000000a', '20000000-0000-4000-8000-000000000001', 'Group A'),
  ('30000000-0000-4000-8000-00000000000b', '20000000-0000-4000-8000-000000000001', 'Group B');

insert into public.profiles (id, full_name, email, role, group_id) values
  ('10000000-0000-4000-8000-000000000001', 'Leader A', 'leader.a@test.local', 'leader', '30000000-0000-4000-8000-00000000000a'),
  ('10000000-0000-4000-8000-000000000002', 'Member One', 'member1.a@test.local', 'member', '30000000-0000-4000-8000-00000000000a'),
  ('10000000-0000-4000-8000-000000000003', 'Member Two', 'member2.a@test.local', 'member', '30000000-0000-4000-8000-00000000000a'),
  ('10000000-0000-4000-8000-000000000004', 'Leader B', 'leader.b@test.local', 'leader', '30000000-0000-4000-8000-00000000000b');

insert into public.premises (id, group_id, ruc, assigned_to) values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-00000000000a', '1800000000001', '10000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-00000000000a', '1800000000002', null),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-00000000000b', '1800000000003', null);

create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

set local role authenticated;

select pg_temp.login('10000000-0000-4000-8000-000000000002');
select is((select count(*) from public.premises), 1::bigint, 'member sees only assigned premises');
select lives_ok($$ insert into public.visits (premise_id, group_id, user_id, status)
  values ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-00000000000a',
          '10000000-0000-4000-8000-000000000002', 'operating_without_permit') $$,
  'member can record a visit for an assigned premise');
select throws_ok($$ insert into public.visits (premise_id, group_id, user_id, status)
  values ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-00000000000a',
          '10000000-0000-4000-8000-000000000002', 'not_found') $$,
  '42501', null, 'member cannot record a visit for an unassigned premise');
select throws_ok($$ update public.profiles set role = 'coordinator' where id = auth.uid() $$,
  '42501', null, 'member cannot change their own role');
select throws_ok($$ select public.import_survey('x', null, null, '[]'::jsonb) $$,
  'P0001', 'Only coordinators can import surveys', 'member cannot import');

select pg_temp.login('10000000-0000-4000-8000-000000000003');
select is((select count(*) from public.visits), 0::bigint, 'member does not see visits of others');

select pg_temp.login('10000000-0000-4000-8000-000000000001');
select is((select count(*) from public.premises), 2::bigint, 'leader sees premises of own group');
select is((select count(*) from public.visits), 1::bigint, 'leader sees visits of own group');

select pg_temp.login('10000000-0000-4000-8000-000000000004');
select is((select count(*) from public.premises), 1::bigint, 'leader does not see other groups');

select * from finish();
rollback;
