import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { register } from "@/lib/api/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
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
        <h1 className="mb-6 text-xl font-semibold">Create account</h1>

        <div className="mb-4 flex flex-col gap-1">
          <label htmlFor="name" className="text-sm text-[var(--color-text-muted)]">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            maxLength={100}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

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
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <p className="text-xs text-[var(--color-text-muted)]">
            Mínimo de 8 caracteres.
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 text-sm text-[var(--kpi-custos)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-bg)] disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <span className="h-px flex-1 bg-[var(--color-border)]" />
          or
          <span className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <GoogleButton label="Sign up with Google" disabled={submitting} />

        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

function messageFor(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Não foi possível conectar. Tente novamente.";
    }
    if (err.response.status === 409) {
      return "Este email já está registado.";
    }
    if (err.response.status === 400) {
      return "Dados inválidos. Verifique o email e a senha (mínimo 8 caracteres).";
    }
  }
  return "Não foi possível criar a conta. Tente novamente.";
}
