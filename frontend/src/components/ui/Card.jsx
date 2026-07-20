import React from "react";

export function Card({ className = "", padded = true, children, ...props }) {
  return (
    <div className={`rounded-lg border border-border bg-surface ${padded ? "p-4 md:p-6" : ""} ${className}`} {...props}>
      {children}
    </div>
  );
}
