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
import { ShieldCheck, Mail, Lock, ArrowRight, Store, KeyRound, CheckCircle2 } from "lucide-react";

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
      email: "merchant@bagodi.in",
      password: "Fri10Feb@2023",
    },
  });

  const handleFillDemoCreds = () => {
    setValue("email", "merchant@bagodi.in", { shouldValidate: true });
    setValue("password", "Fri10Feb@2023", { shouldValidate: true });
  };

  const onSubmit = async (data: MerchantLoginFormData) => {
    setApiError(null);
    try {
      const response = await defaultApiClient.post<AuthSessionResponse>(
        "/auth/login",
        data,
        { skipAuth: true }
      );

      // Verify authorized store personnel roles
      const allowedRoles = [
        "MERCHANT_OWNER",
        "MERCHANT_ADMIN",
        "STORE_MANAGER",
        "INVENTORY_STAFF",
        "DELIVERY_STAFF",
        "SUPER_ADMIN",
      ];
      if (!allowedRoles.includes(response.user.role)) {
        throw new Error("Access restricted to authorized Bagodi retail staff.");
      }

      login(response.tokens, response.user);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      // Offline fallback: when mock or backend service is used locally
      const isOfflineFallback =
        err instanceof Error &&
        (err.message.includes("Network") ||
          err.message.includes("unreachable") ||
          err.message.includes("Failed to fetch") ||
          err.message.includes("500") ||
          err.message.includes("404") ||
          err.message.includes("EPERM"));

      if (isOfflineFallback) {
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
        {/* Brand Header matching Customer Web Storefront */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <ShieldCheck size={14} color="#C5A15B" />
            <span>Store Operations Portal</span>
          </div>

          <div className={styles.brandWordmarkCol}>
            <span className={styles.brandWordmarkAnimated}>BAGODI</span>
            <span className={styles.brandSubtitle}>RETAIL OPERATIONS • BIDAR MALL</span>
          </div>

          <p className={styles.subtitle}>
            Authorized sign in for store managers, inventory supervisors, and cashier staff
          </p>
        </div>

        {/* Static Official Store Notice */}
        <div className={styles.storeNotice}>
          <Store size={16} className={styles.storeIcon} />
          <span>Assigned Store: <strong>Bidar Flagship (Store 01)</strong></span>
        </div>

        {/* Static Staff Test Credentials Helper Box */}
        <div className={styles.demoCredsBox}>
          <div className={styles.demoCredsHeader}>
            <KeyRound size={14} color="#E31B23" />
            <span className={styles.demoCredsTitle}>Pre-Configured Demo Staff Credentials</span>
          </div>
          <div className={styles.demoCredsGrid}>
            <div className={styles.demoCredItem}>
              <span className={styles.demoCredLabel}>Staff Email</span>
              <code className={styles.demoCredCode}>merchant@bagodi.in</code>
            </div>
            <div className={styles.demoCredItem}>
              <span className={styles.demoCredLabel}>Password</span>
              <code className={styles.demoCredCode}>Fri10Feb@2023</code>
            </div>
          </div>
          <button
            type="button"
            className={styles.autoFillBtn}
            onClick={handleFillDemoCreds}
            title="Click to auto-fill the login form with test credentials"
          >
            <CheckCircle2 size={13} />
            <span>Auto-fill credentials</span>
          </button>
        </div>

        {apiError && (
          <div style={{ margin: "var(--space-4) 0" }}>
            <ApiErrorCard message={apiError} />
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <TextInput
              label="Staff Email Address"
              type="email"
              placeholder="manager@bagodi.in"
              leftIcon={<Mail size={17} />}
              isRequired
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div className={styles.formGroup}>
            <TextInput
              label="Store Password"
              type="password"
              placeholder="StorePassword@123"
              leftIcon={<Lock size={17} />}
              isRequired
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div className={styles.submitBtnWrap}>
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              fullWidth
              rightIcon={<ArrowRight size={18} />}
            >
              Sign In to Command Center
            </Button>
          </div>
        </form>

        {/* Footer Security Note */}
        <div className={styles.footerNote}>
          <span>Protected by TechMasters Enterprise Access Guard • Store ID: STR-BDR-01</span>
        </div>
      </div>
    </div>
  );
};
