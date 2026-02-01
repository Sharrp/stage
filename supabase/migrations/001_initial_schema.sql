-- Create user_profiles table
create table public.user_profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  display_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create quack_stats table
create table public.quack_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.user_profiles(id) on delete cascade,
  total_quacks integer default 0 not null,
  last_quack_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on user_profiles
alter table public.user_profiles enable row level security;

-- RLS policy: users can view their own profile
create policy "Users can view their own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

-- RLS policy: users can update their own profile
create policy "Users can update their own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id);

-- Enable RLS on quack_stats
alter table public.quack_stats enable row level security;

-- RLS policy: users can view their own quack stats
create policy "Users can view their own quack stats"
  on public.quack_stats
  for select
  using (auth.uid() = user_id);

-- RLS policy: users can insert their own quack stats
create policy "Users can insert their own quack stats"
  on public.quack_stats
  for insert
  with check (auth.uid() = user_id);

-- RLS policy: users can update their own quack stats
create policy "Users can update their own quack stats"
  on public.quack_stats
  for update
  using (auth.uid() = user_id);

-- RLS policy: users can delete their own quack stats
create policy "Users can delete their own quack stats"
  on public.quack_stats
  for delete
  using (auth.uid() = user_id);

-- Create trigger function to auto-create user_profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, display_name)
  values (new.id, new.email, '');

  insert into public.quack_stats (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create trigger for new auth users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create index on quack_stats for performance
create index idx_quack_stats_user_id on public.quack_stats(user_id);
