import { readdir, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

let pool;
let local;
let esquemaPronto;

function urlDoBanco() {
  return process.env.DATABASE_URL?.trim() ?? "";
}

function pastaMigracoes() {
  return path.join(process.cwd(), "migrations");
}

function dividirSql(texto) {
  return texto
    .split(";")
    .map((parte) => parte.replace(/--[^\n]*/g, "").trim())
    .filter(Boolean);
}

function emMemoria() {
  return process.env.VITEST === "true" || process.env.PGLITE_MEMORIA === "1";
}

async function obterLocal() {
  if (!local) {
    local = iniciarLocal().catch((erro) => {
      local = undefined;
      throw erro;
    });
  }
  return local;
}

async function iniciarLocal() {
  const { PGlite } = await import("@electric-sql/pglite");
  if (emMemoria()) return new PGlite();
  const diretorio = path.join(process.cwd(), ".data", "pglite");
  await mkdir(diretorio, { recursive: true });
  return new PGlite(diretorio);
}

async function aplicarEsquema() {
  const arquivos = (await readdir(pastaMigracoes()).catch(() => []))
    .filter((nome) => nome.endsWith(".sql"))
    .sort();
  const url = urlDoBanco();

  if (url) {
    pool ??= new pg.Pool({ connectionString: url, max: 5 });
    const client = await pool.connect();
    try {
      await client.query(
        "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
      );
      const feitas = new Set(
        (await client.query("select name from schema_migrations")).rows.map((linha) => linha.name),
      );
      for (const arquivo of arquivos) {
        if (feitas.has(arquivo)) continue;
        const comandos = dividirSql(await readFile(path.join(pastaMigracoes(), arquivo), "utf8"));
        await client.query("begin");
        try {
          for (const comando of comandos) {
            await client.query(comando);
          }
          await client.query("insert into schema_migrations (name) values ($1)", [arquivo]);
          await client.query("commit");
        } catch (erro) {
          await client.query("rollback");
          throw erro;
        }
      }
    } finally {
      client.release();
    }
    return;
  }

  const banco = await obterLocal();
  for (const arquivo of arquivos) {
    const comandos = dividirSql(await readFile(path.join(pastaMigracoes(), arquivo), "utf8"));
    for (const comando of comandos) {
      await banco.exec(comando);
    }
  }
}

export async function garantirEsquema() {
  if (!esquemaPronto) {
    esquemaPronto = aplicarEsquema().catch((erro) => {
      esquemaPronto = undefined;
      throw erro;
    });
  }
  return esquemaPronto;
}

export async function sql(texto, params = []) {
  await garantirEsquema();
  const url = urlDoBanco();
  if (url) {
    pool ??= new pg.Pool({ connectionString: url, max: 5 });
    const resultado = await pool.query(texto, params);
    return resultado.rows;
  }
  const banco = await obterLocal();
  const resultado = await banco.query(texto, params);
  return resultado.rows;
}

export async function resetBancoLocalParaTeste() {
  if (urlDoBanco()) {
    throw new Error("O teste precisa rodar sem DATABASE_URL.");
  }
  if (local) {
    try {
      const banco = await local;
      await banco.close();
    } catch {
      // o próximo teste abre outro banco em memória
    }
  }
  local = undefined;
  esquemaPronto = undefined;
}
