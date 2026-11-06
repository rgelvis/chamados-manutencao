"use client";

import { useActionState } from "react";
import { mudarStatus } from "@/app/acoes";
import { useFocoNoErro } from "@/components/foco-erro";
import { descritoPorErro, MensagemErro } from "@/components/mensagens";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LISTA_STATUS } from "@/lib/status";

function proximoStatus(atual) {
  if (atual === "Aberto") return "Em andamento";
  if (atual === "Em andamento") return "Concluído";
  return "Aberto";
}

export function FormularioStatus({ id, statusAtual }) {
  const [estado, acao, enviando] = useActionState(mudarStatus, { erro: "", campo: "" });
  const ajudaId = `ajuda-status-${id}`;
  const erroId = `erro-status-${id}`;
  const invalidoStatus = Boolean(estado.erro) && estado.campo === "status";
  const invalidoTexto = Boolean(estado.erro) && estado.campo === "texto";
  const idCampo = invalidoStatus ? `status-${id}` : invalidoTexto ? `texto-${id}` : "";
  useFocoNoErro(estado.erro, erroId, idCampo);

  return (
    <form action={acao} className="formulario formulario-status" noValidate>
      <input type="hidden" name="id" value={id} />
      <MensagemErro id={erroId}>{estado.erro}</MensagemErro>
      <p id={ajudaId} className="ajuda">
        Para concluir, escreva o que foi feito. Sem esse texto o chamado não muda para Concluído.
      </p>

      <div className="campo-grupo">
        <Label htmlFor={`status-${id}`} className="rotulo">
          Novo status
        </Label>
        <select
          id={`status-${id}`}
          name="status"
          className="campo"
          defaultValue={proximoStatus(statusAtual)}
          aria-invalid={invalidoStatus || undefined}
          aria-errormessage={invalidoStatus ? erroId : undefined}
          aria-describedby={descritoPorErro(estado.erro, erroId, ajudaId, invalidoStatus)}
        >
          {LISTA_STATUS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="campo-grupo">
        <Label htmlFor={`texto-${id}`} className="rotulo">
          Atualização
        </Label>
        <Textarea
          id={`texto-${id}`}
          name="texto"
          className="campo"
          aria-invalid={invalidoTexto || undefined}
          aria-errormessage={invalidoTexto ? erroId : undefined}
          aria-describedby={descritoPorErro(estado.erro, erroId, ajudaId, invalidoTexto)}
        />
      </div>

      <Button type="submit" className="botao" disabled={enviando}>
        {enviando ? "Registrando…" : "Registrar mudança"}
      </Button>
    </form>
  );
}
