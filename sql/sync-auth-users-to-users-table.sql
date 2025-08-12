-- Create a trigger to sync new Supabase auth.users to your public.users table
-- Assumes your public.users table has at least id (UUID) and email (text) columns

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it already exists to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
