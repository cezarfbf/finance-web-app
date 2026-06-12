import axios, { type AxiosInstance } from "axios";

/**
 * The web app talks to two Spring Boot services:
 *   - finance-core-service     (transactions, accounts, holdings, reports)
 *   - finance-identity-service (auth, users)
 *
 * Base URLs are read from Vite env vars so dev / staging / prod can differ.
 * Defaults assume both run locally on the standard Spring Boot port pattern.
 */

const CORE_BASE_URL =
  import.meta.env.VITE_CORE_API_URL ?? "http://localhost:8080";
const IDENTITY_BASE_URL =
  import.meta.env.VITE_IDENTITY_API_URL ?? "http://localhost:8081";

const AUTH_TOKEN_KEY = "auth.token";
const AUTH_EXPIRY_KEY = "auth.expiresIn";
const LOGIN_PATH = "/login";

function build(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const url: string | undefined = error?.config?.url;
      // Don't bounce the user to /login when an auth call itself 401s —
      // those pages (login form, sign-up, Google callback) need to render
      // the error in place.
      const isLoginCall =
        typeof url === "string" &&
        (url.includes("/auth/login") ||
          url.includes("/auth/register") ||
          url.includes("/oauth2/callback"));
      if (status === 401 && !isLoginCall && typeof window !== "undefined") {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_EXPIRY_KEY);
        if (window.location.pathname !== LOGIN_PATH) {
          window.location.assign(LOGIN_PATH);
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

export const coreApi = build(CORE_BASE_URL);
export const identityApi = build(IDENTITY_BASE_URL);
