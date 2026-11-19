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
  ApiErrorCard,
} from "@bagodi/shared-components";
import { defaultApiClient } from "@bagodi/api-client";
import { useAuth } from "@bagodi/authentication";
import {
  AuthSessionResponse,
  SendOtpResponse,
} from "@bagodi/shared-types";
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
  CheckCircle2,
} from "lucide-react";

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
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Registration failed. An account with this phone or email may already exist.");
    }
  };

  return (
    <div className={styles.authPageWrapper}>
      <div className={styles.splitPavilion}>
        {/* Left Column: Royal Heritage & Haute Couture Editorial */}
        <div className={styles.editorialPanel}>
          <div className={styles.editorialMediaWrapper}>
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85"
              alt="Bagodi Royal Handcrafted Silk Saree"
              className={styles.editorialImage}
            />
            <div className={styles.editorialGradientOverlay} />
          </div>

          <div className={styles.editorialContent}>
            <div className={styles.hallmarkStrip}>
              <span className={styles.hallmarkBadge}>BAGODI ROYAL ATELIER</span>
              <span className={styles.hallmarkDot}>•</span>
              <span className={styles.hallmarkLocation}>BIDAR, KARNATAKA</span>
            </div>

            <div className={styles.editorialHeroText}>
              <h2 className={styles.editorialTitle}>
                Heirloom Silks, Master Suiting & Royal Bridal Splendour
              </h2>
              <p className={styles.editorialQuote}>
                "Every weave tells a tale of historic Bidar craftsmanship — hallmarked with Silk Mark India certification, enriched with pure gold zari, and tailored to bespoke perfection."
              </p>
            </div>

            <div className={styles.luxuryPillars}>
              <div className={styles.pillarItem}>
                <div className={styles.pillarIconCircle}>
                  <Award size={16} />
                </div>
                <div>
                  <h4 className={styles.pillarTitle}>Silk Mark Certified</h4>
                  <p className={styles.pillarDesc}>100% natural Mysore, Kanjeevaram & Banarasi silks</p>
                </div>
              </div>

              <div className={styles.pillarItem}>
                <div className={styles.pillarIconCircle}>
                  <Scissors size={16} />
                </div>
                <div>
                  <h4 className={styles.pillarTitle}>Raymond Master Tailoring</h4>
                  <p className={styles.pillarDesc}>Precision measurements & hand-finished festive silhouettes</p>
                </div>
              </div>

              <div className={styles.pillarItem}>
                <div className={styles.pillarIconCircle}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className={styles.pillarTitle}>Atelier Concierge</h4>
                  <p className={styles.pillarDesc}>Private wardrobe curation, bespoke fittings & insured dispatch</p>
                </div>
              </div>
            </div>

            <div className={styles.editorialFooter}>
              <span className={styles.establishedTag}>ESTABLISHED 1968</span>
              <span className={styles.storeFootnote}>Bidar Flagship Mall • Fort Road Landmark</span>
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
                <span>BAGODI CLIENT PRIVILEGE</span>
              </div>
              <h1 className={styles.title}>Client Access</h1>
              <p className={styles.subtitle}>
                Sign in with instant mobile OTP or password to access your bespoke wardrobe, custom sizing, and boutique orders.
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
                <Smartphone size={13} />
                <span>Instant OTP</span>
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === "PASSWORD" ? styles.tabActive : ""}`}
                onClick={() => {
                  setActiveTab("PASSWORD");
                  setApiError(null);
                }}
              >
                <Lock size={13} />
                <span>Password</span>
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === "REGISTER" ? styles.tabActive : ""}`}
                onClick={() => {
                  setActiveTab("REGISTER");
                  setApiError(null);
                }}
              >
                <UserPlus size={13} />
                <span>New Client</span>
              </button>
            </div>

            {/* API Error Notification */}
            {apiError && (
              <div style={{ marginBottom: "16px" }}>
                <ApiErrorCard message={apiError} />
              </div>
            )}

            {/* TAB 1: FAST MOBILE OTP */}
            {activeTab === "OTP" && (
              <div className={styles.tabContentArea}>
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

                    <div className={styles.otpInputWrapper}>
                      <OtpInput
                        length={6}
                        value={enteredOtp}
                        onChange={(val) => setEnteredOtp(val)}
                      />
                    </div>

                    <div className={styles.otpHelperNotice} style={{ marginBottom: "16px" }}>
                      <CheckCircle2 size={13} color="#C5A15B" />
                      <span>Instant verification: Enter SMS code or use demo OTP <strong>123456</strong></span>
                    </div>

                    <Button
                      type="button"
                      size="lg"
                      isLoading={isVerifyingOtp}
                      disabled={enteredOtp.length !== 6}
                      onClick={onVerifyOtp}
                      fullWidth
                      className={styles.crimsonPrimaryBtn}
                    >
                      Verify Code & Enter Atelier
                    </Button>

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
              </div>
            )}

            {/* TAB 2: EMAIL / PHONE + PASSWORD */}
            {activeTab === "PASSWORD" && (
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
                    I agree to the Bagodi Store Terms & Conditions, Atelier Privacy Policy, and Authentic Garment Care Charter.
                  </span>
                </label>
                {registerErrors.acceptTerms && (
                  <span className={styles.termsErrorText}>
                    {registerErrors.acceptTerms.message}
                  </span>
                )}

                <Button
                  type="submit"
                  size="lg"
                  isLoading={isRegistering}
                  fullWidth
                  className={styles.crimsonPrimaryBtn}
                >
                  Create Boutique Account
                </Button>
              </form>
            )}

            {/* Security Guarantee Strip */}
            <div className={styles.securityStrip}>
              <ShieldCheck size={14} className={styles.shieldIcon} />
              <span>End-to-End 256-Bit TLS Encryption • Silk Mark India Authenticity Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
