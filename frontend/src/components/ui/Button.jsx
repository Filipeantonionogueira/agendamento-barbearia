import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const VARIANTS = {
  primary: "bg-brand text-brand-fg hover:opacity-90 shadow-sm",
  accent: "bg-gold text-ink hover:brightness-105 shadow-sm",
  ghost: "border border-border-strong bg-transparent text-text-primary hover:bg-surface-subtle",
  subtle: "bg-surface-subtle text-text-primary hover:bg-border",
  danger: "bg-feedback-danger text-white hover:brightness-95",
  glass: "glass text-white hover:bg-white/20"
};

const SIZES = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-4 py-3 text-sm",
  lg: "px-6 py-3.5 text-base"
};

export const Button = React.forwardRef(function Button(
  { variant = "primary", size = "md", className = "", children, animate = true, ...props },
  ref
) {
  const reduce = useReducedMotion();
  const classes = `inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (!animate || reduce) {
    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref}
      className={classes}
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      {...props}
    >
      {children}
    </motion.button>
  );
});
