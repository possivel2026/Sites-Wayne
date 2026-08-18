-- Integrações reais do Nexus: Watch, Marketplace e relay de saída do StarkIA.

create table public.watch_saves (
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  tmdb_id integer not null check (tmdb_id > 0),
  title text not null check (char_length(title) between 1 and 200),
  poster_url text,
  saved_at timestamptz not null default now(),
  primary key (user_id, media_type, tmdb_id)
);
alter table public.watch_saves enable row level security;
revoke all on table public.watch_saves from anon, authenticated;
grant select, insert, delete on table public.watch_saves to authenticated;
create policy "users read own watch saves" on public.watch_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "users create own watch saves" on public.watch_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users delete own watch saves" on public.watch_saves for delete to authenticated using ((select auth.uid()) = user_id);

create table public.starkia_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  token_hash text not null unique check (char_length(token_hash) = 64),
  token_prefix text not null check (char_length(token_prefix) between 6 and 16),
  status text not null default 'offline' check (status in ('offline','online','revoked')),
  capabilities text[] not null default array['health']::text[],
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index starkia_devices_user_idx on public.starkia_devices(user_id, created_at desc);

create table public.starkia_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_id uuid not null references public.starkia_devices(id) on delete cascade,
  persona text not null default 'jarvis' check (persona in ('jarvis','ultron')),
  command text not null check (command in ('health','assistant_message','list_jobs')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  result jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);
create index starkia_tasks_device_queue_idx on public.starkia_tasks(device_id, status, created_at);
create index starkia_tasks_user_idx on public.starkia_tasks(user_id, created_at desc);

alter table public.starkia_devices enable row level security;
alter table public.starkia_tasks enable row level security;
revoke all on table public.starkia_devices from anon, authenticated;
revoke all on table public.starkia_tasks from anon, authenticated;
grant select on table public.starkia_devices, public.starkia_tasks to authenticated;
create policy "users read own starkia devices" on public.starkia_devices for select to authenticated using ((select auth.uid()) = user_id);
create policy "users read own starkia tasks" on public.starkia_tasks for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.create_marketplace_order(
  p_buyer_id uuid,
  p_items jsonb,
  p_commission_percent numeric default 8
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_product public.products%rowtype;
  v_product_id uuid;
  v_quantity integer;
  v_seen uuid[] := '{}'::uuid[];
  v_subtotal integer := 0;
  v_fee integer;
  v_order_id uuid;
  v_items jsonb;
begin
  if not exists(select 1 from public.profiles where id = p_buyer_id) then raise exception 'buyer_not_found'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then raise exception 'invalid_items'; end if;
  if p_commission_percent < 0 or p_commission_percent > 30 then raise exception 'invalid_commission'; end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity < 1 or v_quantity > 10 or v_product_id = any(v_seen) then raise exception 'invalid_item'; end if;
    v_seen := array_append(v_seen, v_product_id);
    select * into strict v_product from public.products where id = v_product_id and status = 'published' for share;
    if v_product.inventory is not null and v_product.inventory < v_quantity then raise exception 'insufficient_inventory'; end if;
    v_subtotal := v_subtotal + (v_product.price_cents * v_quantity);
  end loop;

  v_fee := floor(v_subtotal * p_commission_percent / 100.0);
  insert into public.orders(buyer_id,status,subtotal_cents,fee_cents,total_cents,payment_provider)
    values(p_buyer_id,'pending',v_subtotal,v_fee,v_subtotal,'mercado_pago') returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    select * into strict v_product from public.products where id = v_product_id;
    insert into public.order_items(order_id,product_id,seller_id,title_snapshot,unit_price_cents,quantity)
      values(v_order_id,v_product.id,v_product.seller_id,v_product.title,v_product.price_cents,v_quantity);
  end loop;

  select jsonb_agg(jsonb_build_object('product_id',product_id,'title',title_snapshot,'unit_price_cents',unit_price_cents,'quantity',quantity))
    into v_items from public.order_items where order_id = v_order_id;
  return jsonb_build_object('id',v_order_id,'subtotal_cents',v_subtotal,'fee_cents',v_fee,'total_cents',v_subtotal,'items',v_items);
end;
$$;
revoke all on function public.create_marketplace_order(uuid,jsonb,numeric) from public, anon, authenticated;
grant execute on function public.create_marketplace_order(uuid,jsonb,numeric) to service_role;

comment on function public.create_marketplace_order(uuid,jsonb,numeric) is 'Cria pedido com preços recalculados no PostgreSQL; chamada exclusiva do backend service_role.';
comment on table public.starkia_devices is 'Tokens são armazenados apenas como SHA-256; o agente usa conexão de saída, nunca exposição da porta local.';

create or replace function public.claim_starkia_task(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_device public.starkia_devices%rowtype;
  v_task public.starkia_tasks%rowtype;
begin
  select * into v_device from public.starkia_devices where token_hash = p_token_hash and status <> 'revoked' for update;
  if not found then raise exception 'device_unauthorized'; end if;
  update public.starkia_devices set status='online', last_seen_at=now() where id=v_device.id;
  select * into v_task from public.starkia_tasks where device_id=v_device.id and status='queued' order by created_at for update skip locked limit 1;
  if not found then return jsonb_build_object('device_id',v_device.id,'task',null); end if;
  update public.starkia_tasks set status='running', started_at=now() where id=v_task.id returning * into v_task;
  return jsonb_build_object('device_id',v_device.id,'task',to_jsonb(v_task) - 'user_id');
end;
$$;
revoke all on function public.claim_starkia_task(text) from public, anon, authenticated;
grant execute on function public.claim_starkia_task(text) to service_role;

create or replace function public.complete_starkia_task(
  p_token_hash text,
  p_task_id uuid,
  p_success boolean,
  p_result jsonb default null,
  p_error_code text default null
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_device_id uuid;
begin
  select id into v_device_id from public.starkia_devices where token_hash=p_token_hash and status <> 'revoked';
  if v_device_id is null then raise exception 'device_unauthorized'; end if;
  update public.starkia_tasks set status=case when p_success then 'succeeded' else 'failed' end,
    result=case when p_result is null then null else jsonb_strip_nulls(p_result) end,
    error_code=left(p_error_code,80), finished_at=now()
    where id=p_task_id and device_id=v_device_id and status='running';
  return found;
end;
$$;
revoke all on function public.complete_starkia_task(text,uuid,boolean,jsonb,text) from public, anon, authenticated;
grant execute on function public.complete_starkia_task(text,uuid,boolean,jsonb,text) to service_role;
