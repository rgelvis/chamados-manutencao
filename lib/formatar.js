export function formatarData(valor) {
  if (!valor) return "";
  const data = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(data.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

export function resumoStatus(chamados) {
  const total = (status) => chamados.filter((chamado) => chamado.status === status).length;
  const aberto = total("Aberto");
  const andamento = total("Em andamento");
  const concluido = total("Concluído");
  const texto = (quantidade, um, varios) => `${quantidade} ${quantidade === 1 ? um : varios}`;
  return `${texto(aberto, "aberto", "abertos")}, ${texto(andamento, "em andamento", "em andamento")} e ${texto(concluido, "concluído", "concluídos")}.`;
}
