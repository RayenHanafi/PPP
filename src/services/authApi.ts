import { ApiError, post } from "./apiClient";
import type { AuthState } from "./types";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in?: string;
}

interface ContributorLoginResponse extends AdminLoginResponse {
  must_change_password: boolean;
}

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

function normalizeAdminLogin(response: AdminLoginResponse): AuthState {
  return {
    token: response.access_token,
    role: "admin",
    mustChangePassword: false,
  };
}

function normalizeContributorLogin(response: ContributorLoginResponse): AuthState {
  return {
    token: response.access_token,
    role: "contributor",
    mustChangePassword: response.must_change_password,
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthState> {
  try {
    const adminResponse = await post<AdminLoginResponse>("/auth/login", credentials);
    return normalizeAdminLogin(adminResponse);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }
  }

  const contributorResponse = await post<ContributorLoginResponse>(
    "/contributor/login",
    credentials,
  );

  return normalizeContributorLogin(contributorResponse);
}

export function changeContributorPassword(
  token: string,
  payload: ChangePasswordPayload,
) {
  return post<unknown>("/contributor/change-password", payload, { token });
}
