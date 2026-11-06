import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { atualizarStatus, criarChamado, obterChamado } from "../lib/chamados.js";
import { resetBancoLocalParaTeste } from "../lib/db.js";
import { PAPEL, STATUS } from "../lib/status.js";

const pedido = {
  local: "Secretaria",
  tipo: "Elétrica",
  descricao: "A lâmpada da secretaria queimou.",
  solicitanteNome: "Pessoa teste",
};

beforeEach(async () => {
  await resetBancoLocalParaTeste();
});

afterAll(async () => {
  await resetBancoLocalParaTeste();
});

describe("fluxo do chamado", () => {
  it("cria o chamado com status Aberto", async () => {
    const chamado = await criarChamado(pedido);

    expect(chamado.status).toBe(STATUS.ABERTO);
    expect(chamado.historico).toHaveLength(1);
    expect(chamado.historico[0].status_novo).toBe(STATUS.ABERTO);
    expect(chamado.historico[0].texto).toBe(pedido.descricao);

    const lido = await obterChamado(chamado.id);
    expect(lido.status).toBe("Aberto");
  });

  it("não conclui sem texto de atualização e mantém o status Aberto", async () => {
    const chamado = await criarChamado(pedido);

    await expect(
      atualizarStatus({
        id: chamado.id,
        novoStatus: STATUS.CONCLUIDO,
        texto: "   ",
        autorNome: "Atendente teste",
        autorPapel: PAPEL.ATENDENTE,
      }),
    ).rejects.toThrow(/atualização/);

    const lido = await obterChamado(chamado.id);
    expect(lido.status).toBe(STATUS.ABERTO);
    expect(lido.historico).toHaveLength(1);
  });

  it("conclui quando há texto de atualização e guarda o histórico", async () => {
    const chamado = await criarChamado(pedido);
    const texto = "Lâmpada trocada pela zeladoria.";

    const atualizado = await atualizarStatus({
      id: chamado.id,
      novoStatus: STATUS.CONCLUIDO,
      texto,
      autorNome: "Atendente teste",
      autorPapel: PAPEL.ATENDENTE,
    });

    expect(atualizado.status).toBe(STATUS.CONCLUIDO);
    expect(atualizado.historico.map((item) => item.status_novo)).toEqual([
      STATUS.ABERTO,
      STATUS.CONCLUIDO,
    ]);
    expect(atualizado.historico[1].texto).toBe(texto);
  });
});
