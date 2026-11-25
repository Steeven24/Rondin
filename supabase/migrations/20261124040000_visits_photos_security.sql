-- RLS for visits, photos and the private photo bucket.

create policy visits_select on public.visits for select to authenticated using (
  public.is_coordinator()
  or (public.auth_role() = 'leader' and group_id = public.auth_group_id())
  or user_id = auth.uid()
);

-- Members record visits only for premises assigned to them.
create policy visits_insert on public.visits for insert to authenticated with check (
  public.auth_role() = 'member'
  and exists (select 1 from public.premises p where p.id = premise_id and p.assigned_to = auth.uid())
);

-- Members can fix their own visit until it is approved; leaders review visits of their group.
create policy visits_update on public.visits for update to authenticated
  using (
    (user_id = auth.uid() and review_status <> 'approved')
    or (public.auth_role() = 'leader' and group_id = public.auth_group_id())
  )
  with check (
    user_id = auth.uid()
    or (public.auth_role() = 'leader' and group_id = public.auth_group_id())
  );

create policy photos_select on public.photos for select to authenticated using (
  exists (select 1 from public.visits v where v.id = visit_id)
);
create policy photos_insert on public.photos for insert to authenticated with check (
  exists (select 1 from public.visits v where v.id = visit_id and v.user_id = auth.uid())
);
create policy photos_delete on public.photos for delete to authenticated using (
  exists (
    select 1 from public.visits v
    where v.id = visit_id and v.user_id = auth.uid() and v.review_status <> 'approved'
  )
);

-- Storage bucket for photos. Object path: <group_id>/<visit_id>/<file>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('visit-photos', 'visit-photos', false, 2097152, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy visit_photos_read on storage.objects for select to authenticated using (
  bucket_id = 'visit-photos'
  and (
    public.is_coordinator()
    or (public.auth_role() = 'leader' and (storage.foldername(name))[1] = public.auth_group_id()::text)
    or exists (
      select 1 from public.visits v
      where v.id::text = (storage.foldername(name))[2] and v.user_id = auth.uid()
    )
  )
);

create policy visit_photos_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'visit-photos'
  and (storage.foldername(name))[1] = public.auth_group_id()::text
  and exists (
    select 1 from public.visits v
    where v.id::text = (storage.foldername(name))[2] and v.user_id = auth.uid()
  )
);

create policy visit_photos_delete on storage.objects for delete to authenticated using (
  bucket_id = 'visit-photos' and owner_id = auth.uid()::text
);
