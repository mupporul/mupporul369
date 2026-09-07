-- Supabase schema for DATA_PROVIDER=supabase
-- Run this in the Supabase SQL editor for the target project.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key,
  mobile text not null unique,
  initials text not null,
  name text,
  role text not null check (role in ('user', 'contributor', 'admin')),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_mobile on public.users (mobile);

create table if not exists public.sessions (
  token text primary key,
  user_id text not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user_id on public.sessions (user_id);
create index if not exists idx_sessions_expires_at on public.sessions (expires_at);

create table if not exists public.temple_groups (
  id uuid primary key default gen_random_uuid(),
  house text not null,
  planets jsonb not null default '[]'::jsonb,
  data jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_temple_groups_sort_order
  on public.temple_groups (sort_order);

create table if not exists public.reviews_queue (
  id uuid primary key,
  action text not null,
  temple_id uuid null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  approvals jsonb not null default '[]'::jsonb,
  created_by jsonb,
  created_at timestamptz not null default now(),
  modified_by jsonb,
  modified_at timestamptz
);

create index if not exists idx_reviews_queue_created_at
  on public.reviews_queue (created_at);
