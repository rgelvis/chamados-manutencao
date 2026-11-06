"use client";

import { MensagemErro } from "@/components/mensagens";
import { Button } from "@/components/ui/button";

export default function Erro({ reset }) {
  return (
    <div className="pagina">
      <h1>Não foi possível abrir esta tela</h1>
      <MensagemErro id="erro-tela">Algo falhou ao carregar os chamados. Tente de novo.</MensagemErro>
      <Button type="button" className="botao" onClick={() => reset()}>
        Tentar de novo
      </Button>
    </div>
  );
}
