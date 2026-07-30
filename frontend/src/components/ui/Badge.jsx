import React from "react";

const VARIANTS = {
  neutral: "bg-surface-subtle text-text-secondary ring-border",
  success: "bg-feedback-success-bg text-feedback-success ring-feedback-success/20",
  warning: "bg-feedback-warning-bg text-feedback-warning ring-feedback-warning/20",
  danger: "bg-feedback-danger-bg text-feedback-danger ring-feedback-danger/20",
  info: "bg-feedback-info-bg text-feedback-info ring-feedback-info/20",
  accent: "bg-gold/15 text-gold-600 ring-gold/30 dark:text-gold-400"
};

export function Badge({ variant = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
