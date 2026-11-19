import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@bagodi/authentication";
import { AgentLoginPage } from "./features/auth/AgentLoginPage";
import { AgentDeliveriesPage } from "./features/deliveries/AgentDeliveriesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("bagodi_access_token"));

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("bagodi_access_token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                token ? (
                  <Navigate to="/" replace />
                ) : (
                  <AgentLoginPage onLoginSuccess={() => setToken(localStorage.getItem("bagodi_access_token"))} />
                )
              }
            />
            <Route
              path="/"
              element={
                token ? (
                  <AgentDeliveriesPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/deliveries"
              element={
                token ? (
                  <AgentDeliveriesPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

