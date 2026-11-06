import { describe, expect, it } from "vitest";
import { opcoesClientePg, urlSemChannelBinding, usaPooler } from "../lib/opcoes-pg.mjs";

describe("conexão Postgres", () => {
  it("liga SSL no Neon e tira channel_binding, que o node-pg não usa", () => {
    const url =
      "postgres://usuario:segredo@ep-exemplo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    const opcoes = opcoesClientePg(url, { pool: true });

    expect(opcoes.connectionString).not.toContain("channel_binding");
    expect(opcoes.connectionString).toContain("sslmode=require");
    expect(opcoes.ssl).toEqual({ rejectUnauthorized: true });
    expect(usaPooler(opcoes.connectionString)).toBe(true);
  });

  it("não pede SSL num Postgres local sem sslmode", () => {
    const opcoes = opcoesClientePg("postgres://chamados@localhost:54329/chamados");

    expect(opcoes.ssl).toBeUndefined();
    expect(usaPooler(opcoes.connectionString)).toBe(false);
  });

  it("mantém a URL quando não há channel_binding", () => {
    expect(urlSemChannelBinding("postgres://localhost/chamados")).toBe("postgres://localhost/chamados");
  });
});
