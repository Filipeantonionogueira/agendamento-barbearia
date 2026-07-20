import React from "react";
import { Users } from "lucide-react";

export function ProfissionaisShowcase({ professionals }) {
  if (!professionals.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[.22em] text-gold">Equipe</p>
        <h2 className="mt-2 text-3xl font-semibold">Quem vai te atender</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {professionals.map((professional) => (
          <div key={professional.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5">
            {professional.photoUrl ? (
              <img src={professional.photoUrl} alt={professional.name} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-full bg-ink text-gold">
                <Users size={22} />
              </div>
            )}
            <div>
              <strong>{professional.name}</strong>
              {professional.bio && <p className="mt-1 text-sm text-text-secondary">{professional.bio}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
