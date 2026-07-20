import React from "react";

const VARIANTS = {
  neutral: "bg-surface-subtle text-text-secondary",
  success: "bg-feedback-success-bg text-feedback-success",
  warning: "bg-feedback-warning-bg text-feedback-warning",
  danger: "bg-feedback-danger-bg text-feedback-danger",
  info: "bg-feedback-info-bg text-feedback-info",
  accent: "bg-gold-100 text-gold-600"
};

export function Badge({ variant = "neutral", className = "", children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}
