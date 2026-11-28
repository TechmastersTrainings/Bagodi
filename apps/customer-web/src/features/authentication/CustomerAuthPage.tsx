import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  SendOtpFormData,
  sendOtpSchema,
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
import bagodiLogoLight from "../../assets/bagodi-logo-light.svg";
import {
  Smartphone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Award,
  Scissors,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import styles from "./CustomerAuthPage.module.css";

export const CustomerAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login } = useAuth();

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

  // Form for Sending OTP (Validates both 10-digit mobile and email addresses)
  const {
    register: registerOtpSend,
    handleSubmit: handleOtpSendSubmit,
    watch: watchOtpSend,
    formState: { errors: otpSendErrors, isSubmitting: isSendingOtp },
  } = useForm<SendOtpFormData>({
    resolver: zodResolver(sendOtpSchema),
  });

  const inputValue = watchOtpSend("phoneOrEmail") || "";
  const isEmailInput = inputValue.includes("@");

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

  /* 1. Request OTP from Backend (Supports Mobile Number or Email) */
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
      setApiError(err instanceof Error ? err.message : "Failed to deliver verification code. Please check your number or email.");
    }
  };

  /* 2. Verify OTP with Backend (Authenticates or Auto-Registers Customer) */
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
      setApiError(err instanceof Error ? err.message : "Invalid or expired verification code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
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

            <div className={styles.editorialFooter}>
              <span className={styles.establishedTag}>ESTABLISHED 1968</span>
              <span className={styles.storeFootnote}>Bidar Flagship Mall • Fort Road Landmark</span>
            </div>
          </div>
        </div>

        {/* Right Column: Refined Ivory Auth Pavilion (Clean Single Input Flow) */}
        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            {/* Header */}
            <div className={styles.authHeader}>
              <img
                src={bagodiLogoLight}
                alt="Bagodi Shopping Mall — ಬಾಗೋಡಿ"
                style={{ height: 64, width: "auto", marginBottom: 10, display: "block" }}
              />
              <h1 className={styles.title}>Welcome Back</h1>
              <p className={styles.subtitle}>
                Enter your mobile number or email address. We'll send an instant verification code to access your account.
              </p>
            </div>

            {/* API Error Notification */}
            {apiError && (
              <div style={{ marginBottom: "14px" }}>
                <ApiErrorCard message={apiError} />
              </div>
            )}

            {/* Step 1: Single Input for Mobile Number or Email */}
            {otpStep === "INPUT" ? (
              <form onSubmit={handleOtpSendSubmit(onSendOtp)} className={styles.form}>
                <TextInput
                  label="Mobile Number or Email Address"
                  placeholder="Enter 10-digit mobile or email address"
                  leftIcon={isEmailInput ? <Mail size={18} /> : <Smartphone size={18} />}
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
                    Send Verification Code
                  </Button>
                </div>

                <div className={styles.otpHelperNotice}>
                  <CheckCircle2 size={14} color="#C5A15B" />
                  <span>Works for both existing and new accounts. Instant verification code sent to your mobile or email.</span>
                </div>
              </form>
            ) : (
              /* Step 2: 6-Digit OTP Verification */
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
                  <div className={styles.otpHelperNotice} style={{ background: "rgba(197, 161, 91, 0.12)", border: "1px solid rgba(197, 161, 91, 0.35)", padding: "10px 14px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
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
                    Verify & Access Account
                  </Button>
                </div>

                <div className={styles.resendContainer}>
                  <span className={styles.resendLabel}>Didn't receive the code?</span>
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
