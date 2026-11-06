"use client";

import { useActionState } from "react";
import { entrar } from "@/app/acoes";
import { useFocoNoErro } from "@/components/foco-erro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { descritoPorErro, MensagemErro } from "@/components/mensagens";
import { NOME_DEMONSTRACAO } from "@/lib/status";

const inicial = { erro: "", campo: "", nome: "" };

export function FormularioEntrada({ erroInicial = "" }) {
  const [estado, acao, enviando] = useActionState(entrar, inicial);
  const erro = estado.erro || erroInicial;
  const nome = estado.nome || "";
  const erroNome = Boolean(erro) && estado.campo === "nome";
  const erroPapel = Boolean(erro) && estado.campo === "papel";
  useFocoNoErro(erro, "erro-entrada", erroNome ? "nome" : estado.campo === "papel" ? "papel-solicitante" : "");

  return (
    <form action={acao} className="formulario" noValidate>
      <MensagemErro id="erro-entrada">{erro}</MensagemErro>

      <div className="campo-grupo">
        <Label htmlFor="nome" className="rotulo">
          Seu nome
        </Label>
        <Input
          id="nome"
          name="nome"
          className="campo"
          autoComplete="name"
          defaultValue={nome}
          aria-invalid={erroNome || undefined}
          aria-errormessage={erroNome ? "erro-entrada" : undefined}
          aria-describedby={descritoPorErro(erro, "erro-entrada", "ajuda-nome", erroNome)}
          required
        />
        <p id="ajuda-nome" className="ajuda">
          Use o nome pelo qual a equipe da escola conhece você. Não informe dado de aluno.
        </p>
      </div>

      <fieldset className="grupo-papel" aria-describedby={erroPapel ? "erro-entrada" : undefined}>
        <legend className="rotulo">Papel na escola</legend>
        <label className="opcao-papel" htmlFor="papel-solicitante">
          <input
            id="papel-solicitante"
            type="radio"
            name="papel"
            value="solicitante"
            aria-invalid={erroPapel || undefined}
            aria-errormessage={erroPapel ? "erro-entrada" : undefined}
            aria-describedby={erroPapel ? "erro-entrada" : undefined}
          />
          <span>
            <strong>Solicita o conserto</strong>
            <span>Abre o chamado e consulta o que pediu.</span>
          </span>
        </label>
        <label className="opcao-papel" htmlFor="papel-atendente">
          <input
            id="papel-atendente"
            type="radio"
            name="papel"
            value="atendente"
            aria-invalid={erroPapel || undefined}
            aria-errormessage={erroPapel ? "erro-entrada" : undefined}
            aria-describedby={erroPapel ? "erro-entrada" : undefined}
          />
          <span>
            <strong>Atende o chamado</strong>
            <span>Vê a lista da direção e muda o status.</span>
          </span>
        </label>
      </fieldset>

      <Button type="submit" className="botao" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </Button>

      <aside className="nota-exemplo">
        <h2>Exemplos para a demonstração</h2>
        <p>
          A visita à escola ainda não aconteceu. Para ver a consulta com exemplos, entre como quem
          solicita e use o nome {NOME_DEMONSTRACAO}. A lista da direção abre com o papel Atende, com
          qualquer nome.
        </p>
      </aside>
    </form>
  );
}
