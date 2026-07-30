import React from "react";
import { Instagram as InstagramIcon, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader.jsx";
import { RevealGroup, RevealItem, Reveal } from "../ui/Reveal.jsx";
import { assetUrl } from "../../lib/api.js";

/**
 * Vitrine do Instagram alimentada pelo painel (imagem + link do post).
 * Sem integracao com a API do Instagram: o admin controla o que aparece.
 */
export function Instagram({ instagram, section }) {
  const reduce = useReducedMotion();
  const posts = (instagram?.posts || []).filter((post) => post.imageUrl);
  const handle = instagram?.handle?.replace(/^@/, "");
  const profileUrl = instagram?.profileUrl || (handle ? `https://instagram.com/${handle}` : "");

  if (!posts.length && !handle) return null;

  return (
    <section id="instagram" className="border-y border-border bg-surface py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader eyebrow="Instagram" title={section?.title || "No Instagram"} subtitle={section?.subtitle} />
          {profileUrl && (
            <Reveal delay={0.1}>
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border-strong px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-gold hover:text-gold"
              >
                <InstagramIcon size={16} />
                {handle ? `@${handle}` : "Seguir"}
              </a>
            </Reveal>
          )}
        </div>

        {posts.length > 0 && (
          <RevealGroup className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" stagger={0.06}>
            {posts.map((post, index) => {
              const Wrapper = post.link ? motion.a : motion.div;
              return (
                <RevealItem key={`${post.imageUrl}-${index}`}>
                  <Wrapper
                    {...(post.link ? { href: post.link, target: "_blank", rel: "noreferrer" } : {})}
                    whileHover={reduce ? undefined : { y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="group relative block aspect-square overflow-hidden rounded-lg bg-surface-subtle"
                  >
                    <img
                      src={assetUrl(post.imageUrl)}
                      alt={post.caption || "Publicacao do Instagram"}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/85 via-ink/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {post.caption && <span className="line-clamp-2 text-xs text-white">{post.caption}</span>}
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gold-200">
                        <InstagramIcon size={13} /> Ver post <ArrowUpRight size={12} />
                      </span>
                    </span>
                  </Wrapper>
                </RevealItem>
              );
            })}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}
