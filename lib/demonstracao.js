import { criarChamado, atualizarStatus } from "./chamados.js";
import { sql } from "./db.js";
import { NOME_DEMONSTRACAO, PAPEL, STATUS } from "./status.js";

let semeadura;

const ATENDENTE_EXEMPLO = "Atendente de exemplo";

async function registrarUsuario(nome, papel) {
  await sql(
    `insert into usuarios (nome, papel)
     values ($1, $2)
     on conflict (nome, papel) do nothing`,
    [nome, papel],
  );
}

async function semear() {
  const existentes = await sql(
    "select count(*)::int as total from chamados where demonstracao = true",
  );
  if (Number(existentes[0]?.total ?? 0) > 0) return;

  await registrarUsuario(NOME_DEMONSTRACAO, PAPEL.SOLICITANTE);
  await registrarUsuario(ATENDENTE_EXEMPLO, PAPEL.ATENDENTE);

  await criarChamado({
    local: "Secretaria",
    tipo: "Equipamento",
    descricao: "O computador da secretaria não inicia.",
    solicitanteNome: NOME_DEMONSTRACAO,
    demonstracao: true,
  });

  const bebedouro = await criarChamado({
    local: "Corredor",
    tipo: "Hidráulica",
    descricao: "O bebedouro está vazando.",
    solicitanteNome: NOME_DEMONSTRACAO,
    demonstracao: true,
  });
  await atualizarStatus({
    id: bebedouro.id,
    novoStatus: STATUS.EM_ANDAMENTO,
    texto: "A zeladoria isolou o registro e aguarda a peça.",
    autorNome: ATENDENTE_EXEMPLO,
    autorPapel: PAPEL.ATENDENTE,
  });

  const lampada = await criarChamado({
    local: "Sala dos professores",
    tipo: "Elétrica",
    descricao: "A lâmpada do teto queimou.",
    solicitanteNome: NOME_DEMONSTRACAO,
    demonstracao: true,
  });
  await atualizarStatus({
    id: lampada.id,
    novoStatus: STATUS.EM_ANDAMENTO,
    texto: "Pedido encaminhado à manutenção do prédio.",
    autorNome: ATENDENTE_EXEMPLO,
    autorPapel: PAPEL.ATENDENTE,
  });
  await atualizarStatus({
    id: lampada.id,
    novoStatus: STATUS.CONCLUIDO,
    texto: "Lâmpada trocada. A sala voltou a acender.",
    autorNome: ATENDENTE_EXEMPLO,
    autorPapel: PAPEL.ATENDENTE,
  });
}

export function garantirDemonstracao() {
  if (!semeadura) {
    semeadura = semear().catch((erro) => {
      semeadura = undefined;
      throw erro;
    });
  }
  return semeadura;
}
