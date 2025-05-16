
-- Schema for AUDIT-IA platform

-- Users table to store additional user information
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  role text not null default 'client',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on users table
alter table public.users enable row level security;

-- Policy to allow users to read and update their own data
create policy "Users can view and update own data" on public.users
  for all using (auth.uid() = id);

-- Messages table to store chat messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  sender text not null check (sender in ('client', 'assistant', 'senior', 'supervisor', 'manager')),
  message text not null,
  timestamp timestamptz default now(),
  session_id uuid,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS on messages table
alter table public.messages enable row level security;

-- Policy for users to view their own messages
create policy "Users can view own messages" on public.messages
  for select using (auth.uid() = user_id);

-- Policy for users to insert their own messages
create policy "Users can insert own messages" on public.messages
  for insert with check (auth.uid() = user_id and sender = 'client');

-- Function to update the user's updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update the updated_at timestamp when a user is updated
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

-- Audit logs table for admin review
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id uuid,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS on audit_logs table
alter table public.audit_logs enable row level security;

-- Policy for admins to view all audit logs
create policy "Admins can view all audit logs" on public.audit_logs
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Add some initial data to test the schema
-- Note: In production, you would set up a Supabase Edge Function to handle user creation
-- and insert the user into the users table with their role
