-- Run this entire file in your Supabase SQL Editor

-- PROFILES (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  phone text,
  role text check (role in ('business', 'customer')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- RESTAURANTS
create table public.restaurants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  address text,
  city text,
  owner_id uuid references public.profiles(id),
  created_at timestamptz default now()
);
alter table public.restaurants enable row level security;
create policy "Anyone can view restaurants" on public.restaurants for select using (true);
create policy "Owners can update their restaurant" on public.restaurants for update using (auth.uid() = owner_id);

-- MEMBERSHIP TIERS
create table public.membership_tiers (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  name text not null,
  price_monthly numeric not null,
  perks text,
  stripe_price_id text,
  created_at timestamptz default now()
);
alter table public.membership_tiers enable row level security;
create policy "Anyone can view tiers" on public.membership_tiers for select using (true);

-- SUBSCRIPTIONS
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id),
  restaurant_id uuid references public.restaurants(id),
  tier_id uuid references public.membership_tiers(id),
  stripe_subscription_id text,
  stripe_customer_id text,
  status text default 'active' check (status in ('active', 'cancelled', 'past_due')),
  start_date timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.subscriptions enable row level security;
create policy "Customers view own subscriptions" on public.subscriptions for select using (auth.uid() = customer_id);
create policy "Customers insert own subscriptions" on public.subscriptions for insert with check (auth.uid() = customer_id);
create policy "Customers update own subscriptions" on public.subscriptions for update using (auth.uid() = customer_id);
create policy "Business owners view their restaurant subscriptions" on public.subscriptions
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

-- SEED: Chicago pizza place + tiers
-- Run AFTER you create your business owner account and have its user ID
-- Replace 'YOUR_BUSINESS_USER_ID' with the actual UUID from auth.users

-- insert into public.restaurants (name, description, address, city, owner_id)
-- values ('Regly Pizza', 'Chicago''s best slice, now with memberships', '123 N Michigan Ave', 'Chicago', 'YOUR_BUSINESS_USER_ID');

-- Then get the restaurant ID and run:
-- insert into public.membership_tiers (restaurant_id, name, price_monthly, perks, stripe_price_id) values
--   ('RESTAURANT_ID', 'Regular', 10, 'Free soda every visit + 1 free delivery/month', 'price_xxx'),
--   ('RESTAURANT_ID', 'Gold Regular', 20, 'Free beer nuggets + 2 free deliveries + 5% off every order', 'price_xxx'),
--   ('RESTAURANT_ID', 'VIP Regular', 35, 'Unlimited delivery + 10% off + free large pizza every month', 'price_xxx');
