import React from "react";
import { Scissors } from "lucide-react";

export function Footer({ shopName, whatsappNumber, addressLine }) {
  return (
    <footer className="border-t border-border bg-ink py-8 text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center">
        <div className="flex items-center gap-2 text-white">
          <Scissors size={18} className="text-gold" />
          <strong>{shopName}</strong>
        </div>
        {addressLine && <p className="text-sm">{addressLine}</p>}
        {whatsappNumber && <p className="text-sm">WhatsApp: {whatsappNumber}</p>}
        <p className="text-xs text-white/40">Agendamento online</p>
      </div>
    </footer>
  );
}
