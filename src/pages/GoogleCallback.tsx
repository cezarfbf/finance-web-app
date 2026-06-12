import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { completeGoogleLogin } from "@/lib/api/auth";

/**
 * Landing route for Google's redirect (GOOGLE_REDIRECT_URI). Trades the
 * one-time authorization code for our own JWT via the identity service,
 * then continues into the app.
 */
export function GoogleCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  // The code is single-use: guard against StrictMode's double-run effect.
  const exchanged = useRef(false);

  const providerError = params.get("error");
  const code = params.get("code");
  const state = params.get("state");

  // Derivable from the URL alone — no effect/state needed.
  const paramError = providerError
    ? providerError === "access_denied"
      ? "O acesso com Google foi cancelado."
      : "O Google devolveu um erro. Tente novamente."
    : !code || !state
      ? "Resposta do Google inválida. Tente novamente."
      : null;

  useEffect(() => {
    if (paramError || exchanged.current) {
      return;
    }
    exchanged.current = true;

    completeGoogleLogin(code!, state!)
      .then(() => navigate("/dashboard", { replace: true }))
      .catch((err) => setExchangeError(messageFor(err)));
  }, [paramError, code, state, navigate]);

  const error = paramError ?? exchangeError;

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-bg)] px-4 text-[var(--color-text)]">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-lg">
        {error ? (
          <>
            <p role="alert" className="mb-6 text-sm text-[var(--kpi-custos)]">
              {error}
            </p>
            <Link
              to="/login"
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              Voltar ao início de sessão
            </Link>
          </>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">
            A concluir o início de sessão com o Google…
          </p>
        )}
      </div>
    </div>
  );
}

function messageFor(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Não foi possível conectar. Tente novamente.";
    }
    if (err.response.status === 401) {
      return "Não foi possível validar o início de sessão com o Google. Tente novamente.";
    }
  }
  return "Não foi possível concluir o início de sessão com o Google.";
}
