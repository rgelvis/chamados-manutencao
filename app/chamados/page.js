import { Suspense } from "react";
import { io } from "next/cache";
import Link from "next/link";
import { CartaoChamado } from "@/components/cartao-chamado";
import { MensagemOk } from "@/components/mensagens";
import { garantirDemonstracao } from "@/lib/demonstracao";
import { resumoStatus } from "@/lib/formatar";
import { listarChamados } from "@/lib/chamados";
import { lerSessao } from "@/lib/sessao";
import { PAPEL } from "@/lib/status";

export const metadata = {
  title: "Lista da direção",
};

const AVISOS = {
  aberto: "Chamado aberto. O status inicial é Aberto.",
  atualizado: "Status atualizado. A mudança ficou no histórico.",
};

export default function Page({ searchParams }) {
  return (
    <Suspense fallback={<p className="pagina">Carregando a lista de chamados…</p>}>
      <Lista searchParams={searchParams} />
    </Suspense>
  );
}

async function Lista({ searchParams }) {
  await io();
  const params = await searchParams;
  const sessao = await lerSessao();

  if (!sessao) {
    return (
      <div className="pagina">
        <h1>Lista da direção</h1>
        <p role="alert" className="mensagem-erro">
          Entre com seu nome e papel para ver a lista.
        </p>
        <p>
          <Link className="atalho" href="/">
            Ir para a entrada
          </Link>
        </p>
      </div>
    );
  }

  if (sessao.papel !== PAPEL.ATENDENTE) {
    return (
      <div className="pagina">
        <h1>Lista da direção</h1>
        <p className="lead">
          A lista completa é de quem atende. A sua consulta mostra só o que você pediu.
        </p>
        <p>
          <Link className="atalho" href="/meus-chamados">
            Ir para meus chamados
          </Link>
        </p>
      </div>
    );
  }

  await garantirDemonstracao();
  const chamados = await listarChamados();
  const aviso = AVISOS[params?.aviso] ?? "";
  const temExemplo = chamados.some((chamado) => chamado.demonstracao);

  return (
    <div className="pagina">
      <h1>Lista da direção</h1>
      <p className="lead">
        Todos os chamados do prédio, com o status por escrito e com ícone. Concluir exige um texto
        de atualização.
      </p>
      <p className="resumo">{resumoStatus(chamados)}</p>
      <MensagemOk>{aviso}</MensagemOk>
      {temExemplo ? (
        <p className="nota-exemplo">
          Os cartões com a etiqueta Exemplo são dados de demonstração. Eles não vêm de uma visita à
          escola.
        </p>
      ) : null}
      {chamados.length === 0 ? (
        <p>Nenhum chamado registrado ainda.</p>
      ) : (
        <div className="lista">
          {chamados.map((chamado) => (
            <CartaoChamado key={chamado.id} chamado={chamado} podeAtualizar />
          ))}
        </div>
      )}
    </div>
  );
}
