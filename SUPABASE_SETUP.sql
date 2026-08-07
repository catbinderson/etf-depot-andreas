-- ETF Depot Andreas Version 9.1 – Cloud-First Supabase Einrichtung
-- Ein Datensatz pro angemeldetem Benutzer ist der zentrale Master-Datenstand.
-- Das Skript kann erneut ausgeführt werden.

create table if not exists public.portfolio_sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  portfolio_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_sync
  add column if not exists schema_version text not null default '9.1';

alter table public.portfolio_sync enable row level security;

drop policy if exists "Users read own portfolio" on public.portfolio_sync;
create policy "Users read own portfolio"
on public.portfolio_sync for select
using (auth.uid() = user_id);

drop policy if exists "Users insert own portfolio" on public.portfolio_sync;
create policy "Users insert own portfolio"
on public.portfolio_sync for insert
with check (auth.uid() = user_id);

drop policy if exists "Users update own portfolio" on public.portfolio_sync;
create policy "Users update own portfolio"
on public.portfolio_sync for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own portfolio" on public.portfolio_sync;
create policy "Users delete own portfolio"
on public.portfolio_sync for delete
using (auth.uid() = user_id);

create index if not exists portfolio_sync_updated_at_idx
on public.portfolio_sync(updated_at desc);
