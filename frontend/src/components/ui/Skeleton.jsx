import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-shimmer rounded bg-[linear-gradient(90deg,#EDEDEC_25%,#F7F7F6_37%,#EDEDEC_63%)] bg-[length:400%_100%] ${className}`}
    />
  );
}
