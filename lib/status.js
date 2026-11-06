export const STATUS = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

export const LISTA_STATUS = [STATUS.ABERTO, STATUS.EM_ANDAMENTO, STATUS.CONCLUIDO];

export const TIPOS_CHAMADO = [
  "Elétrica",
  "Hidráulica",
  "Mobiliário",
  "Equipamento",
  "Outro",
];

export const PAPEL = {
  SOLICITANTE: "solicitante",
  ATENDENTE: "atendente",
};

export const NOME_DEMONSTRACAO = "Demonstração";

export function rotuloPapel(papel) {
  if (papel === PAPEL.ATENDENTE) return "Atende";
  if (papel === PAPEL.SOLICITANTE) return "Solicita";
  return "";
}

export function erroAoConcluir(novoStatus, texto) {
  const limpo = String(texto ?? "").trim();
  if (novoStatus === STATUS.CONCLUIDO && limpo === "") {
    return "Para concluir o chamado, escreva uma atualização do que foi feito.";
  }
  return "";
}
