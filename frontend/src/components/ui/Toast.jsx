import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = React.createContext(null);

const ICONS = { success: CheckCircle2, danger: AlertCircle, info: Info };
const STYLES = {
  success: "border-feedback-success-bg bg-feedback-success-bg text-feedback-success",
  danger: "border-feedback-danger-bg bg-feedback-danger-bg text-feedback-danger",
  info: "border-feedback-info-bg bg-feedback-info-bg text-feedback-info"
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const notify = React.useCallback((message, variant = "info") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, variant }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4000);
  }, []);

  const dismiss = (id) => setToasts((current) => current.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 grid gap-2">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.variant];
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm animate-slideUp ${STYLES[toast.variant]}`}
            >
              <Icon size={16} />
              <span>{toast.message}</span>
              <button onClick={() => dismiss(toast.id)} className="ml-2 opacity-70 hover:opacity-100" aria-label="Fechar">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const notify = React.useContext(ToastContext);
  if (!notify) throw new Error("useToast deve ser usado dentro de ToastProvider.");
  return notify;
}
