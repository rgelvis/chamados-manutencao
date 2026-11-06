"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { atualizarStatus, criarChamado, ErroDeChamado } from "@/lib/chamados";
import { garantirDemonstracao } from "@/lib/demonstracao";
import { salvarEscola as gravarEscola } from "@/lib/escola";
import { encerrarSessao, gravarSessao, lerSessao } from "@/lib/sessao";
import { LISTA_STATUS, PAPEL } from "@/lib/status";
import { registrarUsuario } from "@/lib/usuarios";
import { apenasDigitosCep, consultarViaCep } from "@/lib/viacep";

function atualizarTelas() {
  revalidatePath("/", "layout");
}

function mensagemInesperada(erro) {
  console.error(erro);
  return "Não foi possível concluir a operação. Tente de novo.";
}

export async function entrar(_estado, formData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const papel = String(formData.get("papel") ?? "");

  if (nome.length < 2) {
    return { erro: "Escreva seu nome para entrar.", campo: "nome", nome };
  }
  if (nome.length > 80) {
    return { erro: "O nome precisa caber em 80 caracteres.", campo: "nome", nome };
  }
  if (papel !== PAPEL.SOLICITANTE && papel !== PAPEL.ATENDENTE) {
    return {
      erro: "Escolha se você solicita o conserto ou se atende o chamado.",
      campo: "papel",
      nome,
    };
  }

  let usuario;
  try {
    await garantirDemonstracao();
    usuario = await registrarUsuario(nome, papel);
    if (!usuario?.id || usuario.papel !== papel) {
      return { erro: "Não foi possível registrar o seu papel.", campo: "papel", nome };
    }
    await gravarSessao(usuario.id);
  } catch (erro) {
    return { erro: mensagemInesperada(erro), campo: "", nome };
  }

  atualizarTelas();
  redirect(usuario.papel === PAPEL.ATENDENTE ? "/chamados" : "/chamados/novo");
}

export async function sair() {
  await encerrarSessao();
  atualizarTelas();
  redirect("/");
}

export async function abrirChamado(_estado, formData) {
  const sessao = await lerSessao();
  const local = String(formData.get("local") ?? "");
  const tipo = String(formData.get("tipo") ?? "");
  const descricao = String(formData.get("descricao") ?? "");
  const devolve = { local, tipo, descricao, campo: "" };

  if (!sessao) {
    return { ...devolve, erro: "Entre com seu nome e papel para abrir um chamado." };
  }

  try {
    await garantirDemonstracao();
    await criarChamado({
      local,
      tipo,
      descricao,
      solicitanteNome: sessao.nome,
    });
  } catch (erro) {
    if (erro instanceof ErroDeChamado) {
      return { ...devolve, erro: erro.message, campo: erro.campo };
    }
    return { ...devolve, erro: mensagemInesperada(erro) };
  }

  atualizarTelas();
  const destino = sessao.papel === PAPEL.ATENDENTE ? "/chamados" : "/meus-chamados";
  redirect(`${destino}?aviso=aberto`);
}

export async function mudarStatus(_estado, formData) {
  const sessao = await lerSessao();
  const id = Number(formData.get("id"));
  const novoStatus = String(formData.get("status") ?? "");
  const texto = String(formData.get("texto") ?? "");

  if (!sessao) {
    return { erro: "Entre novamente para atualizar o chamado.", campo: "" };
  }
  if (sessao.papel !== PAPEL.ATENDENTE) {
    return { erro: "Só quem atende pode mudar o status do chamado.", campo: "" };
  }
  if (!LISTA_STATUS.includes(novoStatus)) {
    return { erro: "Escolha um status: Aberto, Em andamento ou Concluído.", campo: "status" };
  }

  try {
    await garantirDemonstracao();
    await atualizarStatus({
      id,
      novoStatus,
      texto,
      autorNome: sessao.nome,
      autorPapel: sessao.papel,
    });
  } catch (erro) {
    if (erro instanceof ErroDeChamado) {
      return { erro: erro.message, campo: erro.campo };
    }
    return { erro: mensagemInesperada(erro), campo: "" };
  }

  atualizarTelas();
  redirect("/chamados?aviso=atualizado");
}

export async function buscarEndereco(cep) {
  const sessao = await lerSessao();
  if (!sessao) {
    return { erro: "Entre com seu nome e papel para consultar o CEP." };
  }
  return consultarViaCep(cep);
}

export async function salvarDadosEscola(_estado, formData) {
  const sessao = await lerSessao();
  const dados = {
    nome: String(formData.get("nome") ?? ""),
    cep: String(formData.get("cep") ?? ""),
    logradouro: String(formData.get("logradouro") ?? ""),
    municipio: String(formData.get("municipio") ?? ""),
    bairro: String(formData.get("bairro") ?? ""),
    uf: String(formData.get("uf") ?? ""),
  };

  if (!sessao) {
    return { erro: "Entre com seu nome e papel para salvar os dados da escola.", ...dados };
  }
  if (dados.nome.trim().length > 120) {
    return { erro: "O nome da escola precisa caber em 120 caracteres.", campo: "nome", ...dados };
  }
  const cep = apenasDigitosCep(dados.cep);
  if (cep !== "" && cep.length !== 8) {
    return { erro: "O CEP precisa ter 8 números ou ficar em branco.", campo: "cep", ...dados };
  }
  if (dados.uf.trim() !== "" && dados.uf.trim().length !== 2) {
    return { erro: "A UF precisa ter 2 letras.", campo: "uf", ...dados };
  }

  try {
    await gravarEscola({ ...dados, cep: cep === "" ? "" : dados.cep.trim() });
  } catch (erro) {
    return { erro: mensagemInesperada(erro), ...dados };
  }

  atualizarTelas();
  redirect("/escola?aviso=escola");
}
