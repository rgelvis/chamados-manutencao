import { Suspense } from "react";
import { io } from "next/cache";
import Link from "next/link";
import { FormularioEscola } from "@/components/formulario-escola";
import { MensagemErro, MensagemOk } from "@/components/mensagens";
import { obterEscola } from "@/lib/escola";
import { lerSessao } from "@/lib/sessao";

export const metadata = {
  title: "Dados da escola",
};

export default function Page({ searchParams }) {
  return (
    <Suspense fallback={<p className="pagina">Carregando os dados da escola…</p>}>
      <Escola searchParams={searchParams} />
    </Suspense>
  );
}

async function Escola({ searchParams }) {
  await io();
  const params = await searchParams;
  const sessao = await lerSessao();

  if (!sessao) {
    return (
      <div className="pagina">
        <h1>Dados da escola</h1>
        <MensagemErro id="erro-acesso-escola">
          Entre com seu nome e papel para preencher os dados da escola.
        </MensagemErro>
        <p>
          <Link className="atalho" href="/">
            Ir para a entrada
          </Link>
        </p>
      </div>
    );
  }

  const escola = await obterEscola();
  const aviso =
    params?.aviso === "escola" ? "Dados da escola salvos. O nome continua o que você escreveu." : "";

  return (
    <div className="pagina">
      <h1>Dados da escola</h1>
      <p className="lead">
        Cadastro do prédio. O CEP é consultado na ViaCEP para preencher logradouro e município. O
        nome da escola fica em branco até alguém da equipe escrever.
      </p>
      <MensagemOk>{aviso}</MensagemOk>
      <FormularioEscola
        escola={{
          nome: escola.nome ?? "",
          cep: escola.cep ?? "",
          logradouro: escola.logradouro ?? "",
          municipio: escola.municipio ?? "",
          bairro: escola.bairro ?? "",
          uf: escola.uf ?? "",
        }}
      />
    </div>
  );
}
