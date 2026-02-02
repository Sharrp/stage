-- Create chat_messages table
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.user_profiles(id) on delete cascade,
  user_message text not null,
  assistant_message text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint chat_messages_user_message_length check (char_length(user_message) <= 50)
);

-- Enable RLS on chat_messages
alter table public.chat_messages enable row level security;

-- RLS policy: users can view their own chat message
create policy "Users can view their own chat message"
  on public.chat_messages
  for select
  using (auth.uid() = user_id);

-- RLS policy: users can insert their own chat message
create policy "Users can insert their own chat message"
  on public.chat_messages
  for insert
  with check (auth.uid() = user_id);

-- RLS policy: users can update their own chat message
create policy "Users can update their own chat message"
  on public.chat_messages
  for update
  using (auth.uid() = user_id);

-- RLS policy: users can delete their own chat message
create policy "Users can delete their own chat message"
  on public.chat_messages
  for delete
  using (auth.uid() = user_id);

-- Create trigger function to update updated_at
create or replace function public.update_chat_messages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for chat_messages updated_at
create trigger on_chat_messages_updated
  before update on public.chat_messages
  for each row execute procedure public.update_chat_messages_updated_at();

-- Create index on chat_messages for performance
create index idx_chat_messages_user_id on public.chat_messages(user_id);
