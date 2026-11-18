-- Gabinete Digital — esquema proposto para a etapa Supabase (NÃO utilizado pelo protótipo).
create type user_role as enum ('cidadao','assessor','parlamentar','admin_plataforma');
create type request_status as enum ('recebida','em_analise','encaminhada','aguardando_retorno','em_acompanhamento','concluida','arquivada');
create type priority as enum ('baixa','media','alta','urgente');

create table tenants (
  id uuid primary key default gen_random_uuid(),
  parlamentar text not null, cargo text not null, municipio text not null, uf char(2) not null,
  plano text not null default 'Essencial', assinatura text not null default 'teste',
  cor_primaria text, cor_secundaria text, logo_url text, foto_url text,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id), role user_role not null,
  nome text not null, cargo text, ativo boolean default true, permissoes text[] default '{}'
);

create table requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  protocolo text not null, citizen_id uuid not null references profiles(id),
  categoria text not null, bairro text not null, rua text not null, numero text,
  lat double precision, lng double precision, descricao text not null,
  status request_status not null default 'recebida', prioridade priority not null default 'media',
  responsavel_id uuid references profiles(id), orgao text, prazo date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (tenant_id, protocolo)
);
create index on requests (tenant_id, status);

create table request_timeline (id uuid primary key default gen_random_uuid(), tenant_id uuid not null, request_id uuid not null references requests(id) on delete cascade, status request_status not null, descricao text not null, created_at timestamptz default now());
create table request_messages (id uuid primary key default gen_random_uuid(), tenant_id uuid not null, request_id uuid not null references requests(id) on delete cascade, autor user_role not null, autor_nome text, texto text not null, created_at timestamptz default now());
-- tabela separada: só equipe lê (política abaixo) => notas internas nunca chegam ao cidadão
create table request_internal_notes (id uuid primary key default gen_random_uuid(), tenant_id uuid not null, request_id uuid not null references requests(id) on delete cascade, autor_nome text, texto text not null, created_at timestamptz default now());
create table request_history (id uuid primary key default gen_random_uuid(), tenant_id uuid not null, request_id uuid not null references requests(id) on delete cascade, texto text not null, autor_nome text, created_at timestamptz default now());
create table request_photos (id uuid primary key default gen_random_uuid(), tenant_id uuid not null, request_id uuid not null references requests(id) on delete cascade, storage_path text not null);
create table notifications (id uuid primary key default gen_random_uuid(), tenant_id uuid not null, citizen_id uuid not null, request_id uuid references requests(id), titulo text not null, texto text, lida boolean default false, created_at timestamptz default now());
create table posts (id uuid primary key default gen_random_uuid(), tenant_id uuid not null references tenants(id), tipo text not null, titulo text not null, resumo text, corpo text, data date, numero text, situacao text, local text, hora text, publicado boolean default false);
create table oficios (id uuid primary key default gen_random_uuid(), tenant_id uuid not null, request_id uuid not null references requests(id), numero text, destinatario text, secretaria text, assunto text, descricao text, providencias text, data date, identificacao text, created_at timestamptz default now());

-- RLS (exemplo; replicar para todas as tabelas com tenant_id)
create or replace function auth_tenant() returns uuid language sql stable as $$ select nullif(auth.jwt() -> 'app_metadata' ->> 'tenant_id','')::uuid $$;
create or replace function auth_role() returns text language sql stable as $$ select auth.jwt() -> 'app_metadata' ->> 'role' $$;

alter table requests enable row level security;
create policy requests_staff on requests for all using (tenant_id = auth_tenant() and auth_role() in ('assessor','parlamentar')) with check (tenant_id = auth_tenant());
create policy requests_citizen_read on requests for select using (tenant_id = auth_tenant() and citizen_id = auth.uid());
create policy requests_citizen_insert on requests for insert with check (tenant_id = auth_tenant() and citizen_id = auth.uid());

alter table request_internal_notes enable row level security;
create policy notes_staff on request_internal_notes for all using (tenant_id = auth_tenant() and auth_role() in ('assessor','parlamentar'));
-- admin_plataforma: acesso apenas a tenants/assinaturas, sem política em tabelas de conteúdo.
