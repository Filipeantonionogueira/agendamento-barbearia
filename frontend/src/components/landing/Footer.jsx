import React from "react";
import { Link } from "react-router-dom";
import { Scissors, Instagram, Facebook, Youtube, MessageCircle, MapPin, Clock } from "lucide-react";
import { assetUrl } from "../../lib/api.js";

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  // O lucide nao traz o icone do TikTok; usamos o de mensagem como neutro.
  tiktok: MessageCircle
};

const LINKS = [
  { href: "#agendamento", label: "Agendar" },
  { href: "#servicos", label: "Servicos" },
  { href: "#profissionais", label: "Equipe" },
  { href: "#galeria", label: "Galeria" },
  { href: "#faq", label: "Duvidas" }
];

export function Footer({ shopName, whatsappNumber, addressLine, openingHoursText, socials = {}, footer = {}, logoUrl }) {
  const year = new Date().getFullYear();
  const socialEntries = Object.entries(socials).filter(([, url]) => url);

  return (
    <footer className="border-t border-border bg-ink text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 text-white">
            {logoUrl ? (
              <img src={assetUrl(logoUrl)} alt={shopName} className="h-10 w-10 rounded-md object-cover" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-md bg-gold text-ink">
                <Scissors size={19} />
              </span>
            )}
            <strong className="font-display text-xl">{shopName}</strong>
          </div>
          {footer.note && <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">{footer.note}</p>}

          {socialEntries.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socialEntries.map(([key, url]) => {
                const Icon = SOCIAL_ICONS[key] || Instagram;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={key}
                    className="grid h-10 w-10 place-items-center rounded-md border border-white/12 text-white/70 transition-colors hover:border-gold hover:text-gold"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <nav className="text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Navegacao</p>
          <ul className="mt-4 space-y-2.5">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-gold">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/conta" className="transition-colors hover:text-gold">
                Minha conta
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Contato</p>
          <ul className="mt-4 space-y-3">
            {addressLine && (
              <li className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                <span>{addressLine}</span>
              </li>
            )}
            {openingHoursText && (
              <li className="flex gap-2.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-gold" />
                <span>{openingHoursText}</span>
              </li>
            )}
            {whatsappNumber && (
              <li className="flex gap-2.5">
                <MessageCircle size={16} className="mt-0.5 shrink-0 text-gold" />
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="hover:text-gold">
                  Falar no WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/35 sm:flex-row">
          <p>
            © {year} {shopName}. {footer.legal || "Todos os direitos reservados."}
          </p>
          <p>Agendamento online</p>
        </div>
      </div>
    </footer>
  );
}
