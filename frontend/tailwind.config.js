export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#151515",
          900: "#0E0E0E",
          700: "#2A2A2A",
          500: "#4A4A4A",
          300: "#8A8A8A"
        },
        gold: {
          DEFAULT: "#C79A3B",
          600: "#8A6418",
          200: "#E8D09A",
          100: "#FFF8E8"
        },
        paper: "#F8F6F1",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#FAFAF8"
        },
        border: {
          DEFAULT: "#E4E4E7",
          strong: "#D4D4D8"
        },
        text: {
          primary: "#151515",
          secondary: "#52525B",
          muted: "#A1A1AA",
          inverse: "#FFFFFF"
        },
        feedback: {
          success: "#2E7D46",
          "success-bg": "#EAF6EE",
          warning: "#B4790F",
          "warning-bg": "#FFF6E5",
          danger: "#C23B3B",
          "danger-bg": "#FBEAEA",
          info: "#2563A8",
          "info-bg": "#EAF2FB"
        }
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px"
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "20px"
      },
      boxShadow: {
        soft: "0 16px 48px rgba(21, 21, 21, 0.08)",
        xs: "0 1px 2px rgba(21, 21, 21, 0.06)",
        sm: "0 4px 12px rgba(21, 21, 21, 0.06)",
        lg: "0 24px 64px rgba(21, 21, 21, 0.14)"
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } }
      },
      animation: {
        fadeIn: "fadeIn .2s ease-out",
        slideUp: "slideUp .25s ease-out",
        shimmer: "shimmer 1.6s linear infinite"
      }
    }
  },
  plugins: []
};
