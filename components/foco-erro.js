"use client";

import { useEffect } from "react";

export function useFocoNoErro(erro, idMensagem, idCampo) {
  useEffect(() => {
    if (!erro) return;
    function focar() {
      const campo = idCampo ? document.getElementById(idCampo) : null;
      const mensagem = idMensagem ? document.getElementById(idMensagem) : null;
      const alvo = campo ?? mensagem;
      if (!alvo || typeof alvo.focus !== "function") return;
      alvo.focus({ focusVisible: true });
    }
    const cedo = window.setTimeout(focar, 0);
    const tarde = window.setTimeout(focar, 250);
    return () => {
      window.clearTimeout(cedo);
      window.clearTimeout(tarde);
    };
  }, [erro, idMensagem, idCampo]);
}
