import { createHmac, timingSafeEqual } from "node:crypto";
import { obterSegredoSessao } from "./segredo-sessao.js";

function assinar(corpo, segredo) {
  return createHmac("sha256", segredo).update(corpo).digest("base64url");
}

function assinaturaConfere(recebida, esperada) {
  const a = Buffer.from(recebida);
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function criarTokenSessao(usuarioId) {
  const id = Number(usuarioId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Sessão sem usuário válido.");
  }
  const corpo = Buffer.from(JSON.stringify({ id }), "utf8").toString("base64url");
  const assinatura = assinar(corpo, await obterSegredoSessao());
  return `${corpo}.${assinatura}`;
}

export async function lerTokenSessao(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const ponto = token.lastIndexOf(".");
  const corpo = token.slice(0, ponto);
  const assinatura = token.slice(ponto + 1);
  if (!corpo || !assinatura) return null;
  const esperada = assinar(corpo, await obterSegredoSessao());
  if (!assinaturaConfere(assinatura, esperada)) return null;
  try {
    const dados = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8"));
    const id = Number(dados?.id);
    if (!Number.isInteger(id) || id <= 0) return null;
    return { id };
  } catch {
    return null;
  }
}
