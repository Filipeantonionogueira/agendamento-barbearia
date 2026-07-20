import React from "react";

export function Panel({ title, icon, children }) {
  return (
    <section>
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
        {React.cloneElement(icon, { size: 24 })} {title}
      </h1>
      {children}
    </section>
  );
}
