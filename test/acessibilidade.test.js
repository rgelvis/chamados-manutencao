import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MensagemErro } from "../components/mensagens.jsx";
import { SeloStatus } from "../components/selo-status.jsx";
import { FormularioChamado } from "../components/formulario-chamado.jsx";

vi.mock("@/app/acoes", () => ({
  abrirChamado: vi.fn(),
  entrar: vi.fn(),
  salvarDadosEscola: vi.fn(),
  buscarEndereco: vi.fn(),
  mudarStatus: vi.fn(),
}));

const STATUS = ["Aberto", "Em andamento", "Concluído"];

describe("acessibilidade pedida na aula", () => {
  it("mostra Aberto, Em andamento e Concluído com palavra e nome no ícone", () => {
    for (const status of STATUS) {
      const html = renderToStaticMarkup(createElement(SeloStatus, { status }));
      const svg = html.slice(html.indexOf("<svg"), html.indexOf("</svg>"));

      expect(html).toContain(status);
      expect(svg).toContain('role="img"');
      expect(svg).toContain(`aria-label="${status}"`);
      expect(svg).not.toContain("aria-hidden");
    }
  });

  it("associa um rótulo visível a cada campo de abrir chamado", () => {
    const html = renderToStaticMarkup(createElement(FormularioChamado));

    expect(html).toMatch(/<label[^>]*for="local"[^>]*>[\s\S]*Local[\s\S]*<\/label>/);
    expect(html).toContain('id="local"');
    expect(html).toMatch(/<label[^>]*for="tipo"[^>]*>[\s\S]*Tipo[\s\S]*<\/label>/);
    expect(html).toContain('id="tipo"');
    expect(html).toMatch(/<label[^>]*for="descricao"[^>]*>[\s\S]*Descrição[\s\S]*<\/label>/);
    expect(html).toContain('id="descricao"');
  });

  it("escreve a mensagem de erro em texto", () => {
    const html = renderToStaticMarkup(
      createElement(MensagemErro, { id: "erro-chamado" }, "Informe o local do problema."),
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain("Erro:");
    expect(html).toContain("Informe o local do problema.");
  });
});
