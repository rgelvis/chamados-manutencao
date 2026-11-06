import { CircleCheck, CircleDot, Clock3 } from "lucide-react";

const ITENS = {
  Aberto: { Icone: CircleDot, classe: "status-aberto" },
  "Em andamento": { Icone: Clock3, classe: "status-andamento" },
  Concluído: { Icone: CircleCheck, classe: "status-concluido" },
};

export function SeloStatus({ status }) {
  const item = ITENS[status] ?? { Icone: CircleDot, classe: "status-aberto" };
  const Icone = item.Icone;
  return (
    <span className={`selo-status ${item.classe}`}>
      <Icone aria-hidden="true" className="selo-icone" />
      <span>{status}</span>
    </span>
  );
}
