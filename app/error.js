"use client";

import { Button } from "@/components/ui/button";

export default function Erro({ reset }) {
  return (
    <div className="pagina">
      <h1>Não foi possível abrir esta tela</h1>
      <p role="alert" className="mensagem-erro">
        Algo falhou ao carregar os chamados. Tente de novo.
      </p>
      <Button type="button" className="botao" onClick={() => reset()}>
        Tentar de novo
      </Button>
    </div>
  );
}
