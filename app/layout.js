import { Suspense } from "react";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { Cabecalho } from "@/components/cabecalho";

const fonte = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Chamados de manutenção",
    template: "%s · Chamados de manutenção",
  },
  description:
    "Sistema para a equipe de uma escola municipal registrar e acompanhar chamados de manutenção do prédio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${fonte.variable} h-full ${fonte.className}`}>
      <body className="flex min-h-full flex-col">
        <a className="pular" href="#conteudo">
          Ir para o conteúdo
        </a>
        <Suspense fallback={<p className="topo-carregando">Carregando identificação…</p>}>
          <Cabecalho />
        </Suspense>
        <main id="conteudo" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <footer className="rodape">
          <p>Uso da equipe da escola. O sistema não pede e não guarda dado de aluno.</p>
        </footer>
      </body>
    </html>
  );
}
