import React from "react";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { api } from "../../lib/api.js";
import { serviceNames } from "../../lib/appointment.js";
import { today, addDays } from "../../lib/format.js";

// Remarca um atendimento: escolhe profissional, dia e um horario realmente livre.
export function RescheduleModal({ appointment, onClose, onSaved }) {
  const [professionals, setProfessionals] = React.useState([]);
  const [professionalId, setProfessionalId] = React.useState(appointment.professionalId);
  const [date, setDate] = React.useState(new Date(appointment.startAt).toISOString().slice(0, 10));
  const [slots, setSlots] = React.useState([]);
  const [time, setTime] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const serviceIds = appointment.appointmentServices.map((item) => item.serviceId).join(",");

  React.useEffect(() => {
    api("/profissionais").then(setProfessionals).catch(() => setProfessionals([]));
  }, []);

  React.useEffect(() => {
    setTime("");
    if (!professionalId || !date) return;
    api(`/disponibilidade?date=${date}&serviceIds=${serviceIds}&professionalId=${professionalId}`)
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]));
  }, [date, professionalId, serviceIds]);

  async function save() {
    setBusy(true);
    setError("");
    try {
      await api(`/agendamentos/${appointment.id}/reagendar`, {
        method: "PUT",
        body: JSON.stringify({ date, time, professionalId })
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
      open
      onClose={onClose}
      title="Remarcar atendimento"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancelar</Button>
          <Button onClick={save} disabled={busy || !time}>{busy ? "Salvando..." : "Confirmar remarcacao"}</Button>
        </>
      }
    >
      <div className="rounded-lg bg-surface-subtle p-3 text-sm">
        <strong>{appointment.client?.name}</strong>
        <p className="text-text-secondary">
          {serviceNames(appointment)} · atualmente {new Date(appointment.startAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <label className="mt-4 block text-sm font-medium text-text-secondary">Profissional</label>
      <select className="field mt-1" value={professionalId} onChange={(e) => setProfessionalId(e.target.value)}>
        {professionals.map((professional) => (
          <option key={professional.id} value={professional.id}>
            {professional.name}
          </option>
        ))}
      </select>

      <label className="mt-3 block text-sm font-medium text-text-secondary">Nova data</label>
      <input
        className="field mt-1"
        type="date"
        min={today()}
        max={addDays(60)}
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label className="mt-3 block text-sm font-medium text-text-secondary">Novo horario</label>
      <div className="mt-1 grid grid-cols-3 gap-2">
        {slots.length ? (
          slots.map((slot) => (
            <button key={slot} onClick={() => setTime(slot)} className={`slot ${time === slot ? "slot-active" : ""}`}>
              {slot}
            </button>
          ))
        ) : (
          <p className="col-span-3 rounded-lg bg-surface-subtle p-3 text-sm text-text-secondary">
            Sem horarios livres neste dia.
          </p>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-feedback-danger">{error}</p>}
    </Modal>
  );
}
