import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Superficie padrao. `interactive` liga o hover elevado usado nos cartoes
 * clicaveis (servicos, profissionais, posts).
 */
export function Card({ className = "", padded = true, interactive = false, children, ...props }) {
  const reduce = useReducedMotion();
  const classes = `rounded-lg border border-border bg-surface transition-colors ${padded ? "p-5 md:p-6" : ""} ${className}`;

  if (!interactive || reduce) {
    return (
      <div className={classes} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`${classes} cursor-pointer`}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
