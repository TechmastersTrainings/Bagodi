/**
 * Permission and Role-Aware Interface Guards
 */

import React, { ReactNode } from "react";
import { UserRole } from "@bagodi/shared-types";
import { useAuth } from "./auth-context";

export interface PermissionGuardProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export interface RoleGuardProps {
  roles: UserRole | UserRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  fallback = null,
  children,
}) => {
  const { hasRole } = useAuth();
  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

