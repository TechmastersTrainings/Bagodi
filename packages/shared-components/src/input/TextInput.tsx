import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import styles from "./TextInput.module.css";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isRequired?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, isRequired, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const containerClasses = [
      styles.inputContainer,
      leftIcon ? styles.hasLeftIcon : "",
      rightIcon ? styles.hasRightIcon : "",
      error ? styles.hasError : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`${styles.fieldWrapper} ${className}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {isRequired && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={containerClasses}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input ref={ref} id={inputId} className={styles.input} {...props} />
          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </div>
        {error ? (
          <span className={styles.errorText}>{error}</span>
        ) : helperText ? (
          <span className={styles.helperText}>{helperText}</span>
        ) : null}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

