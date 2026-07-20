import React from "react";

export const Input = React.forwardRef(function Input({ label, error, className = "", ...props }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>}
      <input ref={ref} className={`field ${error ? "border-feedback-danger" : ""} ${className}`} {...props} />
      {error && <span className="mt-1 block text-xs text-feedback-danger">{error}</span>}
    </label>
  );
});
