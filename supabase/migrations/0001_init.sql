-- Finanzas: schema inicial (perfiles, cuentas, snapshots mensuales, cache de precios)

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  kind text not null check (kind in ('bank', 'usd_investment', 'metal', 'other_investment')),
  name text not null,
  currency text not null default 'COP',
  attributes jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  month date not null,
  quantity numeric,
  manual_balance numeric,
  price_used numeric,
  value_cop numeric not null,
  value_usd numeric not null,
  created_at timestamptz not null default now(),
  unique (account_id, month)
);

create table if not exists price_cache (
  symbol text not null,
  price_date date not null,
  price_usd numeric not null,
  source text not null,
  fetched_at timestamptz not null default now(),
  primary key (symbol, price_date)
);

-- Row Level Security: cada usuario solo ve sus propios perfiles/cuentas/snapshots.

alter table profiles enable row level security;
alter table accounts enable row level security;
alter table snapshots enable row level security;
alter table price_cache enable row level security;

create policy "profiles_owner_all" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "accounts_owner_all" on accounts
  for all using (
    exists (select 1 from profiles p where p.id = accounts.profile_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from profiles p where p.id = accounts.profile_id and p.user_id = auth.uid())
  );

create policy "snapshots_owner_all" on snapshots
  for all using (
    exists (
      select 1 from accounts a
      join profiles p on p.id = a.profile_id
      where a.id = snapshots.account_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from accounts a
      join profiles p on p.id = a.profile_id
      where a.id = snapshots.account_id and p.user_id = auth.uid()
    )
  );

-- price_cache es compartido/global (no tiene dueño); cualquier usuario autenticado puede leer,
-- y solo el backend (via API route con el cliente autenticado) inserta.
create policy "price_cache_read_authenticated" on price_cache
  for select using (auth.role() = 'authenticated');

create policy "price_cache_write_authenticated" on price_cache
  for insert with check (auth.role() = 'authenticated');

create policy "price_cache_update_authenticated" on price_cache
  for update using (auth.role() = 'authenticated');
