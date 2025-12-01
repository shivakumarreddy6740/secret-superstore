-- Create the table for storing encrypted passwords
create table org_passwords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  org_name text not null,
  encrypted_password bytea not null,
  nonce bytea not null,
  created_at timestamptz default now()
);

-- Create an index on user_id for faster lookups
create index on org_passwords (user_id);

-- Enable Row Level Security
alter table org_passwords enable row level security;

-- Create policies for Row Level Security
-- Allow users to select only their own passwords
create policy "select_own" on org_passwords for select using ( auth.uid() = user_id );

-- Allow users to insert only their own passwords
create policy "insert_own" on org_passwords for insert with check ( auth.uid() = user_id );

-- Allow users to delete only their own passwords
create policy "delete_own" on org_passwords for delete using ( auth.uid() = user_id );
