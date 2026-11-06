import { SeloStatus } from "@/components/selo-status";
import { FormularioStatus } from "@/components/formulario-status";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatarData } from "@/lib/formatar";
import { rotuloPapel } from "@/lib/status";

export function CartaoChamado({ chamado, podeAtualizar = false }) {
  return (
    <article>
      <Card className="cartao overflow-visible text-base">
        <CardHeader className="gap-3">
          <div className="linha-titulo">
            <h2>{chamado.local}</h2>
            <SeloStatus status={chamado.status} />
            {chamado.demonstracao ? <span className="etiqueta">Exemplo</span> : null}
          </div>
          <p className="tipo">{chamado.tipo}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-base">
          <p>{chamado.descricao}</p>
          <p>
            Pedido por <strong>{chamado.solicitante_nome}</strong>
            {" · "}
            aberto em {formatarData(chamado.criado_em)}
          </p>
          <section aria-label={`Histórico do chamado em ${chamado.local}`}>
            <h3>Histórico</h3>
            <ol className="historico">
              {chamado.historico.map((item) => (
                <li key={item.id}>
                  <SeloStatus status={item.status_novo} />
                  <p>{item.texto}</p>
                  <p className="meta">
                    {item.autor_nome} · {rotuloPapel(item.autor_papel)} · {formatarData(item.criado_em)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
          {podeAtualizar ? (
            <FormularioStatus id={chamado.id} statusAtual={chamado.status} />
          ) : null}
        </CardContent>
      </Card>
    </article>
  );
}
