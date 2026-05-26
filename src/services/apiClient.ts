export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface ApiErrorBody {
  detail?: string | string[] | Record<string, unknown>;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

let accessTokenProvider: (() => string | null) | null = null;

export function setAccessTokenProvider(provider: (() => string | null) | null) {
  accessTokenProvider = provider;
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function getErrorMessage(status: number, body: unknown) {
  if (body && typeof body === "object") {
    const errorBody = body as ApiErrorBody;

    if (typeof errorBody.detail === "string") {
      return errorBody.detail;
    }

    if (Array.isArray(errorBody.detail)) {
      return errorBody.detail.join(", ");
    }

    if (typeof errorBody.message === "string") {
      return errorBody.message;
    }
  }

  return status === 401
    ? "Invalid email or password."
    : "Request failed. Please try again.";
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest<T>(
  path: string,
  {
    method = "GET",
    body,
    token,
    headers,
    signal,
  }: ApiRequestOptions = {},
): Promise<T> {
  const resolvedToken = token ?? accessTokenProvider?.() ?? null;
  const requestHeaders = new Headers(headers);
  const hasBody = body !== undefined;

  if (resolvedToken) {
    requestHeaders.set("Authorization", `Bearer ${resolvedToken}`);
  }

  if (hasBody && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: hasBody
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
    signal,
  });

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      getErrorMessage(response.status, responseBody),
      responseBody,
    );
  }

  return responseBody as T;
}

export function get<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

export function post<T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, "method" | "body">,
) {
  return apiRequest<T>(path, { ...options, method: "POST", body });
}
