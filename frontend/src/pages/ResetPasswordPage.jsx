import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { api } from "../lib/api.js";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function requestReset(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setMessage("Se existir uma conta com este e-mail, enviamos as instrucoes de recuperacao.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmReset(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (token) {
    return (
      <AuthLayout title="Nova senha" subtitle="Defina uma nova senha para sua conta.">
        <form onSubmit={confirmReset} className="grid gap-4">
          <Input label="Nova senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          {error && <p className="text-sm text-feedback-danger">{error}</p>}
          <Button type="submit" disabled={busy}>{busy ? "Salvando..." : "Salvar nova senha"}</Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber o link de recuperacao."
      footer={<Link to="/login" className="font-semibold text-gold hover:underline">Voltar ao login</Link>}
    >
      <form onSubmit={requestReset} className="grid gap-4">
        <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {message && <p className="text-sm text-feedback-success">{message}</p>}
        {error && <p className="text-sm text-feedback-danger">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? "Enviando..." : "Enviar link"}</Button>
      </form>
    </AuthLayout>
  );
}
