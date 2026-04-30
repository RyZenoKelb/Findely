-- Findely V7 — initial schema
-- Applies to a fresh Supabase project. Idempotent where practical.

-- Extensions -----------------------------------------------------------------

create extension if not exists "pgcrypto";

-- Profiles -------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text not null default 'free',
  role text not null default 'user',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lead searches --------------------------------------------------------------

create table if not exists public.lead_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_type text not null,
  location text not null,
  country text,
  language text,
  objective text,
  filters jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  result_count int not null default 0,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lead_searches_user_id_created_at_idx
  on public.lead_searches (user_id, created_at desc);

-- Leads ----------------------------------------------------------------------

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  external_id text,
  fingerprint text not null,
  name text not null,
  category text,
  phone text,
  website text,
  address text,
  source text not null,
  score int not null default 0,
  priority_label text,
  opportunity_type text,
  opportunity_reason text,
  recommended_action text,
  data_quality text,
  contact_readiness text,
  rating numeric,
  rating_count int,
  maps_url text,
  signals jsonb not null default '[]'::jsonb,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_user_fingerprint_unique unique (user_id, fingerprint)
);

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_user_fingerprint_idx
  on public.leads (user_id, fingerprint);

-- Lead lists -----------------------------------------------------------------

create table if not exists public.lead_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lead_lists_user_id_idx on public.lead_lists (user_id);

-- Lead list items ------------------------------------------------------------

create table if not exists public.lead_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  list_id uuid not null references public.lead_lists(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_list_items_list_lead_unique unique (list_id, lead_id)
);

create index if not exists lead_list_items_user_list_idx
  on public.lead_list_items (user_id, list_id);

-- Seen leads -----------------------------------------------------------------

create table if not exists public.seen_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fingerprint text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  count_seen int not null default 1,
  last_query jsonb not null default '{}'::jsonb,
  constraint seen_leads_user_fingerprint_unique unique (user_id, fingerprint)
);

create index if not exists seen_leads_user_fingerprint_idx
  on public.seen_leads (user_id, fingerprint);

-- Usage events ---------------------------------------------------------------

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  quantity int not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_id_created_at_idx
  on public.usage_events (user_id, created_at desc);

create index if not exists usage_events_user_type_created_at_idx
  on public.usage_events (user_id, type, created_at desc);

-- API keys -------------------------------------------------------------------

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_user_id_idx on public.api_keys (user_id);
create index if not exists api_keys_prefix_idx on public.api_keys (key_prefix);

-- Exports --------------------------------------------------------------------

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'csv',
  lead_count int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists exports_user_id_created_at_idx
  on public.exports (user_id, created_at desc);

-- Updated-at trigger helper --------------------------------------------------

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.tg_set_updated_at();

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.tg_set_updated_at();

drop trigger if exists set_lead_lists_updated_at on public.lead_lists;
create trigger set_lead_lists_updated_at
before update on public.lead_lists
for each row execute function public.tg_set_updated_at();

drop trigger if exists set_lead_list_items_updated_at on public.lead_list_items;
create trigger set_lead_list_items_updated_at
before update on public.lead_list_items
for each row execute function public.tg_set_updated_at();

-- Auto-create profile on signup ---------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, plan, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    'free',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Row-level security ---------------------------------------------------------

alter table public.profiles         enable row level security;
alter table public.lead_searches    enable row level security;
alter table public.leads            enable row level security;
alter table public.lead_lists       enable row level security;
alter table public.lead_list_items  enable row level security;
alter table public.seen_leads       enable row level security;
alter table public.usage_events     enable row level security;
alter table public.api_keys         enable row level security;
alter table public.exports          enable row level security;

-- Policies: profiles keyed by id --------------------------------------------

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Policies: user-owned tables keyed by user_id ------------------------------

do $$
declare
  t text;
  tables text[] := array[
    'lead_searches',
    'leads',
    'lead_lists',
    'lead_list_items',
    'seen_leads',
    'usage_events',
    'api_keys',
    'exports'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "%1$s_select_own" on public.%1$s', t);
    execute format(
      'create policy "%1$s_select_own" on public.%1$s for select using (auth.uid() = user_id)',
      t
    );

    execute format('drop policy if exists "%1$s_insert_own" on public.%1$s', t);
    execute format(
      'create policy "%1$s_insert_own" on public.%1$s for insert with check (auth.uid() = user_id)',
      t
    );

    execute format('drop policy if exists "%1$s_update_own" on public.%1$s', t);
    execute format(
      'create policy "%1$s_update_own" on public.%1$s for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );

    execute format('drop policy if exists "%1$s_delete_own" on public.%1$s', t);
    execute format(
      'create policy "%1$s_delete_own" on public.%1$s for delete using (auth.uid() = user_id)',
      t
    );
  end loop;
end$$;
