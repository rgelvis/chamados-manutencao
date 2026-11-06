import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TAMANHO_MINIMO = 32;

function segredoDoAmbiente() {
  const valor = process.env.SESSAO_SEGREDO?.trim() ?? "";
  if (valor.length >= TAMANHO_MINIMO) return valor;
  return "";
}

async function segredoDeDesenvolvimento() {
  const arquivo = path.join(process.cwd(), ".data", "sessao-segredo");
  try {
    const existente = (await readFile(arquivo, "utf8")).trim();
    if (existente.length >= TAMANHO_MINIMO) return existente;
  } catch {
    // o arquivo ainda não existe; ele é gerado abaixo e não entra no Git
  }
  const novo = randomBytes(32).toString("base64url");
  await mkdir(path.dirname(arquivo), { recursive: true });
  await writeFile(arquivo, `${novo}\n`, { encoding: "utf8", mode: 0o600 });
  return novo;
}

export async function obterSegredoSessao() {
  const doAmbiente = segredoDoAmbiente();
  if (doAmbiente) return doAmbiente;
  if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
    throw new Error(
      "Defina SESSAO_SEGREDO no ambiente da publicação. O segredo não fica no repositório.",
    );
  }
  return segredoDeDesenvolvimento();
}
