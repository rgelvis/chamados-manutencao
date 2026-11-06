import Link from "next/link";
import { io } from "next/cache";
import { sair } from "@/app/acoes";
import { Button } from "@/components/ui/button";
import { garantirDemonstracao } from "@/lib/demonstracao";
import { obterEscola } from "@/lib/escola";
import { lerSessao } from "@/lib/sessao";
import { rotuloPapel } from "@/lib/status";

export async function Cabecalho() {
  await io();
  const sessao = await lerSessao();
  let nomeEscola = "";
  if (sessao) {
    await garantirDemonstracao();
    const escola = await obterEscola();
    nomeEscola = String(escola?.nome ?? "").trim();
  }

  return (
    <header className="topo">
      <div className="topo-miolo">
        <div>
          <p className="marca">Chamados de manutenção</p>
          <p className="escola-topo">
            {nomeEscola || "Nome da escola ainda não informado"}
          </p>
        </div>
        {sessao ? (
          <div className="topo-acoes">
            <nav className="navegacao" aria-label="Seções">
              <Link href="/chamados/novo">Abrir chamado</Link>
              <Link href="/meus-chamados">Meus chamados</Link>
              <Link href="/chamados">Lista da direção</Link>
              <Link href="/escola">Dados da escola</Link>
            </nav>
            <p className="quem">
              {sessao.nome} · {rotuloPapel(sessao.papel)}
            </p>
            <form action={sair}>
              <Button type="submit" variant="outline" className="botao botao-sair">
                Sair
              </Button>
            </form>
          </div>
        ) : (
          <p className="quem">Entre com seu nome e papel para registrar ou acompanhar um conserto.</p>
        )}
      </div>
    </header>
  );
}
