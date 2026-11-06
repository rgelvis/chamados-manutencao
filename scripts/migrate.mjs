import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL?.trim() ?? "";
const pasta = path.join(process.cwd(), "migrations");
const arquivos = (await readdir(pasta).catch(() => []))
  .filter((nome) => nome.endsWith(".sql"))
  .sort();

if (url === "" || arquivos.length === 0) {
  console.log("migrate: nada a fazer");
  process.exit(0);
}

function dividirSql(texto) {
  return texto
    .split(";")
    .map((parte) => parte.replace(/--[^\n]*/g, "").trim())
    .filter(Boolean);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL_UNPOOLED?.trim() || url,
});
await client.connect();

try {
  await client.query("set lock_timeout = '60s'");
  await client.query("select pg_advisory_lock(7272741)");
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
