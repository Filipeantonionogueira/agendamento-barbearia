import React from "react";

export const Select = React.forwardRef(function Select({ label, className = "", children, ...props }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>}
      <select ref={ref} className={`field ${className}`} {...props}>
        {children}
      </select>
    </label>
  );
});
