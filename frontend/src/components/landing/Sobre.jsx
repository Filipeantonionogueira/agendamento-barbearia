import React from "react";

export function Sobre({ aboutText }) {
  if (!aboutText) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 text-center">
      <p className="text-sm uppercase tracking-[.22em] text-gold">Sobre</p>
      <p className="mt-4 text-lg leading-relaxed text-text-secondary">{aboutText}</p>
    </section>
  );
}
