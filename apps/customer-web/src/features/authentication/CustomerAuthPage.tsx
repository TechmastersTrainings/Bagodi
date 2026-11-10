import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./CustomerAuthPage.module.css";
import {
  sendOtpSchema,
  customerPasswordLoginSchema,
  customerRegisterSchema,
  SendOtpFormData,
  CustomerPasswordLoginFormData,
  CustomerRegisterFormData,
} from "@bagodi/validation";
import {
  Button,
  TextInput,
  OtpInput,
  PerspectiveCard3D,
  ApiErrorCard,
} from "@bagodi/shared-components";
import { defaultApiClient } from "@bagodi/api-client";
import { useAuth } from "@bagodi/authentication";
import {
  AuthSessionResponse,
  SendOtpResponse,
} from "@bagodi/shared-types";
import { Smartphone, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

type AuthTab = "OTP" | "PASSWORD" | "REGISTER";

export const CustomerAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("OTP");
  const [apiError, setApiError] = useState<string | null>(null);

  // OTP Flow State
  const [otpStep, setOtpStep] = useState<"INPUT" | "VERIFY">("INPUT");
  const [otpReference, setOtpReference] = useState<SendOtpResponse | null>(null);
  const [targetPhoneOrEmail, setTargetPhoneOrEmail] = useState<string>("");
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  // Determine redirect target
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/account/orders";

  // Form for Sending OTP
  const {
    register: registerOtpSend,
    handleSubmit: handleOtpSendSubmit,
    formState: { errors: otpSendErrors, isSubmitting: isSendingOtp },
  } = useForm<SendOtpFormData>({
    resolver: zodResolver(sendOtpSchema),
  });

  // Form for Password Login
  const {
    register: registerPasswordLogin,
    handleSubmit: handlePasswordLoginSubmit,
    formState: { errors: passwordErrors, isSubmitting: isLoggingInPassword },
  } = useForm<CustomerPasswordLoginFormData>({
    resolver: zodResolver(customerPasswordLoginSchema),
  });

  // Form for Registration
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegistering },
  } = useForm<CustomerRegisterFormData>({
    resolver: zodResolver(customerRegisterSchema),
  });

  // Resend OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpStep === "VERIFY" && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpStep, resendCountdown]);

  /* 1. Request OTP from Backend */
  const onSendOtp = async (data: SendOtpFormData) => {
    setApiError(null);
    try {
      const response = await defaultApiClient.post<SendOtpResponse>("/auth/customer/send-otp", data, {
        skipAuth: true,
      });
      setOtpReference(response);
      setTargetPhoneOrEmail(data.phoneOrEmail);
      setOtpStep("VERIFY");
      setResendCountdown(response.expiresInSeconds || 60);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to deliver verification code. Please check your number.");
    }
  };

  /* 2. Verify OTP with Backend */
  const onVerifyOtp = async () => {
    if (!otpReference || enteredOtp.length !== 6) return;
    setApiError(null);
    setIsVerifyingOtp(true);
    try {
      const response = await defaultApiClient.post<AuthSessionResponse>(
        "/auth/customer/verify-otp",
        {
          referenceId: otpReference.referenceId,
          phoneOrEmail: targetPhoneOrEmail,
          otp: enteredOtp,
        },
        { skipAuth: true }
      );
      login(response.tokens, response.user);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Invalid or expired verification code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  /* 3. Password Login */
  const onPasswordLogin = async (data: CustomerPasswordLoginFormData) => {
    setApiError(null);
    try {
      const response = await defaultApiClient.post<AuthSessionResponse>(
        "/auth/customer/login-password",
        data,
        { skipAuth: true }
      );
      login(response.tokens, response.user);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Invalid login credentials. Please try again.");
    }
  };

  /* 4. Customer Registration */
  const onRegister = async (data: CustomerRegisterFormData) => {
    setApiError(null);
    try {
      const response = await defaultApiClient.post<AuthSessionResponse>(
        "/auth/customer/register",
        data,
        { skipAuth: true }
      );
      login(response.tokens, response.user);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Registration failed. An account with this phone or email may already exist.");
    }
  };

  return (
    <div className={styles.authContainer}>
      <PerspectiveCard3D maxTiltDeg={4}>
        <div className={styles.authCard}>
          {/* Header */}
          <div className={styles.authHeader}>
            <span className={styles.brandBadge}>Bagodi Boutique • Bidar</span>
            <h1 className={styles.title}>Customer Account</h1>
            <p className={styles.subtitle}>
              Sign in to manage your garments, custom sizing, delivery tracking, and returns.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className={styles.tabNavigation}>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "OTP" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab("OTP");
                setApiError(null);
              }}
            >
              Mobile OTP
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "PASSWORD" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab("PASSWORD");
                setApiError(null);
              }}
            >
              Password
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "REGISTER" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab("REGISTER");
                setApiError(null);
              }}
            >
              Create Account
            </button>
          </div>

          {/* API Error Notification */}
          {apiError && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <ApiErrorCard message={apiError} />
            </div>
          )}

          {/* TAB 1: FAST MOBILE OTP */}
          {activeTab === "OTP" && (
            <div>
              {otpStep === "INPUT" ? (
                <form onSubmit={handleOtpSendSubmit(onSendOtp)} className={styles.form}>
                  <TextInput
                    label="Mobile Number or Email"
                    placeholder="Enter 10-digit mobile (e.g. 9876543210)"
                    leftIcon={<Smartphone size={18} />}
                    isRequired
                    error={otpSendErrors.phoneOrEmail?.message}
                    {...registerOtpSend("phoneOrEmail")}
                  />

                  <Button type="submit" size="lg" isLoading={isSendingOtp} fullWidth rightIcon={<ArrowRight size={18} />}>
                    Send Secure OTP
                  </Button>

                  <p style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                    We'll send a 6-digit one-time code to verify your device.
                  </p>
                </form>
              ) : (
                <div className={styles.form}>
                  <div className={styles.otpInfoBox}>
                    <span>
                      Code sent to <strong>{otpReference?.maskedDestination || targetPhoneOrEmail}</strong>
                    </span>
                    <button
                      type="button"
                      className={styles.editNumberBtn}
                      onClick={() => {
                        setOtpStep("INPUT");
                        setEnteredOtp("");
                      }}
                    >
                      Change
                    </button>
                  </div>

                  <OtpInput
                    length={6}
                    value={enteredOtp}
                    onChange={(val) => setEnteredOtp(val)}
                  />

                  <Button
                    type="button"
                    size="lg"
                    isLoading={isVerifyingOtp}
                    disabled={enteredOtp.length !== 6}
                    onClick={onVerifyOtp}
                    fullWidth
                  >
                    Verify & Sign In
                  </Button>

                  <div className={styles.resendContainer}>
                    <span>Didn't receive the code?</span>
                    {resendCountdown > 0 ? (
                      <span>Resend in {resendCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        className={styles.editNumberBtn}
                        onClick={() => onSendOtp({ phoneOrEmail: targetPhoneOrEmail, channel: "SMS" })}
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL / PHONE + PASSWORD */}
          {activeTab === "PASSWORD" && (
            <form onSubmit={handlePasswordLoginSubmit(onPasswordLogin)} className={styles.form}>
              <TextInput
                label="Email or Mobile"
                placeholder="name@example.com or 10-digit phone"
                leftIcon={<Mail size={18} />}
                isRequired
                error={passwordErrors.emailOrPhone?.message}
                {...registerPasswordLogin("emailOrPhone")}
              />

              <TextInput
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock size={18} />}
                isRequired
                error={passwordErrors.password?.message}
                {...registerPasswordLogin("password")}
              />

              <Button type="submit" size="lg" isLoading={isLoggingInPassword} fullWidth rightIcon={<ArrowRight size={18} />}>
                Sign In With Password
              </Button>
            </form>
          )}

          {/* TAB 3: REGISTRATION */}
          {activeTab === "REGISTER" && (
            <form onSubmit={handleRegisterSubmit(onRegister)} className={styles.form}>
              <TextInput
                label="Full Name"
                placeholder="e.g. Ramesh Patil"
                leftIcon={<User size={18} />}
                isRequired
                error={registerErrors.fullName?.message}
                {...registerRegister("fullName")}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <TextInput
                  label="10-Digit Mobile"
                  placeholder="9876543210"
                  leftIcon={<Smartphone size={16} />}
                  isRequired
                  error={registerErrors.phone?.message}
                  {...registerRegister("phone")}
                />
                <TextInput
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  leftIcon={<Mail size={16} />}
                  isRequired
                  error={registerErrors.email?.message}
                  {...registerRegister("email")}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <TextInput
                  label="Password"
                  type="password"
                  placeholder="Min 8 chars"
                  leftIcon={<Lock size={16} />}
                  isRequired
                  error={registerErrors.password?.message}
                  {...registerRegister("password")}
                />
                <TextInput
                  label="Confirm"
                  type="password"
                  placeholder="Repeat password"
                  leftIcon={<Lock size={16} />}
                  isRequired
                  error={registerErrors.confirmPassword?.message}
                  {...registerRegister("confirmPassword")}
                />
              </div>

              <label className={styles.termsCheckbox}>
                <input type="checkbox" {...registerRegister("acceptTerms")} />
                <span>
                  I agree to the Bagodi Store Terms & Conditions and Privacy Policy.
                </span>
              </label>
              {registerErrors.acceptTerms && (
                <span style={{ fontSize: "var(--text-xs)", color: "var(--status-danger)" }}>
                  {registerErrors.acceptTerms.message}
                </span>
              )}

              <Button type="submit" size="lg" isLoading={isRegistering} fullWidth>
                Create Boutique Account
              </Button>
            </form>
          )}

          <div style={{ marginTop: "var(--space-6)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
            <ShieldCheck size={14} style={{ color: "var(--accent-primary)" }} />
            <span>End-to-End Encrypted Session • TechMasters Innovations Platform</span>
          </div>
        </div>
      </PerspectiveCard3D>
    </div>
  );
};

