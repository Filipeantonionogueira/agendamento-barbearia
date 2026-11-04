import React from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Shell } from "../components/layout/Shell.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { useAuth } from "../context/AuthProvider.jsx";

export function LoginPage() {
  const { login } = useAuth();
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
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <section className="mx-auto max-w-md px-4 py-12">
        <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-6 shadow-soft md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold text-ink">
              <Lock size={20} />
            </div>
            <h1 className="text-2xl font-semibold text-text-primary">Painel admin</h1>
          </div>
          <div className="grid gap-4">
            <Input label="E-mail" type="email" placeholder="admin@..." value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input label="Senha" type="password" placeholder="Sua senha" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error && <p className="text-sm text-feedback-danger">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </form>
      </section>
    </Shell>
  );
}
