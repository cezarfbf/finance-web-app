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

function storeSession(data: LoginResponse): void {
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  if (typeof data.expiresIn === "number") {
    localStorage.setItem(AUTH_EXPIRY_KEY, String(data.expiresIn));
  }
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await identityApi.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  storeSession(data);
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await identityApi.post<LoginResponse>("/auth/register", {
    name: name.trim() || null,
    email,
    password,
  });
  storeSession(data);
  return data;
}

/**
 * Full-page navigation target that starts the Google OAuth2 flow.
 * The identity service redirects to Google's consent screen and Google
 * redirects back to our /auth/google/callback route.
 */
export function googleAuthorizeUrl(): string {
  return `${identityApi.defaults.baseURL}/oauth2/google/authorize`;
}

/**
 * Finishes the Google flow: trades the authorization code for our own JWT.
 * withCredentials so the CSRF state cookie set by the identity service
 * during the authorize redirect is sent along (cross-site in prod).
 */
export async function completeGoogleLogin(
  code: string,
  state: string,
): Promise<LoginResponse> {
  const { data } = await identityApi.get<LoginResponse>(
    "/oauth2/callback/google",
    { params: { code, state }, withCredentials: true },
  );
  storeSession(data);
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
