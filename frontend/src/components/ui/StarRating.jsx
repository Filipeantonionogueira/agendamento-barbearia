import React from "react";
import { Star } from "lucide-react";

// Estrelas reutilizaveis: modo leitura (value) ou interativo (onChange).
export function StarRating({ value = 0, onChange, size = 20, readOnly = false }) {
  const [hover, setHover] = React.useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(star)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
          aria-label={`${star} estrela(s)`}
        >
          <Star size={size} className={star <= active ? "fill-gold text-gold" : "text-border-strong"} />
        </button>
      ))}
    </div>
  );
}
