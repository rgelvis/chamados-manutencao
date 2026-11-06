import { Suspense } from "react";
import { io } from "next/cache";
import { FormularioEntrada } from "@/components/formulario-entrada";
import Link from "next/link";
import { lerSessao } from "@/lib/sessao";
import { PAPEL } from "@/lib/status";

export default function Page({ searchParams }) {
  return (
    <Suspense fallback={<p className="pagina">Carregando a entrada…</p>}>
      <Inicio searchParams={searchParams} />
    </Suspense>
  );
}

async function Inicio({ searchParams }) {
  await io();
  const params = await searchParams;
  const sessao = await lerSessao();
  const erroInicial = typeof params?.erro === "string" ? params.erro : "";

  if (!sessao) {
    return (
      <div className="pagina">
        <h1>Entrar</h1>
        <p className="lead">
          A equipe da escola registra o pedido de conserto do prédio e acompanha se ele está aberto,
          em andamento ou concluído.
        </p>
        <FormularioEntrada erroInicial={erroInicial} />
      </div>
    );
  }

  return (
    <div className="pagina">
      <h1>Por onde seguir</h1>
      <p className="lead">
        {sessao.nome}, você está como{" "}
        {sessao.papel === PAPEL.ATENDENTE ? "quem atende o chamado" : "quem solicita o conserto"}.
      </p>
      {erroInicial ? (
        <p role="alert" className="mensagem-erro">
          {erroInicial}
        </p>
      ) : null}
      <ul className="atalhos">
        <li>
          <Link href="/chamados/novo">Abrir um chamado</Link>
          <p>Informe local, tipo e descrição. O status inicial é Aberto.</p>
        </li>
        <li>
          <Link href="/meus-chamados">Consultar o que você pediu</Link>
          <p>Veja o status e o histórico dos chamados abertos com o seu nome.</p>
        </li>
        <li>
          <Link href="/chamados">Lista da direção</Link>
          <p>Quem atende vê todos os chamados e registra cada mudança de status.</p>
        </li>
      </ul>
    </div>
  );
}
