# Rondín

Web app to organize field surveys of commercial premises by groups and generate the final reports in one click.

A coordinator uploads an Excel file (one sheet per group), group leaders split the premises among their members,
members record each visit from their phone (status, annual registration number, photos), and the reports are
generated automatically.

## Roles

| Role        | Sees                               | Can do                                                           |
| ----------- | ---------------------------------- | ---------------------------------------------------------------- |
| Coordinator | All groups, premises and visits    | Upload Excel, create groups, assign leaders, consolidated report |
| Leader      | Only their group                   | Invite members, assign premises, group report                    |
| Member      | Only the premises assigned to them | Record visits with status, registration number and photos        |

Permissions are enforced in the database with Row Level Security, not only in the UI.

## Monorepo

```
apps/web          Next.js app (App Router, Server Actions, Tailwind CSS)
packages/core     Shared logic: enums, Zod schemas, RUC/ID validation, Excel parsing and reports
supabase/         Migrations, RLS policies, storage bucket, seed and pgTAP tests
fixtures/         Sample Excel file with fake data for demos
```

## Local development

Requirements: Node 22+, Docker (WSL works) and the [Supabase CLI](https://supabase.com/docs/guides/local-development).

```bash
npm install
supabase start                  # applies migrations and seed.sql
cp apps/web/.env.example apps/web/.env.local   # paste the keys printed by `supabase status`
npm run dev                     # http://localhost:3000
```

Local coordinator account (seed only): `coordinator@rondin.local` / `Rondin2026`.
Sample data: `node packages/core/scripts/create-sample-workbook.mjs` creates `fixtures/sample-survey.xlsx`.

| Command               | What it does                              |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Start the web app                         |
| `npm test`            | Unit tests of `packages/core` (Vitest)    |
| `supabase test db`    | RLS tests (pgTAP)                         |
| `npm run lint`        | ESLint                                    |
| `npm run typecheck`   | TypeScript in every workspace             |
| `npm run db:types`    | Regenerate database types                 |

## Cloud deployment (Supabase + Vercel)

1. Create a Supabase project and link it: `supabase link --project-ref <ref>`, then `supabase db push`.
2. In Supabase → Authentication: disable public sign-ups (accounts are created by the server), set the
   Site URL to the Vercel URL and add `<url>/auth/callback` to the redirect URLs. Configure custom SMTP for
   password recovery emails.
3. Create the first coordinator: add a user in Authentication → Users, then run in the SQL editor:
   ```sql
   insert into public.profiles (id, full_name, email, role, privacy_accepted_at)
   select id, 'Coordinación', email, 'coordinator', now() from auth.users where email = '<email>';
   ```
4. In Vercel, import the repo with root directory `apps/web` and set the variables from `.env.example`.
   `SUPABASE_SECRET_KEY` must never be exposed with a `NEXT_PUBLIC_` prefix.

## Security and personal data (LOPDP Ecuador)

- **Least privilege:** RLS on every table; leaders can only change the assignment of premises in their group;
  members can only write visits for premises assigned to them. Tested in `supabase/tests`.
- **Server-side identity:** the author and group of a visit are set by a database trigger, never by the client.
- **Private photos:** private bucket, path `<group>/<visit>/<file>.jpg` checked by storage policies, served
  with signed URLs that expire. Photos are compressed (~500 KB) and taken with the camera.
- **Data minimization:** only the fields needed for the survey are stored. The Excel file is parsed in the
  browser and only validated rows are sent.
- **Consent and transparency:** members accept the privacy notice (`/privacy`) when they join; the
  acceptance date is stored.
- **Deletion:** deleting a survey cascades to its groups, premises, visits and photo records.
- **Secrets:** the secret key is only read on the server (`server-only`); `.env*` files are git-ignored.
- **Headers:** HSTS, `X-Frame-Options: DENY`, `nosniff`, strict referrer and a restrictive permissions policy.

## Scope

Phase 1 (MVP, this version): role-based sign-in and invitation codes, Excel import with preview and RUC
validation, manual assignment, visit recording with status, registration number, photos and notes, progress by
group and Excel reports.

Next phases: PDF/Word institutional report with photo annex and signatures, leader review (approve/return),
offline mode, automatic assignment by sector, map and notifications.
