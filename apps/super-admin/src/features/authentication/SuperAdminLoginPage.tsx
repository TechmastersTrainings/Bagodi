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
import { ShieldCheck, Mail, Lock, Key, ArrowRight, Server } from "lucide-react";

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
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SuperAdminLoginFormData) => {
    setApiError(null);
    try {
      const response = await defaultApiClient.post<AuthSessionResponse>(
        "/auth/login",
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
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.shieldPill}>
            <ShieldCheck size={14} color="#C5A15B" />
            <span>Platform Governance Portal</span>
          </div>

          <div className={styles.brandWordmarkCol}>
            <span className={styles.brandWordmarkAnimated}>BAGODI</span>
            <span className={styles.brandSubtitle}>SUPER ADMIN • PLATFORM GOVERNANCE</span>
          </div>

          <p className={styles.subtitle}>
            Authorized sign in for TechMasters Innovations platform operators & governance architects
          </p>
        </div>

        <div className={styles.noticeBox}>
          <Server size={16} className={styles.noticeIcon} />
          <span>Cluster Node: <strong>India-Central (Multi-Tenant Master)</strong></span>
        </div>

        {apiError && (
          <div style={{ margin: "var(--space-4) 0" }}>
            <ApiErrorCard message={apiError} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <TextInput
              label="Master Administrator Email"
              type="email"
              placeholder="admin@techmasters.in"
              leftIcon={<Mail size={18} />}
              isRequired
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div className={styles.formGroup}>
            <TextInput
              label="Master Password"
              type="password"
              placeholder="Enter master password"
              leftIcon={<Lock size={18} />}
              isRequired
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div className={styles.formGroup}>
            <TextInput
              label="Hardware Key / 2FA Token (Optional)"
              type="password"
              placeholder="Security Key"
              leftIcon={<Key size={18} />}
              error={errors.securityKey?.message}
              {...register("securityKey")}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight size={16} />}
            className={styles.submitBtn}
          >
            Authenticate Platform Session
          </Button>
        </form>

        <div className={styles.securityWarning}>
          Multi-tenant platform mutations are cryptographically signed and audited to immutable master ledger.
        </div>
      </div>
    </div>
  );
};
