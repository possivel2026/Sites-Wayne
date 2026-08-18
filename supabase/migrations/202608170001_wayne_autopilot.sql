-- Wayne Autopilot — pedidos, pagamento, publicação e manutenção automática.
create table if not exists public.wayne_site_orders (
  id uuid primary key,
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  package_id text not null check (package_id in ('essencial','profissional','growth')),
  template_id text not null check (template_id in ('claro','luxo','impacto')),
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending','paid','published','cancelled','refunded')),
  payment_status text not null default 'pending',
  provider_preference_id text unique,
  provider_payment_id text unique,
  client_name text not null check (char_length(client_name) between 2 and 80),
  client_email text not null check (char_length(client_email) <= 160),
  site_data jsonb not null,
  consent_at timestamptz not null,
  published_at timestamptz,
  last_health_status text,
  last_health_check_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wayne_site_orders_status_idx on public.wayne_site_orders(status, created_at desc);
create index if not exists wayne_site_orders_slug_idx on public.wayne_site_orders(slug) where status='published';

alter table public.wayne_site_orders enable row level security;
revoke all on table public.wayne_site_orders from anon, authenticated;
grant all on table public.wayne_site_orders to service_role;

comment on table public.wayne_site_orders is 'Pedidos privados do gerador Sites Wayne; acessíveis somente por rotas server-side com service_role.';
