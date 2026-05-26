import type { AuthState } from "../services";

const AUTH_STORAGE_KEY = "threatchain.auth";

function isAuthRole(value: unknown): value is AuthState["role"] {
  return value === "admin" || value === "contributor" || value === null;
}

function isStoredAuthState(value: unknown): value is AuthState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthState>;

  return (
    (typeof candidate.token === "string" || candidate.token === null) &&
    isAuthRole(candidate.role)
  );
}

export function loadStoredAuthState(): AuthState | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed: unknown = JSON.parse(stored);

    if (!isStoredAuthState(parsed)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveStoredAuthState(auth: AuthState) {
  if (!auth.token || !auth.role) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuthState() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
