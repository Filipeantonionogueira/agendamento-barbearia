import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout.jsx";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

export function RegisterPage() {
  usePageMeta({
    title: "Criar conta",
    description: "Cadastre-se na Lukaobarber7 para agendar mais rapido e acompanhar seu historico."
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({ ...form, phone: form.phone || null });
      navigate("/conta");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para agendar mais rapido e acompanhar seu historico."
      social={
        <div>
          <GoogleAuthButton onError={setError} />
          <div className="relative my-5 flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-surface px-3 text-xs font-medium uppercase tracking-wider text-text-muted">
              ou
            </span>
          </div>
        </div>
      }
      footer={
        <>
          Ja tem conta? <Link to="/login" className="font-semibold text-gold hover:underline">Entrar</Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <Input label="Nome completo" value={form.name} onChange={update("name")} required />
        <Input label="E-mail" type="email" value={form.email} onChange={update("email")} required />
        <Input label="WhatsApp (opcional)" value={form.phone} onChange={update("phone")} />
        <Input label="Senha" type="password" value={form.password} onChange={update("password")} required minLength={6} />
        {error && <p className="text-sm text-feedback-danger">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? "Criando..." : "Criar conta com e-mail"}</Button>
        <p className="text-center text-xs text-text-muted">
          Ao se cadastrar, você concorda com nossos{" "}
          <Link to="/termos" className="underline hover:text-gold">
            Termos de Uso
          </Link>{" "}
          e com a{" "}
          <Link to="/privacidade" className="underline hover:text-gold">
            Política de Privacidade
          </Link>.
        </p>
      </form>
    </AuthLayout>
  );
}
