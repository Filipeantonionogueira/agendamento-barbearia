import React from "react";
import { api } from "../lib/api.js";
import { useConsent } from "../context/ConsentContext.jsx";

const SESSION_KEY = "bp_session";

/** Identificador anonimo por sessao — nao identifica a pessoa, so agrupa a visita. */
function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null; // navegador com storage bloqueado: apenas nao registra
  }
}

/** Registra a visita apenas quando o usuario consentiu explicitamente com cookies analiticos (LGPD). */
export function useTrackVisit(path) {
  const { consent } = useConsent();

  React.useEffect(() => {
    // Bloqueia rastreamento antes do consentimento ou se analytics for rejeitado
    if (!consent?.analytics) return;

    const sessionId = getSessionId();
    if (!sessionId) return;
    api("/analytics/visita", {
      method: "POST",
      body: JSON.stringify({ sessionId, path, referrer: document.referrer || null })
    }).catch(() => {});
  }, [path, consent?.analytics]);
}
