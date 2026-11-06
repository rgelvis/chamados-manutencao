import { createHmac, randomBytes } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { obterSegredoSessao } from "../lib/segredo-sessao.js";
import { criarTokenSessao, lerTokenSessao } from "../lib/token-sessao.js";

beforeAll(() => {
  process.env.SESSAO_SEGREDO = randomBytes(32).toString("base64url");
});

describe("cookie de sessão", () => {
  it("guarda só o id do usuário e confere a assinatura", async () => {
    const token = await criarTokenSessao(7);
    const lido = await lerTokenSessao(token);

    expect(lido).toEqual({ id: 7 });
    expect(token.includes("atendente")).toBe(false);
    expect(token.includes("solicitante")).toBe(false);
  });

  it("rejeita um cookie sem assinatura, mesmo com papel de quem atende", async () => {
    const forjado = Buffer.from(
      JSON.stringify({ id: 1, nome: "Visitante", papel: "atendente" }),
      "utf8",
    ).toString("base64url");

    expect(await lerTokenSessao(forjado)).toBeNull();
  });

  it("rejeita um cookie assinado com outro segredo ou com o corpo alterado", async () => {
    const token = await criarTokenSessao(4);
    const corpo = token.slice(0, token.lastIndexOf("."));
    const assinaturaAlheia = createHmac("sha256", randomBytes(32))
      .update(corpo)
      .digest("base64url");
    const corpoTrocado = Buffer.from(JSON.stringify({ id: 4, papel: "atendente" }), "utf8").toString(
      "base64url",
    );

    expect(await lerTokenSessao(`${corpo}.${assinaturaAlheia}`)).toBeNull();
    expect(await lerTokenSessao(`${corpoTrocado}.${token.slice(token.lastIndexOf(".") + 1)}`)).toBeNull();
  });

  it("na publicação exige SESSAO_SEGREDO e não inventa outro", async () => {
    const segredo = process.env.SESSAO_SEGREDO;
    const ambiente = process.env.NODE_ENV;
    delete process.env.SESSAO_SEGREDO;
    process.env.NODE_ENV = "production";
    try {
      await expect(obterSegredoSessao()).rejects.toThrow(/SESSAO_SEGREDO/);
    } finally {
      process.env.SESSAO_SEGREDO = segredo;
      process.env.NODE_ENV = ambiente;
    }
  });
});
