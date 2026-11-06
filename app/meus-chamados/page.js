import { Suspense } from "react";
import { io } from "next/cache";
import Link from "next/link";
import { CartaoChamado } from "@/components/cartao-chamado";
import { MensagemOk } from "@/components/mensagens";
import { garantirDemonstracao } from "@/lib/demonstracao";
import { listarPorSolicitante } from "@/lib/chamados";
import { lerSessao } from "@/lib/sessao";
import { NOME_DEMONSTRACAO } from "@/lib/status";

export const metadata = {
  title: "Meus chamados",
};

export default function Page({ searchParams }) {
  return (
    <Suspense fallback={<p className="pagina">Carregando os seus chamados…</p>}>
      <Consulta searchParams={searchParams} />
    </Suspense>
  );
}

async function Consulta({ searchParams }) {
  await io();
  const params = await searchParams;
  const sessao = await lerSessao();

  if (!sessao) {
    return (
      <div className="pagina">
        <h1>Meus chamados</h1>
        <p role="alert" className="mensagem-erro">
          Entre com seu nome e papel para consultar o que você pediu.
        </p>
        <p>
          <Link className="atalho" href="/">
            Ir para a entrada
          </Link>
        </p>
      </div>
    );
  }

  await garantirDemonstracao();
  const chamados = await listarPorSolicitante(sessao.nome);
  const aviso = params?.aviso === "aberto" ? "Chamado aberto. O status inicial é Aberto." : "";

  return (
    <div className="pagina">
      <h1>Meus chamados</h1>
      <p className="lead">
        Pedidos abertos com o nome {sessao.nome}. O status mostra se alguém já viu o conserto e se
        ele terminou.
      </p>
      <MensagemOk>{aviso}</MensagemOk>
      {chamados.length === 0 ? (
        <div className="nota-exemplo">
          <p>Nenhum chamado com esse nome.</p>
          <p>
            <Link className="atalho" href="/chamados/novo">
              Abrir um chamado
            </Link>
          </p>
          <p>
            Para ver os exemplos, saia e entre como solicitante com o nome {NOME_DEMONSTRACAO}.
          </p>
        </div>
      ) : (
        <div className="lista">
          {chamados.map((chamado) => (
            <CartaoChamado key={chamado.id} chamado={chamado} />
          ))}
        </div>
      )}
    </div>
  );
}
