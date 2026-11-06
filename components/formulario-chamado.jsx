"use client";

import { useActionState } from "react";
import { abrirChamado } from "@/app/acoes";
import { useFocoNoErro } from "@/components/foco-erro";
import { descritoPorErro, MensagemErro } from "@/components/mensagens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TIPOS_CHAMADO } from "@/lib/status";

const inicial = { erro: "", campo: "", local: "", tipo: "", descricao: "" };
const CAMPOS = { local: "local", tipo: "tipo", descricao: "descricao" };

export function FormularioChamado() {
  const [estado, acao, enviando] = useActionState(abrirChamado, inicial);
  useFocoNoErro(estado.erro, "erro-chamado", CAMPOS[estado.campo] ?? "");

  function ligarCampo(campo) {
    const invalido = Boolean(estado.erro) && estado.campo === campo;
    return {
      "aria-invalid": invalido || undefined,
      "aria-errormessage": invalido ? "erro-chamado" : undefined,
      "aria-describedby": descritoPorErro(estado.erro, "erro-chamado", "ajuda-chamado", invalido),
    };
  }

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
          autoComplete="off"
          {...ligarCampo("local")}
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
          required
          {...ligarCampo("tipo")}
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
          required
          {...ligarCampo("descricao")}
        />
      </div>

      <Button type="submit" className="botao" disabled={enviando}>
        {enviando ? "Abrindo chamado…" : "Abrir chamado"}
      </Button>
    </form>
  );
}
