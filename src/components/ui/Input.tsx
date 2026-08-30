"use client";

import React, { useState } from "react";
import styles from "./input.module.css";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  variant?: "default" | "editorial";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      isPassword = false,
      variant = "default",
      type = "text",
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const computedType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={clsx(styles.container, error && styles.hasError, className)}>
        {label && (
          <div className={styles.labelWrapper}>
            <label htmlFor={inputId} className={styles.label}>
              {label}
            </label>
          </div>
        )}

        <div className={styles.inputWrapper}>
          {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}

          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={clsx(
              styles.input,
              variant === "editorial" && styles.editorial,
              leftIcon && styles.withLeftIcon,
              isPassword && styles.withRightIcon
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              className={styles.rightIconButton}
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : helperText ? (
          <p className={styles.helperText}>{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
