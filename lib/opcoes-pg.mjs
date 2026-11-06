export function urlSemChannelBinding(url) {
  return String(url ?? "")
    .trim()
    .replace(/([?&])channel_binding=[^&]*/gi, "$1")
    .replace(/\?&/g, "?")
    .replace(/&&/g, "&")
    .replace(/[?&]$/g, "");
}

export function opcoesClientePg(url, { pool = false } = {}) {
  const connectionString = urlSemChannelBinding(url);
  const modo = connectionString.match(/[?&]sslmode=([^&]+)/i)?.[1]?.toLowerCase() ?? "";
  const neon = connectionString.includes(".neon.tech");
  const opcoes = { connectionString };
  if (neon || modo === "require" || modo === "prefer" || modo === "verify-full" || modo === "verify-ca") {
    opcoes.ssl = { rejectUnauthorized: true };
  }
  if (pool) {
    opcoes.max = process.env.VERCEL ? 1 : 5;
    opcoes.idleTimeoutMillis = 10_000;
    opcoes.connectionTimeoutMillis = 10_000;
  }
  return opcoes;
}

export function usaPooler(url) {
  return /-pooler\./i.test(String(url ?? ""));
}
