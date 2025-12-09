-- LearnLynk Tech Test - Task 1: Schema

create extension if not exists "pgcrypto";

-- Leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  owner_id uuid not null,
  email text,
  phone text,
  full_name text,
  stage text not null default 'new',
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for leads, as per requirements
create index if not exists leads_owner_stage_created_at_idx on public.leads (owner_id, stage, created_at);


-- Applications table
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  lead_id uuid not null references public.leads(id) on delete cascade,
  program_id uuid,
  intake_id uuid,
  stage text not null default 'inquiry',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for applications, as per requirements
create index if not exists applications_lead_id_idx on public.applications (lead_id);


-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  -- Note: PDF refers to this as related_id, but application_id is clearer and used in the initial schema.
  application_id uuid not null references public.applications(id) on delete cascade,
  title text,
  type text not null,
  status text not null default 'open',
  due_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_type_check check (type in ('call', 'email', 'review')),
  constraint tasks_due_at_check check (due_at >= created_at)
);

-- Indexes for tasks, as per requirements
create index if not exists tasks_due_at_idx on public.tasks (due_at);