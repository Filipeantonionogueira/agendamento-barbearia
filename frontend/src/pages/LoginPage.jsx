import React from "react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Shell } from "../components/layout/Shell.jsx";
import { useAuth } from "../context/AuthProvider.jsx";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Shell compact>
      <section className="mx-auto -mt-20 max-w-md px-4 pb-12">
        <form onSubmit={submit} className="rounded-lg bg-surface p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-gold">
              <Lock size={20} />
            </div>
            <h1 className="text-2xl font-semibold">Painel admin</h1>
          </div>
          <input className="field mb-3" type="email" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input className="field mb-3" type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="w-full rounded-lg bg-ink px-4 py-3 font-semibold text-white">Entrar</button>
          {error && <p className="mt-3 text-sm text-feedback-danger">{error}</p>}
        </form>
      </section>
    </Shell>
  );
}
