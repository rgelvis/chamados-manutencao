import Link from "next/link";

export default function NaoEncontrada() {
  return (
    <div className="pagina">
      <h1>Página não encontrada</h1>
      <p>Esse endereço não faz parte do sistema de chamados.</p>
      <p>
        <Link className="atalho" href="/">
          Voltar para a entrada
        </Link>
      </p>
    </div>
  );
}
