import React from "react";
import { Link } from "react-router-dom";
import { Scissors } from "lucide-react";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 py-10 text-ink">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gold text-ink">
            <Scissors size={20} />
          </span>
          <strong className="text-lg">Barbearia Prime</strong>
        </Link>
        <div className="rounded-lg bg-surface p-6 shadow-soft md:p-8">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-4 text-center text-sm text-text-secondary">{footer}</div>}
      </div>
    </main>
  );
}
