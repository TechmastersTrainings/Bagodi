import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./SuperAdminLoginPage.module.css";
import { superAdminLoginSchema, SuperAdminLoginFormData } from "@bagodi/validation";
import { Button, TextInput, ApiErrorCard, PerspectiveCard3D } from "@bagodi/shared-components";
import { defaultApiClient } from "@bagodi/api-client";
import { useAuth } from "@bagodi/authentication";
import { AuthSessionResponse } from "@bagodi/shared-types";
import { ShieldAlert, Mail, Lock, Key, ArrowRight } from "lucide-react";

export const SuperAdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SuperAdminLoginFormData>({
    resolver: zodResolver(superAdminLoginSchema),
  });

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
      setApiError(
        err instanceof Error ? err.message : "Platform authentication failed. Access attempt logged."
      );
    }
  };

  return (
    <div className={styles.superLoginWrapper}>
      <PerspectiveCard3D maxTiltDeg={3}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.shieldPill}>
              <ShieldAlert size={14} /> Platform Security
            </div>
            <h1 className={styles.title}>TECHMASTERS GOVERNANCE</h1>
            <p className={styles.subtitle}>Super Administrator Multi-Tenant Platform Gateway</p>
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
              placeholder="••••••••••••••••"
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
      </PerspectiveCard3D>
    </div>
  );
};

