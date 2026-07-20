import React from "react";
import { MapPin, Clock, MessageCircle } from "lucide-react";

export function Localizacao({ addressLine, openingHoursText, whatsappNumber }) {
  if (!addressLine && !openingHoursText) return null;
  const mapsUrl = addressLine ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}` : null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[.22em] text-gold">Localizacao</p>
        <h2 className="mt-2 text-3xl font-semibold">Onde estamos</h2>
      </div>
      <div className="grid gap-4 rounded-lg border border-border bg-surface p-6 sm:grid-cols-3">
        {addressLine && (
          <div className="flex items-start gap-3">
            <MapPin size={20} className="mt-0.5 shrink-0 text-gold" />
            <div>
              <strong className="block text-sm">Endereco</strong>
              <p className="text-sm text-text-secondary">{addressLine}</p>
            </div>
          </div>
        )}
        {openingHoursText && (
          <div className="flex items-start gap-3">
            <Clock size={20} className="mt-0.5 shrink-0 text-gold" />
            <div>
              <strong className="block text-sm">Horario</strong>
              <p className="text-sm text-text-secondary">{openingHoursText}</p>
            </div>
          </div>
        )}
        {whatsappNumber && (
          <div className="flex items-start gap-3">
            <MessageCircle size={20} className="mt-0.5 shrink-0 text-gold" />
            <div>
              <strong className="block text-sm">WhatsApp</strong>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="text-sm text-gold hover:underline">
                Falar agora
              </a>
            </div>
          </div>
        )}
      </div>
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white"
        >
          Abrir no Google Maps
        </a>
      )}
    </section>
  );
}
