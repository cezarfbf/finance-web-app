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

function build(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
  });

  // Auth interceptor — left as a hook for the future identity-service integration.
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth.token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

export const coreApi = build(CORE_BASE_URL);
export const identityApi = build(IDENTITY_BASE_URL);
