"use client";

import { useActionState } from "react";
import { abrirChamado } from "@/app/acoes";
import { MensagemErro } from "@/components/mensagens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TIPOS_CHAMADO } from "@/lib/status";

const inicial = { erro: "", campo: "", local: "", tipo: "", descricao: "" };

export function FormularioChamado() {
  const [estado, acao, enviando] = useActionState(abrirChamado, inicial);
  const descritoPor = estado.erro ? "erro-chamado ajuda-chamado" : "ajuda-chamado";

  return (
    <form action={acao} className="formulario" noValidate>
      <MensagemErro id="erro-chamado">{estado.erro}</MensagemErro>
      <p id="ajuda-chamado" className="ajuda">
        O chamado nasce com o status Aberto. Quem atende muda o status depois, e só conclui com um
        texto de atualização.
      </p>

      <div className="campo-grupo">
        <Label htmlFor="local" className="rotulo">
          Local
        </Label>
        <Input
          id="local"
          name="local"
          className="campo"
          defaultValue={estado.local}
          aria-invalid={estado.campo === "local" || undefined}
          aria-describedby={descritoPor}
          autoComplete="off"
          required
        />
      </div>

      <div className="campo-grupo">
        <Label htmlFor="tipo" className="rotulo">
          Tipo
        </Label>
        <select
          id="tipo"
          name="tipo"
          className="campo"
          defaultValue={estado.tipo}
          aria-invalid={estado.campo === "tipo" || undefined}
          aria-describedby={descritoPor}
          required
        >
          <option value="">Selecione o tipo</option>
          {TIPOS_CHAMADO.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div className="campo-grupo">
        <Label htmlFor="descricao" className="rotulo">
          Descrição
        </Label>
        <Textarea
          id="descricao"
          name="descricao"
          className="campo"
          defaultValue={estado.descricao}
          aria-invalid={estado.campo === "descricao" || undefined}
          aria-describedby={descritoPor}
          required
        />
      </div>

      <Button type="submit" className="botao" disabled={enviando}>
        {enviando ? "Abrindo chamado…" : "Abrir chamado"}
      </Button>
    </form>
  );
}
