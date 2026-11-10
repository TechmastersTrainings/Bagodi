import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./MerchantLoginPage.module.css";
import { merchantLoginSchema, MerchantLoginFormData } from "@bagodi/validation";
import { Button, TextInput, ApiErrorCard, PerspectiveCard3D } from "@bagodi/shared-components";
import { defaultApiClient } from "@bagodi/api-client";
import { useAuth } from "@bagodi/authentication";
import { AuthSessionResponse } from "@bagodi/shared-types";
import { Shield, Mail, Lock, ArrowRight, Store } from "lucide-react";

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
  });

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
      setApiError(
        err instanceof Error ? err.message : "Staff authentication failed. Please verify your credentials."
      );
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <PerspectiveCard3D maxTiltDeg={3}>
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
            <Store size={16} style={{ color: "var(--admin-accent)" }} />
            <span>Target Location: <strong>Bidar Flagship (Store 01)</strong></span>
          </div>

          {apiError && (
            <div style={{ margin: "var(--space-4) 0" }}>
              <ApiErrorCard message={apiError} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} style={{ marginTop: "var(--space-4)" }}>
            <TextInput
              label="Staff Email"
              type="email"
              placeholder="staff@bagodi.in"
              leftIcon={<Mail size={18} />}
              isRequired
              error={errors.email?.message}
              {...register("email")}
            />

            <TextInput
              label="Password"
              type="password"
              placeholder="••••••••••••"
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
      </PerspectiveCard3D>
    </div>
  );
};

