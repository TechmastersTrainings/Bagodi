import React, { ReactNode } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { ProductListPage } from "../features/products/ProductListPage";
import { InventoryPage } from "../features/inventory/InventoryPage";
import { AdminOrdersPage } from "../features/orders/AdminOrdersPage";
import { ReturnsPage } from "../features/returns/ReturnsPage";
import { PaymentsPage } from "../features/payments/PaymentsPage";
import { DeliveryPage } from "../features/delivery/DeliveryPage";
import { CouponsPage } from "../features/coupons/CouponsPage";
import { ReportsPage } from "../features/reports/ReportsPage";
import { MerchantLoginPage } from "../features/authentication/MerchantLoginPage";
import { useAuth } from "@bagodi/authentication";
import { LoadingSpinner, PermissionDeniedState } from "@bagodi/shared-components";

const ProtectedAdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner label="Verifying operational staff permissions..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  const isStaff = hasRole(["MERCHANT_ADMIN", "STORE_MANAGER", "INVENTORY_STAFF", "SUPER_ADMIN"]);
  if (!isStaff) {
    return <PermissionDeniedState />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Staff Login Route */}
      <Route path="/login" element={<MerchantLoginPage />} />

      {/* Protected Merchant Operations Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedAdminRoute>
            <DashboardPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedAdminRoute>
            <ProductListPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedAdminRoute>
            <InventoryPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedAdminRoute>
            <AdminOrdersPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/returns"
        element={
          <ProtectedAdminRoute>
            <ReturnsPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedAdminRoute>
            <PaymentsPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/delivery"
        element={
          <ProtectedAdminRoute>
            <DeliveryPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/coupons"
        element={
          <ProtectedAdminRoute>
            <CouponsPage />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedAdminRoute>
            <ReportsPage />
          </ProtectedAdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
