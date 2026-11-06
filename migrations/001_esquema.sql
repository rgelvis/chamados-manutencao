create table if not exists escola (
  id integer generated always as identity primary key,
  nome text not null default '',
  cep text not null default '',
  logradouro text not null default '',
  municipio text not null default '',
  bairro text not null default '',
  uf text not null default '',
  atualizado_em timestamptz not null default now()
);

create table if not exists usuarios (
  id integer generated always as identity primary key,
  nome text not null,
  papel text not null check (papel in ('solicitante', 'atendente')),
  criado_em timestamptz not null default now(),
  unique (nome, papel)
);

create table if not exists chamados (
  id integer generated always as identity primary key,
  local text not null,
  tipo text not null,
  descricao text not null,
  status text not null check (status in ('Aberto', 'Em andamento', 'Concluído')),
  solicitante_nome text not null,
  demonstracao boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists historico (
  id integer generated always as identity primary key,
  chamado_id integer not null references chamados (id),
  status_anterior text check (
    status_anterior is null
    or status_anterior in ('Aberto', 'Em andamento', 'Concluído')
  ),
  status_novo text not null check (status_novo in ('Aberto', 'Em andamento', 'Concluído')),
  texto text not null,
  autor_nome text not null,
  autor_papel text not null,
  criado_em timestamptz not null default now()
);

create index if not exists chamados_solicitante_idx on chamados (solicitante_nome);

create index if not exists historico_chamado_idx on historico (chamado_id);
