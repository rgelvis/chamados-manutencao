import { sql } from "./db.js";
import {
  LISTA_STATUS,
  PAPEL,
  STATUS,
  TIPOS_CHAMADO,
  erroAoConcluir,
} from "./status.js";

export class ErroDeChamado extends Error {
  constructor(mensagem, campo = "") {
    super(mensagem);
    this.name = "ErroDeChamado";
    this.campo = campo;
  }
}

function limpar(valor) {
  return String(valor ?? "").trim();
}

function agruparHistorico(chamados, historico) {
  const porChamado = new Map();
  for (const item of historico) {
    const lista = porChamado.get(item.chamado_id) ?? [];
    lista.push(item);
    porChamado.set(item.chamado_id, lista);
  }
  return chamados.map((chamado) => ({
    ...chamado,
    historico: porChamado.get(chamado.id) ?? [],
  }));
}

export async function criarChamado({
  local,
  tipo,
  descricao,
  solicitanteNome,
  demonstracao = false,
}) {
  const localLimpo = limpar(local);
  const tipoLimpo = limpar(tipo);
  const descricaoLimpa = limpar(descricao);
  const nome = limpar(solicitanteNome);

  if (localLimpo === "") {
    throw new ErroDeChamado("Informe o local do problema.", "local");
  }
  if (localLimpo.length > 120) {
    throw new ErroDeChamado("O local precisa caber em 120 caracteres.", "local");
  }
  if (!TIPOS_CHAMADO.includes(tipoLimpo)) {
    throw new ErroDeChamado("Escolha o tipo do problema.", "tipo");
  }
  if (descricaoLimpa === "") {
    throw new ErroDeChamado("Descreva o que aconteceu.", "descricao");
  }
  if (descricaoLimpa.length > 2000) {
    throw new ErroDeChamado("A descrição precisa caber em 2000 caracteres.", "descricao");
  }
  if (nome === "") {
    throw new ErroDeChamado("Informe quem está solicitando o chamado.", "nome");
  }

  const linhas = await sql(
    `insert into chamados (local, tipo, descricao, status, solicitante_nome, demonstracao)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [localLimpo, tipoLimpo, descricaoLimpa, STATUS.ABERTO, nome, Boolean(demonstracao)],
  );
  const chamado = linhas[0];
  await sql(
    `insert into historico (chamado_id, status_anterior, status_novo, texto, autor_nome, autor_papel)
     values ($1, null, $2, $3, $4, $5)`,
    [chamado.id, STATUS.ABERTO, descricaoLimpa, nome, PAPEL.SOLICITANTE],
  );
  return obterChamado(chamado.id);
}

export async function atualizarStatus({ id, novoStatus, texto, autorNome, autorPapel }) {
  if (autorPapel !== PAPEL.ATENDENTE) {
    throw new ErroDeChamado("Só quem atende pode mudar o status do chamado.");
  }
  if (!LISTA_STATUS.includes(novoStatus)) {
    throw new ErroDeChamado("Escolha um status: Aberto, Em andamento ou Concluído.", "status");
  }

  const textoLimpo = limpar(texto);
  const erroConclusao = erroAoConcluir(novoStatus, textoLimpo);
  if (erroConclusao) {
    throw new ErroDeChamado(erroConclusao, "texto");
  }
  if (textoLimpo === "") {
    throw new ErroDeChamado("Escreva uma atualização para registrar a mudança.", "texto");
  }
  if (textoLimpo.length > 2000) {
    throw new ErroDeChamado("A atualização precisa caber em 2000 caracteres.", "texto");
  }

  const nome = limpar(autorNome);
  if (nome === "") {
    throw new ErroDeChamado("Informe quem está atualizando o chamado.");
  }

  const atuais = await sql("select id, status from chamados where id = $1", [id]);
  if (!atuais[0]) {
    throw new ErroDeChamado("Chamado não encontrado.");
  }
  const anterior = atuais[0].status;
  if (anterior === novoStatus) {
    throw new ErroDeChamado(
      `Este chamado já está como ${anterior}. Escolha outro status para registrar a mudança.`,
      "status",
    );
  }

  const atualizados = await sql(
    `update chamados
     set status = $1, atualizado_em = now()
     where id = $2 and status = $3
     returning id`,
    [novoStatus, id, anterior],
  );
  if (atualizados.length === 0) {
    throw new ErroDeChamado("O status mudou enquanto você atualizava. Recarregue a lista.");
  }

  await sql(
    `insert into historico (chamado_id, status_anterior, status_novo, texto, autor_nome, autor_papel)
     values ($1, $2, $3, $4, $5, $6)`,
    [id, anterior, novoStatus, textoLimpo, nome, PAPEL.ATENDENTE],
  );
  return obterChamado(id);
}

export async function obterChamado(id) {
  const linhas = await sql("select * from chamados where id = $1", [id]);
  if (!linhas[0]) return null;
  const historico = await sql(
    "select * from historico where chamado_id = $1 order by id asc",
    [id],
  );
  return { ...linhas[0], historico };
}

export async function listarChamados() {
  const chamados = await sql(
    "select * from chamados order by atualizado_em desc, id desc",
  );
  const historico = await sql("select * from historico order by id asc");
  return agruparHistorico(chamados, historico);
}

export async function listarPorSolicitante(nome) {
  const alvo = limpar(nome).toLocaleLowerCase("pt-BR");
  const chamados = await listarChamados();
  return chamados.filter(
    (chamado) => chamado.solicitante_nome.trim().toLocaleLowerCase("pt-BR") === alvo,
  );
}
