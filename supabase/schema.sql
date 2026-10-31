-- Evolve: single shared document protected by a PIN.
-- Paste into Supabase → SQL Editor and run. Change the PIN on the last line first.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_state (
  id int primary key default 1 check (id = 1),
  pin_hash text not null,
  data jsonb,
  updated_at bigint not null default 0
);

-- RLS on with no policies: the table is unreachable through the public API.
-- Access only goes through the two functions below, which check the PIN.
alter table public.app_state enable row level security;

create or replace function public.load_state(p_pin text)
returns table (data jsonb, updated_at bigint)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (select 1 from app_state s where s.id = 1 and s.pin_hash = crypt(p_pin, s.pin_hash)) then
    raise exception 'invalid pin';
  end if;
  return query select s.data, s.updated_at from app_state s where s.id = 1;
end;
$$;

create or replace function public.save_state(p_pin text, p_data jsonb, p_updated_at bigint)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update app_state s
     set data = p_data, updated_at = p_updated_at
   where s.id = 1 and s.pin_hash = crypt(p_pin, s.pin_hash);
  if not found then
    raise exception 'invalid pin';
  end if;
end;
$$;

revoke all on function public.load_state(text) from public;
revoke all on function public.save_state(text, jsonb, bigint) from public;
grant execute on function public.load_state(text) to anon;
grant execute on function public.save_state(text, jsonb, bigint) to anon;

-- Set (or change) the PIN. Run again with a new value to change it.
insert into public.app_state (id, pin_hash)
values (1, crypt('TROQUE_ESTE_PIN', gen_salt('bf')))
on conflict (id) do update set pin_hash = excluded.pin_hash;
