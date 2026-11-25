-- RLS tests. Run with: supabase test db
begin;
select plan(14);

-- Fixtures (as postgres, RLS bypassed): two teams, an active survey and a closed one.
-- Existing local data is closed temporarily; everything is rolled back at the end.
update public.surveys set status = 'closed';
insert into auth.users (id, email) values
  ('10000000-0000-4000-8000-000000000001', 'leader.a@test.local'),
  ('10000000-0000-4000-8000-000000000002', 'member1.a@test.local'),
  ('10000000-0000-4000-8000-000000000003', 'member2.a@test.local'),
  ('10000000-0000-4000-8000-000000000004', 'leader.b@test.local');

insert into public.teams (id, code, name, leader_id) values
  ('50000000-0000-4000-8000-00000000000a', 'G901', 'Team A', '10000000-0000-4000-8000-000000000001'),
  ('50000000-0000-4000-8000-00000000000b', 'G902', 'Team B', '10000000-0000-4000-8000-000000000004');

insert into public.surveys (id, name, created_by, status) values
  ('20000000-0000-4000-8000-000000000009', 'Old survey', '00000000-0000-4000-8000-000000000001', 'closed'),
  ('20000000-0000-4000-8000-000000000001', 'Test survey', '00000000-0000-4000-8000-000000000001', 'active');

insert into public.groups (id, survey_id, team_id, name) values
  ('30000000-0000-4000-8000-00000000000a', '20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-00000000000a', 'Group A'),
  ('30000000-0000-4000-8000-00000000000b', '20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-00000000000b', 'Group B'),
  ('30000000-0000-4000-8000-0000000000a0', '20000000-0000-4000-8000-000000000009', '50000000-0000-4000-8000-00000000000a', 'Old group A');

insert into public.profiles (id, full_name, email, role, team_id) values
  ('10000000-0000-4000-8000-000000000001', 'Leader A', 'leader.a@test.local', 'leader', '50000000-0000-4000-8000-00000000000a'),
  ('10000000-0000-4000-8000-000000000002', 'Member One', 'member1.a@test.local', 'member', '50000000-0000-4000-8000-00000000000a'),
  ('10000000-0000-4000-8000-000000000003', 'Member Two', 'member2.a@test.local', 'member', '50000000-0000-4000-8000-00000000000a'),
  ('10000000-0000-4000-8000-000000000004', 'Leader B', 'leader.b@test.local', 'leader', '50000000-0000-4000-8000-00000000000b');

insert into public.premises (id, group_id, ruc, assigned_to) values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-00000000000a', '1800000000001', '10000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-00000000000a', '1800000000002', null),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-00000000000b', '1800000000003', null),
  ('40000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-0000000000a0', '1800000000009', '10000000-0000-4000-8000-000000000002');

create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

set local role authenticated;

select pg_temp.login('10000000-0000-4000-8000-000000000002');
select is((select count(*) from public.premises), 1::bigint, 'member sees only assigned premises of the active survey');
select lives_ok($$ insert into public.visits (premise_id, group_id, user_id, status)
  values ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-00000000000a',
          '10000000-0000-4000-8000-000000000002', 'operating_without_permit') $$,
  'member can record a visit for an assigned premise');
select throws_ok($$ insert into public.visits (premise_id, group_id, user_id, status)
  values ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-00000000000a',
          '10000000-0000-4000-8000-000000000002', 'not_found') $$,
  '42501', null, 'member cannot record a visit for an unassigned premise');
select throws_ok($$ insert into public.visits (premise_id, group_id, user_id, status)
  values ('40000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-0000000000a0',
          '10000000-0000-4000-8000-000000000002', 'not_found') $$,
  '42501', null, 'member cannot record a visit in a closed survey');
select throws_ok($$ update public.profiles set team_id = null where id = auth.uid() $$,
  '42501', null, 'member cannot change their own team');
select throws_ok($$ select public.import_survey('x', null, null, '[]'::jsonb) $$,
  'P0001', 'Only coordinators can import surveys', 'member cannot import');

select pg_temp.login('10000000-0000-4000-8000-000000000003');
select is((select count(*) from public.visits), 0::bigint, 'member does not see visits of others');

select pg_temp.login('10000000-0000-4000-8000-000000000001');
select is((select count(*) from public.premises), 2::bigint, 'leader sees premises of own group in the active survey');
select is((select count(*) from public.visits), 1::bigint, 'leader sees visits of own group');
select is((select count(*) from public.profiles), 3::bigint, 'leader sees the people of own team');
select is((select count(*) from public.surveys), 1::bigint, 'leader does not see closed surveys');

select pg_temp.login('10000000-0000-4000-8000-000000000004');
select is((select count(*) from public.premises), 1::bigint, 'leader does not see other groups');

-- Coordinator: sees history and cannot import while a survey is active.
reset role;
insert into auth.users (id, email) values ('10000000-0000-4000-8000-0000000000c0', 'coord@test.local');
insert into public.profiles (id, full_name, email, role) values ('10000000-0000-4000-8000-0000000000c0', 'Coord', 'coord@test.local', 'coordinator');
set local role authenticated;
select pg_temp.login('10000000-0000-4000-8000-0000000000c0');
select is((select count(*) from public.surveys where name in ('Old survey', 'Test survey')), 2::bigint, 'coordinator sees active and closed surveys');
select throws_ok($$ select public.import_survey('New', null, null, '[]'::jsonb) $$,
  'P0001', 'Close the active survey before importing a new one', 'cannot import while a survey is active');

select * from finish();
rollback;
