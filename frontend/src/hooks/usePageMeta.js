import React from "react";

const SITE_NAME = "Barbearia Prime";

function setMeta(attr, key, value) {
  if (!value) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", value);
}

// Titulo/description por rota em SPA. Areas privadas usam noindex.
export function usePageMeta({ title, description, noindex = false }) {
  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    if (description) setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    return () => {
      document.title = previousTitle;
    };
  }, [title, description, noindex]);
}
