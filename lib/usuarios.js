import { sql } from "./db.js";

export async function registrarUsuario(nome, papel) {
  const linhas = await sql(
    `insert into usuarios (nome, papel)
     values ($1, $2)
     on conflict (nome, papel) do update set nome = excluded.nome
     returning id, nome, papel`,
    [nome, papel],
  );
  return linhas[0];
}
