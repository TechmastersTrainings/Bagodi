/**
 * Centralized Authentication Context & Provider
 * Enterprise Session & Role-Based Access Engine
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { AuthUser, AuthTokens, UserRole, StoreContext } from "@bagodi/shared-types";
import { defaultApiClient } from "@bagodi/api-client";
import { tokenStorage } from "./token-storage";

export interface AuthContextType {
  user: AuthUser | null;
  activeStore: StoreContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens, user: AuthUser) => void;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permissionCode: string) => boolean;
  switchStore: (storeId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeStore, setActiveStore] = useState<StoreContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    try {
      const rt = await tokenStorage.getRefreshToken();
      if (rt) {
        await defaultApiClient.post("/auth/logout", { refreshToken: rt }, { skipAuth: true }).catch(() => {});
      }
    } finally {
      await tokenStorage.clearTokens();
      setUser(null);
      setActiveStore(null);
    }
  }, []);

  const login = useCallback(async (tokens: AuthTokens, authUser: AuthUser) => {
    await tokenStorage.setAccessToken(tokens.accessToken);
    await tokenStorage.setRefreshToken(tokens.refreshToken);
    setUser(authUser);

    // Set initial active store context if available
    if (authUser.activeStore) {
      setActiveStore(authUser.activeStore);
    } else if (authUser.availableStores && authUser.availableStores.length > 0) {
      setActiveStore(authUser.availableStores[0]);
    }
  }, []);

  const switchStore = useCallback(async (storeId: string) => {
    if (!user) return;
    try {
      const updatedUser = await defaultApiClient.post<AuthUser>("/auth/switch-store", { storeId });
      setUser(updatedUser);
      if (updatedUser.activeStore) {
        setActiveStore(updatedUser.activeStore);
      }
    } catch (err) {
      console.error("Failed to switch active store context", err);
      throw err;
    }
  }, [user]);

  useEffect(() => {
    // Configure API client callbacks with token storage
    defaultApiClient.updateConfig({
      getAccessToken: () => {
        const token = tokenStorage.getAccessToken();
        return typeof token === "string" ? token : null;
      },
      getRefreshToken: () => {
        const token = tokenStorage.getRefreshToken();
        return typeof token === "string" ? token : null;
      },
      onTokenRefreshed: (newToken) => {
        tokenStorage.setAccessToken(newToken);
      },
      onUnauthorized: () => {
        logout();
      },
    });

    // Verify and hydrate active session on mount
    const checkSession = async () => {
      try {
        const rt = await tokenStorage.getRefreshToken();
        if (rt) {
          const profile = await defaultApiClient.get<AuthUser>("/auth/me");
          setUser(profile);
          if (profile.activeStore) {
            setActiveStore(profile.activeStore);
          } else if (profile.availableStores && profile.availableStores.length > 0) {
            setActiveStore(profile.availableStores[0]);
          }
        }
      } catch {
        await tokenStorage.clearTokens();
        setUser(null);
        setActiveStore(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [logout]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      const targetRoles = Array.isArray(roles) ? roles : [roles];
      return targetRoles.includes(user.role);
    },
    [user]
  );

  const hasPermission = useCallback(
    (permissionCode: string): boolean => {
      if (!user) return false;
      // Super Admin has global platform permissions
      if (user.role === "SUPER_ADMIN") return true;
      return user.permissions?.includes(permissionCode) || false;
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    activeStore,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasPermission,
    switchStore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
