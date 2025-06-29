
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Titanium Color System
        'titanium': {
          'white': '#E4E4E2',
          'gray': '#3A3A3C',
          'gold': '#D4AF37',
          'bronze': '#5A4B3C',
          'blue': '#2B2D42',
          'dark': '#1C1C1E',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'sf': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1"
          }
        },
        "titanium-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)"
          },
          "50%": {
            boxShadow: "0 0 40px rgba(212, 175, 55, 0.6)"
          }
        },
        "titanium-float": {
          "0%, 100%": {
            transform: "translateY(0px)"
          },
          "50%": {
            transform: "translateY(-6px)"
          }
        },
        "titanium-pulse": {
          "0%, 100%": {
            opacity: "1"
          },
          "50%": {
            opacity: "0.7"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "titanium-glow": "titanium-glow 2s ease-in-out infinite",
        "titanium-float": "titanium-float 3s ease-in-out infinite",
        "titanium-pulse": "titanium-pulse 2s ease-in-out infinite",
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'titanium-gradient': 'linear-gradient(135deg, #D4AF37 0%, #5A4B3C 100%)',
        'titanium-dark-gradient': 'linear-gradient(180deg, #1C1C1E 0%, #3A3A3C 100%)',
        'titanium-card-gradient': 'linear-gradient(135deg, #3A3A3C 0%, rgba(212, 175, 55, 0.05) 100%)',
      },
      boxShadow: {
        'titanium': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'titanium-hover': '0 20px 60px rgba(212, 175, 55, 0.3)',
        'titanium-glow': '0 0 20px rgba(212, 175, 55, 0.4)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
