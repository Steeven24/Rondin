-- Core domain tables for Rondín.
-- Every row that belongs to a group carries group_id so RLS policies can filter by it.

create type public.user_role as enum ('coordinator', 'leader', 'member');

create type public.visit_status as enum (
  'operating_with_permit',
  'operating_without_permit',
  'temporarily_closed',
  'not_found',
  'not_visited'
);

create type public.review_status as enum ('pending', 'approved', 'returned');

create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 120),
  institution text check (char_length(institution) <= 160),
  period text check (char_length(period) <= 60),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  source_sheet text,
  leader_id uuid references auth.users (id) on delete set null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

-- One profile per auth user. Personal data is kept to the minimum needed (LOPDP).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 3 and 120),
  national_id text check (national_id ~ '^\d{10}$'),
  email text not null,
  role public.user_role not null default 'member',
  group_id uuid references public.groups (id) on delete set null,
  privacy_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.premises (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  ruc text not null check (ruc ~ '^\d{13}$'),
  trade_name text,
  owner_name text,
  activity text,
  address text,
  phone text,
  sector text,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  premise_id uuid not null unique references public.premises (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  status public.visit_status not null,
  registration_number text check (char_length(registration_number) <= 40),
  notes text check (char_length(notes) <= 1000),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  visited_at timestamptz not null default now(),
  review_status public.review_status not null default 'pending',
  review_comment text check (char_length(review_comment) <= 500),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint registration_required check (
    status <> 'operating_with_permit' or coalesce(registration_number, '') <> ''
  )
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  storage_path text not null unique,
  taken_at timestamptz not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create index premises_group_idx on public.premises (group_id);
create index premises_assigned_idx on public.premises (assigned_to);
create index visits_group_idx on public.visits (group_id);
create index photos_visit_idx on public.photos (visit_id);
create index profiles_group_idx on public.profiles (group_id);
