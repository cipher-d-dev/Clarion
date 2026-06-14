import type { ApiResponse, AuthUser, AuthTokens } from "@clarion/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    throw new ApiClientError(
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.message ?? "An error occurred",
      response.status,
      body.error?.details,
    );
  }

  return body.data as T;
}

export interface AuthResponseData {
  user: AuthUser;
  tokens: AuthTokens;
}

export const api = {
  health: () =>
    request<{ status: string; timestamp: string; service: string }>(
      "/v1/health",
    ),

  login: (data: { email: string; password: string }) =>
    request<AuthResponseData>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    institutionSlug: string;
    matricNo?: string;
    departmentCode?: string;
  }) =>
    request<AuthResponseData>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refresh: (refreshToken: string) =>
    request<AuthResponseData>("/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (refreshToken: string) =>
    request<{ message: string }>("/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
};
