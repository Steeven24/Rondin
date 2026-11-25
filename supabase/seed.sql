-- Local development seed (runs on `supabase db reset`, never on the cloud project).
-- Creates one coordinator account: coordinator@rondin.local / Rondin2026

do $$
declare
  v_id uuid := '00000000-0000-4000-8000-000000000001';
  v_email text := 'coordinator@rondin.local';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt('Rondin2026', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  );

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text, jsonb_build_object('sub', v_id::text, 'email', v_email),
          'email', now(), now(), now());

  insert into public.profiles (id, full_name, email, role, privacy_accepted_at)
  values (v_id, 'Coordinación', v_email, 'coordinator', now());
end $$;
