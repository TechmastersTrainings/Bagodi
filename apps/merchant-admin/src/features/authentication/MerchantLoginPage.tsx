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
import { ShieldCheck, Mail, Lock, ArrowRight, Store } from "lucide-react";

export const MerchantLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MerchantLoginFormData>({
    resolver: zodResolver(merchantLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: MerchantLoginFormData) => {
    setApiError(null);
    try {
      const response = await defaultApiClient.post<any>(
        "/auth/login",
        data,
        { skipAuth: true }
      );

      const rawUser = response?.user || {};
      const userRoles: string[] = Array.isArray(rawUser.roles)
        ? rawUser.roles
        : typeof rawUser.role === "string"
        ? [rawUser.role]
        : [];

      // Verify authorized store personnel roles
      const allowedRoles = [
        "MERCHANT_OWNER",
        "MERCHANT_ADMIN",
        "STORE_MANAGER",
        "INVENTORY_STAFF",
        "DELIVERY_STAFF",
        "SUPER_ADMIN",
      ];
      const hasAllowedRole = userRoles.some((r) => allowedRoles.includes(r)) || allowedRoles.includes(rawUser.role);
      if (!hasAllowedRole) {
        throw new Error("Access restricted to authorized Bagodi retail staff.");
      }

      const tokens: any = response?.tokens || {
        accessToken: response?.access_token || response?.accessToken,
        refreshToken: response?.refresh_token || response?.refreshToken,
        tokenType: "Bearer",
        expiresIn: response?.expires_in || response?.expiresIn || 900,
      };

      const normalizedUser: any = {
        id: String(rawUser.id || ""),
        email: rawUser.email || "",
        phone: rawUser.phone_e164 || rawUser.phone,
        fullName: rawUser.fullName || rawUser.display_name || rawUser.email || "Store Staff",
        role: rawUser.role || userRoles.find((r) => allowedRoles.includes(r)) || "STORE_MANAGER",
        merchantId: rawUser.tenant_id || rawUser.merchantId,
        permissions: Array.isArray(rawUser.permissions) ? rawUser.permissions : [],
        isActive: rawUser.status === "active" || rawUser.isActive === true,
        createdAt: rawUser.created_at || new Date().toISOString(),
      };

      login(tokens, normalizedUser);
      navigate(from, { replace: true });
    } catch (err: unknown) {
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
              placeholder="staff@bagodi.in"
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
              placeholder="Enter your store password"
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
