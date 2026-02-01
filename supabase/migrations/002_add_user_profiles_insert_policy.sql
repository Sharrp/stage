-- Add RLS policy to allow users to insert their own profile
-- This is needed for cases where the auth trigger doesn't run (e.g., OAuth flows)
create policy "Users can insert their own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = id);
