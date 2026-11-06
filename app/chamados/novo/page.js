import { Suspense } from "react";
import { io } from "next/cache";
import Link from "next/link";
import { FormularioChamado } from "@/components/formulario-chamado";
import { lerSessao } from "@/lib/sessao";

export const metadata = {
  title: "Abrir chamado",
};

export default function Page() {
  return (
    <Suspense fallback={<p className="pagina">Carregando o formulário…</p>}>
      <Novo />
    </Suspense>
  );
}

async function Novo() {
  await io();
  const sessao = await lerSessao();
  if (!sessao) {
    return (
      <div className="pagina">
        <h1>Abrir chamado</h1>
        <p role="alert" className="mensagem-erro">
          Entre com seu nome e papel para abrir um chamado.
        </p>
        <p>
          <Link className="atalho" href="/">
            Ir para a entrada
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="pagina">
      <h1>Abrir chamado</h1>
      <p className="lead">
        Descreva o problema do prédio. O pedido fica com o seu nome, {sessao.nome}, para você
        consultar depois.
      </p>
      <FormularioChamado />
    </div>
  );
}
