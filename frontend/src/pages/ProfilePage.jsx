import React from "react";
import { useNavigate } from "react-router-dom";
import { Download, ShieldAlert } from "lucide-react";
import { ClientShell } from "../components/client/ClientShell.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
import { usePageMeta } from "../hooks/usePageMeta.js";

export function ProfilePage() {
  usePageMeta({ title: "Perfil", noindex: true });
  const { user, updateProfile, logout } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ name: user?.name || "", phone: user?.phone || "", photoUrl: user?.photoUrl || "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function downloadData() {
    try {
      const data = await api("/conta/meus-dados");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "meus-dados.json";
      link.click();
      URL.revokeObjectURL(url);
      notify("Download iniciado.", "success");
    } catch (err) {
      notify(err.message, "error");
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await api("/conta", { method: "DELETE" });
      await logout();
      navigate("/");
    } catch (err) {
      notify(err.message, "error");
      setDeleting(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await updateProfile({ name: form.name, phone: form.phone || null, photoUrl: form.photoUrl || null });
      notify("Perfil atualizado.", "success");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClientShell>
      <h1 className="text-2xl font-semibold md:text-3xl">Perfil</h1>
      <p className="mt-1 text-text-secondary">Mantenha seus dados atualizados.</p>

      <Card className="mt-6 max-w-xl">
        <form onSubmit={save} className="grid gap-4">
          <div className="flex items-center gap-4">
            <img
              src={form.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || "U")}&background=151515&color=C79A3B`}
              alt="Foto do perfil"
              className="h-16 w-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <Input label="URL da foto (opcional)" value={form.photoUrl} onChange={update("photoUrl")} placeholder="https://..." />
            </div>
          </div>
          <Input label="Nome completo" value={form.name} onChange={update("name")} required />
          <Input label="E-mail" value={user?.email || ""} disabled />
          <Input label="WhatsApp" value={form.phone} onChange={update("phone")} placeholder="11999998888" />
          {error && <p className="text-sm text-feedback-danger">{error}</p>}
          <div>
            <Button type="submit" disabled={busy}>{busy ? "Salvando..." : "Salvar alteracoes"}</Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6 max-w-xl">
        <h2 className="text-lg font-semibold">Privacidade e dados (LGPD)</h2>
        <p className="mt-1 text-sm text-text-secondary">Voce controla seus dados pessoais.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button variant="ghost" onClick={downloadData}>
            <Download size={16} /> Baixar meus dados
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <ShieldAlert size={16} /> Excluir minha conta
          </Button>
        </div>
      </Card>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir conta"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancelar</Button>
            <Button variant="danger" onClick={deleteAccount} disabled={deleting}>{deleting ? "Excluindo..." : "Confirmar exclusao"}</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Sua conta sera desativada e seus dados pessoais anonimizados de forma permanente. Historicos de atendimento
          podem ser mantidos de forma anonima por obrigacao legal. Esta acao nao pode ser desfeita.
        </p>
      </Modal>
    </ClientShell>
  );
}
