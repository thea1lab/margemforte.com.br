-- Table: public.calculator_history

create table if not exists public.calculator_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  simulation_name text not null,
  service_value numeric not null,
  travel_costs numeric not null,
  hours_worked numeric not null,
  hourly_rate numeric not null,
  materials numeric not null,
  desired_margin numeric not null
);

-- Enable RLS
alter table public.calculator_history enable row level security;

-- Add per-user ownership and lock down policies
do $$
begin
  -- Add owner column (nullable to avoid failing if legacy rows exist),
  -- but set default so new inserts automatically attach to the current user.
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'calculator_history'
      and column_name = 'user_id'
  ) then
    alter table public.calculator_history
      add column user_id uuid references auth.users(id) on delete cascade;
  end if;

  -- Always ensure default is set to auth.uid() for new inserts
  alter table public.calculator_history
    alter column user_id set default auth.uid();

  -- Create index (if not exists) for user-specific queries
  create index if not exists calculator_history_user_id_idx
    on public.calculator_history (user_id);

  -- Drop overly-permissive policies if present
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'calculator_history' and policyname = 'Allow read'
  ) then
    drop policy "Allow read" on public.calculator_history;
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'calculator_history' and policyname = 'Allow insert'
  ) then
    drop policy "Allow insert" on public.calculator_history;
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'calculator_history' and policyname = 'Allow update'
  ) then
    drop policy "Allow update" on public.calculator_history;
  end if;

  -- Create secure per-user policies
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'calculator_history' and policyname = 'Read own rows'
  ) then
    create policy "Read own rows"
      on public.calculator_history
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'calculator_history' and policyname = 'Insert own rows'
  ) then
    create policy "Insert own rows"
      on public.calculator_history
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'calculator_history' and policyname = 'Update own rows'
  ) then
    create policy "Update own rows"
      on public.calculator_history
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'calculator_history' and policyname = 'Delete own rows'
  ) then
    create policy "Delete own rows"
      on public.calculator_history
      for delete
      using (auth.uid() = user_id);
  end if;
end$$;


