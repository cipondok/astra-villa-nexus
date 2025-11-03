
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
        // Professional macOS/iOS Colors - HSL Format
        'macos': {
          'blue': 'hsl(213, 100%, 50%)',
          'light-blue': 'hsl(195, 100%, 69%)',
          'gray': 'hsl(240, 3%, 57%)',
          'light-gray': 'hsl(240, 6%, 79%)',
        },
        'neutral': {
          50: 'hsl(0, 0%, 98%)',
          100: 'hsl(0, 0%, 96%)',
          200: 'hsl(0, 0%, 90%)',
          300: 'hsl(0, 0%, 83%)',
          400: 'hsl(0, 0%, 64%)',
          500: 'hsl(0, 0%, 45%)',
          600: 'hsl(0, 0%, 32%)',
          700: 'hsl(0, 0%, 25%)',
          800: 'hsl(0, 0%, 15%)',
          900: 'hsl(0, 0%, 9%)',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'sf': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
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
        "macos-window-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.8) translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) translateY(0)"
          }
        },
        "macos-popup-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.7) translateY(30px)"
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05) translateY(-5px)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) translateY(0)"
          }
        },
        "macos-bounce": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" }
        },
        "ai-search-pulse": {
          "0%, 100%": { 
            transform: "scale(1)",
            opacity: "1"
          },
          "50%": { 
            transform: "scale(1.1)",
            opacity: "0.8"
          }
        },
        "ai-particle-float": {
          "0%, 100%": { 
            transform: "translateY(0px) rotate(0deg)",
            opacity: "0.6"
          },
          "33%": { 
            transform: "translateY(-8px) rotate(120deg)",
            opacity: "1"
          },
          "66%": { 
            transform: "translateY(-4px) rotate(240deg)",
            opacity: "0.8"
          }
        },
        "ai-shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        "typing-dot": {
          "0%, 60%, 100%": {
            transform: "translateY(0) scale(1)",
            opacity: "0.7"
          },
          "30%": {
            transform: "translateY(-10px) scale(1.2)",
            opacity: "1"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "macos-window-in": "macos-window-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "macos-popup-in": "macos-popup-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "macos-bounce": "macos-bounce 0.3s ease-out",
        "ai-search-pulse": "ai-search-pulse 2s ease-in-out infinite",
        "ai-particle-float": "ai-particle-float 3s ease-in-out infinite",
        "ai-shimmer": "ai-shimmer 2s ease-in-out infinite",
        "typing-dot": "typing-dot 1.4s ease-in-out infinite",
      },
      backgroundImage: {
        'macos-gradient': 'linear-gradient(135deg, hsl(48, 100%, 50%) 0%, hsl(45, 90%, 60%) 100%)',
        'macos-card': 'linear-gradient(135deg, hsl(0, 0%, 96%) 0%, hsla(48, 100%, 50%, 0.03) 100%)',
      },
      boxShadow: {
        'macos': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'macos-hover': '0 8px 30px rgba(255, 215, 0, 0.20)',
        'macos-active': '0 2px 8px rgba(255, 215, 0, 0.15)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
