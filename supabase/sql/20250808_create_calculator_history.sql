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

-- Public read/insert policies (adjust if you want auth later)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'calculator_history' and policyname = 'Allow read'
  ) then
    create policy "Allow read" on public.calculator_history for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'calculator_history' and policyname = 'Allow insert'
  ) then
    create policy "Allow insert" on public.calculator_history for insert with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'calculator_history' and policyname = 'Allow update'
  ) then
    create policy "Allow update" on public.calculator_history for update using (true) with check (true);
  end if;
end$$;


