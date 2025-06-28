
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
        // WWDC 2025 Color System
        'wwdc': {
          'midnight': '#000000',
          'dark': '#1c1c1e',
          'gray-1': '#2c2c2e',
          'gray-2': '#3a3a3c',
          'gray-3': '#48484a',
          'gray-4': '#636366',
          'gray-5': '#8e8e93',
          'gray-6': '#aeaeb2',
          'light-gray': '#c7c7cc',
          'white': '#ffffff',
          'blue': '#007aff',
          'blue-light': '#5ac8fa',
          'purple': '#af52de',
          'pink': '#ff2d92',
          'red': '#ff3b30',
          'orange': '#ff9500',
          'yellow': '#ffcc00',
          'green': '#30d158',
          'teal': '#40c8e0',
          'indigo': '#5856d6',
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
        "wwdc-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 122, 255, 0.3)"
          },
          "50%": {
            boxShadow: "0 0 40px rgba(0, 122, 255, 0.6)"
          }
        },
        "wwdc-float": {
          "0%, 100%": {
            transform: "translateY(0px)"
          },
          "50%": {
            transform: "translateY(-6px)"
          }
        },
        "wwdc-pulse": {
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
        "wwdc-glow": "wwdc-glow 2s ease-in-out infinite",
        "wwdc-float": "wwdc-float 3s ease-in-out infinite",
        "wwdc-pulse": "wwdc-pulse 2s ease-in-out infinite",
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'wwdc-gradient': 'linear-gradient(135deg, #007aff 0%, #af52de 100%)',
        'wwdc-dark-gradient': 'linear-gradient(180deg, #000000 0%, #1c1c1e 100%)',
        'wwdc-card-gradient': 'linear-gradient(135deg, #2c2c2e 0%, rgba(0, 122, 255, 0.05) 100%)',
      },
      boxShadow: {
        'wwdc': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'wwdc-hover': '0 20px 60px rgba(0, 122, 255, 0.3)',
        'wwdc-glow': '0 0 20px rgba(0, 122, 255, 0.4)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
