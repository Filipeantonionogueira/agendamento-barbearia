/**
 * Design tokens.
 *
 * Cores semanticas (superficie, texto, borda, marca) sao variaveis CSS definidas
 * em styles.css para `:root` e `.dark` — a mesma classe funciona nos dois temas.
 * Cores fixas de marca (ink, gold) nao trocam: garantem contraste sobre o dourado
 * e nos blocos escuros de destaque.
 */
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Marca fixa (nao inverte com o tema).
        ink: {
          DEFAULT: "#0F0F11",
          900: "#08080A",
          700: "#26262B",
          500: "#4A4A52",
          300: "#8A8A93"
        },
        gold: {
          DEFAULT: "#C9A24C",
          600: "#8C6D22",
          400: "#DCBB72",
          200: "#EFDCAE",
          100: "#FBF3E1"
        },
        // Semanticas (invertem no modo escuro).
        paper: token("--paper"),
        surface: {
          DEFAULT: token("--surface"),
          subtle: token("--surface-subtle"),
          raised: token("--surface-raised")
        },
        border: {
          DEFAULT: token("--border"),
          strong: token("--border-strong")
        },
        text: {
          primary: token("--text-primary"),
          secondary: token("--text-secondary"),
          muted: token("--text-muted"),
          inverse: token("--text-inverse")
        },
        brand: {
          DEFAULT: token("--brand"),
          fg: token("--brand-fg"),
          soft: token("--brand-soft")
        },
        feedback: {
          success: token("--success"),
          "success-bg": token("--success-bg"),
          warning: token("--warning"),
          "warning-bg": token("--warning-bg"),
          danger: token("--danger"),
          "danger-bg": token("--danger-bg"),
          info: token("--info"),
          "info-bg": token("--info-bg")
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ['"Playfair Display"', "Georgia", "serif"]
      },
      fontSize: {
        "display-sm": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-lg": ["4rem", { lineHeight: "1", letterSpacing: "-0.03em" }],
        "display-xl": ["5rem", { lineHeight: "0.98", letterSpacing: "-0.035em" }]
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "14px",
        lg: "18px",
        xl: "24px",
        "2xl": "32px"
      },
      boxShadow: {
        xs: "0 1px 2px rgb(var(--shadow) / 0.06)",
        sm: "0 4px 16px rgb(var(--shadow) / 0.08)",
        md: "0 12px 32px rgb(var(--shadow) / 0.10)",
        lg: "0 24px 64px rgb(var(--shadow) / 0.16)",
        soft: "0 18px 56px rgb(var(--shadow) / 0.12)"
      },
      backgroundImage: {
        "gold-sheen": "linear-gradient(120deg, #C9A24C 0%, #EFDCAE 45%, #C9A24C 100%)"
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } }
      },
      animation: {
        fadeIn: "fadeIn .25s ease-out",
        slideUp: "slideUp .3s cubic-bezier(.2,.8,.2,1)",
        shimmer: "shimmer 1.6s linear infinite"
      }
    }
  },
  plugins: []
};
