import { sql } from "./db.js";

export async function obterEscola() {
  const linhas = await sql("select * from escola order by id asc limit 1");
  if (linhas[0]) return linhas[0];
  const criadas = await sql(
    "insert into escola (nome) values ('') returning *",
  );
  return criadas[0];
}

export async function salvarEscola({ nome, cep, logradouro, municipio, bairro, uf }) {
  const atual = await obterEscola();
  const linhas = await sql(
    `update escola
     set nome = $1,
         cep = $2,
         logradouro = $3,
         municipio = $4,
         bairro = $5,
         uf = $6,
         atualizado_em = now()
     where id = $7
     returning *`,
    [
      String(nome ?? "").trim(),
      String(cep ?? "").trim(),
      String(logradouro ?? "").trim(),
      String(municipio ?? "").trim(),
      String(bairro ?? "").trim(),
      String(uf ?? "").trim().toUpperCase(),
      atual.id,
    ],
  );
  return linhas[0];
}
