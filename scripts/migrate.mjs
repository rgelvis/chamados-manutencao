import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { opcoesClientePg, usaPooler } from "../lib/opcoes-pg.mjs";

const url = process.env.DATABASE_URL?.trim() ?? "";
const direta = process.env.DATABASE_URL_UNPOOLED?.trim() || url;
const pasta = path.join(process.cwd(), "migrations");
const arquivos = (await readdir(pasta).catch(() => []))
  .filter((nome) => nome.endsWith(".sql"))
  .sort();

if (process.env.VERCEL === "1") {
  const segredo = process.env.SESSAO_SEGREDO?.trim() ?? "";
  if (url === "") {
    console.error("migrate: defina DATABASE_URL com a conexão do Neon.");
    process.exit(1);
  }
  if (segredo.length < 32) {
    console.error("migrate: defina SESSAO_SEGREDO com pelo menos 32 caracteres.");
    process.exit(1);
  }
}

if (url === "") {
  console.log("migrate: sem DATABASE_URL, o desenvolvimento segue no PGlite");
  process.exit(0);
}
if (arquivos.length === 0) {
  console.log("migrate: nenhuma migração encontrada");
  process.exit(0);
}

function dividirSql(texto) {
  return texto
    .split(";")
    .map((parte) => parte.replace(/--[^\n]*/g, "").trim())
    .filter(Boolean);
}

const client = new pg.Client(opcoesClientePg(direta));
await client.connect();

try {
  if (!usaPooler(direta)) {
    await client.query("set lock_timeout = '60s'");
    await client.query("select pg_advisory_lock(7272741)");
  }
  await client.query(
    "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const feitas = new Set(
    (await client.query("select name from schema_migrations")).rows.map((linha) => linha.name),
  );

  for (const arquivo of arquivos.filter((nome) => !feitas.has(nome))) {
    const comandos = dividirSql(await readFile(path.join(pasta, arquivo), "utf8"));
    await client.query("begin");
    try {
      for (const comando of comandos) {
        await client.query(comando);
      }
      await client.query("insert into schema_migrations (name) values ($1)", [arquivo]);
      await client.query("commit");
      console.log(`migrate: aplicado ${arquivo}`);
    } catch (erro) {
      await client.query("rollback");
      throw erro;
    }
  }
} finally {
  await client.end();
}
