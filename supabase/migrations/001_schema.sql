-- ====================================================
-- Shooting Range App - Initial Schema
-- Run this in Supabase SQL Editor
-- ====================================================

-- PROFILES (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  member_since timestamptz not null default now(),
  license_number text
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can read all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New User'));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- LANES
create table public.lanes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('pistol', 'rifle', 'mixed')),
  max_distance_m integer not null default 25,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz default now()
);
alter table public.lanes enable row level security;
create policy "Anyone authenticated can read active lanes" on public.lanes for select using (auth.uid() is not null);
create policy "Admins can manage lanes" on public.lanes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- BOOKINGS
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  lane_id uuid references public.lanes(id) on delete cascade not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);
alter table public.bookings enable row level security;
create policy "Users can read own bookings" on public.bookings for select using (auth.uid() = user_id);
create policy "Users can create bookings" on public.bookings for insert with check (auth.uid() = user_id);
create policy "Users can update own bookings" on public.bookings for update using (auth.uid() = user_id);
create policy "Admins can manage all bookings" on public.bookings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- SESSIONS
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  rounds_fired integer not null default 0,
  weapon_type text not null,
  notes text,
  created_at timestamptz default now()
);
alter table public.sessions enable row level security;
create policy "Users can read own sessions" on public.sessions for select using (auth.uid() = user_id);
create policy "Admins can manage sessions" on public.sessions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- SCORES
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  round_number integer not null,
  score integer not null,
  distance_m integer not null,
  target_type text not null,
  created_at timestamptz default now()
);
alter table public.scores enable row level security;
create policy "Users can read own scores" on public.scores for select using (auth.uid() = user_id);
create policy "Admins can manage scores" on public.scores for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- INVENTORY
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('ammo', 'equipment', 'target')),
  caliber text,
  quantity integer not null default 0,
  min_stock integer not null default 5,
  unit_cost numeric(10,2) not null default 0,
  last_restocked timestamptz,
  created_at timestamptz default now()
);
alter table public.inventory enable row level security;
create policy "Admins can manage inventory" on public.inventory for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Enable Realtime on bookings
alter publication supabase_realtime add table public.bookings;

-- Seed: sample lanes
insert into public.lanes (name, type, max_distance_m, notes) values
  ('Lane A', 'pistol', 25, 'Indoor pistol range'),
  ('Lane B', 'pistol', 25, 'Indoor pistol range'),
  ('Lane C', 'rifle', 100, 'Outdoor rifle range'),
  ('Lane D', 'mixed', 50, 'Multi-purpose lane');
