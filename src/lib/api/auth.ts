import { identityApi } from "./client";

const AUTH_TOKEN_KEY = "auth.token";
const AUTH_EXPIRY_KEY = "auth.expiresIn";

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface CurrentUser {
  id: string;
  email: string;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await identityApi.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  if (typeof data.expiresIn === "number") {
    localStorage.setItem(AUTH_EXPIRY_KEY, String(data.expiresIn));
  }
  return data;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const { data } = await identityApi.get<CurrentUser>("/auth/me");
    return data;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      (err as { response?: { status?: number } }).response?.status === 401
    ) {
      return null;
    }
    throw err;
  }
}

export function logout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
