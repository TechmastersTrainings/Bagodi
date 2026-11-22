import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
  ApiErrorCard,
} from "@bagodi/shared-components";
import { defaultApiClient } from "@bagodi/api-client";
import { useAuth } from "@bagodi/authentication";
import {
  AuthSessionResponse,
  SendOtpResponse,
} from "@bagodi/shared-types";
import { LuxurySilkCanvas } from "./LuxurySilkCanvas";
import {
  Smartphone,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Award,
  Scissors,
  Sparkles,
  UserPlus,
  LogIn,
  CheckCircle2,
} from "lucide-react";

type AuthMode = "LOGIN" | "REGISTER";
type LoginMethod = "OTP" | "PASSWORD";

export const CustomerAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login } = useAuth();

  const [activeMode, setActiveMode] = useState<AuthMode>("LOGIN");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("OTP");
  const [apiError, setApiError] = useState<string | null>(null);

  // OTP Flow State
  const [otpStep, setOtpStep] = useState<"INPUT" | "VERIFY">("INPUT");
  const [otpReference, setOtpReference] = useState<SendOtpResponse | null>(null);
  const [targetPhoneOrEmail, setTargetPhoneOrEmail] = useState<string>("");
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  // Determine redirect target (defaults to /checkout or prior route)
  const stateFrom = (location.state as any)?.from;
  const from =
    typeof stateFrom === "string"
      ? stateFrom
      : stateFrom?.pathname || "/checkout";

  // If already logged in, immediately redirect to checkout or target route
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  // Form for Sending OTP
  const {
    register: registerOtpSend,
    handleSubmit: handleOtpSendSubmit,
    watch: watchOtpSend,
    formState: { errors: otpSendErrors, isSubmitting: isSendingOtp },
  } = useForm<SendOtpFormData>({
    resolver: zodResolver(sendOtpSchema),
  });

  // Form for Password Login
  const {
    register: registerPasswordLogin,
    handleSubmit: handlePasswordLoginSubmit,
    watch: watchPasswordLogin,
    formState: { errors: passwordErrors, isSubmitting: isLoggingInPassword },
  } = useForm<CustomerPasswordLoginFormData>({
    resolver: zodResolver(customerPasswordLoginSchema),
  });

  // Form for Registration
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    setValue: setRegisterValue,
    formState: { errors: registerErrors, isSubmitting: isRegistering },
  } = useForm<CustomerRegisterFormData>({
    resolver: zodResolver(customerRegisterSchema),
  });

  const switchToRegister = () => {
    setActiveMode("REGISTER");
    setApiError(null);
    const otpInput = watchOtpSend("phoneOrEmail");
    const pwdInput = watchPasswordLogin("emailOrPhone");
    const candidate = (otpInput || pwdInput || "").trim();
    if (candidate) {
      if (/^\d{10}$/.test(candidate)) {
        setRegisterValue("phone", candidate);
      } else if (candidate.includes("@")) {
        setRegisterValue("email", candidate);
      }
    }
  };

  const switchToLogin = () => {
    setActiveMode("LOGIN");
    setApiError(null);
  };

  // Resend OTP Countdown Timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (otpStep === "VERIFY" && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpStep, resendCountdown]);

  const extractSession = (response: any): { tokens: any; user: any } => {
    const tokens = response.tokens || {
      accessToken: response.access_token || response.accessToken,
      refreshToken: response.refresh_token || response.refreshToken,
      tokenType: "Bearer",
      expiresIn: response.expires_in || response.expiresIn || 900,
    };
    const user = response.user || {
      id: "customer_user",
      role: "CUSTOMER",
      fullName: "Bagodi Client",
      isActive: true,
      permissions: [],
    };
    return { tokens, user };
  };

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
      const devCode = response.devOtp || (response as any).dev_otp;
      if (devCode) {
        setEnteredOtp(devCode);
      }
      setResendCountdown(response.expiresInSeconds || (response as any).expires_in_seconds || 60);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to deliver verification code. Please check your number.");
    }
  };

  /* 2. Verify OTP with Backend */
  const onVerifyOtp = async () => {
    if (enteredOtp.length !== 6) return;
    setApiError(null);
    setIsVerifyingOtp(true);
    try {
      const response = await defaultApiClient.post<AuthSessionResponse>(
        "/auth/customer/verify-otp",
        {
          referenceId: otpReference?.referenceId || (otpReference as any)?.reference_id || undefined,
          phoneOrEmail: targetPhoneOrEmail,
          otp: enteredOtp,
        },
        { skipAuth: true }
      );
      const { tokens, user } = extractSession(response);
      login(tokens, user);
      queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
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
      const { tokens, user } = extractSession(response);
      login(tokens, user);
      queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
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
      const { tokens, user } = extractSession(response);
      login(tokens, user);
      queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Registration failed. An account with this phone or email may already exist.");
    }
  };

  return (
    <div className={styles.authPageWrapper}>
      <div className={styles.splitPavilion}>
        {/* Left Column: Interactive Luxury Animated Silk Pavilion */}
        <div className={styles.editorialPanel}>
          <div className={styles.editorialMediaWrapper}>
            <LuxurySilkCanvas className={styles.silkCanvas} />
            <div className={styles.editorialGradientOverlay} />
          </div>

          <div className={styles.editorialContent}>
            <div className={styles.hallmarkStrip}>
              <span className={styles.hallmarkBadge}>BAGODI SHOPPING MALL</span>
              <span className={styles.hallmarkDot}>•</span>
              <span className={styles.hallmarkLocation}>BIDAR, KARNATAKA</span>
            </div>

            <div className={styles.editorialHeroText}>
              <h2 className={styles.editorialTitle}>
                Curated Luxury & Royal Festivities
              </h2>
              <p className={styles.editorialQuote}>
                "Where centuries of Bidar craftsmanship meet modern festive elegance — master tailoring, pure silks, and royal ensembles."
              </p>
            </div>

            <div className={styles.luxuryPillars}>
              <div className={styles.pillarItem}>
                <div className={styles.pillarIconCircle}>
                  <Award size={18} />
                </div>
                <div>
                  <h4 className={styles.pillarTitle}>Silk Mark Certified</h4>
                  <p className={styles.pillarDesc}>100% natural Mysore, Kanjeevaram & Banarasi silks</p>
                </div>
              </div>

              <div className={styles.pillarItem}>
                <div className={styles.pillarIconCircle}>
                  <Scissors size={18} />
                </div>
                <div>
                  <h4 className={styles.pillarTitle}>Raymond Master Tailoring</h4>
                  <p className={styles.pillarDesc}>Precision measurements & hand-finished festive silhouettes</p>
                </div>
              </div>

              <div className={styles.pillarItem}>
                <div className={styles.pillarIconCircle}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className={styles.pillarTitle}>Bidar Flagship Concierge</h4>
                  <p className={styles.pillarDesc}>Personal styling, bespoke fittings & insured doorstep dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Refined Ivory Auth Pavilion */}
        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            {/* Header */}
            <div className={styles.authHeader}>
              <div className={styles.brandMicroTag}>
                <span className={styles.brandMicroDot} />
                <span>BAGODI SHOPPING MALL</span>
              </div>
              <h1 className={styles.title}>
                {activeMode === "LOGIN" ? "Welcome Back" : "Create Your Account"}
              </h1>
              <p className={styles.subtitle}>
                {activeMode === "LOGIN"
                  ? "Sign in using your mobile number or email to manage your orders, delivery addresses, and shopping bag."
                  : "Join Bagodi to enjoy swift checkout, live delivery tracking, and exclusive festive collections."}
              </p>
            </div>

            {/* Top Two-Button Primary Switcher */}
            <div className={styles.mainModeSwitcher}>
              <button
                type="button"
                className={`${styles.mainModeBtn} ${activeMode === "LOGIN" ? styles.mainModeActive : ""}`}
                onClick={switchToLogin}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`${styles.mainModeBtn} ${activeMode === "REGISTER" ? styles.mainModeActive : ""}`}
                onClick={switchToRegister}
              >
                <UserPlus size={15} />
                <span>Create Account</span>
              </button>
            </div>

            {/* Subtle Login Method Sub-Toggle (Only shown during Login) */}
            {activeMode === "LOGIN" && (
              <div className={styles.loginMethodToggle}>
                <button
                  type="button"
                  className={`${styles.methodBtn} ${loginMethod === "OTP" ? styles.methodActive : ""}`}
                  onClick={() => {
                    setLoginMethod("OTP");
                    setApiError(null);
                  }}
                >
                  <Smartphone size={13} />
                  <span>Mobile OTP</span>
                </button>
                <button
                  type="button"
                  className={`${styles.methodBtn} ${loginMethod === "PASSWORD" ? styles.methodActive : ""}`}
                  onClick={() => {
                    setLoginMethod("PASSWORD");
                    setApiError(null);
                  }}
                >
                  <Lock size={13} />
                  <span>Password</span>
                </button>
              </div>
            )}

            {/* API Error Notification */}
            {apiError && (
              <div style={{ marginBottom: "16px" }}>
                <ApiErrorCard message={apiError} />
              </div>
            )}

            {/* MODE 1: LOGIN */}
            {activeMode === "LOGIN" && (
              <div className={styles.tabContentArea}>
                {/* Method A: Mobile OTP */}
                {loginMethod === "OTP" && (
                  <>
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

                        <div className={styles.actionButtonGroup}>
                          <Button
                            type="submit"
                            size="lg"
                            isLoading={isSendingOtp}
                            fullWidth
                            rightIcon={<ArrowRight size={18} />}
                            className={styles.crimsonPrimaryBtn}
                          >
                            Send Secure Verification Code
                          </Button>

                          <div className={styles.orDivider}>
                            <span className={styles.orDividerLine} />
                            <span className={styles.orDividerText}>OR CREATE ACCOUNT</span>
                            <span className={styles.orDividerLine} />
                          </div>

                          <button
                            type="button"
                            className={styles.secondaryOutlineBtn}
                            onClick={switchToRegister}
                          >
                            <UserPlus size={16} />
                            <span>New to Bagodi? Create Account</span>
                          </button>
                        </div>

                        <div className={styles.otpHelperNotice}>
                          <CheckCircle2 size={13} color="#C5A15B" />
                          <span>We will transmit a 6-digit one-time code to authenticate your session.</span>
                        </div>
                      </form>
                    ) : (
                      <div className={styles.form}>
                        <div className={styles.otpInfoBox}>
                          <div className={styles.otpDestinationDetails}>
                            <span className={styles.otpSentLabel}>Verification code dispatched to</span>
                            <strong className={styles.otpDestinationVal}>
                              {otpReference?.maskedDestination || targetPhoneOrEmail}
                            </strong>
                          </div>
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

                        {(otpReference?.devOtp || (otpReference as any)?.dev_otp) && (
                          <div className={styles.otpHelperNotice} style={{ background: "rgba(197, 161, 91, 0.12)", border: "1px solid rgba(197, 161, 91, 0.35)", padding: "10px 14px", borderRadius: "10px", marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <CheckCircle2 size={16} color="#8F1D2C" />
                            <span style={{ color: "#3B1218", fontSize: "13px", fontWeight: 500 }}>
                              Demonstration Verification Code: <strong style={{ color: "#8F1D2C", fontSize: "16px", letterSpacing: "3px", fontWeight: 700 }}>{otpReference?.devOtp || (otpReference as any)?.dev_otp}</strong>
                            </span>
                          </div>
                        )}

                        <div className={styles.otpInputWrapper}>
                          <OtpInput
                            length={6}
                            value={enteredOtp}
                            onChange={(val) => setEnteredOtp(val)}
                          />
                        </div>

                        <div className={styles.actionButtonGroup}>
                          <Button
                            type="button"
                            size="lg"
                            isLoading={isVerifyingOtp}
                            disabled={enteredOtp.length !== 6}
                            onClick={onVerifyOtp}
                            fullWidth
                            className={styles.crimsonPrimaryBtn}
                          >
                            Verify & Sign In
                          </Button>

                          <div className={styles.orDivider}>
                            <span className={styles.orDividerLine} />
                            <span className={styles.orDividerText}>OR CREATE ACCOUNT</span>
                            <span className={styles.orDividerLine} />
                          </div>

                          <button
                            type="button"
                            className={styles.secondaryOutlineBtn}
                            onClick={switchToRegister}
                          >
                            <UserPlus size={16} />
                            <span>New to Bagodi? Create Account</span>
                          </button>
                        </div>

                        <div className={styles.resendContainer}>
                          <span className={styles.resendLabel}>Didn't receive the SMS code?</span>
                          {resendCountdown > 0 ? (
                            <span className={styles.resendTimer}>Resend in {resendCountdown}s</span>
                          ) : (
                            <button
                              type="button"
                              className={styles.resendActionBtn}
                              onClick={() => onSendOtp({ phoneOrEmail: targetPhoneOrEmail, channel: "SMS" })}
                            >
                              Resend Code Now
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Method B: Password Login */}
                {loginMethod === "PASSWORD" && (
                  <form onSubmit={handlePasswordLoginSubmit(onPasswordLogin)} className={styles.form}>
                    <TextInput
                      label="Registered Email or Mobile"
                      placeholder="name@example.com or 10-digit phone"
                      leftIcon={<Mail size={18} />}
                      isRequired
                      error={passwordErrors.emailOrPhone?.message}
                      {...registerPasswordLogin("emailOrPhone")}
                    />

                    <TextInput
                      label="Security Password"
                      type="password"
                      placeholder="••••••••"
                      leftIcon={<Lock size={18} />}
                      isRequired
                      error={passwordErrors.password?.message}
                      {...registerPasswordLogin("password")}
                    />

                    <div className={styles.actionButtonGroup}>
                      <Button
                        type="submit"
                        size="lg"
                        isLoading={isLoggingInPassword}
                        fullWidth
                        rightIcon={<ArrowRight size={18} />}
                        className={styles.crimsonPrimaryBtn}
                      >
                        Sign In With Password
                      </Button>

                      <div className={styles.orDivider}>
                        <span className={styles.orDividerLine} />
                        <span className={styles.orDividerText}>OR CREATE ACCOUNT</span>
                        <span className={styles.orDividerLine} />
                      </div>

                      <button
                        type="button"
                        className={styles.secondaryOutlineBtn}
                        onClick={switchToRegister}
                      >
                        <UserPlus size={16} />
                        <span>New to Bagodi? Create Account</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* MODE 2: REGISTRATION */}
            {activeMode === "REGISTER" && (
              <form onSubmit={handleRegisterSubmit(onRegister)} className={styles.form}>
                <TextInput
                  label="Full Name"
                  placeholder="e.g. Ramesh Patil"
                  leftIcon={<User size={18} />}
                  isRequired
                  error={registerErrors.fullName?.message}
                  {...registerRegister("fullName")}
                />

                <div className={styles.twoColumnGrid}>
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

                <div className={styles.twoColumnGrid}>
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
                    label="Confirm Password"
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
                    I agree to the Bagodi Store Terms & Conditions and Authentic Garment Care Charter.
                  </span>
                </label>
                {registerErrors.acceptTerms && (
                  <span className={styles.termsErrorText}>
                    {registerErrors.acceptTerms.message}
                  </span>
                )}

                <div className={styles.actionButtonGroup}>
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isRegistering}
                    fullWidth
                    rightIcon={<ArrowRight size={18} />}
                    className={styles.crimsonPrimaryBtn}
                  >
                    Create Account & Continue
                  </Button>

                  <div className={styles.orDivider}>
                    <span className={styles.orDividerLine} />
                    <span className={styles.orDividerText}>ALREADY HAVE AN ACCOUNT?</span>
                    <span className={styles.orDividerLine} />
                  </div>

                  <button
                    type="button"
                    className={styles.secondaryOutlineBtn}
                    onClick={switchToLogin}
                  >
                    <LogIn size={16} />
                    <span>Sign In to Existing Account</span>
                  </button>
                </div>
              </form>
            )}

            {/* Security Guarantee Strip */}
            <div className={styles.securityStrip}>
              <ShieldCheck size={14} className={styles.shieldIcon} />
              <span>100% Authentic Handpicked Luxury • 256-Bit SSL Encryption • Bidar Flagship Dispatch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
