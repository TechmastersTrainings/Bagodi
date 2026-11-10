/**
 * API Client Types & Interfaces
 */

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  timeoutMs?: number;
}

export interface ApiClientConfig {
  baseUrl?: string;
  defaultTimeoutMs?: number;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

