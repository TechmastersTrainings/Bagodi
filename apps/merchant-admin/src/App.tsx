import React, { Component, ErrorInfo, ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@bagodi/authentication";
import { AdminRoutes } from "./routes/AdminRoutes";
import { Button } from "@bagodi/shared-components";
import "@bagodi/design-system/css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught admin application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-6)",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: 500,
              padding: "var(--space-8)",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>
              Admin Portal Error
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
              {this.state.error?.message || "An unexpected error occurred in the merchant operations dashboard."}
            </p>
            <Button onClick={() => window.location.reload()} size="md">
              Reload Dashboard
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AdminRoutes />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
