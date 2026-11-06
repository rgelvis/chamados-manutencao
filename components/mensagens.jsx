export function MensagemErro({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mensagem-erro">
      {children}
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
