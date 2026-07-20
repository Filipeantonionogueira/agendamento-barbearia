import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Evita tela branca: se um componente quebrar, mostra uma tela de recuperacao
 * em vez de derrubar a aplicacao inteira.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Em producao, encaminhar para um servico de monitoramento (Sentry etc.).
    console.error("Falha na interface:", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="grid min-h-screen place-items-center bg-paper px-4">
        <div className="max-w-md rounded-lg bg-surface p-8 text-center shadow-soft">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-feedback-danger-bg text-feedback-danger">
            <AlertTriangle size={24} />
          </span>
          <h1 className="mt-4 text-xl font-semibold">Algo deu errado</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Tivemos um problema ao carregar esta parte do sistema. Tente novamente — seus dados estao seguros.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-ink px-4 py-3 font-semibold text-white hover:bg-ink-700"
            >
              Recarregar
            </button>
            <a href="/" className="rounded-lg border border-border-strong px-4 py-3 font-semibold hover:bg-surface-subtle">
              Ir para o inicio
            </a>
          </div>
        </div>
      </div>
    );
  }
}
