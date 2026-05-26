import { createContext } from "react";
import type { AuthState } from "../services";

export interface AuthContextValue {
  auth: AuthState;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthState>;
  logout: () => void;
  setAuthState: (auth: AuthState) => void;
}

export const emptyAuthState: AuthState = {
  token: null,
  role: null,
  mustChangePassword: false,
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
