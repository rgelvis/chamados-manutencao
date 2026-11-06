export function apenasDigitosCep(cep) {
  return String(cep ?? "").replace(/\D/g, "");
}

export async function consultarViaCep(cep) {
  const digitos = apenasDigitosCep(cep);
  if (digitos.length !== 8) {
    return { erro: "O CEP precisa ter 8 números." };
  }

  let resposta;
  try {
    resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return {
      erro: "Não foi possível consultar a ViaCEP. Preencha logradouro e município manualmente.",
    };
  }

  if (!resposta.ok) {
    return {
      erro: "A ViaCEP não respondeu. Preencha logradouro e município manualmente.",
    };
  }

  const dados = await resposta.json();
  if (!dados || dados.erro) {
    return {
      erro: "CEP não encontrado. Confira os números ou preencha o endereço manualmente.",
    };
  }

  const logradouro = String(dados.logradouro ?? "").trim();
  const municipio = String(dados.localidade ?? "").trim();
  const aviso = logradouro
    ? "Logradouro e município preenchidos pela ViaCEP. Confira antes de salvar. O nome da escola não vem dessa consulta."
    : "A ViaCEP informou o município, mas não o logradouro. Escreva o logradouro manualmente.";

  return {
    cep: String(dados.cep ?? digitos),
    logradouro,
    municipio,
    bairro: String(dados.bairro ?? "").trim(),
    uf: String(dados.uf ?? "").trim(),
    aviso,
  };
}
