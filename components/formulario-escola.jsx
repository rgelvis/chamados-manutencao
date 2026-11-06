"use client";

import { useState } from "react";
import { useActionState } from "react";
import { buscarEndereco, salvarDadosEscola } from "@/app/acoes";
import { useFocoNoErro } from "@/components/foco-erro";
import { descritoPorErro, MensagemErro, MensagemOk } from "@/components/mensagens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inicial = { erro: "", campo: "" };

export function FormularioEscola({ escola }) {
  const [estado, acao, enviando] = useActionState(salvarDadosEscola, inicial);
  const [nome, setNome] = useState(escola.nome ?? "");
  const [cep, setCep] = useState(escola.cep ?? "");
  const [logradouro, setLogradouro] = useState(escola.logradouro ?? "");
  const [municipio, setMunicipio] = useState(escola.municipio ?? "");
  const [bairro, setBairro] = useState(escola.bairro ?? "");
  const [uf, setUf] = useState(escola.uf ?? "");
  const [avisoBusca, setAvisoBusca] = useState("");
  const [erroBusca, setErroBusca] = useState("");
  const [buscando, setBuscando] = useState(false);

  async function aoBuscarCep() {
    setBuscando(true);
    setErroBusca("");
    setAvisoBusca("");
    const resultado = await buscarEndereco(cep);
    setBuscando(false);
    if (resultado.erro) {
      setErroBusca(resultado.erro);
      return;
    }
    setCep(resultado.cep || cep);
    setLogradouro(resultado.logradouro);
    setMunicipio(resultado.municipio);
    setBairro(resultado.bairro);
    setUf(resultado.uf);
    setAvisoBusca(resultado.aviso);
  }

  const erro = estado.erro || erroBusca;
  const campoErro = erroBusca ? "cep" : estado.campo;
  const idsCampo = { nome: "nome-escola", cep: "cep", uf: "uf" };
  useFocoNoErro(erro, "erro-escola", idsCampo[campoErro] ?? "");

  function ligarCampo(campo, idAjuda) {
    const invalido = Boolean(erro) && campoErro === campo;
    return {
      "aria-invalid": invalido || undefined,
      "aria-errormessage": invalido ? "erro-escola" : undefined,
      "aria-describedby": descritoPorErro(erro, "erro-escola", idAjuda, invalido),
    };
  }

  return (
    <form action={acao} className="formulario" noValidate>
      <MensagemErro id="erro-escola">{erro}</MensagemErro>
      <MensagemOk>{avisoBusca}</MensagemOk>

      <div className="campo-grupo">
        <Label htmlFor="nome-escola" className="rotulo">
          Nome da escola
        </Label>
        <Input
          id="nome-escola"
          name="nome"
          className="campo"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          autoComplete="organization"
          {...ligarCampo("nome", "ajuda-nome-escola")}
        />
        <p id="ajuda-nome-escola" className="ajuda">
          Começa em branco de propósito. Preencha quando o nome estiver definido. A consulta de CEP
          não inventa esse nome.
        </p>
      </div>

      <div className="campo-grupo">
        <Label htmlFor="cep" className="rotulo">
          CEP do prédio
        </Label>
        <Input
          id="cep"
          name="cep"
          className="campo"
          inputMode="numeric"
          autoComplete="postal-code"
          value={cep}
          onChange={(evento) => setCep(evento.target.value)}
          {...ligarCampo("cep", "ajuda-cep")}
        />
        <p id="ajuda-cep" className="ajuda">
          A busca usa a ViaCEP e preenche logradouro e município. Você pode corrigir os campos antes
          de salvar.
        </p>
        <Button
          type="button"
          variant="outline"
          className="botao"
          onClick={aoBuscarCep}
          disabled={buscando}
        >
          {buscando ? "Buscando CEP…" : "Buscar CEP"}
        </Button>
      </div>

      <div className="campo-grupo">
        <Label htmlFor="logradouro" className="rotulo">
          Logradouro
        </Label>
        <Input
          id="logradouro"
          name="logradouro"
          className="campo"
          value={logradouro}
          onChange={(evento) => setLogradouro(evento.target.value)}
          autoComplete="address-line1"
        />
      </div>

      <div className="campo-grupo">
        <Label htmlFor="municipio" className="rotulo">
          Município
        </Label>
        <Input
          id="municipio"
          name="municipio"
          className="campo"
          value={municipio}
          onChange={(evento) => setMunicipio(evento.target.value)}
          autoComplete="address-level2"
        />
      </div>

      <div className="grade-endereco">
        <div className="campo-grupo">
          <Label htmlFor="bairro" className="rotulo">
            Bairro
          </Label>
          <Input
            id="bairro"
            name="bairro"
            className="campo"
            value={bairro}
            onChange={(evento) => setBairro(evento.target.value)}
            autoComplete="address-level3"
          />
        </div>
        <div className="campo-grupo">
          <Label htmlFor="uf" className="rotulo">
            UF
          </Label>
          <Input
            id="uf"
            name="uf"
            className="campo"
            value={uf}
            onChange={(evento) => setUf(evento.target.value)}
            autoComplete="address-level1"
            maxLength={2}
            {...ligarCampo("uf")}
          />
        </div>
      </div>

      <Button type="submit" className="botao" disabled={enviando}>
        {enviando ? "Salvando…" : "Salvar dados da escola"}
      </Button>
    </form>
  );
}
