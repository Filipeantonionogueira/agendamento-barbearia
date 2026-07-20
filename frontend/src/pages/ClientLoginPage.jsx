import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

export function ClientLoginPage() {
  usePageMeta({ title: "Entrar", description: "Acesse sua conta da Barbearia Prime para agendar mais rapido." });
  const { login, hasRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(hasRole("OWNER", "ADMIN") ? "/admin" : "/conta");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para agendar mais rapido."
      footer={
        <>
          Nao tem conta? <Link to="/cadastro" className="font-semibold text-gold hover:underline">Criar conta</Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Link to="/recuperar-senha" className="justify-self-end text-sm text-text-secondary hover:text-gold">
          Esqueci minha senha
        </Link>
        {error && <p className="text-sm text-feedback-danger">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? "Entrando..." : "Entrar"}</Button>
      </form>
    </AuthLayout>
  );
}
