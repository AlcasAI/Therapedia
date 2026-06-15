-- =============================================================================
-- Clinical Protocol Hub — Supabase schema
-- =============================================================================
-- Run this in the Supabase SQL editor (or via the CLI) to provision the tables
-- used when the app runs in SUPABASE MODE.
--
-- IMPORTANT: This app stores NO patient data. There are no tables, columns, or
-- policies for patient-identifiable information. This is a clinician-facing
-- document library only.
--
-- The RLS policies below are intentionally simple starter policies for an MVP:
--   - Anyone authenticated can read published reference content.
--   - Writes to protocols/categories/contacts are restricted to "admin" users
--     (flagged via profiles.role = 'admin').
-- Harden these before any production use.
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- -----------------------------------------------------------------------------
-- profiles
-- Mirrors UserProfile. `id` should match auth.users.id when real auth is added.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           text primary key default gen_random_uuid()::text,
  name         text not null default '',
  role         text not null default '',
  specialty    text not null default '',
  organization text not null default '',
  email        text not null default ''
);

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  icon        text
);

-- -----------------------------------------------------------------------------
-- protocols
-- -----------------------------------------------------------------------------
create table if not exists public.protocols (
  id           text primary key default gen_random_uuid()::text,
  slug         text not null unique,
  title        text not null,
  "categoryId" text not null references public.categories (id),
  "categoryName" text not null default '',
  description  text not null default '',
  tags         text[] not null default '{}',
  "fileUrl"    text not null default '',
  "fileType"   text not null default 'pdf'
                 check ("fileType" in ('pdf','docx','html','external')),
  version      text not null default '1.0',
  status       text not null default 'draft'
                 check (status in ('published','draft','archived')),
  author       text not null default '',
  reviewer     text not null default '',
  "lastUpdated" date not null default now(),
  "createdAt"  date not null default now()
);

create index if not exists protocols_status_idx on public.protocols (status);
create index if not exists protocols_category_idx on public.protocols ("categoryId");

-- Optional: full-text search support for the prepared search repository fns.
create index if not exists protocols_search_idx on public.protocols
  using gin (to_tsvector('simple',
    coalesce(title,'') || ' ' || coalesce(description,'') || ' ' ||
    coalesce(author,'') || ' ' || coalesce(reviewer,'') || ' ' ||
    array_to_string(tags, ' ')));

-- -----------------------------------------------------------------------------
-- contacts
-- -----------------------------------------------------------------------------
create table if not exists public.contacts (
  id         text primary key default gen_random_uuid()::text,
  name       text not null,
  role       text not null default '',
  department text not null default '',
  email      text not null default '',
  phone      text not null default '',
  notes      text not null default ''
);

-- -----------------------------------------------------------------------------
-- contact_requests
-- -----------------------------------------------------------------------------
create table if not exists public.contact_requests (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  email         text not null,
  "requestType" text not null default 'other'
                  check ("requestType" in
                    ('technical issue','protocol update','new protocol request','other')),
  message       text not null default '',
  "createdAt"   timestamptz not null default now()
);

-- =============================================================================
-- Row Level Security (starter policies)
-- =============================================================================
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.protocols        enable row level security;
alter table public.contacts         enable row level security;
alter table public.contact_requests enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()::text and p.role = 'admin'
  );
$$;

-- categories: readable by all authenticated users; writable by admins.
create policy "categories_read" on public.categories
  for select using (auth.role() = 'authenticated');
create policy "categories_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- protocols: authenticated users read published; admins read/write everything.
create policy "protocols_read_published" on public.protocols
  for select using (auth.role() = 'authenticated' and status = 'published');
create policy "protocols_admin_all" on public.protocols
  for all using (public.is_admin()) with check (public.is_admin());

-- contacts: readable by all authenticated users; writable by admins.
create policy "contacts_read" on public.contacts
  for select using (auth.role() = 'authenticated');
create policy "contacts_write" on public.contacts
  for all using (public.is_admin()) with check (public.is_admin());

-- contact_requests: any authenticated user can submit; admins can read.
create policy "contact_requests_insert" on public.contact_requests
  for insert with check (auth.role() = 'authenticated');
create policy "contact_requests_admin_read" on public.contact_requests
  for select using (public.is_admin());

-- profiles: a user can read/update their own row.
create policy "profiles_self" on public.profiles
  for all using (id = auth.uid()::text) with check (id = auth.uid()::text);

-- =============================================================================
-- Storage
-- =============================================================================
-- Create a public bucket named "protocols" for uploaded documents:
--   insert into storage.buckets (id, name, public) values ('protocols','protocols', true);
-- Then add storage policies allowing admins to upload and everyone to read.
