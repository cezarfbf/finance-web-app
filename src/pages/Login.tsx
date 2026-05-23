import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { login } from "@/lib/api/auth";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-bg)] px-4 text-[var(--color-text)]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-lg"
      >
        <h1 className="mb-6 text-xl font-semibold">Sign in</h1>

        <div className="mb-4 flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-[var(--color-text-muted)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="mb-4 flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-[var(--color-text-muted)]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 text-sm text-[var(--kpi-custos)]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-bg)] disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function messageFor(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Não foi possível conectar. Tente novamente.";
    }
    if (err.response.status === 401) {
      return "Email ou senha incorretos.";
    }
    if (err.response.status === 400) {
      return "Email e senha são obrigatórios.";
    }
  }
  return "Não foi possível concluir o login. Tente novamente.";
}
