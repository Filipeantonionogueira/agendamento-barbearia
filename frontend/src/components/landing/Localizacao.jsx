import React from "react";
import { MapPin, Clock, MessageCircle, Mail, Phone, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader.jsx";
import { Reveal, RevealGroup, RevealItem } from "../ui/Reveal.jsx";

function InfoCard({ icon: Icon, label, value, href }) {
  if (!value) return null;
  const content = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-gold/12 text-gold-600 dark:text-gold-400">
        <Icon size={19} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">{label}</span>
        <span className="mt-1 block text-sm leading-relaxed text-text-primary">{value}</span>
      </span>
      {href && <ArrowUpRight size={16} className="ml-auto shrink-0 self-center text-text-muted" />}
    </>
  );

  const classes =
    "flex items-start gap-4 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-gold/50";

  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={classes}>
      {content}
    </a>
  ) : (
    <div className={classes}>{content}</div>
  );
}

export function Localizacao({ addressLine, openingHoursText, whatsappNumber, contact, section }) {
  const hasAny = addressLine || openingHoursText || whatsappNumber || contact?.email || contact?.phone;
  if (!hasAny) return null;

  const mapsUrl = addressLine
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`
    : null;

  return (
    <section id="localizacao" className="mx-auto max-w-6xl px-4 py-20 md:py-24">
      <SectionHeader
        eyebrow="Localizacao"
        title={section?.title || "Onde estamos"}
        subtitle={section?.subtitle}
        align="center"
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <RevealGroup className="grid content-start gap-4">
          <RevealItem>
            <InfoCard icon={MapPin} label="Endereco" value={addressLine} href={mapsUrl} />
          </RevealItem>
          <RevealItem>
            <InfoCard icon={Clock} label="Horario de funcionamento" value={openingHoursText} />
          </RevealItem>
          <RevealItem>
            <InfoCard
              icon={MessageCircle}
              label="WhatsApp"
              value={whatsappNumber ? "Falar com a barbearia" : null}
              href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : null}
            />
          </RevealItem>
          <RevealItem>
            <InfoCard
              icon={Phone}
              label="Telefone"
              value={contact?.phone}
              href={contact?.phone ? `tel:${contact.phone.replace(/\D/g, "")}` : null}
            />
          </RevealItem>
          <RevealItem>
            <InfoCard
              icon={Mail}
              label="E-mail"
              value={contact?.email}
              href={contact?.email ? `mailto:${contact.email}` : null}
            />
          </RevealItem>
        </RevealGroup>

        {(contact?.mapEmbedUrl || mapsUrl) && (
          <Reveal delay={0.1} className="min-h-[320px]">
            {contact?.mapEmbedUrl ? (
              <iframe
                title="Mapa da barbearia"
                src={contact.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[320px] w-full rounded-xl border border-border"
              />
            ) : (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface p-8 text-center transition-colors hover:border-gold"
              >
                <MapPin size={32} className="text-gold" />
                <span className="text-base font-semibold text-text-primary">Abrir no Google Maps</span>
                <span className="text-sm text-text-secondary">{addressLine}</span>
              </a>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
