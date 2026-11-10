import React, { ReactNode } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CustomerLayout } from "../layouts/CustomerLayout";
import { HomePage } from "../features/home/HomePage";
import { CataloguePage } from "../features/catalogue/CataloguePage";
import { ProductDetailPage } from "../features/product-details/ProductDetailPage";
import { CartPage } from "../features/cart/CartPage";
import { CheckoutPage } from "../features/checkout/CheckoutPage";
import { OrdersPage } from "../features/orders/OrdersPage";
import { OrderSuccessPage } from "../features/orders/OrderSuccessPage";
import { CustomerAuthPage } from "../features/authentication/CustomerAuthPage";
import { useAuth } from "@bagodi/authentication";
import { LoadingSpinner } from "@bagodi/shared-components";

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner label="Authenticating customer session..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <CustomerLayout>
      <Routes>
        {/* Public Browsing Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="/login" element={<CustomerAuthPage />} />

        {/* Protected Customer Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/profile"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CustomerLayout>
  );
};
