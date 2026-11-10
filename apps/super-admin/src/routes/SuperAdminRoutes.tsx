import React, { ReactNode } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SuperAdminLayout } from "../layouts/SuperAdminLayout";
import { SuperDashboardPage } from "../features/dashboard/SuperDashboardPage";
import { MerchantsPage } from "../features/merchants/MerchantsPage";
import { PlatformUsersPage } from "../features/platform-users/PlatformUsersPage";
import { AuditLogsPage } from "../features/audit-logs/AuditLogsPage";
import { SystemConfigPage } from "../features/settings/SystemConfigPage";
import { SuperAdminLoginPage } from "../features/authentication/SuperAdminLoginPage";
import { useAuth } from "@bagodi/authentication";
import { LoadingSpinner, PermissionDeniedState } from "@bagodi/shared-components";

const ProtectedSuperAdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner label="Validating Super Admin platform authorization..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!hasRole("SUPER_ADMIN")) {
    return <PermissionDeniedState />;
  }

  return <SuperAdminLayout>{children}</SuperAdminLayout>;
};

export const SuperAdminRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<SuperAdminLoginPage />} />

      {/* Protected Governance Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedSuperAdminRoute>
            <SuperDashboardPage />
          </ProtectedSuperAdminRoute>
        }
      />
      <Route
        path="/merchants"
        element={
          <ProtectedSuperAdminRoute>
            <MerchantsPage />
          </ProtectedSuperAdminRoute>
        }
      />
      <Route
        path="/platform-users"
        element={
          <ProtectedSuperAdminRoute>
            <PlatformUsersPage />
          </ProtectedSuperAdminRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedSuperAdminRoute>
            <AuditLogsPage />
          </ProtectedSuperAdminRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedSuperAdminRoute>
            <SystemConfigPage />
          </ProtectedSuperAdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
