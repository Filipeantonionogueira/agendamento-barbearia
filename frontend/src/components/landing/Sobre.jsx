import React from "react";
import { Reveal } from "../ui/Reveal.jsx";
import { SectionHeader } from "./SectionHeader.jsx";
import { assetUrl } from "../../lib/api.js";

export function Sobre({ aboutText, section, imageUrl }) {
  if (!aboutText) return null;
  const image = assetUrl(imageUrl);

  return (
    <section id="sobre" className="mx-auto max-w-6xl px-4 py-20 md:py-24">
      <div className={`grid items-center gap-10 ${image ? "lg:grid-cols-2" : "mx-auto max-w-3xl text-center"}`}>
        <div>
          <SectionHeader
            eyebrow="Sobre"
            title={section?.title || "Sobre nos"}
            subtitle={section?.subtitle}
            align={image ? "left" : "center"}
          />
          <Reveal delay={0.08}>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-text-secondary">{aboutText}</p>
          </Reveal>
        </div>

        {image && (
          <Reveal delay={0.12} className="relative">
            <div className="overflow-hidden rounded-xl border border-border">
              <img src={image} alt="" aria-hidden="true" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="pointer-events-none absolute -bottom-4 -left-4 -z-10 h-32 w-32 rounded-xl bg-gold/20 blur-2xl" />
          </Reveal>
        )}
      </div>
    </section>
  );
}
