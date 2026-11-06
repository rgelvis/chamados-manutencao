import { CircleCheck, CircleDot, Clock3 } from "lucide-react";

const ITENS = {
  Aberto: { Icone: CircleDot, classe: "status-aberto" },
  "Em andamento": { Icone: Clock3, classe: "status-andamento" },
  Concluído: { Icone: CircleCheck, classe: "status-concluido" },
};

export function SeloStatus({ status }) {
  const conhecido = Object.hasOwn(ITENS, status);
  const item = conhecido ? ITENS[status] : { Icone: CircleDot, classe: "status-aberto" };
  const nome = conhecido ? status : String(status ?? "");
  const Icone = item.Icone;
  return (
    <span className={`selo-status ${item.classe}`}>
      <Icone className="selo-icone" role="img" aria-label={nome} />
      <span aria-hidden="true">{nome}</span>
    </span>
  );
}
