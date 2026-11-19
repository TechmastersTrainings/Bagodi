/**
 * Centralized API Client
 * FastAPI /api/v1/ integration with JWT refresh mutex, error handling, and cancellation
 */

import { RequestConfig, ApiClientConfig } from "./types";
import {
  ApiError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ServerError,
  NetworkError,
} from "./errors";

export interface ApiClientAuthConfig {
  getAccessToken?: () => string | null | Promise<string | null>;
  getRefreshToken?: () => string | null | Promise<string | null>;
  onTokenRefreshed?: (newToken: string) => void | Promise<void>;
  onUnauthorized?: () => void | Promise<void>;
}

function getEnvVar(key: string): string | undefined {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && typeof metaEnv[key] === "string" && metaEnv[key].trim() !== "") {
      return metaEnv[key].trim();
    }
  } catch {
    // Ignore in environments where import.meta is unavailable
  }
  try {
    if (typeof process !== "undefined" && process?.env && process.env[key]) {
      return String(process.env[key]).trim();
    }
  } catch {
    // Ignore
  }
  return undefined;
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeoutMs: number;
  private tokenGetter: (() => Promise<string | null> | string | null) | null = null;
  private tokenRefresher: (() => Promise<string | null> | string | null) | null = null;
  private onTokenRefreshedCb: ((token: string) => void) | null = null;
  private onUnauthorizedCb: (() => void) | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(config: ApiClientConfig = {}) {
    const envBase = getEnvVar("VITE_API_BASE_URL");
    const windowBase = typeof window !== "undefined" && (window as any).__API_BASE_URL__;

    // Production default: fallback to relative /api/v1 (proxied by Vercel/Nginx) or direct Render API
    let resolvedBase = config.baseUrl || envBase || windowBase || "/api/v1";

    if (resolvedBase.startsWith("http://") || resolvedBase.startsWith("https://")) {
      const clean = resolvedBase.replace(/\/+$/, "");
      if (!clean.endsWith("/api/v1")) {
        resolvedBase = `${clean}/api/v1`;
      } else {
        resolvedBase = clean;
      }
    }

    this.baseUrl = resolvedBase;
    this.defaultTimeoutMs = config.defaultTimeoutMs || 30000;
  }

  public updateConfig(authConfig: ApiClientAuthConfig): void {
    if (authConfig.getAccessToken) {
      this.tokenGetter = authConfig.getAccessToken;
    }
    if (authConfig.getRefreshToken) {
      this.tokenRefresher = authConfig.getRefreshToken;
    }
    if (authConfig.onTokenRefreshed) {
      this.onTokenRefreshedCb = authConfig.onTokenRefreshed;
    }
    if (authConfig.onUnauthorized) {
      this.onUnauthorizedCb = authConfig.onUnauthorized;
    }
  }

  public setTokenGetter(getter: () => Promise<string | null> | string | null): void {
    this.tokenGetter = getter;
  }

  public setTokenRefresher(refresher: () => Promise<string | null> | string | null): void {
    this.tokenRefresher = refresher;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const isAbsolute = this.baseUrl.startsWith("http://") || this.baseUrl.startsWith("https://");
    const fullTarget = `${this.baseUrl.replace(/\/+$/, "")}${cleanPath}`;

    const url = new URL(
      fullTarget,
      typeof window !== "undefined" ? window.location.origin : "http://localhost"
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return isAbsolute ? url.toString() : url.pathname + url.search;
  }

  public async request<T = unknown>(path: string, config: RequestConfig = {}): Promise<T> {
    const { params, skipAuth = false, timeoutMs = this.defaultTimeoutMs, headers: customHeaders, ...fetchInit } = config;

    const url = this.buildUrl(path, params);
    const headers = new Headers(customHeaders);

    if (!headers.has("Content-Type") && !(fetchInit.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Accept", "application/json");

    if (!skipAuth && this.tokenGetter) {
      try {
        const token = await this.tokenGetter();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (err) {
        console.warn("Failed retrieving access token", err);
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response: Response;
      try {
        response = await fetch(url, {
          ...fetchInit,
          headers,
          signal: fetchInit.signal || controller.signal,
        });
      } catch (err: any) {
        if (err.name === "AbortError") {
          throw new NetworkError("Request timed out");
        }
        throw new NetworkError(err?.message || "Network request failed. Ensure backend service is reachable.");
      }

      // Handle 401 Unauthorized with token refresh mutex
      if (response.status === 401 && !skipAuth && this.tokenRefresher) {
        if (!this.refreshPromise) {
          this.refreshPromise = (async () => {
            try {
              const refreshToken = await this.tokenRefresher!();
              if (!refreshToken) return null;

              const refreshRes = await fetch(this.buildUrl("/auth/refresh"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
              });

              if (refreshRes.ok) {
                const data = await refreshRes.json();
                const newAccessToken = data.accessToken || data.access_token;
                if (newAccessToken && this.onTokenRefreshedCb) {
                  this.onTokenRefreshedCb(newAccessToken);
                }
                return newAccessToken;
              }
            } catch (refreshErr) {
              console.warn("Silent token refresh failed", refreshErr);
            }
            if (this.onUnauthorizedCb) {
              this.onUnauthorizedCb();
            }
            return null;
          })().finally(() => {
            this.refreshPromise = null;
          });
        }

        const newToken = await this.refreshPromise;
        if (newToken) {
          headers.set("Authorization", `Bearer ${newToken}`);
          response = await fetch(url, {
            ...fetchInit,
            headers,
            signal: fetchInit.signal || controller.signal,
          });
        }
      }

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Handle empty response bodies (204 No Content, etc.)
      if (response.status === 204) {
        return null as unknown as T;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } finally {
      clearTimeout(timer);
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const message = errorData?.detail || errorData?.message || `HTTP ${response.status} Error`;

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message, errorData);
      case 403:
        throw new ForbiddenError(message, errorData);
      case 404:
        throw new NotFoundError(message, errorData);
      case 422:
        throw new ValidationError(message, errorData?.errors || errorData?.detail, errorData);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(message, errorData);
      default:
        throw new ApiError(message, response.status, errorData);
    }
  }

  public get<T = unknown>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, { ...config, method: "GET" });
  }

  public post<T = unknown>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: "POST",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = unknown>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: "PUT",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = unknown>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: "PATCH",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = unknown>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, { ...config, method: "DELETE" });
  }
}

export const defaultApiClient = new ApiClient();
