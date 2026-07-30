import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Scroll reveal padrao do site.
 * Respeita `prefers-reduced-motion`: sem movimento, o conteudo aparece direto.
 */
export function Reveal({ children, delay = 0, y = 18, className = "", as = "div", once = true }) {
  const reduce = useReducedMotion();
  const Component = motion[as] || motion.div;

  if (reduce) return <Component className={className}>{children}</Component>;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </Component>
  );
}

/** Container que escalona a entrada dos filhos (`RevealItem`). */
export function RevealGroup({ children, className = "", stagger = 0.08, once = true }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export const revealItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } }
};

export function RevealItem({ children, className = "", ...props }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={revealItemVariants} {...props}>
      {children}
    </motion.div>
  );
}
