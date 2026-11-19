import React, { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import styles from "./OtpInput.module.css";

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  error?: string;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = value.split("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const char = e.target.value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    const newOtp = newDigits.join("").slice(0, length);
    onChange(newOtp);

    // Auto-advance if digit entered
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim().replace(/\D/g, "");
    if (!pastedData) return;

    const newOtp = pastedData.slice(0, length);
    onChange(newOtp);

    const focusIndex = Math.min(newOtp.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div>
      <div className={`${styles.otpContainer} ${error ? styles.hasError : ""}`}>
        {[...Array(length)].map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={digits[i] || ""}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            className={`${styles.otpBox} ${digits[i] ? styles.otpBoxFilled : ""}`}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

