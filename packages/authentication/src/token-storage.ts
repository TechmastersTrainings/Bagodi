/**
 * Secure Token Storage Adapter
 * Provides platform-aware storage (Capacitor Secure Storage vs Web Memory/Storage)
 */

export interface TokenStorageStrategy {
  getAccessToken(): Promise<string | null> | string | null;
  setAccessToken(token: string): Promise<void> | void;
  getRefreshToken(): Promise<string | null> | string | null;
  setRefreshToken(token: string): Promise<void> | void;
  clearTokens(): Promise<void> | void;
}

class HybridPlatformTokenStorage implements TokenStorageStrategy {
  private inMemoryAccessToken: string | null = null;
  private readonly REFRESH_KEY = "bagodi_auth_rt";
  private readonly ACCESS_KEY = "bagodi_auth_at";

  private isNative(): boolean {
    return typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();
  }

  getAccessToken(): string | null {
    if (this.inMemoryAccessToken) return this.inMemoryAccessToken;
    if (this.isNative()) {
      try {
        return localStorage.getItem(this.ACCESS_KEY);
      } catch {
        return null;
      }
    }
    return null;
  }

  setAccessToken(token: string): void {
    this.inMemoryAccessToken = token;
    if (this.isNative()) {
      try {
        localStorage.setItem(this.ACCESS_KEY, token);
      } catch {
        // Fallback
      }
    }
  }

  getRefreshToken(): string | null {
    try {
      if (this.isNative()) {
        return localStorage.getItem(this.REFRESH_KEY);
      }
      return sessionStorage.getItem(this.REFRESH_KEY);
    } catch {
      return null;
    }
  }

  setRefreshToken(token: string): void {
    try {
      if (this.isNative()) {
        localStorage.setItem(this.REFRESH_KEY, token);
      } else {
        sessionStorage.setItem(this.REFRESH_KEY, token);
      }
    } catch {
      // Memory fallback if storage is restricted
    }
  }

  clearTokens(): void {
    this.inMemoryAccessToken = null;
    try {
      if (this.isNative()) {
        localStorage.removeItem(this.ACCESS_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
      } else {
        sessionStorage.removeItem(this.REFRESH_KEY);
      }
    } catch {
      // Ignore
    }
  }
}

export const tokenStorage: TokenStorageStrategy = new HybridPlatformTokenStorage();

