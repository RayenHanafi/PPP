import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, setAccessTokenProvider, type AuthState } from "../services";
import { AuthContext, emptyAuthState } from "./AuthContext";
import {
  clearStoredAuthState,
  loadStoredAuthState,
  saveStoredAuthState,
} from "./authStorage";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    return loadStoredAuthState() ?? emptyAuthState;
  });

  useEffect(() => {
    setAccessTokenProvider(() => auth.token);
    saveStoredAuthState(auth);

    return () => setAccessTokenProvider(null);
  }, [auth]);

  const setAuthState = useCallback((nextAuth: AuthState) => {
    setAuth(nextAuth);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const nextAuth = await authApi.login({ email, password });
    setAuth(nextAuth);
    return nextAuth;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuthState();
    setAuth(emptyAuthState);
  }, []);

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth.token && auth.role),
      login,
      logout,
      setAuthState,
    }),
    [auth, login, logout, setAuthState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
