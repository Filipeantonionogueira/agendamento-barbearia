import React from "react";
import { Navbar } from "./Navbar.jsx";

/**
 * Casca das telas publicas simples (login, cadastro, recuperacao).
 * A landing usa `Navbar` diretamente porque tem hero de altura total.
 */
export function Shell({ children, shopName = "Barbearia Prime", logoUrl }) {
  return (
    <main className="min-h-screen bg-paper text-text-primary">
      <Navbar shopName={shopName} logoUrl={logoUrl} showAnchors={false} />
      <div className="pt-20">{children}</div>
    </main>
  );
}
