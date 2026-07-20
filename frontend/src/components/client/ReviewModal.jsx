import React from "react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { StarRating } from "../ui/StarRating.jsx";
import { api } from "../../lib/api.js";
import { serviceNames } from "../../lib/appointment.js";

export function ReviewModal({ appointment, onClose, onSaved }) {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api("/avaliacoes", {
        method: "POST",
        body: JSON.stringify({ appointmentId: appointment.id, rating, comment: comment || null })
      });
      onSaved();
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
      title="Avaliar atendimento"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancelar</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Enviando..." : "Enviar avaliacao"}</Button>
        </>
      }
    >
      <div className="rounded-lg bg-surface-subtle p-4 text-sm">
        <strong>{serviceNames(appointment)}</strong>
        <p className="mt-1 text-text-secondary">
          {new Date(appointment.startAt).toLocaleDateString("pt-BR")} · {appointment.professional?.name}
        </p>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-text-secondary">Sua nota</label>
        <div className="mt-2"><StarRating value={rating} onChange={setRating} size={28} /></div>
      </div>
      <textarea
        className="field mt-4 min-h-[90px] resize-y"
        placeholder="Conte como foi sua experiencia (opcional)"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      {error && <p className="mt-2 text-sm text-feedback-danger">{error}</p>}
    </Modal>
  );
}
