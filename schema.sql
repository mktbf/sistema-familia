-- ============================================================
--  CADERNO DA CASA ÔÇö schema Supabase
--  Cole tudo no SQL Editor do Supabase e rode uma vez.
-- ============================================================

-- ---------- TABELAS ----------

create table if not exists households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Nossa Casa',
  created_at  timestamptz not null default now()
);

create table if not exists profiles (
  id            uuid primary key references auth.users on delete cascade,
  display_name  text not null,
  household_id  uuid references households(id),
  created_at    timestamptz not null default now()
);

-- s├│ guardamos as categorias personalizadas; as padr├úo ficam no app
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households(id) on delete cascade,
  label         text not null,
  color         text not null,
  created_at    timestamptz not null default now()
);

create table if not exists transactions (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,  -- autor = quem pagou
  space         text not null check (space in ('casa','pessoal')),
  type          text not null check (type in ('in','out')),
  amount        numeric(12,2) not null check (amount > 0),
  category      text not null,            -- id da categoria padr├úo ou uuid da personalizada
  description   text not null default '',
  occurred_on   date not null default current_date,
  created_at    timestamptz not null default now()
);

create index if not exists idx_tx_house_date on transactions (household_id, occurred_on);
create index if not exists idx_tx_user on transactions (user_id);

-- ---------- HELPER: a casa do usu├írio logado ----------
-- SECURITY DEFINER evita recurs├úo de RLS ao ler profiles
create or replace function my_household()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select household_id from profiles where id = auth.uid()
$$;

-- ---------- TRIGGER: cria o perfil ao cadastrar ----------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
--  RLS ÔÇö o cora├º├úo da privacidade
-- ============================================================

alter table households   enable row level security;
alter table profiles     enable row level security;
alter table categories   enable row level security;
alter table transactions enable row level security;

-- households: cada um v├¬ s├│ a pr├│pria casa
create policy "ver minha casa" on households
  for select using (id = my_household());

-- profiles: vejo os membros da minha casa (pra mostrar os nomes); edito s├│ o meu
create policy "ver perfis da casa" on profiles
  for select using (household_id = my_household() or id = auth.uid());
create policy "editar meu perfil" on profiles
  for update using (id = auth.uid());

-- categories: membros da casa leem, criam e apagam categorias da casa
create policy "ver categorias" on categories
  for select using (household_id = my_household());
create policy "criar categorias" on categories
  for insert with check (household_id = my_household());
create policy "apagar categorias" on categories
  for delete using (household_id = my_household());

-- transactions: CASA ├® vis├¡vel ├á casa toda; PESSOAL s├│ ao dono
create policy "ver transacoes" on transactions
  for select using (
    household_id = my_household()
    and (space = 'casa' or user_id = auth.uid())
  );
create policy "criar transacoes" on transactions
  for insert with check (
    user_id = auth.uid()
    and household_id = my_household()
  );
create policy "editar minhas transacoes" on transactions
  for update using (user_id = auth.uid());
create policy "apagar minhas transacoes" on transactions
  for delete using (user_id = auth.uid());

-- ============================================================
--  V├ìNCULO DO CASAL  ÔÜá´©Å rode S├ô DEPOIS que os dois j├í criaram conta no app
--  Cria uma casa e liga os dois perfis a ela.
-- ============================================================
-- do $$
-- declare h uuid;
-- begin
--   insert into households (name) values ('Nossa Casa') returning id into h;
--   update profiles set household_id = h where household_id is null;
-- end $$;

-- ============================================================
--  ATUALIZA├ç├âO: Lixeira (soft delete)
--  Rode no SQL Editor do Supabase DEPOIS do schema principal.
-- ============================================================
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
