-- TravelMate 360 starter schema for Supabase. Review before running.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text, preferred_language text not null default 'en',
 home_currency text not null default 'USD', created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.trips (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, destination text, start_date date, end_date date, currency text not null default 'USD',
 budget numeric(12,2), status text not null default 'planning' check(status in ('planning','booked','in_progress','completed','cancelled')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.trip_tasks (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, title text not null, is_done boolean not null default false,
 due_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.trip_expenses (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, category text not null default 'other',
 amount numeric(12,2) not null check(amount >= 0), currency text not null default 'USD', note text,
 spent_at date not null default current_date, created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_tasks enable row level security;
alter table public.trip_expenses enable row level security;
create policy "Users can view own profile" on public.profiles for select using(auth.uid()=id);
create policy "Users can insert own profile" on public.profiles for insert with check(auth.uid()=id);
create policy "Users can update own profile" on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id);
create policy "Users manage own trips" on public.trips for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "Users manage own tasks" on public.trip_tasks for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "Users manage own expenses" on public.trip_expenses for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create index if not exists trips_user_created_idx on public.trips(user_id,created_at desc);
create index if not exists trip_tasks_trip_idx on public.trip_tasks(trip_id);
create index if not exists trip_expenses_trip_idx on public.trip_expenses(trip_id,spent_at desc);
-- Never put the Supabase service_role key in frontend code.
