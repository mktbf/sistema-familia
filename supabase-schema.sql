-- Cria a tabela que vai guardar todo o estado do app
create table app_state (
  id integer primary key default 1,
  current_week varchar,
  checks jsonb default '{}'::jsonb,
  meeting jsonb default '{}'::jsonb,
  goals jsonb default '{}'::jsonb
);

-- Habilita atualizações em tempo real para que um celular veja o que o outro faz instantaneamente
alter publication supabase_realtime add table app_state;

-- Insere a linha única que o sistema vai ficar atualizando
insert into app_state (id, current_week, checks, meeting, goals) 
values (1, '', '{}', '{}', '{}');

-- Permite leitura/escrita anônima (como é só para vocês dois, para ser mais rápido)
alter table app_state enable row level security;
create policy "Permitir acesso público" on app_state for all using (true) with check (true);
