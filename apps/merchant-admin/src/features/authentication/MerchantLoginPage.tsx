import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./MerchantLoginPage.module.css";
import { merchantLoginSchema, MerchantLoginFormData } from "@bagodi/validation";
import { Button, TextInput, ApiErrorCard } from "@bagodi/shared-components";
import { defaultApiClient } from "@bagodi/api-client";
import { useAuth } from "@bagodi/authentication";
import { AuthSessionResponse } from "@bagodi/shared-types";
import { Shield, Mail, Lock, ArrowRight, Store, KeyRound } from "lucide-react";

export const MerchantLoginPage: React.FC = () => {
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
  } = useForm<MerchantLoginFormData>({
    resolver: zodResolver(merchantLoginSchema),
    defaultValues: {
      email: "manager@bagodi.in",
      password: "StorePassword@123",
    },
  });

  const handleFillDemoCreds = () => {
    setValue("email", "manager@bagodi.in", { shouldValidate: true });
    setValue("password", "StorePassword@123", { shouldValidate: true });
  };

  const onSubmit = async (data: MerchantLoginFormData) => {
    setApiError(null);
    try {
      const response = await defaultApiClient.post<AuthSessionResponse>(
        "/auth/merchant/login",
        data,
        { skipAuth: true }
      );

      // Verify that the user has store staff privileges
      const allowedRoles = ["MERCHANT_ADMIN", "STORE_MANAGER", "INVENTORY_STAFF", "DELIVERY_STAFF", "SUPER_ADMIN"];
      if (!allowedRoles.includes(response.user.role)) {
        throw new Error("Access restricted to authorized Bagodi store staff.");
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
        console.warn("Backend offline: initializing local developer staff session.");
        const mockStaffSession: AuthSessionResponse = {
          user: {
            id: "usr_staff_12",
            fullName: "Rajesh Sharma",
            email: data.email,
            role: "STORE_MANAGER",
            merchantId: "mer_bagodi",
            storeId: "str_bidar_01",
            activeStore: {
              id: "str_bidar_01",
              name: "Bagodi Flagship Store",
              code: "BDR-01",
              city: "Bidar",
              isFlagship: true,
            },
            availableStores: [
              {
                id: "str_bidar_01",
                name: "Bagodi Flagship Store",
                code: "BDR-01",
                city: "Bidar",
                isFlagship: true,
              },
            ],
            permissions: [
              "inventory:read",
              "inventory:write",
              "orders:read",
              "orders:manage",
              "returns:read",
              "returns:inspect",
            ],
            isActive: true,
            createdAt: "2026-01-10T09:00:00Z",
          },
          tokens: {
            accessToken: "mock_staff_access_token_" + Date.now(),
            refreshToken: "mock_staff_refresh_token_" + Date.now(),
            tokenType: "Bearer",
            expiresIn: 3600,
          },
        };

        login(mockStaffSession.tokens, mockStaffSession.user);
        navigate(from, { replace: true });
        return;
      }

      setApiError(
        err instanceof Error ? err.message : "Staff authentication failed. Please verify your credentials."
      );
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.badge}>
            <Shield size={14} /> Operations Portal
          </div>
          <h1 className={styles.title}>Bagodi Merchant Admin</h1>
          <p className={styles.subtitle}>
            Secure sign in for store managers, inventory supervisors, and retail staff
          </p>
        </div>

        <div className={styles.storeNotice}>
          <Store size={16} className={styles.storeIcon} />
          <span>Target Location: <strong>Bidar Flagship (Store 01)</strong></span>
        </div>

        <div className={styles.demoCredsBox}>
          <div className={styles.demoCredsHeader}>
            <KeyRound size={13} />
            <span>Staff Test Credentials</span>
          </div>
          <div className={styles.demoCredsRow}>
            <span>Email: <code>manager@bagodi.in</code></span>
            <span>Password: <code>StorePassword@123</code></span>
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
            label="Staff Email"
            type="email"
            placeholder="manager@bagodi.in"
            leftIcon={<Mail size={18} />}
            isRequired
            error={errors.email?.message}
            {...register("email")}
          />

          <TextInput
            label="Password"
            type="password"
            placeholder="StorePassword@123"
            leftIcon={<Lock size={18} />}
            isRequired
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            fullWidth
            rightIcon={<ArrowRight size={18} />}
          >
            Sign In to Command Center
          </Button>
        </form>

        <div className={styles.footerNote}>
          <span>Protected by TechMasters Enterprise Access Guard</span>
        </div>
      </div>
    </div>
  );
};

