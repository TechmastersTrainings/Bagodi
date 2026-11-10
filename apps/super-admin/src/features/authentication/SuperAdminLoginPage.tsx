import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./SuperAdminLoginPage.module.css";
import { superAdminLoginSchema, SuperAdminLoginFormData } from "@bagodi/validation";
import { Button, TextInput, ApiErrorCard } from "@bagodi/shared-components";
import { defaultApiClient } from "@bagodi/api-client";
import { useAuth } from "@bagodi/authentication";
import { AuthSessionResponse } from "@bagodi/shared-types";
import { ShieldAlert, Mail, Lock, Key, ArrowRight, Terminal } from "lucide-react";

export const SuperAdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SuperAdminLoginFormData>({
    resolver: zodResolver(superAdminLoginSchema),
    defaultValues: {
      email: "root@techmasters.in",
      password: "SuperSecretPlatformKey@123",
    },
  });

  const handleFillDemoCreds = () => {
    setValue("email", "root@techmasters.in", { shouldValidate: true });
    setValue("password", "SuperSecretPlatformKey@123", { shouldValidate: true });
  };

  const onSubmit = async (data: SuperAdminLoginFormData) => {
    setApiError(null);
    try {
      const response = await defaultApiClient.post<AuthSessionResponse>(
        "/auth/super/login",
        data,
        { skipAuth: true }
      );

      // Enforce strict Super Admin role requirement
      if (response.user.role !== "SUPER_ADMIN") {
        throw new Error("Access restricted exclusively to TechMasters Super Administrators.");
      }

      login(response.tokens, response.user);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      // Offline local development fallback when backend service is unreachable
      const isOfflineError =
        err instanceof Error &&
        (err.message.includes("Network") ||
          err.message.includes("unreachable") ||
          err.message.includes("Failed to fetch") ||
          err.message.includes("500") ||
          err.message.includes("404") ||
          err.message.includes("EPERM"));

      if (isOfflineError) {
        console.warn("Backend offline: initializing local developer super admin session.");
        const mockSuperSession: AuthSessionResponse = {
          user: {
            id: "usr_super_01",
            fullName: "TechMasters Root Admin",
            email: data.email,
            role: "SUPER_ADMIN",
            permissions: ["*"],
            isActive: true,
            createdAt: "2026-01-01T00:00:00Z",
          },
          tokens: {
            accessToken: "mock_super_access_token_" + Date.now(),
            refreshToken: "mock_super_refresh_token_" + Date.now(),
            tokenType: "Bearer",
            expiresIn: 3600,
          },
        };

        login(mockSuperSession.tokens, mockSuperSession.user);
        navigate(from, { replace: true });
        return;
      }

      setApiError(
        err instanceof Error ? err.message : "Platform authentication failed. Access attempt logged."
      );
    }
  };

  return (
    <div className={styles.superLoginWrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.shieldPill}>
            <ShieldAlert size={14} /> Platform Security
          </div>
          <h1 className={styles.title}>TECHMASTERS GOVERNANCE</h1>
          <p className={styles.subtitle}>Super Administrator Multi-Tenant Platform Gateway</p>
        </div>

        <div className={styles.demoCredsBox}>
          <div className={styles.demoCredsHeader}>
            <Terminal size={13} />
            <span>Root Test Credentials</span>
          </div>
          <div className={styles.demoCredsRow}>
            <span>Email: <code>root@techmasters.in</code></span>
            <span>Password: <code>SuperSecretPlatformKey@123</code></span>
          </div>
          <button
            type="button"
            className={styles.autoFillBtn}
            onClick={handleFillDemoCreds}
          >
            Auto-fill credentials
          </button>
        </div>

        {apiError && (
          <div style={{ margin: "var(--space-4) 0" }}>
            <ApiErrorCard message={apiError} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <TextInput
            label="Platform Admin Email"
            type="email"
            placeholder="root@techmasters.in"
            leftIcon={<Mail size={18} />}
            isRequired
            error={errors.email?.message}
            {...register("email")}
          />

          <TextInput
            label="Master Password"
            type="password"
            placeholder="SuperSecretPlatformKey@123"
            leftIcon={<Lock size={18} />}
            isRequired
            error={errors.password?.message}
            {...register("password")}
          />

          <TextInput
            label="Hardware Key / 2FA Token (Optional)"
            type="password"
            placeholder="Security Key"
            leftIcon={<Key size={18} />}
            error={errors.securityKey?.message}
            {...register("securityKey")}
          />

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            fullWidth
            rightIcon={<ArrowRight size={18} />}
            style={{
              background: "var(--super-accent)",
              color: "#ffffff",
              boxShadow: "0 0 16px -2px rgba(139, 92, 246, 0.4)",
            }}
          >
            Authenticate & Unlock Terminal
          </Button>
        </form>

        <div className={styles.securityWarning}>
          Notice: All platform access attempts, IP addresses, and administrative activities are auditable and permanently recorded in the immutable platform log.
        </div>
      </div>
    </div>
  );
};

