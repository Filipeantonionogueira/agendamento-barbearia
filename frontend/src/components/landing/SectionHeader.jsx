import React from "react";
import { Reveal } from "../ui/Reveal.jsx";

/** Cabecalho padrao das secoes — titulo/subtitulo vem do CMS. */
export function SectionHeader({ eyebrow, title, subtitle, align = "left", className = "" }) {
  const centered = align === "center";
  return (
    <Reveal className={`${centered ? "mx-auto max-w-2xl text-center" : ""} ${className}`}>
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      {title && <h2 className="section-title">{title}</h2>}
      {subtitle && <p className={`section-subtitle ${centered ? "mx-auto" : ""}`}>{subtitle}</p>}
    </Reveal>
  );
}
