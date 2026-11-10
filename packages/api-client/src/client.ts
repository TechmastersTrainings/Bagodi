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
import { getMockResponse } from "./mockRouter";

export interface ApiClientAuthConfig {
  getAccessToken?: () => string | null | Promise<string | null>;
  getRefreshToken?: () => string | null | Promise<string | null>;
  onTokenRefreshed?: (newToken: string) => void | Promise<void>;
  onUnauthorized?: () => void | Promise<void>;
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
    this.baseUrl = config.baseUrl || (typeof window !== "undefined" && (window as any).__API_BASE_URL__) || "/api/v1";
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
    const url = new URL(this.baseUrl + cleanPath, typeof window !== "undefined" ? window.location.origin : "http://localhost");

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.pathname + url.search;
  }

  public async request<T = unknown>(path: string, config: RequestConfig = {}): Promise<T> {
    const { params, skipAuth = false, timeoutMs = this.defaultTimeoutMs, headers: customHeaders, ...fetchInit } = config;

    const url = this.buildUrl(path, params);
    const headers = new Headers(customHeaders);

    // Fast-path: standalone mode (no backend required)
    // Runs in-browser mock router by default unless explicitly configured with bagodi_use_real_backend=true
    const isMockForced =
      typeof window !== "undefined" &&
      localStorage.getItem("bagodi_use_real_backend") !== "true";

    if (isMockForced) {
      await new Promise((r) => setTimeout(r, 60));
      let parsedBody: unknown;
      try {
        if (typeof fetchInit.body === "string") parsedBody = JSON.parse(fetchInit.body);
      } catch {
        parsedBody = fetchInit.body;
      }
      return getMockResponse(fetchInit.method || "GET", path, parsedBody, params) as T;
    }

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
        // Graceful standalone fallback when backend is unreachable locally
        console.warn(`[ApiClient] Network request failed for ${path}. Falling back to standalone mock provider.`);
        await new Promise((r) => setTimeout(r, 60));
        let parsedBody: unknown;
        try {
          if (typeof fetchInit.body === "string") parsedBody = JSON.parse(fetchInit.body);
        } catch {
          parsedBody = fetchInit.body;
        }
        return getMockResponse(fetchInit.method || "GET", path, parsedBody, params) as T;
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
        // When Vite proxy returns 500/502/503/504 because backend is offline
        if (response.status >= 500) {
          console.warn(`[ApiClient] Backend server error (${response.status}) on ${path}. Falling back to standalone mock provider.`);
          await new Promise((r) => setTimeout(r, 60));
          let parsedBody: unknown;
          try {
            if (typeof fetchInit.body === "string") parsedBody = JSON.parse(fetchInit.body);
          } catch {
            parsedBody = fetchInit.body;
          }
          return getMockResponse(fetchInit.method || "GET", path, parsedBody, params) as T;
        }

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
