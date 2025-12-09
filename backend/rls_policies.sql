-- LearnLynk Tech Test - Task 2: RLS Policies on leads

-- Assumption: A user_teams table exists to link users to teams.
-- We create it here as it is a required dependency for the SELECT policy.
create table if not exists public.user_teams (
  user_id uuid not null,
  team_id uuid not null,
  primary key (user_id, team_id)
);
-- Seeding some data for teams to make it testable
insert into public.user_teams (user_id, team_id) values
    ('a9fa3558-9360-4370-97f9-be386987df92', 'f5242559-15d9-4399-813b-15598688d2f1'),
    ('3e020f6a-16a4-44a6-89b6-8a0339945801', 'f5242559-15d9-4399-813b-15598688d2f1')
on conflict do nothing;

-- Enable RLS on the leads table
alter table public.leads enable row level security;

-- Drop placeholder/old policies if they exist
drop policy if exists "leads_select_policy" on public.leads;
drop policy if exists "Users can see leads based on their role" on public.leads;
drop policy if exists "Admins and counselors can insert leads" on public.leads;

-- Policy for SELECT access:
-- Admins can see all leads in their tenant.
-- Counselors can see leads assigned to them OR their teammates.
create policy "Users can see leads based on their role"
on public.leads
for select
using (
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
  and
  (
    -- Admin role can see all
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin'
    or
    -- Counselor role has limited visibility
    (
      (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'counselor'
      and
      (
        -- Lead is assigned to the current user
        owner_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid
        or
        -- Lead is assigned to a user in the same team as the current user
        owner_id in (
          select team_mate.user_id
          from public.user_teams as team_mate
          where team_mate.team_id in (
            select my_team.team_id
            from public.user_teams as my_team
            where my_team.user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid
          )
        )
      )
    )
  )
);

-- Policy for INSERT access:
-- Admins and Counselors can insert leads into their own tenant.
create policy "Admins and counselors can insert leads"
on public.leads
for insert
with check (
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
  and
  (current_setting('request.jwt.claims', true)::jsonb ->> 'role') in ('admin', 'counselor')
);