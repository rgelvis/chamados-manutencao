import { cookies, headers } from "next/headers";
import { sql } from "./db.js";
import { PAPEL } from "./status.js";
import { criarTokenSessao, lerTokenSessao } from "./token-sessao.js";

const NOME_COOKIE = "sessao_chamados";

function opcoesCookie() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}

export async function gravarSessao(usuarioId) {
  const armazenamento = await cookies();
  const valor = await criarTokenSessao(usuarioId);
  armazenamento.set(NOME_COOKIE, valor, opcoesCookie());
}

function tokenNoCabecalho(bruto) {
  if (!bruto) return;
  const prefixo = `${NOME_COOKIE}=`;
  const parte = bruto
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefixo));
  if (!parte) return;
  try {
    return decodeURIComponent(parte.slice(prefixo.length));
  } catch {
    return;
  }
}

async function tokenDaSessao() {
  try {
    const armazenamento = await cookies();
    return armazenamento.get(NOME_COOKIE)?.value;
  } catch (erro) {
    if (!String(erro?.message ?? "").includes("mutableCookies")) throw erro;
    const recebidos = await headers();
    return tokenNoCabecalho(recebidos.get("cookie"));
  }
}

export async function lerSessao() {
  const token = await tokenDaSessao();
  const dados = await lerTokenSessao(token);
  if (!dados) return null;

  const linhas = await sql("select id, nome, papel from usuarios where id = $1", [dados.id]);
  const usuario = linhas[0];
  if (!usuario) return null;
  if (usuario.papel !== PAPEL.SOLICITANTE && usuario.papel !== PAPEL.ATENDENTE) return null;
  return { id: usuario.id, nome: usuario.nome, papel: usuario.papel };
}

export async function encerrarSessao() {
  const armazenamento = await cookies();
  armazenamento.delete(NOME_COOKIE);
}
