import React from "react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { api } from "../../lib/api.js";
import { money } from "../../lib/format.js";
import { serviceNames } from "../../lib/appointment.js";

export function CancelAppointmentModal({ appointment, onClose, onCanceled }) {
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await api(`/agendamentos/minhas/${appointment.id}/cancelar`, {
        method: "POST",
        body: JSON.stringify({ reason: reason || null })
      });
      onCanceled();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!appointment}
      onClose={onClose}
      title="Cancelar agendamento"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Voltar</Button>
          <Button variant="danger" onClick={confirm} disabled={busy}>{busy ? "Cancelando..." : "Confirmar cancelamento"}</Button>
        </>
      }
    >
      <div className="rounded-lg bg-surface-subtle p-4 text-sm">
        <strong>{serviceNames(appointment)}</strong>
        <p className="mt-1 text-text-secondary">
          {new Date(appointment.startAt).toLocaleString("pt-BR")} · {appointment.professional?.name}
        </p>
        <p className="mt-1 font-semibold text-gold">{money(appointment.totalPriceCents)}</p>
      </div>
      <label className="mt-4 block text-sm font-medium text-text-secondary">Motivo (opcional)</label>
      <textarea
        className="field mt-1 min-h-[72px] resize-y"
        placeholder="Conte o motivo do cancelamento"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      {error && <p className="mt-2 text-sm text-feedback-danger">{error}</p>}
    </Modal>
  );
}
