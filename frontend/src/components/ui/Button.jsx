import React from "react";

const VARIANTS = {
  primary: "bg-ink text-white hover:bg-ink-700",
  accent: "bg-gold text-ink hover:brightness-95",
  ghost: "bg-transparent text-ink border border-border-strong hover:bg-surface-subtle",
  danger: "bg-feedback-danger text-white hover:brightness-95"
};

const SIZES = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm",
  lg: "px-5 py-3.5 text-base"
};

export const Button = React.forwardRef(function Button(
  { variant = "primary", size = "md", className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
