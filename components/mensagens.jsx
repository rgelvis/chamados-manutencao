export function descritoPorErro(erro, idErro, idAjuda, invalido) {
  const ids = [];
  if (erro && invalido && idErro) ids.push(idErro);
  if (idAjuda) ids.push(idAjuda);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export function MensagemErro({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" tabIndex={-1} className="mensagem-erro">
      Erro: {children}
    </p>
  );
}

export function MensagemOk({ children }) {
  if (!children) return null;
  return (
    <p role="status" className="mensagem-ok">
      {children}
    </p>
  );
}
